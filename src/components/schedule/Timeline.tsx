import { useEffect, useRef } from 'react';
import { TimeBlock, HOUR_HEIGHT, START_HOUR, END_HOUR } from './TimeBlock';
import type { TimeBlockEvent } from '@/types';

const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);
const TOTAL_HOURS = END_HOUR - START_HOUR;

interface TimelineProps {
  events: TimeBlockEvent[];
  onSelectEvent: (event: TimeBlockEvent) => void;
  /** Minutes since midnight to draw a "now" line at. Undefined hides it. */
  nowMinutes?: number;
  /** When true, auto-scroll the parent so the now line sits near the top of view on mount. */
  scrollToNow?: boolean;
}

export function Timeline({ events, onSelectEvent, nowMinutes, scrollToNow }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nowOffsetHours =
    nowMinutes !== undefined ? (nowMinutes - START_HOUR * 60) / 60 : undefined;
  const nowVisible =
    nowOffsetHours !== undefined && nowOffsetHours >= 0 && nowOffsetHours <= TOTAL_HOURS;

  useEffect(() => {
    if (!scrollToNow || nowOffsetHours === undefined || !nowVisible || !containerRef.current) return;
    const top = nowOffsetHours * HOUR_HEIGHT - 80;
    window.scrollTo({ top: Math.max(0, top + containerRef.current.offsetTop), behavior: 'auto' });
  }, [scrollToNow, nowOffsetHours, nowVisible]);

  return (
    <div ref={containerRef} className="relative" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>
      {HOURS.map((hour) => (
        <div
          key={hour}
          className="absolute left-12 right-0 border-t border-DEFAULT"
          style={{ top: (hour - START_HOUR) * HOUR_HEIGHT }}
        >
          <span className="absolute -top-2.5 -left-12 w-12 pr-2 text-right text-[10px] font-medium uppercase tracking-wider text-muted">
            {hour.toString().padStart(2, '0')}:00
          </span>
        </div>
      ))}
      {events.map((event) => (
        <TimeBlock key={event.habit.id} event={event} onClick={() => onSelectEvent(event)} />
      ))}
      {nowVisible && <NowLine offsetHours={nowOffsetHours!} minutes={nowMinutes!} />}
    </div>
  );
}

function NowLine({ offsetHours, minutes }: { offsetHours: number; minutes: number }) {
  const top = offsetHours * HOUR_HEIGHT;
  const label = `${Math.floor(minutes / 60).toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}`;
  return (
    <div className="pointer-events-none absolute left-12 right-0 z-20" style={{ top }}>
      <span className="absolute -top-2.5 -left-12 w-12 pr-2 text-right text-[10px] font-semibold uppercase tracking-wider text-danger">
        {label}
      </span>
      <span className="absolute -top-1 -left-1 h-2 w-2 rounded-full bg-danger" />
      <span className="absolute left-0 top-0 right-0 h-px bg-danger" />
    </div>
  );
}
