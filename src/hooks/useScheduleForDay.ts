import { useMemo } from 'react';
import { useHabits } from '@/hooks/useHabits';
import { toMinutes } from '@/lib/utils';
import type { TimeBlockEvent } from '@/types';

/** Projects the same `habits` list onto a single weekday's timeline — no extra fetch. */
export function useScheduleForDay(weekday: number) {
  const { data: habits, isLoading } = useHabits(false);

  const events = useMemo<TimeBlockEvent[]>(() => {
    if (!habits) return [];
    return habits
      .filter((h) => h.frequency_days.includes(weekday))
      .map((habit) => ({
        habit,
        startMinutes: toMinutes(habit.time_start),
        endMinutes: toMinutes(habit.time_end),
      }))
      .sort((a, b) => a.startMinutes - b.startMinutes);
  }, [habits, weekday]);

  return { events, isLoading };
}
