import { useProfile } from '@/hooks/useProfile';
import { getTodayInTimezone } from '@/lib/utils';
import { useHabitsForDate } from '@/hooks/useHabitsForDate';

/** Convenience wrapper for the "today" case used by code that doesn't need date picking. */
export function useTodayHabits() {
  const { data: profile } = useProfile();
  const timezone = profile?.timezone ?? 'UTC';
  return useHabitsForDate(getTodayInTimezone(timezone));
}
