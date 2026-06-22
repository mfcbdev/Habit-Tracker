import * as webpush from 'https://esm.sh/web-push@3.6.7';

let configured = false;

function configure() {
  if (configured) return;
  const publicKey = Deno.env.get('VAPID_PUBLIC_KEY');
  const privateKey = Deno.env.get('VAPID_PRIVATE_KEY');
  const subject = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:support@example.com';
  if (!publicKey || !privateKey) {
    throw new Error('VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY are not configured');
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

export interface PushSubscriptionKeys {
  endpoint: string;
  p256dh: string;
  authKey: string;
}

export interface SendPushResult {
  ok: boolean;
  statusCode?: number;
}

export async function sendPush(sub: PushSubscriptionKeys, payload: unknown): Promise<SendPushResult> {
  configure();
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.authKey } },
      JSON.stringify(payload),
    );
    return { ok: true };
  } catch (err) {
    const statusCode = (err as { statusCode?: number }).statusCode;
    console.error('Push send failed', sub.endpoint, statusCode, err);
    return { ok: false, statusCode };
  }
}
