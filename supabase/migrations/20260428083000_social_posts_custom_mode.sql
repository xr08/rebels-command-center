-- Phase 2 custom post builder support.
-- Keep existing fixture/result flow intact while allowing manual posts.

alter table public.social_posts
  alter column fixture_id drop not null;

alter table public.social_posts
  alter column template_id drop not null;

alter table public.social_posts
  add column if not exists custom_post_type text,
  add column if not exists custom_payload jsonb;
