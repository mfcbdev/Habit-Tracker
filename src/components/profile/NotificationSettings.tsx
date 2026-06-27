import { useState } from 'react';
import { Bell, Share, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { usePushSubscription } from '@/hooks/usePushSubscription';
import { usePlatform } from '@/hooks/usePlatform';
import { useToast } from '@/hooks/useToast';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

export function NotificationSettings() {
  const { session } = useAuth();
  const { data: profile } = useProfile();
  const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushSubscription();
  const { needsIOSInstall } = usePlatform();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [isToggling, setIsToggling] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);

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

  async function handleSendTest() {
    if (!session) return;
    setIsSendingTest(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-test-notification', {
        method: 'POST',
      });
      if (error) throw error;
      const delivered = (data as { delivered?: number } | null)?.delivered ?? 0;
      if (delivered > 0) showToast(`Test sent to ${delivered} device${delivered === 1 ? '' : 's'}.`, 'success');
      else showToast('No devices to send to. Re-enable notifications.', 'error');
    } catch (err) {
      showToast(`Test failed: ${err instanceof Error ? err.message : 'unknown'}.`, 'error');
    } finally {
      setIsSendingTest(false);
    }
  }

  if (!isSupported) {
    return <p className="text-xs text-muted">Push notifications aren't supported on this device.</p>;
  }

  return (
    <div className="space-y-3">
      {needsIOSInstall && (
        <div className="rounded-card bg-surface-raised p-4 text-[13px] text-secondary shadow-card">
          <p className="flex items-center gap-2 font-semibold text-primary">
            <Share className="h-4 w-4" /> Install to home screen first
          </p>
          <p className="mt-1 text-muted">
            iOS only delivers push to installed PWAs. Tap{' '}
            <span className="inline-flex items-center gap-1 font-medium text-primary">
              Share <Share className="h-3 w-3" />
            </span>{' '}
            → <span className="font-medium text-primary">Add to Home Screen</span>, then open the app from the new icon and enable notifications here.
          </p>
        </div>
      )}

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
        {isSubscribed && (
          <Row label="Send test notification">
            <button
              type="button"
              onClick={handleSendTest}
              disabled={isSendingTest}
              className="inline-flex items-center gap-1.5 rounded-pill bg-accent px-3 py-1.5 text-xs font-semibold text-accent-contrast disabled:opacity-50"
            >
              <Send className="h-3 w-3" /> {isSendingTest ? 'Sending…' : 'Send'}
            </button>
          </Row>
        )}
      </div>
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
