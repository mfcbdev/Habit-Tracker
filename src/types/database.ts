// Hand-written to match supabase/migrations/*.sql exactly. Once a Supabase
// project exists, this can be regenerated with:
//   npx supabase gen types typescript --project-id <ref> > src/types/database.ts
// Keep the same `Database` shape so the rest of the app doesn't need to change.
//
// Note: @supabase/postgrest-js requires every table/view to carry a
// `Relationships` array (even if empty) and the schema to carry a `Functions`
// map, or its generic inference silently falls back to `never` everywhere.

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
          habit_points: number;
          current_rank: number;
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
          habit_points?: number;
          current_rank?: number;
          daily_summary_enabled?: boolean;
          daily_summary_time?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          purpose: string | null;
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
          purpose?: string | null;
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
        Relationships: [];
      };
      habit_completions: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          completed_date: string;
          completed_at: string;
          hp_earned: number;
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
          hp_earned?: number;
          created_at?: string;
        };
        // No update policy exists in the DB — completions are insert/delete only.
        Update: never;
        Relationships: [];
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
        Relationships: [];
      };
      ranks: {
        Row: {
          rank_order: number;
          tier: string;
          division: number | null;
          display_name: string;
          min_hp: number;
          max_hp: number | null;
          color: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      habit_points_ledger: {
        Row: {
          id: string;
          user_id: string;
          habit_completion_id: string | null;
          amount: number;
          reason: XpLedgerReason;
          created_at: string;
        };
        // Read-only to clients: only written by the HP award/revert triggers.
        Insert: never;
        Update: never;
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };
      weekly_hp_summary: {
        Row: {
          user_id: string;
          week_start: string;
          hp_total: number;
        };
        Relationships: [];
      };
      weekly_leaderboard: {
        Row: {
          user_id: string;
          current_week_hp: number;
          last_week_hp: number;
          hp_delta: number;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      habit_frequency: HabitFrequency;
      habit_difficulty: HabitDifficulty;
    };
  };
}
