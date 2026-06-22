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
    if (!userId) return;
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const registration = await navigator.serviceWorker.ready;
    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

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
    if (error) throw error;
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
