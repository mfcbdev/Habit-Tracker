import type { Database } from './database';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Habit = Database['public']['Tables']['habits']['Row'];
export type HabitCompletion = Database['public']['Tables']['habit_completions']['Row'];
export type HabitStreak = Database['public']['Tables']['habit_streaks']['Row'];
export type Level = Database['public']['Tables']['levels']['Row'];
export type XpLedgerEntry = Database['public']['Tables']['xp_ledger']['Row'];
export type Badge = Database['public']['Tables']['badges']['Row'];
export type UserBadge = Database['public']['Tables']['user_badges']['Row'];
export type PushSubscriptionRow = Database['public']['Tables']['push_subscriptions']['Row'];
export type NotificationLogEntry = Database['public']['Tables']['notification_log']['Row'];

export type HabitCompletionRate = Database['public']['Views']['habit_completion_rates']['Row'];
export type WeeklyXpSummary = Database['public']['Views']['weekly_xp_summary']['Row'];
export type WeeklyLeaderboardRow = Database['public']['Views']['weekly_leaderboard']['Row'];

export interface HabitWithStreak extends Habit {
  streak: HabitStreak | null;
}

/** A habit projected onto one specific calendar date (used by Today/Schedule views). */
export interface HabitInstance {
  habit: Habit;
  date: string; // YYYY-MM-DD, in the user's timezone
  isCompleted: boolean;
  completion: HabitCompletion | null;
}

export interface ProfileWithLevel extends Profile {
  levelInfo: Level;
}

export interface BadgeWithStatus extends Badge {
  earnedAt: string | null; // null if not yet earned
}

export interface GamificationSnapshot {
  profile: ProfileWithLevel | null;
  streaks: HabitStreak[];
  badges: BadgeWithStatus[];
  leaderboard: WeeklyLeaderboardRow | null;
  weeklyXp: WeeklyXpSummary[];
  isLoading: boolean;
}

/** A habit projected onto a single day's timeline, with minute offsets for layout. */
export interface TimeBlockEvent {
  habit: Habit;
  startMinutes: number; // minutes since midnight
  endMinutes: number;
}
