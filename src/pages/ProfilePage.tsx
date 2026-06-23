import { TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useGamification } from '@/hooks/useGamification';
import { useCompletionRates, useWeeklyHpSummary, useRanks } from '@/hooks/useStats';
import { useTheme } from '@/hooks/useTheme';
import { RankProgress } from '@/components/profile/RankProgress';
import { BadgeGrid } from '@/components/profile/BadgeGrid';
import { WeeklyHpChart, WeakestHabitsChart } from '@/components/profile/StatsChart';
import { NotificationSettings } from '@/components/profile/NotificationSettings';
import { LargeTitle } from '@/components/ui/LargeTitle';
import { SegmentedControl } from '@/components/ui/SegmentedControl';

export default function ProfilePage() {
  const { signOut } = useAuth();
  const { profile, badges, leaderboard, streaks } = useGamification();
  const { data: completionRates } = useCompletionRates();
  const { data: weeklyHp } = useWeeklyHpSummary();
  const { data: ranks } = useRanks();
  const { theme, setTheme } = useTheme();

  const longestStreak = streaks.reduce((max, s) => Math.max(max, s.longest_streak), 0);
  const displayName = profile?.display_name ?? profile?.username ?? 'Profile';
  const rankLabel = ranks?.find((r) => r.rank_order === profile?.current_rank)?.display_name ?? '';

  return (
    <div className="pt-4 pb-8">
      <LargeTitle title={displayName} subtitle={rankLabel || undefined} />

      <div className="space-y-7 px-5">
        {profile && ranks && <RankProgress habitPoints={profile.habit_points} ranks={ranks} />}

        <div className="grid grid-cols-2 gap-3">
          <StatTile label="Longest streak" value={`${longestStreak}d`} />
          <StatTile
            label="This week vs last"
            value={
              leaderboard ? (
                <span className="flex items-center gap-1">
                  {leaderboard.hp_delta >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-success" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-danger" />
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

        <Section title="Badges">
          <BadgeGrid badges={badges} />
        </Section>

        <Section title="HP over time">{weeklyHp && <WeeklyHpChart data={weeklyHp} />}</Section>

        <Section title="Weakest habits · 7d">
          {completionRates && <WeakestHabitsChart data={completionRates} />}
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
