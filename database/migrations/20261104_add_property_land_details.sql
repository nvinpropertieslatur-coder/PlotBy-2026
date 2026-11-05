-- Sheti details are stored on the property row, so they inherit its existing
-- ownership, row-level security, edit, and delete behavior.
alter table public.properties
  add column if not exists land_details jsonb not null default '{}'::jsonb;

alter table public.properties
  add column if not exists property_type text;

alter table public.properties
  add column if not exists contact_role text not null default 'Owner';
