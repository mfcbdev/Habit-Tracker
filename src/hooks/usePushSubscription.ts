import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let i = 0; i < rawData.length; i++) {
    bytes[i] = rawData.charCodeAt(i);
  }
  return bytes;
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

async function upsertSubscription(sub: PushSubscription, userId: string): Promise<{ error: string | null }> {
  const keys = sub.toJSON().keys;
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: userId,
      endpoint: sub.endpoint,
      p256dh: keys?.p256dh ?? arrayBufferToBase64(sub.getKey('p256dh')),
      auth_key: keys?.auth ?? arrayBufferToBase64(sub.getKey('auth')),
      user_agent: navigator.userAgent,
    },
    { onConflict: 'user_id,endpoint' },
  );
  return { error: error?.message ?? null };
}

export class PushSubscribeError extends Error {
  code: 'permission_denied' | 'permission_default' | 'no_vapid_key' | 'sw_missing' | 'subscribe_failed' | 'db_insert_failed' | 'unknown';
  constructor(code: PushSubscribeError['code'], message: string) {
    super(message);
    this.code = code;
    this.name = 'PushSubscribeError';
  }
}

export function usePushSubscription() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('serviceWorker' in navigator && 'PushManager' in window);
  }, []);

  // Subscription is "on" iff the browser has a PushSubscription AND our
  // push_subscriptions table has a row matching its endpoint for THIS user.
  // If the browser has one but the DB doesn't (e.g. we're now logged in as a
  // different account than when the sub was created), heal by upserting.
  useEffect(() => {
    if (!isSupported || !userId) return;
    let cancelled = false;
    (async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const browserSub = await registration.pushManager.getSubscription();
        if (!browserSub) {
          if (!cancelled) setIsSubscribed(false);
          return;
        }
        const { data } = await supabase
          .from('push_subscriptions')
          .select('endpoint')
          .eq('user_id', userId)
          .eq('endpoint', browserSub.endpoint);
        if (cancelled) return;
        if (data && data.length > 0) {
          setIsSubscribed(true);
          return;
        }
        // Browser has a sub but the current user doesn't own it in DB → heal it.
        // Permission is already granted (browser wouldn't hand us a sub otherwise).
        const { error } = await upsertSubscription(browserSub, userId);
        if (!cancelled) setIsSubscribed(!error);
      } catch {
        if (!cancelled) setIsSubscribed(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSupported, userId]);

  const subscribe = useCallback(async () => {
    if (!userId) throw new PushSubscribeError('unknown', 'Not signed in.');

    if (Notification.permission === 'denied') {
      throw new PushSubscribeError(
        'permission_denied',
        'Notifications were previously blocked for this site. Allow them from your device Settings and try again.',
      );
    }

    let registration: ServiceWorkerRegistration;
    try {
      registration = await navigator.serviceWorker.ready;
    } catch (err) {
      throw new PushSubscribeError('sw_missing', `Service worker unavailable: ${err instanceof Error ? err.message : err}`);
    }

    // Reuse an existing browser subscription if present (e.g. left over from
    // another logged-in account or a previous session) so we don't get a
    // "already subscribed" error from the push service.
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      const permission = await Notification.requestPermission();
      if (permission === 'denied') {
        throw new PushSubscribeError('permission_denied', 'Notification permission was denied.');
      }
      if (permission !== 'granted') {
        throw new PushSubscribeError('permission_default', 'Notification permission was dismissed.');
      }

      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new PushSubscribeError('no_vapid_key', 'VITE_VAPID_PUBLIC_KEY is missing from the build.');
      }

      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      } catch (err) {
        throw new PushSubscribeError(
          'subscribe_failed',
          `Browser refused subscription: ${err instanceof Error ? err.message : err}`,
        );
      }
    }

    const { error } = await upsertSubscription(subscription, userId);
    if (error) throw new PushSubscribeError('db_insert_failed', `Could not save subscription: ${error}`);
    setIsSubscribed(true);
  }, [userId]);

  const unsubscribe = useCallback(async () => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      if (userId) {
        await supabase.from('push_subscriptions').delete().eq('user_id', userId).eq('endpoint', subscription.endpoint);
      }
      await subscription.unsubscribe();
    }
    setIsSubscribed(false);
  }, [userId]);

  return { isSupported, isSubscribed, subscribe, unsubscribe };
}
