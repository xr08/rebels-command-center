-- Production hardening: keep reads available, tighten writes to authenticated users only.

alter table public.clubs enable row level security;
alter table public.teams enable row level security;
alter table public.fixtures enable row level security;
alter table public.brand_settings enable row level security;
alter table public.social_posts enable row level security;
alter table public.media_assets enable row level security;

-- Ensure authenticated read access exists for required app tables.
drop policy if exists "authenticated read clubs" on public.clubs;
create policy "authenticated read clubs"
on public.clubs for select to authenticated
using (true);

drop policy if exists "authenticated read teams" on public.teams;
create policy "authenticated read teams"
on public.teams for select to authenticated
using (true);

drop policy if exists "authenticated read fixtures" on public.fixtures;
create policy "authenticated read fixtures"
on public.fixtures for select to authenticated
using (true);

drop policy if exists "authenticated read brand_settings" on public.brand_settings;
create policy "authenticated read brand_settings"
on public.brand_settings for select to authenticated
using (true);

drop policy if exists "authenticated read social_posts" on public.social_posts;
create policy "authenticated read social_posts"
on public.social_posts for select to authenticated
using (true);

drop policy if exists "authenticated read media_assets" on public.media_assets;
create policy "authenticated read media_assets"
on public.media_assets for select to authenticated
using (true);

-- Tighten social_posts writes.
drop policy if exists "public write posts" on public.social_posts;
drop policy if exists "authenticated write posts" on public.social_posts;
create policy "authenticated write posts"
on public.social_posts
for all to authenticated
using (true)
with check (true);

-- Tighten media_assets writes.
drop policy if exists "public write media" on public.media_assets;
drop policy if exists "authenticated write media" on public.media_assets;
create policy "authenticated write media"
on public.media_assets
for insert to authenticated
with check (true);

-- Tighten storage object writes (social-assets bucket).
drop policy if exists "public write social-assets" on storage.objects;
drop policy if exists "authenticated write social-assets" on storage.objects;
create policy "authenticated write social-assets"
on storage.objects
for insert to authenticated
with check (bucket_id = 'social-assets');
