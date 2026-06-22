-- Analytics views. security_invoker is required (PG15+) so each view enforces
-- the querying user's RLS instead of running with the view owner's privileges.
create view public.habit_completion_rates
with (security_invoker = true) as
select
  h.id as habit_id,
  h.user_id,
  h.name,
  h.frequency,
  count(hc.id) filter (where hc.completed_date >= current_date - interval '7 days') as completions_7d,
  count(hc.id) filter (where hc.completed_date >= current_date - interval '30 days') as completions_30d,
  round(
    count(hc.id) filter (where hc.completed_date >= current_date - interval '7 days')::numeric
    / greatest(1, cardinality(h.frequency_days)) / 1.0, 2
  ) as rough_weekly_rate
from public.habits h
left join public.habit_completions hc on hc.habit_id = h.id
group by h.id, h.user_id, h.name, h.frequency, h.frequency_days;

create view public.weekly_xp_summary
with (security_invoker = true) as
select
  user_id,
  date_trunc('week', created_at)::date as week_start,
  sum(amount) as xp_total
from public.xp_ledger
group by user_id, date_trunc('week', created_at)::date;

-- Personal (non-social) weekly leaderboard: this week vs last week, per user.
create view public.weekly_leaderboard
with (security_invoker = true) as
select
  user_id,
  coalesce(sum(amount) filter (
    where created_at >= date_trunc('week', now())
  ), 0) as current_week_xp,
  coalesce(sum(amount) filter (
    where created_at >= date_trunc('week', now()) - interval '7 days'
      and created_at < date_trunc('week', now())
  ), 0) as last_week_xp,
  coalesce(sum(amount) filter (
    where created_at >= date_trunc('week', now())
  ), 0) - coalesce(sum(amount) filter (
    where created_at >= date_trunc('week', now()) - interval '7 days'
      and created_at < date_trunc('week', now())
  ), 0) as xp_delta
from public.xp_ledger
group by user_id;
