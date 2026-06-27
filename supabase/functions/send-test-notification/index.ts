import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { sendPush } from '../send-reminders/webpush.ts';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'method_not_allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ ok: false, error: 'missing_auth' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const url = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!url || !serviceRoleKey || !anonKey) {
      throw new Error('Supabase env vars not configured');
    }

    // Identify the caller via their JWT (anon client honors the user token).
    const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ ok: false, error: 'invalid_auth' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    const userId = userData.user.id;

    // Service role to read subscriptions and self-heal stale ones.
    const admin = createClient(url, serviceRoleKey);
    const { data: subs } = await admin.from('push_subscriptions').select('*').eq('user_id', userId);

    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ ok: false, error: 'no_subscriptions' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const payload = {
      type: 'habit_reminder' as const,
      title: 'Test notification',
      body: 'If you can see this, push delivery is working end-to-end. ✓',
      url: '/profile',
    };

    let delivered = 0;
    for (const sub of subs) {
      const result = await sendPush(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, authKey: sub.auth_key },
        payload,
      );
      if (result.ok) delivered += 1;
      else if (result.statusCode === 404 || result.statusCode === 410) {
        await admin.from('push_subscriptions').delete().eq('id', sub.id);
      }
    }

    return new Response(JSON.stringify({ ok: true, delivered, total: subs.length }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
