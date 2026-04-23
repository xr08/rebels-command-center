alter table public.clubs enable row level security;
alter table public.brand_settings enable row level security;
alter table public.teams enable row level security;
alter table public.fixtures enable row level security;
alter table public.social_templates enable row level security;
alter table public.media_assets enable row level security;
alter table public.social_posts enable row level security;

drop policy if exists "authenticated read clubs" on public.clubs;
drop policy if exists "public read clubs" on public.clubs;
create policy "public read clubs" on public.clubs for select to public using (true);

drop policy if exists "authenticated read brand_settings" on public.brand_settings;
drop policy if exists "public read brand_settings" on public.brand_settings;
create policy "public read brand_settings" on public.brand_settings for select to public using (true);

drop policy if exists "authenticated read teams" on public.teams;
drop policy if exists "public read teams" on public.teams;
create policy "public read teams" on public.teams for select to public using (true);

drop policy if exists "authenticated read fixtures" on public.fixtures;
drop policy if exists "public read fixtures" on public.fixtures;
create policy "public read fixtures" on public.fixtures for select to public using (true);

drop policy if exists "authenticated read templates" on public.social_templates;
drop policy if exists "public read templates" on public.social_templates;
create policy "public read templates" on public.social_templates for select to public using (true);

drop policy if exists "authenticated read media" on public.media_assets;
drop policy if exists "public read media" on public.media_assets;
create policy "public read media" on public.media_assets for select to public using (true);

drop policy if exists "authenticated read posts" on public.social_posts;
drop policy if exists "public read posts" on public.social_posts;
create policy "public read posts" on public.social_posts for select to public using (true);

drop policy if exists "authenticated write posts" on public.social_posts;
drop policy if exists "public write posts" on public.social_posts;
create policy "public write posts" on public.social_posts
for all to public
using (true)
with check (true);

drop policy if exists "authenticated read social-assets" on storage.objects;
drop policy if exists "public read social-assets" on storage.objects;
create policy "public read social-assets"
on storage.objects for select to public
using (bucket_id = 'social-assets');

drop policy if exists "authenticated write social-assets" on storage.objects;
drop policy if exists "public write social-assets" on storage.objects;
create policy "public write social-assets"
on storage.objects for insert to public
with check (bucket_id = 'social-assets');
