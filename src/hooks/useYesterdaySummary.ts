import { useQuery } from '@tanstack/react-query';
import { addDays, format, parseISO } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { getTodayInTimezone, toMinutes } from '@/lib/utils';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export interface YesterdaySummary {
  date: string; // yesterday's iso
  dueCount: number;
  doneCount: number;
  rate: number;
  hpEarned: number;
  bestTimeOfDay: TimeOfDay | null;
  streaksKept: number;
  streaksBroken: number;
}

function bucket(minutes: number): TimeOfDay {
  if (minutes < 12 * 60) return 'morning';
  if (minutes < 18 * 60) return 'afternoon';
  return 'evening';
}

export function useYesterdaySummary() {
  const { session } = useAuth();
  const { data: profile } = useProfile();
  const userId = session?.user.id;
  const timezone = profile?.timezone ?? 'UTC';
  const today = getTodayInTimezone(timezone);
  const yesterday = format(addDays(parseISO(today), -1), 'yyyy-MM-dd');
  const yesterdayWeekday = parseISO(yesterday).getDay();

  return useQuery<YesterdaySummary>({
    queryKey: ['yesterdaySummary', userId, yesterday],
    queryFn: async () => {
      const [{ data: habits }, { data: completions }, { data: streaks }] = await Promise.all([
        supabase
          .from('habits')
          .select('id, frequency_days, time_start, created_at, is_active')
          .eq('user_id', userId!),
        supabase
          .from('habit_completions')
          .select('habit_id, hp_earned, completed_date')
          .eq('user_id', userId!)
          .eq('completed_date', yesterday),
        supabase.from('habit_streaks').select('habit_id, current_streak, last_completed_date').eq('user_id', userId!),
      ]);

      // "Due yesterday" = active habits scheduled for that weekday whose created_at
      // is on/before yesterday (so newly-created habits don't inflate the miss count).
      const dueHabits = (habits ?? []).filter(
        (h) =>
          h.is_active &&
          h.frequency_days.includes(yesterdayWeekday) &&
          h.created_at.slice(0, 10) <= yesterday,
      );

      const doneIds = new Set((completions ?? []).map((c) => c.habit_id));
      const doneCount = dueHabits.filter((h) => doneIds.has(h.id)).length;
      const hpEarned = (completions ?? []).reduce((s, c) => s + (c.hp_earned ?? 0), 0);

      // Time-of-day bucket for done habits — pick the bucket with the most completions.
      const bucketCounts: Record<TimeOfDay, number> = { morning: 0, afternoon: 0, evening: 0 };
      for (const h of dueHabits) {
        if (!doneIds.has(h.id)) continue;
        bucketCounts[bucket(toMinutes(h.time_start))] += 1;
      }
      const bestTimeOfDay =
        doneCount > 0
          ? (Object.entries(bucketCounts).sort((a, b) => b[1] - a[1])[0][0] as TimeOfDay)
          : null;

      // Streak accounting: a streak is "kept" if last_completed_date is >= yesterday
      // (i.e. yesterday's completion extended it). It's "broken" if the streak's
      // last_completed_date is < yesterday AND the habit was due yesterday.
      const streaksKept = (streaks ?? []).filter(
        (s) => s.last_completed_date && s.last_completed_date >= yesterday && s.current_streak >= 2,
      ).length;
      const streaksBroken = dueHabits.filter((h) => {
        const s = (streaks ?? []).find((x) => x.habit_id === h.id);
        return s && s.last_completed_date && s.last_completed_date < yesterday && !doneIds.has(h.id);
      }).length;

      return {
        date: yesterday,
        dueCount: dueHabits.length,
        doneCount,
        rate: dueHabits.length > 0 ? doneCount / dueHabits.length : 0,
        hpEarned,
        bestTimeOfDay,
        streaksKept,
        streaksBroken,
      };
    },
    enabled: !!userId && !!profile,
  });
}
