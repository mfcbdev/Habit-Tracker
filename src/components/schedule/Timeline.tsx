import { TimeBlock, HOUR_HEIGHT } from './TimeBlock';
import type { TimeBlockEvent } from '@/types';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface TimelineProps {
  events: TimeBlockEvent[];
  onSelectEvent: (event: TimeBlockEvent) => void;
}

export function Timeline({ events, onSelectEvent }: TimelineProps) {
  return (
    <div className="relative" style={{ height: HOURS.length * HOUR_HEIGHT }}>
      {HOURS.map((hour) => (
        <div
          key={hour}
          className="absolute left-0 right-0 border-t border-surface-border"
          style={{ top: hour * HOUR_HEIGHT }}
        >
          <span className="absolute -top-2 left-1 text-[10px] text-slate-500">
            {hour.toString().padStart(2, '0')}:00
          </span>
        </div>
      ))}
      {events.map((event) => (
        <TimeBlock key={event.habit.id} event={event} onClick={() => onSelectEvent(event)} />
      ))}
    </div>
  );
}
