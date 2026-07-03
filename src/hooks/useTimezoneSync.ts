import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

/**
 * Silently syncs the device's IANA timezone to profile.timezone.
 * Runs once when the profile loads; skips if already matching. Failures are
 * logged and swallowed — a stale tz is preferable to a broken auth session
 * over a network hiccup.
 */
export function useTimezoneSync() {
  const { session } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const userId = session?.user.id;

  useEffect(() => {
    if (!userId || !profile) return;
    const deviceTz = getDeviceTimezone();
    if (!deviceTz || deviceTz === profile.timezone) return;

    let cancelled = false;
    (async () => {
      const { error } = await supabase.from('profiles').update({ timezone: deviceTz }).eq('id', userId);
      if (cancelled) return;
      if (error) {
        console.warn('Timezone sync failed', error);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      // Downstream queries key off profile.timezone; refresh them too.
      queryClient.invalidateQueries({ queryKey: ['todayHabits'] });
      queryClient.invalidateQueries({ queryKey: ['habitsForDate'] });
      queryClient.invalidateQueries({ queryKey: ['weekStatus'] });
      queryClient.invalidateQueries({ queryKey: ['userActivity'] });
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, profile, queryClient]);
}

function getDeviceTimezone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}
