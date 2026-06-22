import type { HabitDifficulty, HabitFrequency } from './database';

export interface HabitFormValues {
  name: string;
  description: string;
  category: string;
  color: string;
  icon: string;
  frequency: HabitFrequency;
  frequency_days: number[]; // 0-6, Sun-Sat
  time_start: string; // "HH:mm", for <input type="time">
  time_end: string; // "HH:mm"
  difficulty: HabitDifficulty;
  reminder_offset_minutes: number;
}

export interface HabitFormErrors {
  name?: string;
  description?: string;
  category?: string;
  frequency_days?: string;
  time_start?: string;
  time_end?: string;
  reminder_offset_minutes?: string;
  /** Form-level slot for the DB overlap-trigger error (Postgres code 23P01). */
  _overlap?: string;
}
