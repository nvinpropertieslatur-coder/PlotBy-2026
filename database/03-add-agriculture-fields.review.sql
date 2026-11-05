-- Apply to the configured Supabase project before authenticated Sheti writes.
-- Nullable columns preserve existing listings and the existing owner/RLS policy.
-- Legacy unclassified rows require a verified property type before any backfill.
begin;

alter table public.properties
  add column if not exists property_type text,
  add column if not exists agriculture_details jsonb;

commit;
