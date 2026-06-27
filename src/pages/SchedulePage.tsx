import { useEffect, useState } from 'react';
import { addDays, format, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { useScheduleForDay } from '@/hooks/useScheduleForDay';
import { useProfile } from '@/hooks/useProfile';
import { useHabitSheets } from '@/hooks/useHabitSheets';
import { Timeline } from '@/components/schedule/Timeline';
import { LargeTitle } from '@/components/ui/LargeTitle';
import { getTodayInTimezone } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { TimeBlockEvent } from '@/types';

export default function SchedulePage() {
  const { data: profile } = useProfile();
  const timezone = profile?.timezone ?? 'UTC';
  const today = getTodayInTimezone(timezone);

  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [scheduleOpen, setScheduleOpen] = useState(true);

  const isToday = selectedDate === today;
  const selectedDateObj = parseISO(selectedDate);
  const weekday = selectedDateObj.getDay();
  const { events, isLoading } = useScheduleForDay(weekday);
  const { openDetail } = useHabitSheets();

  // Re-anchor to "today" if the wall clock rolls over while the page is open.
  useEffect(() => {
    if (isToday) setSelectedDate(today);
  }, [today, isToday]);

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

  function shiftDays(delta: number) {
    setSelectedDate(format(addDays(selectedDateObj, delta), 'yyyy-MM-dd'));
  }

  return (
    <div className="pt-4">
      <LargeTitle
        eyebrow={isToday ? 'Today' : format(selectedDateObj, 'EEE')}
        title={format(selectedDateObj, 'EEEE').toUpperCase()}
        subtitle={format(selectedDateObj, 'd MMMM').toUpperCase()}
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
            onClick={() => shiftDays(-1)}
            aria-label="Previous day"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-raised text-secondary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setSelectedDate(today)}
            disabled={isToday}
            className={cn(
              'rounded-pill px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition',
              isToday ? 'text-muted' : 'bg-primary text-inverse',
            )}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => shiftDays(1)}
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
