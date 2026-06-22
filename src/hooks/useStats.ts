import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { HabitCompletionRate, Rank, WeeklyHpSummary } from '@/types';

export function useCompletionRates() {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery<HabitCompletionRate[]>({
    queryKey: ['completionRates', userId],
    queryFn: async () => {
      const { data, error } = await supabase.from('habit_completion_rates').select('*').eq('user_id', userId!);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useWeeklyHpSummary() {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery<WeeklyHpSummary[]>({
    queryKey: ['weeklyHpSummary', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weekly_hp_summary')
        .select('*')
        .eq('user_id', userId!)
        .order('week_start');
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useRanks() {
  return useQuery<Rank[]>({
    queryKey: ['ranks'],
    queryFn: async () => {
      const { data, error } = await supabase.from('ranks').select('*').order('rank_order');
      if (error) throw error;
      return data;
    },
    staleTime: Infinity,
  });
}
