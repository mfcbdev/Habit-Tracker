-- Replaces the generic 10-level system with a Valorant-tier-inspired rank
-- ladder driven by "Habit Points" (HP). Renames total_xp -> habit_points and
-- current_level -> current_rank on profiles; replaces `levels` with `ranks`
-- (25 tiers: Iron 1 .. Radiant); renames xp_ledger -> habit_points_ledger.
-- Trigger/function *names* (handle_habit_completion_xp, t2_..._award_xp, etc.)
-- are left as-is — they're internal plumbing, not user-facing "XP" language.

alter table public.profiles rename column total_xp to habit_points;
alter table public.profiles rename column current_level to current_rank;
alter table public.habit_completions rename column xp_earned to hp_earned;

drop table public.levels;

create table public.ranks (
  rank_order smallint primary key,
  tier text not null,
  division smallint,
  display_name text not null,
  min_hp integer not null,
  max_hp integer,
  color text not null
);

insert into public.ranks (rank_order, tier, division, display_name, min_hp, max_hp, color) values
  (1, 'Iron', 1, 'Iron 1', 0, 49, '#6b7280'),
  (2, 'Iron', 2, 'Iron 2', 50, 119, '#6b7280'),
  (3, 'Iron', 3, 'Iron 3', 120, 219, '#6b7280'),
  (4, 'Bronze', 1, 'Bronze 1', 220, 349, '#b5651d'),
  (5, 'Bronze', 2, 'Bronze 2', 350, 519, '#b5651d'),
  (6, 'Bronze', 3, 'Bronze 3', 520, 739, '#b5651d'),
  (7, 'Silver', 1, 'Silver 1', 740, 1019, '#9ca3af'),
  (8, 'Silver', 2, 'Silver 2', 1020, 1369, '#9ca3af'),
  (9, 'Silver', 3, 'Silver 3', 1370, 1799, '#9ca3af'),
  (10, 'Gold', 1, 'Gold 1', 1800, 2319, '#eab308'),
  (11, 'Gold', 2, 'Gold 2', 2320, 2949, '#eab308'),
  (12, 'Gold', 3, 'Gold 3', 2950, 3699, '#eab308'),
  (13, 'Platinum', 1, 'Platinum 1', 3700, 4599, '#2dd4bf'),
  (14, 'Platinum', 2, 'Platinum 2', 4600, 5669, '#2dd4bf'),
  (15, 'Platinum', 3, 'Platinum 3', 5670, 6929, '#2dd4bf'),
  (16, 'Diamond', 1, 'Diamond 1', 6930, 8399, '#a78bfa'),
  (17, 'Diamond', 2, 'Diamond 2', 8400, 10099, '#a78bfa'),
  (18, 'Diamond', 3, 'Diamond 3', 10100, 12059, '#a78bfa'),
  (19, 'Ascendant', 1, 'Ascendant 1', 12060, 14299, '#10b981'),
  (20, 'Ascendant', 2, 'Ascendant 2', 14300, 16849, '#10b981'),
  (21, 'Ascendant', 3, 'Ascendant 3', 16850, 19749, '#10b981'),
  (22, 'Immortal', 1, 'Immortal 1', 19750, 23049, '#f43f5e'),
  (23, 'Immortal', 2, 'Immortal 2', 23050, 26799, '#f43f5e'),
  (24, 'Immortal', 3, 'Immortal 3', 26800, 31049, '#f43f5e'),
  (25, 'Radiant', null, 'Radiant', 31050, null, '#fde68a');

alter table public.ranks enable row level security;

create policy "ranks_select_all" on public.ranks
  for select using (true);

alter table public.xp_ledger rename to habit_points_ledger;

drop view public.weekly_xp_summary;
drop view public.weekly_leaderboard;

create view public.weekly_hp_summary
with (security_invoker = true) as
select
  user_id,
  date_trunc('week', created_at)::date as week_start,
  sum(amount) as hp_total
from public.habit_points_ledger
group by user_id, date_trunc('week', created_at)::date;

create view public.weekly_leaderboard
with (security_invoker = true) as
select
  user_id,
  coalesce(sum(amount) filter (
    where created_at >= date_trunc('week', now())
  ), 0) as current_week_hp,
  coalesce(sum(amount) filter (
    where created_at >= date_trunc('week', now()) - interval '7 days'
      and created_at < date_trunc('week', now())
  ), 0) as last_week_hp,
  coalesce(sum(amount) filter (
    where created_at >= date_trunc('week', now())
  ), 0) - coalesce(sum(amount) filter (
    where created_at >= date_trunc('week', now()) - interval '7 days'
      and created_at < date_trunc('week', now())
  ), 0) as hp_delta
from public.habit_points_ledger
group by user_id;

create or replace function public.difficulty_xp(d public.habit_difficulty) returns integer as $$
  select case d
    when 'easy' then 10
    when 'medium' then 25
    when 'hard' then 50
  end;
$$ language sql immutable;

create or replace function public.handle_habit_completion_xp() returns trigger as $$
declare
  v_difficulty public.habit_difficulty;
  v_hp integer;
  v_new_total integer;
begin
  select difficulty into v_difficulty from public.habits where id = new.habit_id;
  v_hp := public.difficulty_xp(v_difficulty);

  update public.habit_completions set hp_earned = v_hp where id = new.id;

  insert into public.habit_points_ledger (user_id, habit_completion_id, amount, reason)
  values (new.user_id, new.id, v_hp, 'habit_completion');

  update public.profiles
  set habit_points = habit_points + v_hp,
      updated_at = now()
  where id = new.user_id
  returning habit_points into v_new_total;

  update public.profiles
  set current_rank = (select coalesce(max(rank_order), 1) from public.ranks where min_hp <= v_new_total)
  where id = new.user_id;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.handle_habit_completion_delete_xp() returns trigger as $$
declare
  v_new_total integer;
begin
  insert into public.habit_points_ledger (user_id, habit_completion_id, amount, reason)
  values (old.user_id, null, -old.hp_earned, 'habit_completion_reverted');

  update public.profiles
  set habit_points = greatest(0, habit_points - old.hp_earned),
      updated_at = now()
  where id = old.user_id
  returning habit_points into v_new_total;

  update public.profiles
  set current_rank = (select coalesce(max(rank_order), 1) from public.ranks where min_hp <= v_new_total)
  where id = old.user_id;

  return old;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.check_and_award_badges(p_user_id uuid) returns void as $$
declare
  v_total_completions integer;
  v_max_streak integer;
  v_habit_count integer;
  v_rank integer;
  b record;
  v_qualifies boolean;
begin
  select count(*) into v_total_completions from public.habit_completions where user_id = p_user_id;
  select coalesce(max(current_streak), 0) into v_max_streak from public.habit_streaks where user_id = p_user_id;
  select count(*) into v_habit_count from public.habits where user_id = p_user_id;
  select current_rank into v_rank from public.profiles where id = p_user_id;

  for b in select * from public.badges loop
    v_qualifies := case b.criteria_type
      when 'streak' then v_max_streak >= b.criteria_value
      when 'total_completions' then v_total_completions >= b.criteria_value
      when 'habit_count' then v_habit_count >= b.criteria_value
      when 'level' then coalesce(v_rank, 1) >= b.criteria_value
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

delete from public.badges where code in ('level_5', 'level_10');

insert into public.badges (code, name, description, icon, criteria_type, criteria_value) values
  ('rank_gold', 'Going for Gold', 'Reached Gold rank', 'star', 'level', 10),
  ('rank_diamond', 'Diamond Hands', 'Reached Diamond rank', 'star', 'level', 16),
  ('rank_immortal', 'Immortal', 'Reached Immortal rank', 'star', 'level', 22),
  ('rank_radiant', 'Radiant', 'Reached the top rank', 'star', 'level', 25);
