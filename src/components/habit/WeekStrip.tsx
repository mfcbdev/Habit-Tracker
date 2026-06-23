import { addDays, format, startOfWeek } from 'date-fns';
import { StatusDot, type DayStatus } from '@/components/ui/StatusDot';
import { cn } from '@/lib/utils';

interface WeekStripProps {
  /** ISO date 'yyyy-MM-dd' for today (in user timezone). */
  today: string;
  /** Map of 'yyyy-MM-dd' → status for the visible week. Missing = empty. */
  statuses: Record<string, DayStatus>;
}

export function WeekStrip({ today, statuses }: WeekStripProps) {
  const todayDate = new Date(`${today}T00:00:00`);
  const monday = startOfWeek(todayDate, { weekStartsOn: 1 });

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(monday, i);
    const iso = format(date, 'yyyy-MM-dd');
    return {
      iso,
      label: format(date, 'EEE'),
      day: format(date, 'd'),
      isToday: iso === today,
      status: statuses[iso] ?? 'empty',
    };
  });

  return (
    <div className="flex items-stretch justify-between gap-1 px-5">
      {days.map((d) => (
        <div key={d.iso} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="text-[11px] font-medium uppercase text-muted">{d.label}</span>
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-pill text-[15px] font-semibold transition',
              d.isToday ? 'bg-primary text-inverse' : 'text-secondary',
            )}
          >
            {d.day}
          </div>
          <StatusDot status={d.status} />
        </div>
      ))}
    </div>
  );
}
