// Hand-written to match supabase/migrations/*.sql exactly. Once a Supabase
// project exists, this can be regenerated with:
//   npx supabase gen types typescript --project-id <ref> > src/types/database.ts
// Keep the same `Database` shape so the rest of the app doesn't need to change.

export type HabitFrequency = 'daily' | 'weekly';
export type HabitDifficulty = 'easy' | 'medium' | 'hard';
export type BadgeCriteriaType = 'streak' | 'total_completions' | 'habit_count' | 'level';
export type NotificationType = 'habit_reminder' | 'daily_summary';
export type XpLedgerReason = 'habit_completion' | 'habit_completion_reverted';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          timezone: string;
          total_xp: number;
          current_level: number;
          daily_summary_enabled: boolean;
          daily_summary_time: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          total_xp?: number;
          current_level?: number;
          daily_summary_enabled?: boolean;
          daily_summary_time?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          category: string | null;
          color: string;
          icon: string;
          frequency: HabitFrequency;
          frequency_days: number[];
          time_start: string;
          time_end: string;
          difficulty: HabitDifficulty;
          reminder_offset_minutes: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          category?: string | null;
          color?: string;
          icon?: string;
          frequency?: HabitFrequency;
          frequency_days?: number[];
          time_start: string;
          time_end: string;
          difficulty?: HabitDifficulty;
          reminder_offset_minutes?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['habits']['Insert']>;
      };
      habit_completions: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          completed_date: string;
          completed_at: string;
          xp_earned: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          completed_date: string;
          completed_at?: string;
          // Server-overwritten by the t2_habit_completions_award_xp trigger;
          // clients should never set this themselves.
          xp_earned?: number;
          created_at?: string;
        };
        // No update policy exists in the DB — completions are insert/delete only.
        Update: never;
      };
      habit_streaks: {
        Row: {
          habit_id: string;
          user_id: string;
          current_streak: number;
          longest_streak: number;
          last_completed_date: string | null;
          updated_at: string;
        };
        // Read-only to clients: only written by recalculate_habit_streak().
        Insert: never;
        Update: never;
      };
      levels: {
        Row: {
          level: number;
          min_xp: number;
          max_xp: number | null;
          title: string;
        };
        Insert: never;
        Update: never;
      };
      xp_ledger: {
        Row: {
          id: string;
          user_id: string;
          habit_completion_id: string | null;
          amount: number;
          reason: XpLedgerReason;
          created_at: string;
        };
        // Read-only to clients: only written by the XP award/revert triggers.
        Insert: never;
        Update: never;
      };
      badges: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string;
          icon: string;
          criteria_type: BadgeCriteriaType;
          criteria_value: number;
        };
        Insert: never;
        Update: never;
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          earned_at: string;
        };
        // Read-only to clients: only written by check_and_award_badges().
        Insert: never;
        Update: never;
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth_key: string;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth_key: string;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['push_subscriptions']['Insert']>;
      };
      notification_log: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          habit_id: string | null;
          sent_at: string;
          payload: Record<string, unknown> | null;
        };
        // Written only by the Edge Function via the service-role key.
        Insert: never;
        Update: never;
      };
    };
    Views: {
      habit_completion_rates: {
        Row: {
          habit_id: string;
          user_id: string;
          name: string;
          frequency: HabitFrequency;
          completions_7d: number;
          completions_30d: number;
          rough_weekly_rate: number;
        };
      };
      weekly_xp_summary: {
        Row: {
          user_id: string;
          week_start: string;
          xp_total: number;
        };
      };
      weekly_leaderboard: {
        Row: {
          user_id: string;
          current_week_xp: number;
          last_week_xp: number;
          xp_delta: number;
        };
      };
    };
    Enums: {
      habit_frequency: HabitFrequency;
      habit_difficulty: HabitDifficulty;
    };
  };
}
