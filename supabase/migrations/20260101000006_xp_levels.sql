-- Levels reference table + append-only XP ledger + profile XP/level sync
create table public.levels (
  level integer primary key,
  min_xp integer not null,
  max_xp integer,
  title text not null
);

insert into public.levels (level, min_xp, max_xp, title) values
  (1, 0, 100, 'Beginner'),
  (2, 101, 300, 'Novice'),
  (3, 301, 600, 'Apprentice'),
  (4, 601, 1000, 'Achiever'),
  (5, 1001, 1500, 'Pro'),
  (6, 1501, 2500, 'Expert'),
  (7, 2501, 4000, 'Master'),
  (8, 4001, 6000, 'Champion'),
  (9, 6001, 9000, 'Legend'),
  (10, 9001, null, 'Grandmaster');

alter table public.levels enable row level security;

create policy "levels_select_all" on public.levels
  for select using (true);

create table public.xp_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_completion_id uuid references public.habit_completions(id) on delete set null,
  amount integer not null,
  reason text not null default 'habit_completion',
  created_at timestamptz not null default now()
);

create index xp_ledger_user_idx on public.xp_ledger (user_id, created_at desc);

alter table public.xp_ledger enable row level security;

create policy "xp_ledger_select_own" on public.xp_ledger
  for select using (auth.uid() = user_id);

-- No client write policies: the ledger is only ever appended to by the
-- security definer trigger functions below.

create function public.difficulty_xp(d public.habit_difficulty) returns integer as $$
  select case d
    when 'easy' then 10
    when 'medium' then 25
    when 'hard' then 50
  end;
$$ language sql immutable;

create function public.handle_habit_completion_xp() returns trigger as $$
declare
  v_difficulty public.habit_difficulty;
  v_xp integer;
  v_new_total integer;
begin
  select difficulty into v_difficulty from public.habits where id = new.habit_id;
  v_xp := public.difficulty_xp(v_difficulty);

  update public.habit_completions set xp_earned = v_xp where id = new.id;

  insert into public.xp_ledger (user_id, habit_completion_id, amount, reason)
  values (new.user_id, new.id, v_xp, 'habit_completion');

  update public.profiles
  set total_xp = total_xp + v_xp,
      updated_at = now()
  where id = new.user_id
  returning total_xp into v_new_total;

  update public.profiles
  set current_level = (select coalesce(max(level), 1) from public.levels where min_xp <= v_new_total)
  where id = new.user_id;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create function public.handle_habit_completion_delete_xp() returns trigger as $$
declare
  v_new_total integer;
begin
  insert into public.xp_ledger (user_id, habit_completion_id, amount, reason)
  values (old.user_id, null, -old.xp_earned, 'habit_completion_reverted');

  update public.profiles
  set total_xp = greatest(0, total_xp - old.xp_earned),
      updated_at = now()
  where id = old.user_id
  returning total_xp into v_new_total;

  update public.profiles
  set current_level = (select coalesce(max(level), 1) from public.levels where min_xp <= v_new_total)
  where id = old.user_id;

  return old;
end;
$$ language plpgsql security definer set search_path = public;

-- Numeric prefix: fires after streak sync (t1) so anything downstream sees
-- consistent state, before the badge check (t3) which depends on both.
create trigger t2_habit_completions_award_xp
  after insert on public.habit_completions
  for each row execute function public.handle_habit_completion_xp();

create trigger t2_habit_completions_revert_xp
  after delete on public.habit_completions
  for each row execute function public.handle_habit_completion_delete_xp();
