import { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useGamification } from '@/hooks/useGamification';
import { useCompletionRates, useWeeklyHpSummary, useRanks } from '@/hooks/useStats';
import { useTheme } from '@/hooks/useTheme';
import { useUserActivity } from '@/hooks/useUserActivity';
import { useHabits } from '@/hooks/useHabits';
import { RankProgress } from '@/components/profile/RankProgress';
import { BadgeGrid } from '@/components/profile/BadgeGrid';
import { RecentResultsStrip } from '@/components/profile/RecentResultsStrip';
import { ActivityHeatmap } from '@/components/profile/ActivityHeatmap';
import { HabitCompletionBars } from '@/components/profile/HabitCompletionBars';
import { HpProgressionChart } from '@/components/profile/HpProgressionChart';
import { NotificationSettings } from '@/components/profile/NotificationSettings';
import { LargeTitle } from '@/components/ui/LargeTitle';
import { SegmentedControl } from '@/components/ui/SegmentedControl';

export default function ProfilePage() {
  const { signOut } = useAuth();
  const { profile, badges, leaderboard, streaks } = useGamification();
  const { data: completionRates = [] } = useCompletionRates();
  const { data: weeklyHp = [] } = useWeeklyHpSummary();
  const { data: ranks = [] } = useRanks();
  const { data: habits = [] } = useHabits(false);
  const { data: activity30 = [] } = useUserActivity(30);
  const { data: activity90 = [] } = useUserActivity(90);
  const { theme, setTheme } = useTheme();

  const completionRate30 = useMemo(() => {
    const totalDue = activity30.reduce((s, d) => s + d.dueCount, 0);
    const totalDone = activity30.reduce((s, d) => s + d.doneCount, 0);
    return totalDue > 0 ? Math.round((totalDone / totalDue) * 100) : 0;
  }, [activity30]);

  const longestStreak = streaks.reduce((max, s) => Math.max(max, s.longest_streak), 0);
  const currentStreak = streaks.reduce((max, s) => Math.max(max, s.current_streak), 0);
  const displayName = profile?.display_name ?? profile?.username ?? 'Profile';
  const rankLabel = ranks.find((r) => r.rank_order === profile?.current_rank)?.display_name ?? '';

  return (
    <div className="pt-4 pb-8">
      <LargeTitle title={displayName} subtitle={rankLabel || undefined} />

      <div className="space-y-7 px-5">
        {profile && ranks.length > 0 && <RankProgress habitPoints={profile.habit_points} ranks={ranks} />}

        <RecentResultsStrip activity={activity30} />

        <div className="grid grid-cols-2 gap-3">
          <StatTile label="Completion · 30d" value={`${completionRate30}%`} />
          <StatTile label="Current streak" value={`${currentStreak}d`} />
          <StatTile label="Longest streak" value={`${longestStreak}d`} />
          <StatTile
            label="Week vs last"
            value={
              leaderboard ? (
                <span className="flex items-baseline gap-1">
                  {leaderboard.hp_delta >= 0 ? (
                    <TrendingUp className="h-5 w-5 self-center text-success" />
                  ) : (
                    <TrendingDown className="h-5 w-5 self-center text-danger" />
                  )}
                  {leaderboard.hp_delta >= 0 ? '+' : ''}
                  {leaderboard.hp_delta}
                </span>
              ) : (
                '—'
              )
            }
          />
        </div>

        <Section title="Activity">
          <ActivityHeatmap activity={activity90} monthsBack={3} />
        </Section>

        <Section title="Per-habit">
          <HabitCompletionBars rates={completionRates} habits={habits} />
        </Section>

        <Section title="HP over time">
          {profile && ranks.length > 0 && (
            <HpProgressionChart weeklyHp={weeklyHp} ranks={ranks} currentHp={profile.habit_points} />
          )}
        </Section>

        <Section title="Badges">
          <BadgeGrid badges={badges} />
        </Section>

        <Section title="Appearance">
          <div className="rounded-card bg-surface p-4 shadow-card">
            <SegmentedControl
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'system', label: 'System' },
              ]}
              value={theme}
              onChange={(t) => setTheme(t as typeof theme)}
              className="w-full"
            />
          </div>
        </Section>

        <Section title="Notifications">
          <NotificationSettings />
        </Section>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => signOut()}
            className="text-xs font-medium uppercase tracking-wider text-muted hover:text-danger"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">{title}</h2>
      {children}
    </section>
  );
}

function StatTile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-card bg-surface p-4 shadow-card">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1.5 font-serif-display text-[26px] text-primary">{value}</p>
    </div>
  );
}
