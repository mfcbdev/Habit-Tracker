-- Badge catalog + per-user earned badges + automatic award checks
create table public.badges (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text not null,
  icon text not null default 'award',
  criteria_type text not null check (criteria_type in ('streak', 'total_completions', 'habit_count', 'level')),
  criteria_value integer not null
);

insert into public.badges (code, name, description, icon, criteria_type, criteria_value) values
  ('first_habit', 'First Step', 'Created your first habit', 'sparkles', 'habit_count', 1),
  ('streak_7', '7-Day Streak', 'Completed a habit 7 days in a row', 'flame', 'streak', 7),
  ('streak_30', '30-Day Streak', 'Completed a habit 30 days in a row', 'flame', 'streak', 30),
  ('streak_100', '100-Day Streak', 'Completed a habit 100 days in a row', 'flame', 'streak', 100),
  ('completions_100', 'Centurion', 'Completed 100 total habits', 'medal', 'total_completions', 100),
  ('completions_500', 'Habit Machine', 'Completed 500 total habits', 'medal', 'total_completions', 500),
  ('level_5', 'Rising Star', 'Reached level 5', 'star', 'level', 5),
  ('level_10', 'Grandmaster', 'Reached level 10', 'star', 'level', 10);

alter table public.badges enable row level security;

create policy "badges_select_all" on public.badges
  for select using (true);

create table public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

create index user_badges_user_idx on public.user_badges (user_id);

alter table public.user_badges enable row level security;

create policy "user_badges_select_own" on public.user_badges
  for select using (auth.uid() = user_id);

-- No client write policies: badges are only ever awarded by the security
-- definer function below.

create function public.check_and_award_badges(p_user_id uuid) returns void as $$
declare
  v_total_completions integer;
  v_max_streak integer;
  v_habit_count integer;
  v_level integer;
  b record;
  v_qualifies boolean;
begin
  select count(*) into v_total_completions from public.habit_completions where user_id = p_user_id;
  select coalesce(max(current_streak), 0) into v_max_streak from public.habit_streaks where user_id = p_user_id;
  select count(*) into v_habit_count from public.habits where user_id = p_user_id;
  select current_level into v_level from public.profiles where id = p_user_id;

  for b in select * from public.badges loop
    v_qualifies := case b.criteria_type
      when 'streak' then v_max_streak >= b.criteria_value
      when 'total_completions' then v_total_completions >= b.criteria_value
      when 'habit_count' then v_habit_count >= b.criteria_value
      when 'level' then coalesce(v_level, 1) >= b.criteria_value
      else false
    end;

    if v_qualifies then
      insert into public.user_badges (user_id, badge_id)
      values (p_user_id, b.id)
      on conflict (user_id, badge_id) do nothing;
    end if;
  end loop;
end;
$$ language plpgsql security definer set search_path = public;

create function public.trigger_check_badges_on_completion() returns trigger as $$
begin
  perform public.check_and_award_badges(new.user_id);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create function public.trigger_check_badges_on_habit() returns trigger as $$
begin
  perform public.check_and_award_badges(new.user_id);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- t3 fires last: after streak sync (t1) and XP award (t2) on habit_completions
create trigger t3_habit_completions_check_badges
  after insert on public.habit_completions
  for each row execute function public.trigger_check_badges_on_completion();

create trigger t1_habits_check_badges
  after insert on public.habits
  for each row execute function public.trigger_check_badges_on_habit();
