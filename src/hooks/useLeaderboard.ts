import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { WeeklyLeaderboardRow } from '@/types';

/** Personal (non-social) week-over-week comparison. No realtime needed — fine to refresh on mount. */
export function useLeaderboard() {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery<WeeklyLeaderboardRow | null>({
    queryKey: ['weeklyLeaderboard', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weekly_leaderboard')
        .select('*')
        .eq('user_id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}
