import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DailyActivity } from '@/hooks/useUserActivity';

interface RecentResultsStripProps {
  activity: DailyActivity[];
  className?: string;
}

function tone(rate: number, dueCount: number): string {
  if (dueCount === 0) return 'bg-border';
  if (rate >= 1) return 'bg-success';
  if (rate >= 0.5) return 'bg-accent-soft';
  if (rate > 0) return 'bg-warning';
  return 'bg-danger/60';
}

export function RecentResultsStrip({ activity, className }: RecentResultsStripProps) {
  return (
    <div className={cn('rounded-card bg-surface p-4 shadow-card', className)}>
      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
          Last {activity.length} days
        </p>
        <Legend />
      </div>
      <div className="flex items-stretch gap-[3px] overflow-x-auto">
        {activity.map((day) => (
          <span
            key={day.date}
            title={`${format(parseISO(day.date), 'MMM d')} — ${day.doneCount} of ${day.dueCount}`}
            className={cn('h-8 flex-1 min-w-[8px] rounded-[3px]', tone(day.rate, day.dueCount))}
          />
        ))}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-2 text-[10px] text-muted">
      <span className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-sm bg-danger/60" /> miss
      </span>
      <span className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-sm bg-accent-soft" /> partial
      </span>
      <span className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-sm bg-success" /> all
      </span>
    </div>
  );
}
