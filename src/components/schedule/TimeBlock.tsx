import { getIcon } from '@/lib/icons';
import { formatTimeRange } from '@/lib/utils';
import type { TimeBlockEvent } from '@/types';

const HOUR_HEIGHT = 64;

interface TimeBlockProps {
  event: TimeBlockEvent;
  onClick: () => void;
}

export function TimeBlock({ event, onClick }: TimeBlockProps) {
  const Icon = getIcon(event.habit.icon);
  const top = (event.startMinutes / 60) * HOUR_HEIGHT;
  const height = Math.max(((event.endMinutes - event.startMinutes) / 60) * HOUR_HEIGHT, 36);

  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute left-16 right-3 overflow-hidden rounded-card bg-surface text-left shadow-card transition-shadow hover:shadow-floating"
      style={{ top, height }}
    >
      <span
        className="absolute inset-y-0 left-0 w-1 rounded-l-card"
        style={{ backgroundColor: event.habit.color }}
        aria-hidden
      />
      <div className="flex h-full flex-col justify-center pl-4 pr-3">
        <span className="flex items-center gap-1.5 text-[14px] font-semibold text-primary">
          <Icon className="h-3.5 w-3.5" style={{ color: event.habit.color }} />
          {event.habit.name}
        </span>
        {height > 44 && (
          <span className="text-[11px] text-muted">
            {formatTimeRange(event.habit.time_start, event.habit.time_end)}
          </span>
        )}
      </div>
    </button>
  );
}

export { HOUR_HEIGHT };
