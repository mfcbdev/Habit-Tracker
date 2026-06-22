import { getIcon } from '@/lib/icons';
import { formatTimeRange } from '@/lib/utils';
import type { TimeBlockEvent } from '@/types';

const HOUR_HEIGHT = 56; // px per hour, matches Timeline gridlines

interface TimeBlockProps {
  event: TimeBlockEvent;
  onClick: () => void;
}

export function TimeBlock({ event, onClick }: TimeBlockProps) {
  const Icon = getIcon(event.habit.icon);
  const top = (event.startMinutes / 60) * HOUR_HEIGHT;
  const height = Math.max(((event.endMinutes - event.startMinutes) / 60) * HOUR_HEIGHT, 28);

  return (
    <button
      onClick={onClick}
      className="absolute left-14 right-2 overflow-hidden rounded-lg border px-2 py-1 text-left text-xs"
      style={{
        top,
        height,
        backgroundColor: `${event.habit.color}26`,
        borderColor: event.habit.color,
      }}
    >
      <span className="flex items-center gap-1 font-medium" style={{ color: event.habit.color }}>
        <Icon size={12} /> {event.habit.name}
      </span>
      <span className="text-slate-400">{formatTimeRange(event.habit.time_start, event.habit.time_end)}</span>
    </button>
  );
}

export { HOUR_HEIGHT };
