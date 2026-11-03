-- Read-only diagnostics. Run in the Supabase SQL editor before applying ownership changes.
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'properties'
order by ordinal_position;

select c.relrowsecurity as rls_enabled, c.relforcerowsecurity as rls_forced
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'properties';

select policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'properties';

select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'properties'
  and grantee in ('anon', 'authenticated');
