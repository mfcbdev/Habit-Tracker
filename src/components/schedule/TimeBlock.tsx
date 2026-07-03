import { getIcon } from '@/lib/icons';
import { formatTimeRange } from '@/lib/utils';
import type { TimeBlockEvent } from '@/types';

const HOUR_HEIGHT = 64;
const START_HOUR = 7;
const END_HOUR = 24; // exclusive upper bound for label generation, inclusive for layout extent

interface TimeBlockProps {
  event: TimeBlockEvent;
  onClick: () => void;
}

export function TimeBlock({ event, onClick }: TimeBlockProps) {
  const Icon = getIcon(event.habit.icon);
  const startOffset = (event.startMinutes - START_HOUR * 60) / 60;
  const endOffset = (event.endMinutes - START_HOUR * 60) / 60;

  if (endOffset <= 0 || startOffset >= END_HOUR - START_HOUR) return null;

  const clampedStart = Math.max(startOffset, 0);
  const clampedEnd = Math.min(endOffset, END_HOUR - START_HOUR);
  const top = clampedStart * HOUR_HEIGHT;
  const height = Math.max((clampedEnd - clampedStart) * HOUR_HEIGHT, 36);

  const description = event.habit.description?.trim();
  const showDescription = height > 76 && description;

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
      <div className="flex h-full flex-col justify-center gap-0.5 pl-4 pr-3 py-2">
        <span className="flex items-center gap-1.5 text-[14px] font-semibold text-primary">
          <Icon className="h-3.5 w-3.5" style={{ color: event.habit.color }} />
          {event.habit.name}
        </span>
        {height > 44 && !showDescription && (
          <span className="text-[11px] text-muted">
            {formatTimeRange(event.habit.time_start, event.habit.time_end)}
          </span>
        )}
        {showDescription && (
          <>
            <span className="text-[11px] text-muted">
              {formatTimeRange(event.habit.time_start, event.habit.time_end)}
            </span>
            <span className="line-clamp-2 text-[11px] leading-snug text-secondary">{description}</span>
          </>
        )}
      </div>
    </button>
  );
}

export { HOUR_HEIGHT, START_HOUR, END_HOUR };
