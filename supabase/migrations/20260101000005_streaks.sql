-- Cached streak state per habit, recalculated whenever completions change.
create table public.habit_streaks (
  habit_id uuid primary key references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_completed_date date,
  updated_at timestamptz not null default now()
);

create index habit_streaks_user_idx on public.habit_streaks (user_id);

alter table public.habit_streaks enable row level security;

create policy "streaks_select_own" on public.habit_streaks
  for select using (auth.uid() = user_id);

-- No insert/update/delete policies: this table is only ever written by the
-- security definer function below, never directly by a client.

-- Recomputes current + longest streak for a habit, counting only days the
-- habit was actually due (frequency_days), so weekly habits don't get
-- penalized for non-scheduled days. Bounded by the habit's completion
-- history span, which is fine at personal-habit-tracker scale.
create function public.recalculate_habit_streak(p_habit_id uuid) returns void as $$
declare
  v_habit public.habits;
  v_start_date date;
  v_last_completed date;
  v_check_date date;
  v_dow smallint;
  v_has_completion boolean;
  v_run integer := 0;
  v_longest integer := 0;
begin
  select * into v_habit from public.habits where id = p_habit_id;
  if v_habit is null then
    return;
  end if;

  select min(completed_date), max(completed_date)
    into v_start_date, v_last_completed
  from public.habit_completions
  where habit_id = p_habit_id;

  if v_start_date is null then
    insert into public.habit_streaks (habit_id, user_id, current_streak, longest_streak, last_completed_date, updated_at)
    values (p_habit_id, v_habit.user_id, 0, 0, null, now())
    on conflict (habit_id) do update set
      current_streak = 0, longest_streak = 0, last_completed_date = null, updated_at = now();
    return;
  end if;

  v_check_date := v_start_date;
  while v_check_date <= current_date loop
    v_dow := extract(dow from v_check_date);
    if v_dow = any(v_habit.frequency_days) then
      select exists(
        select 1 from public.habit_completions
        where habit_id = p_habit_id and completed_date = v_check_date
      ) into v_has_completion;

      if v_has_completion then
        v_run := v_run + 1;
        v_longest := greatest(v_longest, v_run);
      elsif v_check_date < current_date then
        -- missed a due day in the past breaks the run; today missing doesn't (yet)
        v_run := 0;
      end if;
    end if;
    v_check_date := v_check_date + 1;
  end loop;

  insert into public.habit_streaks (habit_id, user_id, current_streak, longest_streak, last_completed_date, updated_at)
  values (p_habit_id, v_habit.user_id, v_run, v_longest, v_last_completed, now())
  on conflict (habit_id) do update set
    current_streak = excluded.current_streak,
    longest_streak = excluded.longest_streak,
    last_completed_date = excluded.last_completed_date,
    updated_at = now();
end;
$$ language plpgsql security definer set search_path = public;

create function public.handle_habit_completion_change() returns trigger as $$
begin
  if tg_op = 'DELETE' then
    perform public.recalculate_habit_streak(old.habit_id);
    return old;
  else
    perform public.recalculate_habit_streak(new.habit_id);
    return new;
  end if;
end;
$$ language plpgsql security definer set search_path = public;

-- Numeric prefix on the trigger name controls firing order relative to the
-- XP and badge triggers added in later migrations (Postgres fires same-event
-- triggers in name order): streak state must be fresh before badges are checked.
create trigger t1_habit_completions_streak_sync
  after insert or delete on public.habit_completions
  for each row execute function public.handle_habit_completion_change();
