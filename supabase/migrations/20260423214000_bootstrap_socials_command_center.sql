-- Bootstrap migration for Supabase project: socials-command-center
-- Project URL: https://ckrhabmjqfzofmkognuh.supabase.co
-- This migration is idempotent and reflects the current open-access (no-login) app mode.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'stream_type') then
    create type stream_type as enum ('mens', 'womens', 'juniors');
  end if;
  if not exists (select 1 from pg_type where typname = 'social_post_type') then
    create type social_post_type as enum ('preview_single', 'result_single', 'preview_summary', 'result_summary');
  end if;
  if not exists (select 1 from pg_type where typname = 'social_post_status') then
    create type social_post_status as enum ('draft', 'posted');
  end if;
end $$;

create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.brand_settings (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  primary_color text not null,
  accent_color text not null,
  logo_path text,
  font_family text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (club_id)
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  name text not null,
  stream stream_type not null,
  created_at timestamptz not null default now()
);

create table if not exists public.fixtures (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  opponent_name text not null,
  round_label text not null,
  fixture_date timestamptz not null,
  venue text not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed')),
  home_score integer,
  away_score integer,
  result_outcome text,
  created_at timestamptz not null default now()
);

create table if not exists public.social_templates (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  name text not null,
  post_type social_post_type not null,
  component_key text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  storage_bucket text not null,
  file_path text not null,
  media_type text not null,
  alt_text text,
  created_at timestamptz not null default now()
);

create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  fixture_id uuid not null references public.fixtures(id) on delete cascade,
  template_id uuid not null references public.social_templates(id) on delete cascade,
  post_type social_post_type not null,
  caption text not null,
  image_path text,
  status social_post_status not null default 'draft',
  generated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_fixtures_club_date on public.fixtures (club_id, fixture_date);
create index if not exists idx_social_posts_club_created on public.social_posts (club_id, created_at desc);
create index if not exists idx_templates_club_active on public.social_templates (club_id, is_active);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_brand_settings_updated_at on public.brand_settings;
create trigger set_brand_settings_updated_at
before update on public.brand_settings
for each row execute function public.set_updated_at();

drop trigger if exists set_social_posts_updated_at on public.social_posts;
create trigger set_social_posts_updated_at
before update on public.social_posts
for each row execute function public.set_updated_at();

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

insert into storage.buckets (id, name, public)
values ('social-assets', 'social-assets', true)
on conflict (id) do update set public = true;

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

insert into public.clubs (id, name, slug)
values ('12d2ee5b-53f6-4f6b-a049-289e0ef9c001', 'Fremantle Rebels', 'fremantle-rebels')
on conflict (slug) do update set name = excluded.name;

insert into public.brand_settings (club_id, primary_color, accent_color, logo_path, font_family)
values (
  '12d2ee5b-53f6-4f6b-a049-289e0ef9c001',
  '#044229',
  '#FFCD00',
  '/brands/fremantle-rebels-logo.png',
  'Segoe UI'
)
on conflict (club_id) do update
set primary_color = excluded.primary_color,
    accent_color = excluded.accent_color,
    logo_path = excluded.logo_path,
    font_family = excluded.font_family;

insert into public.teams (id, club_id, name, stream)
values
  ('12d2ee5b-53f6-4f6b-a049-289e0ef9c010', '12d2ee5b-53f6-4f6b-a049-289e0ef9c001', 'Rebels Mens', 'mens'),
  ('12d2ee5b-53f6-4f6b-a049-289e0ef9c011', '12d2ee5b-53f6-4f6b-a049-289e0ef9c001', 'Rebels Womens', 'womens'),
  ('12d2ee5b-53f6-4f6b-a049-289e0ef9c012', '12d2ee5b-53f6-4f6b-a049-289e0ef9c001', 'Rebels Juniors', 'juniors')
on conflict (id) do update
set name = excluded.name,
    stream = excluded.stream;

insert into public.fixtures (id, club_id, team_id, opponent_name, round_label, fixture_date, venue, status, home_score, away_score, result_outcome)
values
  ('12d2ee5b-53f6-4f6b-a049-289e0ef9c101', '12d2ee5b-53f6-4f6b-a049-289e0ef9c001', '12d2ee5b-53f6-4f6b-a049-289e0ef9c010', 'Perth Rangers', 'Round 6', now() + interval '2 days', 'Rebels Oval', 'scheduled', null, null, null),
  ('12d2ee5b-53f6-4f6b-a049-289e0ef9c102', '12d2ee5b-53f6-4f6b-a049-289e0ef9c001', '12d2ee5b-53f6-4f6b-a049-289e0ef9c011', 'Harbour Lions', 'Round 6', now() + interval '3 days', 'Rebels Oval', 'scheduled', null, null, null),
  ('12d2ee5b-53f6-4f6b-a049-289e0ef9c103', '12d2ee5b-53f6-4f6b-a049-289e0ef9c001', '12d2ee5b-53f6-4f6b-a049-289e0ef9c012', 'South Bay United', 'Round 5', now() - interval '4 days', 'South Bay Park', 'completed', 3, 2, 'win')
on conflict (id) do update
set opponent_name = excluded.opponent_name,
    round_label = excluded.round_label,
    fixture_date = excluded.fixture_date,
    venue = excluded.venue,
    status = excluded.status,
    home_score = excluded.home_score,
    away_score = excluded.away_score,
    result_outcome = excluded.result_outcome;

insert into public.social_templates (id, club_id, name, post_type, component_key, is_active)
values
  ('12d2ee5b-53f6-4f6b-a049-289e0ef9c201', '12d2ee5b-53f6-4f6b-a049-289e0ef9c001', 'Game Day single team', 'preview_single', 'game_day_single', true),
  ('12d2ee5b-53f6-4f6b-a049-289e0ef9c202', '12d2ee5b-53f6-4f6b-a049-289e0ef9c001', 'Result single team', 'result_single', 'result_single', true),
  ('12d2ee5b-53f6-4f6b-a049-289e0ef9c203', '12d2ee5b-53f6-4f6b-a049-289e0ef9c001', 'Round preview summary', 'preview_summary', 'round_preview_summary', true),
  ('12d2ee5b-53f6-4f6b-a049-289e0ef9c204', '12d2ee5b-53f6-4f6b-a049-289e0ef9c001', 'Round results summary', 'result_summary', 'round_results_summary', true)
on conflict (id) do update
set name = excluded.name,
    post_type = excluded.post_type,
    component_key = excluded.component_key,
    is_active = excluded.is_active;

insert into public.media_assets (id, club_id, storage_bucket, file_path, media_type, alt_text)
values
  ('12d2ee5b-53f6-4f6b-a049-289e0ef9c301', '12d2ee5b-53f6-4f6b-a049-289e0ef9c001', 'social-assets', 'brands/fremantle-rebels-logo.png', 'image/png', 'Fremantle Rebels logo')
on conflict (id) do update
set file_path = excluded.file_path,
    media_type = excluded.media_type,
    alt_text = excluded.alt_text;
