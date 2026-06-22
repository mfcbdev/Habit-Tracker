-- postgres_changes subscriptions only fire for tables added to this publication.
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.habit_streaks;
alter publication supabase_realtime add table public.user_badges;
