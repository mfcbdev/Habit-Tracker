import type { HabitFormValues } from '@/types/forms';

export type TemplateAuthor = 'Cal Newport · Deep Work' | 'James Clear · Atomic Habits' | 'David Goggins · Can’t Hurt Me';

export interface HabitTemplate {
  id: string;
  author: TemplateAuthor;
  emoji: string;
  headline: string;
  principle: string;
  values: HabitFormValues;
}

/** Every field is fully filled so the wizard can jump straight into review. */
export const HABIT_TEMPLATES: HabitTemplate[] = [
  // ---------------- Deep Work ----------------
  {
    id: 'dw-deep-block',
    author: 'Cal Newport · Deep Work',
    emoji: '🎯',
    headline: 'Deep work block',
    principle: 'Depth compounds. Two undistracted hours will out-produce a full day of shallow work.',
    values: {
      name: 'Deep work — no phone',
      description: 'Two hours of focused, uninterrupted work on the single most important thing. Phone in another room. No email, no chat.',
      purpose: 'someone whose focus is my superpower',
      category: 'Work',
      color: '#3E8473',
      icon: 'brain',
      frequency: 'daily',
      frequency_days: [1, 2, 3, 4, 5],
      time_start: '09:00',
      time_end: '11:00',
      difficulty: 'hard',
      reminder_offset_minutes: 5,
    },
  },
  {
    id: 'dw-shutdown',
    author: 'Cal Newport · Deep Work',
    emoji: '🌙',
    headline: 'Shutdown ritual',
    principle: 'Every work day needs a hard end. Review what shipped, plan tomorrow, then close the laptop.',
    values: {
      name: 'Shutdown ritual',
      description: 'Review today’s wins, capture tomorrow’s top three, close all tabs. Say the phrase: schedule shutdown complete.',
      purpose: 'someone who protects their evenings',
      category: 'Work',
      color: '#8FD5B4',
      icon: 'moon',
      frequency: 'daily',
      frequency_days: [1, 2, 3, 4, 5],
      time_start: '17:45',
      time_end: '18:00',
      difficulty: 'easy',
      reminder_offset_minutes: 5,
    },
  },
  {
    id: 'dw-weekly-review',
    author: 'Cal Newport · Deep Work',
    emoji: '🗓️',
    headline: 'Weekly review',
    principle: 'A weekly review keeps you steering the boat. Otherwise the current picks the direction.',
    values: {
      name: 'Weekly review',
      description: 'Look at last week’s calendar, close open loops, plan the coming week’s deep-work blocks.',
      purpose: 'someone who owns their week',
      category: 'Planning',
      color: '#6366f1',
      icon: 'pencil',
      frequency: 'weekly',
      frequency_days: [0],
      time_start: '18:00',
      time_end: '18:45',
      difficulty: 'medium',
      reminder_offset_minutes: 15,
    },
  },

  // ---------------- Atomic Habits ----------------
  {
    id: 'ah-two-minute',
    author: 'James Clear · Atomic Habits',
    emoji: '⏱️',
    headline: 'Two-minute habit',
    principle: 'When you start a habit, it should take less than two minutes. Master the arrival, then expand.',
    values: {
      name: 'Read 2 minutes',
      description: 'Open a book. Read for at least two minutes. On days you feel like more, keep going — but two minutes always counts.',
      purpose: 'a reader',
      category: 'Mind',
      color: '#f59e0b',
      icon: 'book',
      frequency: 'daily',
      frequency_days: [0, 1, 2, 3, 4, 5, 6],
      time_start: '21:30',
      time_end: '21:35',
      difficulty: 'easy',
      reminder_offset_minutes: 5,
    },
  },
  {
    id: 'ah-habit-stack',
    author: 'James Clear · Atomic Habits',
    emoji: '🔗',
    headline: 'Habit stacking',
    principle: 'After [current habit], I will [new habit]. Cue-response is stronger when the cue is already automatic.',
    values: {
      name: 'Stretch after coffee',
      description: 'Right after your morning coffee is poured, do 3 minutes of stretching before the first sip.',
      purpose: 'someone who moves with ease',
      category: 'Health',
      color: '#22c55e',
      icon: 'sparkles',
      frequency: 'daily',
      frequency_days: [0, 1, 2, 3, 4, 5, 6],
      time_start: '07:30',
      time_end: '07:35',
      difficulty: 'easy',
      reminder_offset_minutes: 0,
    },
  },
  {
    id: 'ah-identity-line',
    author: 'James Clear · Atomic Habits',
    emoji: '✒️',
    headline: 'One identity line',
    principle: 'Every action is a vote for the person you wish to become. One line a day = 365 votes a year.',
    values: {
      name: 'Journal one identity line',
      description: 'Write one sentence that starts with "I am the kind of person who…" Look at yesterday’s line first.',
      purpose: 'the person I want to become',
      category: 'Mind',
      color: '#a855f7',
      icon: 'pencil',
      frequency: 'daily',
      frequency_days: [0, 1, 2, 3, 4, 5, 6],
      time_start: '22:15',
      time_end: '22:20',
      difficulty: 'easy',
      reminder_offset_minutes: 5,
    },
  },

  // ---------------- Can't Hurt Me ----------------
  {
    id: 'ch-cold-shower',
    author: 'David Goggins · Can’t Hurt Me',
    emoji: '🧊',
    headline: 'Cold shower',
    principle: 'Voluntary hardship builds a mental callus. Choose one uncomfortable thing every day.',
    values: {
      name: 'Cold shower',
      description: 'Ninety seconds of the coldest water you can stand at the end of your normal shower. No skipping.',
      purpose: 'unfuckwithable',
      category: 'Discipline',
      color: '#06b6d4',
      icon: 'droplet',
      frequency: 'daily',
      frequency_days: [0, 1, 2, 3, 4, 5, 6],
      time_start: '07:00',
      time_end: '07:05',
      difficulty: 'hard',
      reminder_offset_minutes: 0,
    },
  },
  {
    id: 'ch-early-workout',
    author: 'David Goggins · Can’t Hurt Me',
    emoji: '🏋️',
    headline: 'Get up and go',
    principle: 'Nobody feels like it at 5 AM. Doing it anyway is exactly the point.',
    values: {
      name: 'Morning workout',
      description: 'Forty-five minutes of hard training before the day gets a vote. Same time regardless of how you feel.',
      purpose: 'the hardest man in the room',
      category: 'Health',
      color: '#ef4444',
      icon: 'dumbbell',
      frequency: 'daily',
      frequency_days: [1, 2, 3, 4, 5, 6],
      time_start: '05:30',
      time_end: '06:15',
      difficulty: 'hard',
      reminder_offset_minutes: 10,
    },
  },
  {
    id: 'ch-accountability-mirror',
    author: 'David Goggins · Can’t Hurt Me',
    emoji: '🫞',
    headline: 'Accountability mirror',
    principle: 'Look yourself in the eye. Tell the truth about what needs to change. Post it.',
    values: {
      name: 'Accountability mirror',
      description: 'Two minutes in front of the mirror. Say out loud what you did well today and what you cheated on. Write one lesson.',
      purpose: 'radically honest with myself',
      category: 'Mind',
      color: '#ec4899',
      icon: 'heart',
      frequency: 'daily',
      frequency_days: [0, 1, 2, 3, 4, 5, 6],
      time_start: '22:00',
      time_end: '22:05',
      difficulty: 'medium',
      reminder_offset_minutes: 5,
    },
  },
];

export const TEMPLATES_BY_AUTHOR: Record<TemplateAuthor, HabitTemplate[]> = HABIT_TEMPLATES.reduce(
  (acc, t) => {
    (acc[t.author] ??= []).push(t);
    return acc;
  },
  {} as Record<TemplateAuthor, HabitTemplate[]>,
);
