import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { getTodayInTimezone, getWeekdayInTimezone } from '@/lib/utils';
import type { HabitInstance } from '@/types';

export function useTodayHabits() {
  const { session } = useAuth();
  const { data: profile } = useProfile();
  const userId = session?.user.id;
  const timezone = profile?.timezone ?? 'UTC';
  const today = getTodayInTimezone(timezone);
  const queryClient = useQueryClient();

  const query = useQuery<HabitInstance[]>({
    queryKey: ['todayHabits', userId, today],
    queryFn: async () => {
      const weekday = getWeekdayInTimezone(timezone);

      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId!)
        .eq('is_active', true);
      if (habitsError) throw habitsError;

      const dueToday = habits.filter((h) => h.frequency_days.includes(weekday));

      const { data: completions, error: completionsError } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', userId!)
        .eq('completed_date', today);
      if (completionsError) throw completionsError;

      return dueToday
        .map((habit) => {
          const completion = completions.find((c) => c.habit_id === habit.id) ?? null;
          return { habit, date: today, isCompleted: !!completion, completion };
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
          completed_date: today,
        });
        if (error) throw error;
      }
    },
    onMutate: async (instance) => {
      const key = ['todayHabits', userId, today];
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
      queryClient.invalidateQueries({ queryKey: ['todayHabits', userId, today] });
    },
  });

  return { ...query, toggleComplete: toggleComplete.mutate, isToggling: toggleComplete.isPending };
}
