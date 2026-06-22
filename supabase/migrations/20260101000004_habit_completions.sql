-- Habit completions: one row per habit per completed calendar date
create table public.habit_completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_date date not null,
  completed_at timestamptz not null default now(),
  xp_earned integer not null default 0,
  created_at timestamptz not null default now(),
  unique (habit_id, completed_date)
);

create index habit_completions_user_date_idx on public.habit_completions (user_id, completed_date desc);
create index habit_completions_habit_date_idx on public.habit_completions (habit_id, completed_date desc);

alter table public.habit_completions enable row level security;

create policy "completions_select_own" on public.habit_completions
  for select using (auth.uid() = user_id);

create policy "completions_insert_own" on public.habit_completions
  for insert with check (auth.uid() = user_id);

create policy "completions_delete_own" on public.habit_completions
  for delete using (auth.uid() = user_id);

-- Completions are immutable by design (mark done / undo done = insert / delete), no update policy.
