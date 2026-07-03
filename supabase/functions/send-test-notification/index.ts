import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { sendPush } from '../send-reminders/webpush.ts';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json(405, { ok: false, error: 'method_not_allowed' });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token) return json(401, { ok: false, error: 'missing_auth' });

    const url = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !serviceRoleKey) {
      return json(500, { ok: false, error: 'env_missing', detail: { url: !!url, serviceRoleKey: !!serviceRoleKey } });
    }

    // Service role for all DB and JWT-verification operations.
    const admin = createClient(url, serviceRoleKey);

    // Verify the user JWT by passing it explicitly — avoids the global-header
    // pattern that's flaky across supabase-js versions.
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData?.user) {
      return json(401, { ok: false, error: 'invalid_auth', detail: userError?.message ?? null });
    }
    const userId = userData.user.id;

    const { data: subs, error: subsError } = await admin
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);
    if (subsError) return json(500, { ok: false, error: 'subs_query_failed', detail: subsError.message });
    if (!subs || subs.length === 0) return json(404, { ok: false, error: 'no_subscriptions' });

    const vapidSet = {
      VAPID_PUBLIC_KEY: !!Deno.env.get('VAPID_PUBLIC_KEY'),
      VAPID_PRIVATE_KEY: !!Deno.env.get('VAPID_PRIVATE_KEY'),
      VAPID_SUBJECT: !!Deno.env.get('VAPID_SUBJECT'),
    };
    if (!vapidSet.VAPID_PUBLIC_KEY || !vapidSet.VAPID_PRIVATE_KEY) {
      return json(500, { ok: false, error: 'vapid_not_configured', detail: vapidSet });
    }

    const payload = {
      type: 'habit_reminder' as const,
      title: 'Test notification',
      body: 'If you can see this, push delivery is working end-to-end. ✓',
      url: '/profile',
    };

    let delivered = 0;
    const failures: { endpoint: string; statusCode?: number }[] = [];
    for (const sub of subs) {
      const result = await sendPush(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, authKey: sub.auth_key },
        payload,
      );
      if (result.ok) {
        delivered += 1;
      } else {
        failures.push({ endpoint: sub.endpoint.slice(0, 60) + '…', statusCode: result.statusCode });
        if (result.statusCode === 404 || result.statusCode === 410) {
          await admin.from('push_subscriptions').delete().eq('id', sub.id);
        }
      }
    }

    return json(200, { ok: true, delivered, total: subs.length, failures });
  } catch (err) {
    const detail = err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : String(err);
    console.error('send-test-notification error', detail);
    return json(500, { ok: false, error: 'unhandled', detail });
  }
});
