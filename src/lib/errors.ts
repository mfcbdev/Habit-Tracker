import type { PostgrestError } from '@supabase/supabase-js';

export interface MappedError {
  field?: string;
  message: string;
}

/**
 * Maps known Postgres error codes raised by our triggers/constraints into a
 * friendly message. 23P01 is the exclusion-violation code we raise manually
 * from check_habit_time_overlap(); 23505 covers unique-constraint hits like
 * a duplicate habit_completions row from a double tap.
 */
export function mapSupabaseError(error: PostgrestError): MappedError {
  switch (error.code) {
    case '23P01':
      return { field: '_overlap', message: 'This time block overlaps with an existing habit on a shared day.' };
    case '23505':
      if (error.message.includes('habit_completions')) {
        return { message: 'This habit is already marked complete for today.' };
      }
      if (error.message.includes('profiles_username')) {
        return { field: 'username', message: 'That username is already taken.' };
      }
      return { message: 'That already exists.' };
    default:
      return { message: error.message || 'Something went wrong. Please try again.' };
  }
}
