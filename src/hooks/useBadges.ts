import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { Badge, BadgeWithStatus, UserBadge } from '@/types';

export function useBadgeCatalog() {
  return useQuery<Badge[]>({
    queryKey: ['badges'],
    queryFn: async () => {
      const { data, error } = await supabase.from('badges').select('*');
      if (error) throw error;
      return data;
    },
    staleTime: Infinity,
  });
}

/** Read-only: user_badges is only ever written server-side by check_and_award_badges(). */
export function useEarnedBadges() {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery<UserBadge[]>({
    queryKey: ['earnedBadges', userId],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_badges').select('*').eq('user_id', userId!);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function mergeBadgeStatus(catalog: Badge[], earned: UserBadge[]): BadgeWithStatus[] {
  return catalog.map((badge) => ({
    ...badge,
    earnedAt: earned.find((e) => e.badge_id === badge.id)?.earned_at ?? null,
  }));
}
