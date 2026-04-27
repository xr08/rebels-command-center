# Production Readiness

## Vercel Environment Variables

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Notes:

- Do not expose `SUPABASE_SERVICE_ROLE_KEY` to browser/client bundles.
- If a service role key is ever introduced, keep it server-side only (API routes/server actions).

## Supabase Project Requirements

Primary project:

- `socials-command-center`
- project ref: `ckrhabmjqfzofmkognuh`
- URL: `https://ckrhabmjqfzofmkognuh.supabase.co`

Required schema/migrations:

- baseline migrations in `supabase/migrations`
- hardening migration:
  - `20260427110000_harden_rls_authenticated_writes.sql`

## Smoke Test Checklist (Post Deploy)

1. Open `/social` and confirm fixtures load for Upcoming and Results.
2. Generate single preview/result post, then:
   - generate caption
   - copy caption
   - export PNG (square and portrait)
3. Generate round summary preview/result, then export PNG.
4. Save draft and posted entries, then verify in `/history`.
5. Open `/history` and reuse a draft via `Open Draft/Reuse`.
6. Upload a media asset on `/media`, confirm thumbnail appears and can be selected as background.

## Backup and Export Plan

Tables to snapshot regularly:

- `fixtures`
- `social_posts`
- `media_assets`

Recommended routine:

1. Use Supabase dashboard SQL editor or CLI export before major releases.
2. Store timestamped CSV/SQL exports in secure storage.
3. Keep at least:
   - daily export for 7 days
   - weekly export for 8 weeks

## Rollback Plan

1. Roll back app deploy in Vercel to previous healthy deployment.
2. If migration rollback is required:
   - apply compensating SQL migration (do not edit history in place on production).
3. Re-run smoke test checklist.

## Known Limitations

- No Meta/auto-post integration yet.
- Current auth posture can block unauthenticated write actions (draft save/media upload) by design.
- Error handling is lightweight and operator-focused (no external observability service configured).

## Do Not Publicly Enable Yet

- Public unauthenticated write access to `social_posts`, `media_assets`, or storage objects.
- Any server-side usage of `SUPABASE_SERVICE_ROLE_KEY` in client components.
