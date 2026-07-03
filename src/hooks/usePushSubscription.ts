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

  useEffect(() => {
    if (!isSupported) return;
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setIsSubscribed(!!sub))
      .catch(() => setIsSubscribed(false));
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    if (!userId) throw new PushSubscribeError('unknown', 'Not signed in.');

    // Check current permission BEFORE requesting so we can differentiate
    // "already denied" (permanent, needs Settings) from "user just tapped no".
    if (Notification.permission === 'denied') {
      throw new PushSubscribeError(
        'permission_denied',
        'Notifications were previously blocked for this site. Allow them from your device Settings and try again.',
      );
    }

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

    let registration: ServiceWorkerRegistration;
    try {
      registration = await navigator.serviceWorker.ready;
    } catch (err) {
      throw new PushSubscribeError('sw_missing', `Service worker unavailable: ${err instanceof Error ? err.message : err}`);
    }

    let subscription: PushSubscription;
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

    const keys = subscription.toJSON().keys;
    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: keys?.p256dh ?? arrayBufferToBase64(subscription.getKey('p256dh')),
        auth_key: keys?.auth ?? arrayBufferToBase64(subscription.getKey('auth')),
        user_agent: navigator.userAgent,
      },
      { onConflict: 'user_id,endpoint' },
    );
    if (error) {
      throw new PushSubscribeError('db_insert_failed', `Could not save subscription: ${error.message}`);
    }
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
