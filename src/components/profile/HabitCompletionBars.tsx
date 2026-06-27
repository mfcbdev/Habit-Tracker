import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { Habit, HabitCompletionRate } from '@/types';

interface HabitCompletionBarsProps {
  rates: HabitCompletionRate[];
  habits: Habit[];
  /** Show the top-N habits. Default: all. */
  limit?: number;
  className?: string;
}

const MAX_PER_WEEK = 7;

export function HabitCompletionBars({ rates, habits, limit, className }: HabitCompletionBarsProps) {
  const sorted = useMemo(() => {
    const habitsById = new Map(habits.map((h) => [h.id, h]));
    const enriched = rates
      .map((r) => {
        const habit = habitsById.get(r.habit_id);
        const pct = Math.min(100, Math.round((r.completions_7d / MAX_PER_WEEK) * 100));
        return habit ? { rate: r, habit, pct } : null;
      })
      .filter((x): x is { rate: HabitCompletionRate; habit: Habit; pct: number } => x !== null)
      .sort((a, b) => b.pct - a.pct);
    return limit ? enriched.slice(0, limit) : enriched;
  }, [rates, habits, limit]);

  if (sorted.length === 0) {
    return (
      <div className={cn('rounded-card bg-surface p-6 text-center text-sm text-muted shadow-card', className)}>
        No habits yet.
      </div>
    );
  }

  return (
    <div className={cn('space-y-2 rounded-card bg-surface p-4 shadow-card', className)}>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
        Habit completion · 7d
      </p>
      {sorted.map(({ habit, pct, rate }) => (
        <div key={habit.id} className="flex items-center gap-3">
          <span className="w-24 truncate text-sm font-medium text-primary" title={habit.name}>
            {habit.name}
          </span>
          <div className="relative h-7 flex-1 overflow-hidden rounded-pill bg-surface-raised">
            <div
              className="absolute inset-y-0 left-0 rounded-pill transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: habit.color }}
            />
            <span className="absolute inset-y-0 right-3 flex items-center text-[11px] font-semibold text-secondary">
              {rate.completions_7d}/{MAX_PER_WEEK}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
