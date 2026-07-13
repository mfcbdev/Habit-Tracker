import { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useGamification } from '@/hooks/useGamification';
import { useCompletionRates, useWeeklyHpSummary, useRanks } from '@/hooks/useStats';
import { useTheme } from '@/hooks/useTheme';
import { useSoundPref } from '@/hooks/useSoundPref';
import { useI18n } from '@/i18n/I18nProvider';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useUserActivity } from '@/hooks/useUserActivity';
import { useHabits } from '@/hooks/useHabits';
import { AvatarUploader } from '@/components/profile/AvatarUploader';
import { RankProgress } from '@/components/profile/RankProgress';
import { BadgeGrid } from '@/components/profile/BadgeGrid';
import { RecentResultsStrip } from '@/components/profile/RecentResultsStrip';
import { ActivityHeatmap } from '@/components/profile/ActivityHeatmap';
import { HabitCompletionBars } from '@/components/profile/HabitCompletionBars';
import { HpProgressionChart } from '@/components/profile/HpProgressionChart';
import { NotificationSettings } from '@/components/profile/NotificationSettings';
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
  const { enabled: soundEnabled, setEnabled: setSoundEnabled } = useSoundPref();
  const { t } = useI18n();

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
      <div className="flex flex-col items-center gap-3 px-5 pt-2 pb-4">
        <AvatarUploader avatarUrl={profile?.avatar_url ?? null} displayName={displayName} size={96} />
        <div className="text-center">
          <h1 className="font-serif-display text-[30px] leading-none text-primary">{displayName}</h1>
          {rankLabel && <p className="mt-1 text-[13px] text-secondary">{rankLabel}</p>}
        </div>
      </div>

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

        <Section title={t('profile.section.appearance')}>
          <div className="space-y-3 rounded-card bg-surface p-4 shadow-card">
            <div>
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted">
                {t('profile.appearance.theme')}
              </p>
              <SegmentedControl
                options={[
                  { value: 'light', label: t('theme.light') },
                  { value: 'dark', label: t('theme.dark') },
                  { value: 'system', label: t('theme.system') },
                ]}
                value={theme}
                onChange={(next) => setTheme(next as typeof theme)}
                className="w-full"
              />
            </div>
            <div className="border-t border-DEFAULT pt-3">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted">
                {t('profile.appearance.language')}
              </p>
              <LanguageToggle size="md" className="w-full" />
            </div>
            <div className="flex items-center justify-between border-t border-DEFAULT pt-3">
              <span className="text-[15px] text-primary">{t('profile.appearance.sound')}</span>
              <ToggleSwitch checked={soundEnabled} onChange={() => setSoundEnabled(!soundEnabled)} />
            </div>
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

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 shrink-0 rounded-full border border-transparent transition ${
        checked ? 'bg-accent' : 'bg-surface-raised'
      }`}
    >
      <span
        aria-hidden
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
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
