import { useMemo } from 'react';
import { addDays, format, parseISO, startOfMonth, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DailyActivity } from '@/hooks/useUserActivity';

interface ActivityHeatmapProps {
  activity: DailyActivity[];
  monthsBack?: number;
  className?: string;
}

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

interface MonthGrid {
  label: string;
  cells: { date: string | null; rate: number; dueCount: number }[];
  cols: number;
}

function build(monthStart: Date, byDate: Map<string, DailyActivity>): MonthGrid {
  const firstDayWeekday = (monthStart.getDay() + 6) % 7; // 0 = Mon
  const gridStart = addDays(monthStart, -firstDayWeekday);
  const nextMonth = startOfMonth(addDays(monthStart, 35));

  const buf: { date: string | null; rate: number; dueCount: number }[] = [];
  let cursor = gridStart;
  let cols = 0;

  while (cursor < nextMonth) {
    for (let row = 0; row < 7; row += 1) {
      const cell = addDays(cursor, row);
      if (cell.getMonth() === monthStart.getMonth()) {
        const iso = format(cell, 'yyyy-MM-dd');
        const a = byDate.get(iso);
        buf.push({ date: iso, rate: a?.rate ?? 0, dueCount: a?.dueCount ?? 0 });
      } else {
        buf.push({ date: null, rate: 0, dueCount: 0 });
      }
    }
    cursor = addDays(cursor, 7);
    cols += 1;
  }

  // Transpose col-major → row-major (rows = weekdays, cols = weeks).
  const transposed: typeof buf = [];
  for (let row = 0; row < 7; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      transposed.push(buf[col * 7 + row]);
    }
  }
  return { label: format(monthStart, 'MMM'), cells: transposed, cols };
}

function shade(rate: number, dueCount: number): string {
  if (dueCount === 0) return 'bg-border';
  if (rate >= 1) return 'bg-success';
  if (rate >= 0.66) return 'bg-success/70';
  if (rate >= 0.33) return 'bg-accent-soft/70';
  if (rate > 0) return 'bg-warning/60';
  return 'bg-danger/40';
}

export function ActivityHeatmap({ activity, monthsBack = 3, className }: ActivityHeatmapProps) {
  const byDate = useMemo(() => {
    const m = new Map<string, DailyActivity>();
    for (const a of activity) m.set(a.date, a);
    return m;
  }, [activity]);

  const months = useMemo(() => {
    const now = new Date();
    return Array.from({ length: monthsBack }, (_, i) => build(startOfMonth(subMonths(now, monthsBack - 1 - i)), byDate));
  }, [monthsBack, byDate]);

  return (
    <div className={cn('rounded-card bg-surface p-4 shadow-card', className)}>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
        Activity · {monthsBack} months
      </p>
      <div className="flex gap-3">
        <div className="flex flex-col gap-[3px] pt-5 pr-1 text-[10px] text-muted">
          {WEEKDAY_LABELS.map((label, i) => (
            <span key={i} className="h-3 leading-3">
              {label}
            </span>
          ))}
        </div>
        <div className="flex flex-1 gap-3 overflow-x-auto">
          {months.map((month) => (
            <div key={month.label} className="flex flex-col items-start gap-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted">{month.label}</span>
              <div
                className="grid gap-[3px]"
                style={{ gridTemplateColumns: `repeat(${month.cols}, 12px)`, gridTemplateRows: 'repeat(7, 12px)' }}
              >
                {month.cells.map((cell, idx) => {
                  if (!cell.date) return <span key={idx} className="h-3 w-3" />;
                  return (
                    <span
                      key={idx}
                      className={cn('h-3 w-3 rounded-[3px]', shade(cell.rate, cell.dueCount))}
                      title={`${format(parseISO(cell.date), 'MMM d')} · ${Math.round(cell.rate * 100)}%`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
