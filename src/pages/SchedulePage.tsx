import { useEffect, useMemo, useState } from 'react';
import { addDays, format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { useScheduleForDay } from '@/hooks/useScheduleForDay';
import { useProfile } from '@/hooks/useProfile';
import { useHabitSheets } from '@/hooks/useHabitSheets';
import { Timeline } from '@/components/schedule/Timeline';
import { LargeTitle } from '@/components/ui/LargeTitle';
import { getWeekdayInTimezone } from '@/lib/utils';
import type { TimeBlockEvent } from '@/types';

const WEEKDAY_LONG = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Date of the next occurrence of `targetWeekday` (>= today). 0=Sun..6=Sat. */
function nextOccurrenceOf(targetWeekday: number, todayWeekday: number): Date {
  const today = new Date();
  const offset = (targetWeekday - todayWeekday + 7) % 7;
  return addDays(today, offset);
}

export default function SchedulePage() {
  const { data: profile } = useProfile();
  const timezone = profile?.timezone ?? 'UTC';
  const todayWeekday = getWeekdayInTimezone(timezone);
  const [weekday, setWeekday] = useState<number>(todayWeekday);
  const [scheduleOpen, setScheduleOpen] = useState(true);
  const { events, isLoading } = useScheduleForDay(weekday);
  const { openDetail } = useHabitSheets();

  const isToday = weekday === todayWeekday;
  const displayedDate = useMemo(
    () => (isToday ? new Date() : nextOccurrenceOf(weekday, todayWeekday)),
    [isToday, weekday, todayWeekday],
  );
  const dateSubtitle = format(displayedDate, 'd MMMM').toUpperCase();

  // Tick every minute so the now line stays accurate without a wall-clock refresh.
  const [nowMinutes, setNowMinutes] = useState<number | undefined>(() =>
    isToday ? computeNowMinutes(timezone) : undefined,
  );
  useEffect(() => {
    if (!isToday) {
      setNowMinutes(undefined);
      return;
    }
    setNowMinutes(computeNowMinutes(timezone));
    const id = setInterval(() => setNowMinutes(computeNowMinutes(timezone)), 60_000);
    return () => clearInterval(id);
  }, [isToday, timezone]);

  function handleSelect(event: TimeBlockEvent) {
    openDetail(event.habit);
  }

  return (
    <div className="pt-4">
      <LargeTitle
        eyebrow={isToday ? 'Today' : WEEKDAY_SHORT[weekday]}
        title={WEEKDAY_LONG[weekday]}
        subtitle={dateSubtitle}
      />

      <div className="flex items-center justify-between gap-4 px-5 pb-3">
        <button
          type="button"
          onClick={() => setScheduleOpen((o) => !o)}
          className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted"
        >
          Schedule
          {scheduleOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWeekday((d) => (d + 6) % 7)}
            aria-label="Previous day"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-raised text-secondary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setWeekday(todayWeekday)}
            disabled={isToday}
            className="rounded-pill px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-secondary disabled:opacity-50"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setWeekday((d) => (d + 1) % 7)}
            aria-label="Next day"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-raised text-secondary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {scheduleOpen && (
        <div className="px-5 pb-8">
          {isLoading && <p className="text-sm text-muted">Loading…</p>}
          {!isLoading && events.length === 0 && (
            <p className="rounded-card bg-surface p-6 text-center text-sm text-muted shadow-card">
              Nothing scheduled this day.
            </p>
          )}
          {events.length > 0 && (
            <Timeline
              events={events}
              onSelectEvent={handleSelect}
              nowMinutes={nowMinutes}
              scrollToNow={isToday}
            />
          )}
        </div>
      )}
    </div>
  );
}

function computeNowMinutes(timezone: string): number {
  const hhmm = formatInTimeZone(new Date(), timezone, 'HH:mm');
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}
