import type { HabitDifficulty } from './database';

export const DAYS_OF_WEEK = [0, 1, 2, 3, 4, 5, 6] as const;
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export const WEEKDAY_LABELS: Record<DayOfWeek, string> = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
};

export const DIFFICULTY_HP: Record<HabitDifficulty, number> = {
  easy: 10,
  medium: 25,
  hard: 50,
};
