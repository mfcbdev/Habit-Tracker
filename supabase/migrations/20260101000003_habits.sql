-- Habits + time block overlap prevention
create type public.habit_frequency as enum ('daily', 'weekly');
create type public.habit_difficulty as enum ('easy', 'medium', 'hard');

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  description text,
  category text,
  color text not null default '#6366f1',
  icon text not null default 'circle',
  frequency public.habit_frequency not null default 'daily',
  -- day of week: 0 = Sunday .. 6 = Saturday. 'daily' habits implicitly use all 7.
  frequency_days smallint[] not null default '{0,1,2,3,4,5,6}',
  time_start time not null,
  time_end time not null,
  difficulty public.habit_difficulty not null default 'medium',
  reminder_offset_minutes smallint not null default 10 check (reminder_offset_minutes >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint habits_time_range_valid check (time_end > time_start),
  constraint habits_frequency_days_valid check (
    array_length(frequency_days, 1) > 0
    and frequency_days <@ array[0,1,2,3,4,5,6]::smallint[]
  )
);

create index habits_user_id_idx on public.habits (user_id);
create index habits_user_active_idx on public.habits (user_id, is_active);
create index habits_frequency_days_gin_idx on public.habits using gin (frequency_days);
create index habits_category_idx on public.habits (user_id, category);

alter table public.habits enable row level security;

create policy "habits_select_own" on public.habits
  for select using (auth.uid() = user_id);

create policy "habits_insert_own" on public.habits
  for insert with check (auth.uid() = user_id);

create policy "habits_update_own" on public.habits
  for update using (auth.uid() = user_id);

create policy "habits_delete_own" on public.habits
  for delete using (auth.uid() = user_id);

create trigger habits_set_updated_at
  before update on public.habits
  for each row execute function public.set_updated_at();

-- Prevent two active habits for the same user from sharing a day and overlapping times.
-- Note: this is a row-trigger check, not an exclusion constraint, because overlap depends
-- on a smallint[] day mask rather than a single equality key. Under concurrent inserts for
-- the same user this has a small race window; acceptable at this app's scale (single user
-- editing their own schedule from one device at a time).
create function public.check_habit_time_overlap() returns trigger as $$
declare
  conflict_count integer;
begin
  if new.is_active = false then
    return new;
  end if;

  select count(*) into conflict_count
  from public.habits h
  where h.user_id = new.user_id
    and h.id <> new.id
    and h.is_active = true
    and h.frequency_days && new.frequency_days
    and h.time_start < new.time_end
    and h.time_end > new.time_start;

  if conflict_count > 0 then
    raise exception 'Time block %-% overlaps with an existing habit on a shared day', new.time_start, new.time_end
      using errcode = '23P01';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger habits_check_overlap
  before insert or update of time_start, time_end, frequency_days, is_active, user_id
  on public.habits
  for each row execute function public.check_habit_time_overlap();
