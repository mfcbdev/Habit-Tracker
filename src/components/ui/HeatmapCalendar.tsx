import { useMemo } from 'react';
import { addDays, format, startOfMonth, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';

interface HeatmapCalendarProps {
  completedDates: string[]; // 'yyyy-MM-dd'
  color: string;
  monthsBack?: number;
  className?: string;
}

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

interface MonthGrid {
  label: string;
  days: (string | null)[]; // 7 rows × N cols
  cols: number;
}

function buildMonthGrid(monthStart: Date): MonthGrid {
  // Build a grid: rows = weekdays (Mon..Sun), cols = ISO weeks of the month.
  // Move start back to Monday of the week containing day 1.
  const firstDayWeekday = (monthStart.getDay() + 6) % 7; // 0 = Mon
  const gridStart = addDays(monthStart, -firstDayWeekday);
  const nextMonth = startOfMonth(addDays(monthStart, 35));

  const cells: (string | null)[] = [];
  let cursor = gridStart;
  let cols = 0;

  while (cursor < nextMonth) {
    for (let row = 0; row < 7; row += 1) {
      const cell = addDays(cursor, row);
      if (cell.getMonth() === monthStart.getMonth()) {
        cells.push(format(cell, 'yyyy-MM-dd'));
      } else {
        cells.push(null);
      }
    }
    cursor = addDays(cursor, 7);
    cols += 1;
  }

  // Transpose to row-major: rows=weekdays, cols=weeks → cells stored col-major above.
  const transposed: (string | null)[] = [];
  for (let row = 0; row < 7; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      transposed.push(cells[col * 7 + row]);
    }
  }
  return { label: format(monthStart, 'MMM'), days: transposed, cols };
}

export function HeatmapCalendar({ completedDates, color, monthsBack = 3, className }: HeatmapCalendarProps) {
  const months = useMemo(() => {
    const now = new Date();
    return Array.from({ length: monthsBack }, (_, i) =>
      buildMonthGrid(startOfMonth(subMonths(now, monthsBack - 1 - i))),
    );
  }, [monthsBack]);

  const completedSet = useMemo(() => new Set(completedDates), [completedDates]);

  return (
    <div className={cn('flex gap-3', className)}>
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
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted">
              {month.label}
            </span>
            <div
              className="grid gap-[3px]"
              style={{ gridTemplateColumns: `repeat(${month.cols}, 12px)`, gridTemplateRows: 'repeat(7, 12px)' }}
            >
              {month.days.map((date, idx) => {
                if (!date) return <span key={idx} className="h-3 w-3" />;
                const isDone = completedSet.has(date);
                return (
                  <span
                    key={idx}
                    className={cn('h-3 w-3 rounded-[3px]', !isDone && 'bg-border')}
                    style={isDone ? { backgroundColor: color } : undefined}
                    title={date}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
