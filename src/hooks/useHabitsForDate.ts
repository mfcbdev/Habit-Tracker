import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { getTodayInTimezone } from '@/lib/utils';
import type { HabitInstance } from '@/types';

/** Habit instances for any date (today or past). Toggle is allowed; the page is
 *  responsible for disabling it on past dates if it wants read-only semantics. */
export function useHabitsForDate(date: string) {
  const { session } = useAuth();
  const { data: profile } = useProfile();
  const userId = session?.user.id;
  const timezone = profile?.timezone ?? 'UTC';
  const today = getTodayInTimezone(timezone);
  const queryClient = useQueryClient();

  const weekday = new Date(`${date}T00:00:00`).getDay();

  const query = useQuery<HabitInstance[]>({
    queryKey: ['habitsForDate', userId, date],
    queryFn: async () => {
      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId!)
        .eq('is_active', true);
      if (habitsError) throw habitsError;

      const dueOnDate = habits.filter((h) => h.frequency_days.includes(weekday));

      const { data: completions, error: completionsError } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', userId!)
        .eq('completed_date', date);
      if (completionsError) throw completionsError;

      return dueOnDate
        .map((habit) => {
          const completion = completions.find((c) => c.habit_id === habit.id) ?? null;
          return { habit, date, isCompleted: !!completion, completion };
        })
        .sort((a, b) => a.habit.time_start.localeCompare(b.habit.time_start));
    },
    enabled: !!userId,
  });

  const toggleComplete = useMutation({
    mutationFn: async (instance: HabitInstance) => {
      if (instance.isCompleted && instance.completion) {
        const { error } = await supabase.from('habit_completions').delete().eq('id', instance.completion.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('habit_completions').insert({
          habit_id: instance.habit.id,
          user_id: userId!,
          completed_date: date,
        });
        if (error) throw error;
      }
    },
    onMutate: async (instance) => {
      const key = ['habitsForDate', userId, date];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<HabitInstance[]>(key);

      queryClient.setQueryData<HabitInstance[]>(key, (old) =>
        old?.map((i) =>
          i.habit.id === instance.habit.id ? { ...i, isCompleted: !i.isCompleted, completion: i.completion } : i,
        ),
      );

      return { previous, key };
    },
    onError: (_err, _instance, context) => {
      if (context) queryClient.setQueryData(context.key, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['habitsForDate', userId, date] });
      queryClient.invalidateQueries({ queryKey: ['weekStatus'] });
    },
  });

  return {
    ...query,
    toggleComplete: toggleComplete.mutate,
    isToggling: toggleComplete.isPending,
    isToday: date === today,
    isPast: date < today,
    isFuture: date > today,
  };
}
