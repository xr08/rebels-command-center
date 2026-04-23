alter table public.fixtures
add column if not exists status text;

update public.fixtures
set status = case
  when coalesce(is_completed, false) = true then 'completed'
  else 'scheduled'
end
where status is null;

alter table public.fixtures
alter column status set default 'scheduled';

alter table public.fixtures
alter column status set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'fixtures_status_check'
      and conrelid = 'public.fixtures'::regclass
  ) then
    alter table public.fixtures
    add constraint fixtures_status_check check (status in ('scheduled', 'completed'));
  end if;
end $$;

create index if not exists idx_fixtures_status on public.fixtures (status);
