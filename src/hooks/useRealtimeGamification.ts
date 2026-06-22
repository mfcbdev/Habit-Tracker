import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

/**
 * One completion insert fires t1 (streak) -> t2 (HP) -> t3 (badges) in quick
 * succession, each a separate Postgres NOTIFY. Rather than hand-merge partial
 * realtime payloads into the cache (risking a UI flash of new streak + stale
 * HP), every event just triggers a cheap refetch of the small profile/streaks/
 * badges queries.
 */
export function useRealtimeGamification() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`gamification:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        () => queryClient.invalidateQueries({ queryKey: ['profile', userId] }),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'habit_streaks', filter: `user_id=eq.${userId}` },
        () => queryClient.invalidateQueries({ queryKey: ['habitStreaks', userId] }),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_badges', filter: `user_id=eq.${userId}` },
        () => queryClient.invalidateQueries({ queryKey: ['earnedBadges', userId] }),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
}
