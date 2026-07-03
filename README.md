# Habit Tracker

An iOS-style habit tracking PWA. Built with React, Vite, TypeScript, Tailwind, and Supabase. Deployed on Vercel.

## Features

- **Today** — see today's habits grouped by morning/afternoon/evening, tap to complete with confetti, tap any past day in the week strip to review that day read-only.
- **Habits** — Atoms-inspired bubble grid. Tap a habit to open a detail sheet with a serif "I will *X*, every day at *Y*, so that I can become *Z*" vision statement, a 3-month completion heatmap, and quick actions (edit / archive / delete).
- **Schedule** — Timepage-inspired vertical timeline with floating event cards, day navigation across any date, a "now" line that ticks in real time, and a Today button to jump back.
- **Profile** — Rank progress, recent-results strip (30d), full-account activity heatmap (90d), per-habit 7d completion bars, cumulative HP area chart with rank-up markers, badge grid, and theme + notification settings.
- **Gamification** — Habit Points (HP) with a 25-tier Valorant-inspired rank ladder from Iron 1 to Radiant. Streaks, HP, and badges are all server-derived via a Postgres trigger chain — the client only inserts/deletes `habit_completions` rows.
- **Push notifications** — Web Push via a Supabase Edge Function scheduled on `pg_cron` (every 5 min). Sends habit reminders before scheduled start times and optional daily summaries. iOS supported when the PWA is installed to the home screen.
- **Themes** — Light + dark themes driven by CSS variables, with a system-follow option. Design tokens for surfaces, text, borders, shadows, radii, and motion so the palette swaps instantly.
- **PWA** — Installable to home screen with an offline-capable service worker and a manifest tuned for iOS status-bar tinting per theme.

## Tech stack

- **Frontend**: React 18, Vite 5, TypeScript, React Router 6, TanStack Query 5, Tailwind (design-token driven), framer-motion, vaul (bottom sheets), Recharts, Lucide icons, canvas-confetti.
- **Backend**: Supabase (Postgres + Auth + Realtime + Edge Functions). All derived state (streaks, HP, badges) is computed by SQL triggers on `habit_completions` — the client never computes it.
- **Push**: `web-push` library, VAPID keys stored as Edge Function secrets.
- **Design inspiration**: Timepage (schedule), Atoms (habit detail), Tangerine (today grouping), Stoic (typography and whitespace). Palette anchored on `#1A312C` forest with cream `#FAF3E1` and mint `#8FD5B4` accents.

## Local setup

```bash
git clone https://github.com/mfcbdev/Habit-Tracker.git
cd Habit-Tracker
npm install
cp .env.example .env.local
# Fill in the three VITE_* keys from your Supabase project + a VAPID public key.
npm run dev
```

Open http://localhost:5173.

### Environment variables

`.env.local` (client-only, all `VITE_*` are baked into the bundle at build time):

| Variable | Where to find it |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase dashboard → Settings → API (anon public) |
| `VITE_VAPID_PUBLIC_KEY` | Generated once via `npx web-push generate-vapid-keys` |

Server-side secrets (Supabase Edge Function secrets, not in `.env.local`):

| Secret | Purpose |
| --- | --- |
| `VAPID_PUBLIC_KEY` | Must match `VITE_VAPID_PUBLIC_KEY` |
| `VAPID_PRIVATE_KEY` | Paired with the public key; never leaves the server |
| `VAPID_SUBJECT` | `mailto:you@example.com` — sent to push services |

Set via `npx supabase secrets set NAME=value --project-ref <ref>`.

## Database

Schema lives in [`supabase/migrations/`](supabase/migrations). Push directly to a live project (Docker not required):

```bash
npx supabase db push --db-url postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres
```

Core tables: `profiles`, `habits`, `habit_completions`, `habit_streaks`, `habit_points_ledger`, `ranks`, `badges`, `user_badges`, `push_subscriptions`, `notification_log`. Derived views: `habit_completion_rates`, `weekly_hp_summary`, `weekly_leaderboard`.

The trigger chain on `habit_completions` runs in name order (`t1_..._streak_sync` → `t2_..._award_xp` → `t3_..._check_badges`) — Postgres fires same-event triggers alphabetically.

## Edge Functions

Two functions live under [`supabase/functions/`](supabase/functions):

- **`send-reminders`** — runs every 5 minutes via `pg_cron`, matches habits due in the lookahead window, dedupes via `notification_log`, sends via `web-push`. Also sends daily summaries at each user's chosen time.
- **`send-test-notification`** — authenticated (user JWT), fires a one-off test push to all the caller's subscriptions. Used by the "Send" button in Profile → Notifications for end-to-end verification.

Deploy with `npx supabase functions deploy <name> --project-ref <ref>`.

## Scripts

- `npm run dev` — Vite dev server on port 5173
- `npm run build` — type-check + production build
- `npm run preview` — serve the production build locally
- `npm run lint` — ESLint
- `npm test` — Vitest

## License

MIT. See [LICENSE](LICENSE).
