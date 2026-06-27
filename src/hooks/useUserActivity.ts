import { useQuery } from '@tanstack/react-query';
import { addDays, format, parseISO } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { getTodayInTimezone } from '@/lib/utils';

export interface DailyActivity {
  date: string; // yyyy-MM-dd
  dueCount: number;
  doneCount: number;
  /** 0..1 — `doneCount / dueCount`, or 0 if nothing was due. */
  rate: number;
}

/**
 * Per-day completion rollup for the trailing `daysBack` window ending today
 * (inclusive). Joins active habits with completions and computes how many
 * habits were due on each day (by weekday) vs how many were completed.
 */
export function useUserActivity(daysBack: number) {
  const { session } = useAuth();
  const { data: profile } = useProfile();
  const userId = session?.user.id;
  const timezone = profile?.timezone ?? 'UTC';
  const today = getTodayInTimezone(timezone);

  return useQuery<DailyActivity[]>({
    queryKey: ['userActivity', userId, today, daysBack],
    queryFn: async () => {
      const todayDate = parseISO(today);
      const fromDate = addDays(todayDate, -(daysBack - 1));
      const fromIso = format(fromDate, 'yyyy-MM-dd');

      const [{ data: habits, error: habitsError }, { data: completions, error: completionsError }] = await Promise.all([
        supabase.from('habits').select('id, frequency_days, created_at').eq('user_id', userId!).eq('is_active', true),
        supabase
          .from('habit_completions')
          .select('habit_id, completed_date')
          .eq('user_id', userId!)
          .gte('completed_date', fromIso)
          .lte('completed_date', today),
      ]);
      if (habitsError) throw habitsError;
      if (completionsError) throw completionsError;

      const completionsByDate = new Map<string, Set<string>>();
      for (const c of completions ?? []) {
        const set = completionsByDate.get(c.completed_date) ?? new Set<string>();
        set.add(c.habit_id);
        completionsByDate.set(c.completed_date, set);
      }

      const result: DailyActivity[] = [];
      for (let i = 0; i < daysBack; i += 1) {
        const date = addDays(fromDate, i);
        const iso = format(date, 'yyyy-MM-dd');
        const weekday = date.getDay();
        const dueHabits = (habits ?? []).filter(
          (h) => h.frequency_days.includes(weekday) && h.created_at.slice(0, 10) <= iso,
        );
        const doneIds = completionsByDate.get(iso) ?? new Set();
        const doneCount = dueHabits.filter((h) => doneIds.has(h.id)).length;
        result.push({
          date: iso,
          dueCount: dueHabits.length,
          doneCount,
          rate: dueHabits.length > 0 ? doneCount / dueHabits.length : 0,
        });
      }
      return result;
    },
    enabled: !!userId,
  });
}
