import { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { usePushSubscription } from '@/hooks/usePushSubscription';
import { useToast } from '@/hooks/useToast';
import { useQueryClient } from '@tanstack/react-query';

export function NotificationSettings() {
  const { session } = useAuth();
  const { data: profile } = useProfile();
  const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushSubscription();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [isToggling, setIsToggling] = useState(false);

  async function handleToggle() {
    setIsToggling(true);
    try {
      if (isSubscribed) {
        await unsubscribe();
        showToast('Notifications disabled.');
      } else {
        await subscribe();
        showToast('Notifications enabled.', 'success');
      }
    } catch {
      showToast('Could not update notification settings.', 'error');
    } finally {
      setIsToggling(false);
    }
  }

  async function handleDailySummaryToggle(enabled: boolean) {
    if (!session) return;
    const { error } = await supabase
      .from('profiles')
      .update({ daily_summary_enabled: enabled })
      .eq('id', session.user.id);
    if (error) {
      showToast('Could not update daily summary setting.', 'error');
      return;
    }
    queryClient.invalidateQueries({ queryKey: ['profile', session.user.id] });
  }

  if (!isSupported) {
    return <p className="text-xs text-slate-500">Push notifications aren't supported on this device/browser.</p>;
  }

  return (
    <div className="space-y-3 rounded-xl border border-surface-border bg-surface-raised p-4">
      <button
        onClick={handleToggle}
        disabled={isToggling}
        className="flex w-full items-center justify-between disabled:opacity-50"
      >
        <span className="flex items-center gap-2 text-sm">
          {isSubscribed ? <Bell size={16} className="text-indigo-400" /> : <BellOff size={16} className="text-slate-400" />}
          Habit reminders
        </span>
        <span className="text-xs text-slate-400">{isSubscribed ? 'On' : 'Off'}</span>
      </button>

      <label className="flex items-center justify-between text-sm">
        <span>Daily summary</span>
        <input
          type="checkbox"
          checked={profile?.daily_summary_enabled ?? false}
          onChange={(e) => handleDailySummaryToggle(e.target.checked)}
          className="h-4 w-4"
        />
      </label>
    </div>
  );
}
