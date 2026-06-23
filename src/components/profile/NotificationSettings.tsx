import { useState } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { usePushSubscription } from '@/hooks/usePushSubscription';
import { useToast } from '@/hooks/useToast';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

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
    return <p className="text-xs text-muted">Push notifications aren't supported on this device.</p>;
  }

  return (
    <div className="divide-y divide-DEFAULT rounded-card bg-surface shadow-card">
      <Row
        label="Habit reminders"
        icon={<Bell className={cn('h-4 w-4', isSubscribed ? 'text-accent' : 'text-muted')} />}
      >
        <Switch checked={isSubscribed} disabled={isToggling} onChange={handleToggle} />
      </Row>
      <Row label="Daily summary">
        <Switch
          checked={profile?.daily_summary_enabled ?? false}
          onChange={() => handleDailySummaryToggle(!profile?.daily_summary_enabled)}
        />
      </Row>
    </div>
  );
}

function Row({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5">
      <span className="flex items-center gap-2.5 text-[15px] text-primary">
        {icon}
        {label}
      </span>
      {children}
    </div>
  );
}

function Switch({ checked, disabled, onChange }: { checked: boolean; disabled?: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 rounded-full border border-transparent transition disabled:opacity-50',
        checked ? 'bg-accent' : 'bg-surface-raised',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}
