import { TrendingUp, TrendingDown } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useRanks, useCompletionRates, useWeeklyHpSummary } from '@/hooks/useStats';
import { useBadgeCatalog, useEarnedBadges, mergeBadgeStatus } from '@/hooks/useBadges';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useHabitStreaks } from '@/hooks/useHabitStreaks';
import { RankProgress } from '@/components/profile/RankProgress';
import { BadgeGrid } from '@/components/profile/BadgeGrid';
import { WeeklyHpChart, WeakestHabitsChart } from '@/components/profile/StatsChart';

export default function ProfilePage() {
  const { signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: ranks } = useRanks();
  const { data: completionRates } = useCompletionRates();
  const { data: weeklyHp } = useWeeklyHpSummary();
  const { data: badgeCatalog } = useBadgeCatalog();
  const { data: earnedBadges } = useEarnedBadges();
  const { data: leaderboard } = useLeaderboard();
  const { data: streaks } = useHabitStreaks();

  const longestStreak = streaks?.reduce((max, s) => Math.max(max, s.longest_streak), 0) ?? 0;
  const badges = badgeCatalog && earnedBadges ? mergeBadgeStatus(badgeCatalog, earnedBadges) : [];

  return (
    <div className="space-y-6 px-4 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{profile?.display_name ?? profile?.username ?? 'Profile'}</h1>
        <button onClick={() => signOut()} className="text-xs text-slate-400 underline">
          Sign out
        </button>
      </div>

      {profile && ranks && <RankProgress habitPoints={profile.habit_points} ranks={ranks} />}

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-surface-border bg-surface-raised p-3">
          <p className="text-xs text-slate-400">Longest streak</p>
          <p className="text-2xl font-semibold">{longestStreak}d</p>
        </div>
        <div className="rounded-xl border border-surface-border bg-surface-raised p-3">
          <p className="text-xs text-slate-400">This week vs last</p>
          {leaderboard ? (
            <p className="flex items-center gap-1 text-2xl font-semibold">
              {leaderboard.hp_delta >= 0 ? (
                <TrendingUp size={18} className="text-emerald-400" />
              ) : (
                <TrendingDown size={18} className="text-red-400" />
              )}
              {leaderboard.hp_delta >= 0 ? '+' : ''}
              {leaderboard.hp_delta}
            </p>
          ) : (
            <p className="text-2xl font-semibold">—</p>
          )}
        </div>
      </div>

      <section>
        <h2 className="mb-2 text-sm font-medium text-slate-400">Badges</h2>
        <BadgeGrid badges={badges} />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-slate-400">HP over time</h2>
        {weeklyHp && <WeeklyHpChart data={weeklyHp} />}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-slate-400">Weakest habits (7d)</h2>
        {completionRates && <WeakestHabitsChart data={completionRates} />}
      </section>
    </div>
  );
}
