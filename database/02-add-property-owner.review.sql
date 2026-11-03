-- REVIEW ONLY: this file has NOT been applied to the database.
-- The observed properties table has no owner column.
-- Read 01-inspect-property-access.sql and review the existing RLS policies first.
-- This adds ownership storage; it deliberately does NOT alter grants, RLS or policies.
-- Existing rows remain unowned until the administrator can establish their true owners.
-- Do not bulk-assign all existing rows to the current user.

begin;

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'properties' and column_name = 'user_id'
  ) then
    alter table public.properties
      add column user_id uuid references auth.users(id) on delete set null;
  elsif not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'properties'
      and column_name = 'user_id' and data_type = 'uuid'
  ) then
    raise exception 'properties.user_id already exists with a non-UUID type; review before proceeding';
  end if;
end $$;

alter table public.properties alter column user_id set default auth.uid();
create index if not exists properties_user_id_idx on public.properties(user_id);

commit;

-- The app already supplies the verified user's id on insert, and filters owner mutations.
-- Server authorization still requires reviewed RLS policies: client filters are not policies.
-- Keep existing public browse rules if intended. Owner writes should enforce auth.uid() = user_id.
