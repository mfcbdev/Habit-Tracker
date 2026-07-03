import { createAdminClient } from './_shared/supabaseAdmin.ts';
import { sendPush } from './webpush.ts';

// Shared contract with src/sw.ts — keep both in sync, there's no shared
// types package across the Deno/browser boundary.
interface PushPayload {
  type: 'habit_reminder' | 'daily_summary';
  title: string;
  body: string;
  habitId?: string;
  url: string;
}

// Matches the pg_cron schedule (every 5 minutes) — a habit/summary is "due"
// if its target minute falls within [now, now + LOOKAHEAD) in the user's tz.
const LOOKAHEAD_MINUTES = 5;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function getNowInTimezone(timezone: string): { date: string; weekday: number; minutesSinceMidnight: number } {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hour12: false,
  }).formatToParts(now);

  const map: Record<string, string> = {};
  for (const part of parts) map[part.type] = part.value;

  const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const hour = map.hour === '24' ? 0 : parseInt(map.hour, 10);
  const minute = parseInt(map.minute, 10);

  return {
    date: `${map.year}-${map.month}-${map.day}`,
    weekday: weekdayMap[map.weekday],
    minutesSinceMidnight: hour * 60 + minute,
  };
}

// Approximates the UTC instant of local midnight for a given IANA timezone +
// calendar date, used only to bound the "already notified today" dedupe
// query — a few minutes of DST-transition error is harmless there since
// this function re-runs every 5 minutes anyway.
function startOfDayUtcIso(timezone: string, dateStr: string): string {
  const offsetFormatter = new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'longOffset', hour: '2-digit' });
  const offsetLabel = offsetFormatter.formatToParts(new Date(`${dateStr}T00:00:00Z`)).find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+00:00';
  const match = offsetLabel.match(/GMT([+-])(\d{2}):(\d{2})/);
  const offsetMinutes = match ? (match[1] === '-' ? -1 : 1) * (parseInt(match[2], 10) * 60 + parseInt(match[3], 10)) : 0;
  const utcMs = new Date(`${dateStr}T00:00:00Z`).getTime() - offsetMinutes * 60_000;
  return new Date(utcMs).toISOString();
}

// deno-lint-ignore no-explicit-any
async function sendToUser(supabase: any, userId: string, payload: PushPayload) {
  const { data: subs } = await supabase.from('push_subscriptions').select('*').eq('user_id', userId);
  if (!subs || subs.length === 0) return;

  for (const sub of subs) {
    const result = await sendPush({ endpoint: sub.endpoint, p256dh: sub.p256dh, authKey: sub.auth_key }, payload);
    // Self-heal: a 404/410 means the push service no longer recognizes this
    // subscription (browser unsubscribed, uninstalled, etc.) — stop trying.
    if (!result.ok && (result.statusCode === 404 || result.statusCode === 410)) {
      await supabase.from('push_subscriptions').delete().eq('id', sub.id);
    }
  }
}

// deno-lint-ignore no-explicit-any
async function processHabitReminders(supabase: any) {
  const runStart = Date.now();
  const { data: habits, error } = await supabase
    .from('habits')
    .select('id, user_id, name, time_start, reminder_offset_minutes, frequency_days')
    .eq('is_active', true);
  if (error) {
    console.error('[send-reminders] load-habits-failed', error);
    return;
  }
  if (!habits || habits.length === 0) {
    console.log('[send-reminders] no-active-habits');
    return;
  }

  const userIds = [...new Set(habits.map((h: { user_id: string }) => h.user_id))];
  const { data: profiles } = await supabase.from('profiles').select('id, timezone').in('id', userIds);
  const timezoneByUser = new Map<string, string>((profiles ?? []).map((p: { id: string; timezone: string }) => [p.id, p.timezone]));

  const stats = { evaluated: 0, weekday_skip: 0, out_of_window: 0, already_done: 0, already_sent: 0, sent: 0 };

  for (const habit of habits) {
    stats.evaluated += 1;
    const timezone = timezoneByUser.get(habit.user_id) ?? 'UTC';
    const { date, weekday, minutesSinceMidnight } = getNowInTimezone(timezone);
    const reminderMinute = timeToMinutes(habit.time_start) - habit.reminder_offset_minutes;
    const minutesUntilReminder = reminderMinute - minutesSinceMidnight;

    const traceBase = {
      habit_id: habit.id,
      user_id: habit.user_id,
      name: habit.name,
      timezone,
      local_time: `${Math.floor(minutesSinceMidnight / 60)}:${String(minutesSinceMidnight % 60).padStart(2, '0')}`,
      reminder_minute: reminderMinute,
      minutes_until: minutesUntilReminder,
    };

    if (!habit.frequency_days.includes(weekday)) {
      stats.weekday_skip += 1;
      continue;
    }
    if (minutesUntilReminder < 0 || minutesUntilReminder >= LOOKAHEAD_MINUTES) {
      stats.out_of_window += 1;
      continue;
    }

    const { data: completion } = await supabase
      .from('habit_completions')
      .select('id')
      .eq('habit_id', habit.id)
      .eq('completed_date', date)
      .maybeSingle();
    if (completion) {
      stats.already_done += 1;
      console.log('[send-reminders] skip.already_done', traceBase);
      continue;
    }

    const { data: alreadySent } = await supabase
      .from('notification_log')
      .select('id')
      .eq('user_id', habit.user_id)
      .eq('type', 'habit_reminder')
      .eq('habit_id', habit.id)
      .gte('sent_at', startOfDayUtcIso(timezone, date))
      .maybeSingle();
    if (alreadySent) {
      stats.already_sent += 1;
      console.log('[send-reminders] skip.already_sent', traceBase);
      continue;
    }

    const payload: PushPayload = {
      type: 'habit_reminder',
      title: 'Habit reminder',
      body: `"${habit.name}" is coming up in ${habit.reminder_offset_minutes} min`,
      habitId: habit.id,
      url: '/',
    };

    console.log('[send-reminders] sending', traceBase);
    await sendToUser(supabase, habit.user_id, payload);
    await supabase.from('notification_log').insert({ user_id: habit.user_id, type: 'habit_reminder', habit_id: habit.id, payload });
    stats.sent += 1;
  }

  console.log('[send-reminders] run-summary', { duration_ms: Date.now() - runStart, ...stats });
}

// deno-lint-ignore no-explicit-any
async function processDailySummaries(supabase: any) {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, timezone, daily_summary_time')
    .eq('daily_summary_enabled', true);
  if (error) {
    console.error('Failed to load profiles', error);
    return;
  }

  for (const profile of profiles ?? []) {
    const { date, weekday, minutesSinceMidnight } = getNowInTimezone(profile.timezone);

    const targetMinute = timeToMinutes(profile.daily_summary_time);
    const minutesUntilTarget = targetMinute - minutesSinceMidnight;
    if (minutesUntilTarget < 0 || minutesUntilTarget >= LOOKAHEAD_MINUTES) continue;

    const { data: alreadySent } = await supabase
      .from('notification_log')
      .select('id')
      .eq('user_id', profile.id)
      .eq('type', 'daily_summary')
      .gte('sent_at', startOfDayUtcIso(profile.timezone, date))
      .maybeSingle();
    if (alreadySent) continue;

    const { data: dueHabits } = await supabase
      .from('habits')
      .select('id')
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .contains('frequency_days', [weekday]);

    const dueCount = dueHabits?.length ?? 0;
    let completedCount = 0;
    if (dueCount > 0) {
      const { count } = await supabase
        .from('habit_completions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('completed_date', date);
      completedCount = count ?? 0;
    }

    const rate = dueCount > 0 ? Math.round((completedCount / dueCount) * 100) : 0;
    const payload: PushPayload = {
      type: 'daily_summary',
      title: 'Daily summary',
      body: dueCount > 0 ? `You completed ${completedCount}/${dueCount} habits today (${rate}%).` : 'No habits scheduled today.',
      url: '/profile',
    };

    await sendToUser(supabase, profile.id, payload);
    await supabase.from('notification_log').insert({ user_id: profile.id, type: 'daily_summary', habit_id: null, payload });
  }
}

Deno.serve(async (_req: Request) => {
  try {
    const supabase = createAdminClient();
    await processHabitReminders(supabase);
    await processDailySummaries(supabase);
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
