-- Web Push subscriptions + a log used both for analytics and for de-duplicating sends
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth_key text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

create index push_subscriptions_user_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

create policy "push_subscriptions_select_own" on public.push_subscriptions
  for select using (auth.uid() = user_id);

create policy "push_subscriptions_insert_own" on public.push_subscriptions
  for insert with check (auth.uid() = user_id);

create policy "push_subscriptions_delete_own" on public.push_subscriptions
  for delete using (auth.uid() = user_id);

create table public.notification_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('habit_reminder', 'daily_summary')),
  habit_id uuid references public.habits(id) on delete cascade,
  sent_at timestamptz not null default now(),
  payload jsonb
);

-- Edge function queries "has this reminder already fired today" before sending
create index notification_log_dedupe_idx on public.notification_log (user_id, type, habit_id, sent_at);

alter table public.notification_log enable row level security;

create policy "notification_log_select_own" on public.notification_log
  for select using (auth.uid() = user_id);

-- Inserts come only from the Edge Function using the service role key, which
-- bypasses RLS, so no insert policy is needed for end users here.
