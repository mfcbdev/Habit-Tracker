import { useProfile } from '@/hooks/useProfile';
import { useRanks, useWeeklyHpSummary } from '@/hooks/useStats';
import { useHabitStreaks } from '@/hooks/useHabitStreaks';
import { useBadgeCatalog, useEarnedBadges, mergeBadgeStatus } from '@/hooks/useBadges';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useRealtimeGamification } from '@/hooks/useRealtimeGamification';
import { getRankProgress } from '@/lib/gamification';
import type { GamificationSnapshot } from '@/types';

/**
 * Composes profile/rank/streaks/badges/leaderboard into one snapshot, kept
 * fresh by a realtime subscription. Deliberately has no dependency on the
 * Step-4 completion mutation — it only reacts to DB changes, matching the
 * schema's "client never computes derived state" design.
 */
export function useGamification(): GamificationSnapshot {
  useRealtimeGamification();

  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: ranks } = useRanks();
  const { data: streaks, isLoading: streaksLoading } = useHabitStreaks();
  const { data: badgeCatalog } = useBadgeCatalog();
  const { data: earnedBadges, isLoading: badgesLoading } = useEarnedBadges();
  const { data: leaderboard } = useLeaderboard();
  const { data: weeklyHp } = useWeeklyHpSummary();

  const rankInfo = profile && ranks ? getRankProgress(profile.habit_points, ranks)?.rank : undefined;
  const profileWithRank = profile && rankInfo ? { ...profile, rankInfo } : null;
  const badges = badgeCatalog && earnedBadges ? mergeBadgeStatus(badgeCatalog, earnedBadges) : [];

  return {
    profile: profileWithRank,
    streaks: streaks ?? [],
    badges,
    leaderboard: leaderboard ?? null,
    weeklyHp: weeklyHp ?? [],
    isLoading: profileLoading || streaksLoading || badgesLoading,
  };
}
