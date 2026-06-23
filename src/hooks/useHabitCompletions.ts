import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { HabitCompletion } from '@/types';

/** All completions for a single habit, ordered newest first. */
export function useHabitCompletions(habitId: string | null | undefined) {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery<HabitCompletion[]>({
    queryKey: ['habitCompletions', userId, habitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', userId!)
        .eq('habit_id', habitId!)
        .order('completed_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId && !!habitId,
  });
}
