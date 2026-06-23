-- Adds an optional "purpose" / vision sentence per habit.
-- Surfaced in the habit detail bottom sheet as:
--   "I will <name>, every day at <time>, so that I can become <purpose>."

alter table public.habits add column if not exists purpose text;
