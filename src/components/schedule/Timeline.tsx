import { useEffect, useRef } from 'react';
import { TimeBlock, HOUR_HEIGHT } from './TimeBlock';
import type { TimeBlockEvent } from '@/types';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

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

  useEffect(() => {
    if (!scrollToNow || nowMinutes === undefined || !containerRef.current) return;
    const top = (nowMinutes / 60) * HOUR_HEIGHT - 80;
    containerRef.current.scrollIntoView({ block: 'start', behavior: 'auto' });
    window.scrollTo({ top: Math.max(0, top + containerRef.current.offsetTop), behavior: 'auto' });
  }, [scrollToNow, nowMinutes]);

  return (
    <div ref={containerRef} className="relative" style={{ height: HOURS.length * HOUR_HEIGHT }}>
      {HOURS.map((hour) => (
        <div
          key={hour}
          className="absolute left-12 right-0 border-t border-DEFAULT"
          style={{ top: hour * HOUR_HEIGHT }}
        >
          <span className="absolute -top-2.5 -left-12 w-12 pr-2 text-right text-[10px] font-medium uppercase tracking-wider text-muted">
            {hour.toString().padStart(2, '0')}:00
          </span>
        </div>
      ))}
      {events.map((event) => (
        <TimeBlock key={event.habit.id} event={event} onClick={() => onSelectEvent(event)} />
      ))}
      {nowMinutes !== undefined && <NowLine nowMinutes={nowMinutes} />}
    </div>
  );
}

function NowLine({ nowMinutes }: { nowMinutes: number }) {
  const top = (nowMinutes / 60) * HOUR_HEIGHT;
  const label = `${Math.floor(nowMinutes / 60)
    .toString()
    .padStart(2, '0')}:${(nowMinutes % 60).toString().padStart(2, '0')}`;
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
