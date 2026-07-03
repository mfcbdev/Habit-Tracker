import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Flame, TrendingUp, Sparkles, Sunrise, Sun, Moon } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useYesterdaySummary, type TimeOfDay } from '@/hooks/useYesterdaySummary';
import { useProfile } from '@/hooks/useProfile';
import { getTodayInTimezone } from '@/lib/utils';

const STORAGE_KEY = 'last-summary-shown';

function encouragement(rate: number, dueCount: number): string {
  if (dueCount === 0) return 'A rest day. Fresh start today.';
  if (rate >= 1) return 'A perfect day. Do it again.';
  if (rate >= 0.66) return 'Strong showing. Close out the rest today.';
  if (rate >= 0.33) return 'Some ground held. Push for more today.';
  return 'Yesterday is data. Today is the vote.';
}

const TIME_ICONS: Record<TimeOfDay, typeof Sun> = {
  morning: Sunrise,
  afternoon: Sun,
  evening: Moon,
};

export function YesterdaySummarySheet() {
  const { data: profile } = useProfile();
  const { data: summary } = useYesterdaySummary();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!profile || !summary) return;
    const today = getTodayInTimezone(profile.timezone);
    const lastShown = window.localStorage.getItem(STORAGE_KEY);
    // Bail if already shown today OR yesterday had no scheduled habits.
    if (lastShown === today) return;
    if (summary.dueCount === 0) {
      window.localStorage.setItem(STORAGE_KEY, today);
      return;
    }
    setOpen(true);
    window.localStorage.setItem(STORAGE_KEY, today);
  }, [profile, summary]);

  if (!summary) return null;
  const yesterdayLabel = format(parseISO(summary.date), 'EEEE, MMM d');
  const TimeIcon = summary.bestTimeOfDay ? TIME_ICONS[summary.bestTimeOfDay] : null;

  return (
    <BottomSheet open={open} onOpenChange={setOpen}>
      <div className="space-y-6 pb-2">
        <header className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            Yesterday · {yesterdayLabel}
          </p>
          <p className="mt-3 font-serif-display text-[46px] leading-none text-primary">
            {summary.doneCount}
            <span className="text-muted">/{summary.dueCount}</span>
          </p>
          <p className="mt-1 text-sm text-muted">habits completed</p>
        </header>

        <div className="grid grid-cols-2 gap-2.5">
          <Tile
            icon={<TrendingUp className="h-4 w-4 text-accent" />}
            label="HP earned"
            value={`+${summary.hpEarned}`}
          />
          <Tile
            icon={<Flame className="h-4 w-4 text-warning" />}
            label="Streaks kept"
            value={`${summary.streaksKept}`}
          />
          {summary.streaksBroken > 0 && (
            <Tile
              icon={<Flame className="h-4 w-4 text-muted" />}
              label="Streaks broken"
              value={`${summary.streaksBroken}`}
            />
          )}
          {summary.bestTimeOfDay && TimeIcon && (
            <Tile
              icon={<TimeIcon className="h-4 w-4 text-accent" />}
              label="Strongest hours"
              value={<span className="capitalize">{summary.bestTimeOfDay}</span>}
            />
          )}
        </div>

        <div className="rounded-card border border-DEFAULT bg-surface-raised p-4 text-center">
          <Sparkles className="mx-auto mb-2 h-4 w-4 text-accent" />
          <p className="font-serif-display text-[17px] leading-snug text-primary text-balance">
            {encouragement(summary.rate, summary.dueCount)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mx-auto block rounded-pill bg-accent px-6 py-3 text-sm font-semibold text-accent-contrast shadow-card"
        >
          Start today
        </button>
      </div>
    </BottomSheet>
  );
}

function Tile({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-card bg-surface-raised p-3.5">
      <div className="mb-1 flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</span>
      </div>
      <p className="font-serif-display text-[22px] text-primary">{value}</p>
    </div>
  );
}
