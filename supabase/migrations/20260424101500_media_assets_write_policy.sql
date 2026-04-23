alter table public.media_assets enable row level security;

drop policy if exists "public write media" on public.media_assets;
create policy "public write media"
on public.media_assets
for insert to public
with check (true);
