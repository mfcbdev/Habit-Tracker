/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

self.skipWaiting();
clientsClaim();

// Shared contract with supabase/functions/send-reminders — keep both in sync,
// there's no shared types package across the Deno/browser boundary.
interface PushPayload {
  type: 'habit_reminder' | 'daily_summary';
  title: string;
  body: string;
  habitId?: string;
  url: string;
}

self.addEventListener('push', (event) => {
  if (!event.data) return;
  const payload: PushPayload = event.data.json();

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: payload.url, habitId: payload.habitId, type: payload.type },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data as { url?: string } | undefined)?.url ?? '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      const existing = clientsArr.find((c) => 'focus' in c) as WindowClient | undefined;
      if (existing) {
        existing.focus();
        if ('navigate' in existing) return existing.navigate(url);
        return undefined;
      }
      return self.clients.openWindow(url);
    }),
  );
});
