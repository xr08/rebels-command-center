-- Source fixtures now come from the website DB, so fixture_id values
-- may not exist in Command Center public.fixtures.
-- Keep fixture_id column (uuid) but remove FK enforcement.

do $$
declare
  fk_name text;
begin
  select tc.constraint_name
    into fk_name
  from information_schema.table_constraints tc
  join information_schema.key_column_usage kcu
    on tc.constraint_name = kcu.constraint_name
   and tc.table_schema = kcu.table_schema
  where tc.table_schema = 'public'
    and tc.table_name = 'social_posts'
    and tc.constraint_type = 'FOREIGN KEY'
    and kcu.column_name = 'fixture_id'
  limit 1;

  if fk_name is not null then
    execute format('alter table public.social_posts drop constraint %I', fk_name);
  end if;
end $$;
