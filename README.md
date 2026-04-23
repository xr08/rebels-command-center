# Rebels Command Center

Standalone Next.js App Router foundation for the `xr08/rebels_command_center` web app.
Primary Supabase project: `socials-command-center` (`ckrhabmjqfzofmkognuh`).

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (Auth + Postgres + Storage-ready model)
- Vercel-ready deployment scripts/config

## Routes

- `/dashboard`
- `/social`
- `/templates`
- `/media`
- `/history`

`/login` currently redirects to `/dashboard` (open-access mode).

## Quick Start

1. Install dependencies:
   - `npm install`
2. Configure env vars:
   - Copy `.env.example` to `.env.local`
   - Set `NEXT_PUBLIC_SUPABASE_URL`
   - Set `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. For a fresh Supabase environment, run the single bootstrap SQL:
   - `supabase/migrations/20260423214000_bootstrap_socials_command_center.sql`
4. For this repository's already-linked remote (`ckrhabmjqfzofmkognuh`), migration history is already applied and in sync.
4. Start locally:
   - `npm run dev`

## Notes

- Branding is driven from `clubs` + `brand_settings` in Supabase.
- Auth login is disabled for now; app runs in open-access mode.
- Phase 1 post types:
  - `preview_single`
  - `result_single`
  - `preview_summary`
  - `result_summary`
- PNG export is done in-browser with `html-to-image`.
