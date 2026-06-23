import { useQuery } from '@tanstack/react-query';
import { addDays, format, startOfWeek } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { getTodayInTimezone } from '@/lib/utils';
import type { DayStatus } from '@/components/ui/StatusDot';

/**
 * Per-day completion rollup for the current week.
 * Compares completions on each date against the number of active habits
 * scheduled for that weekday — all/some/none/empty.
 */
export function useWeekStatus() {
  const { session } = useAuth();
  const { data: profile } = useProfile();
  const userId = session?.user.id;
  const timezone = profile?.timezone ?? 'UTC';
  const today = getTodayInTimezone(timezone);

  return useQuery<Record<string, DayStatus>>({
    queryKey: ['weekStatus', userId, today],
    queryFn: async () => {
      const todayDate = new Date(`${today}T00:00:00`);
      const monday = startOfWeek(todayDate, { weekStartsOn: 1 });
      const sunday = addDays(monday, 6);
      const fromIso = format(monday, 'yyyy-MM-dd');
      const toIso = format(sunday, 'yyyy-MM-dd');

      const [{ data: habits }, { data: completions }] = await Promise.all([
        supabase
          .from('habits')
          .select('id, frequency_days')
          .eq('user_id', userId!)
          .eq('is_active', true),
        supabase
          .from('habit_completions')
          .select('habit_id, completed_date')
          .eq('user_id', userId!)
          .gte('completed_date', fromIso)
          .lte('completed_date', toIso),
      ]);

      const result: Record<string, DayStatus> = {};
      for (let i = 0; i < 7; i += 1) {
        const date = addDays(monday, i);
        const iso = format(date, 'yyyy-MM-dd');
        const weekday = date.getDay(); // 0=Sun..6=Sat
        const dueHabits = (habits ?? []).filter((h) => h.frequency_days.includes(weekday));
        if (dueHabits.length === 0) {
          result[iso] = 'empty';
          continue;
        }
        const dayCompletions = (completions ?? []).filter((c) => c.completed_date === iso);
        const doneIds = new Set(dayCompletions.map((c) => c.habit_id));
        const doneDueCount = dueHabits.filter((h) => doneIds.has(h.id)).length;

        if (doneDueCount === 0) result[iso] = iso > today ? 'empty' : 'none';
        else if (doneDueCount === dueHabits.length) result[iso] = 'all';
        else result[iso] = 'some';
      }
      return result;
    },
    enabled: !!userId,
  });
}
