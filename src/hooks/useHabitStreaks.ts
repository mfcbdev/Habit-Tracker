import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { HabitStreak } from '@/types';

/** Read-only: habit_streaks is only ever written server-side by recalculate_habit_streak(). */
export function useHabitStreaks() {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery<HabitStreak[]>({
    queryKey: ['habitStreaks', userId],
    queryFn: async () => {
      const { data, error } = await supabase.from('habit_streaks').select('*').eq('user_id', userId!);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}
