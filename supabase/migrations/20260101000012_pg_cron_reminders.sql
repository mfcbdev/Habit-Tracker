-- Schedules the send-reminders Edge Function every 5 minutes via pg_cron +
-- pg_net, matching the LOOKAHEAD_MINUTES window in the function itself.
--
-- IMPORTANT: the service role key must be stored in Supabase Vault BEFORE
-- this job can authenticate, via a one-off statement run directly against
-- the database (never inside a migration file, so the key never lands in
-- git history):
--   select vault.create_secret('<service-role-key>', 'service_role_key');
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'send-reminders-every-5-min',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://irjwbfeqpmcixamyswkx.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);
