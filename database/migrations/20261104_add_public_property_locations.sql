-- Public map projection exposes listing location and map summary fields only.
-- Property ownership and write permissions remain on public.properties.
create table if not exists public.public_property_locations (
  id text primary key,
  property_type text,
  city text,
  address text,
  pincode text,
  latitude double precision not null,
  longitude double precision not null,
  length numeric,
  width numeric,
  total_area numeric,
  rate_per_sqft numeric,
  total_amount numeric,
  facing jsonb,
  land_details jsonb,
  status text,
  updated_at timestamptz not null default now(),
  constraint public_property_locations_latitude_check check (latitude between -90 and 90),
  constraint public_property_locations_longitude_check check (longitude between -180 and 180)
);

alter table public.public_property_locations enable row level security;
drop policy if exists "Public map locations are readable" on public.public_property_locations;
create policy "Public map locations are readable"
  on public.public_property_locations for select
  to anon, authenticated
  using (true);
grant select on public.public_property_locations to anon, authenticated;

create or replace function public.sync_public_property_location()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    delete from public.public_property_locations where id = old.id::text;
    return old;
  end if;

  if new.latitude is null or new.longitude is null
     or new.latitude < -90 or new.latitude > 90
     or new.longitude < -180 or new.longitude > 180
     or coalesce((to_jsonb(new)->>'archived')::boolean, false)
     or lower(coalesce(new.status, '')) in ('archived', 'deleted', 'inactive', 'draft') then
    delete from public.public_property_locations where id = new.id::text;
    return new;
  end if;

  insert into public.public_property_locations (
    id, property_type, city, address, pincode, latitude, longitude,
    length, width, total_area, rate_per_sqft, total_amount, facing,
    land_details, status, updated_at
  ) values (
    new.id::text, new.property_type, new.city, new.address, new.pincode,
    new.latitude, new.longitude, new.length, new.width, new.total_area,
    new.rate_per_sqft, new.total_amount, to_jsonb(new.facing),
    new.land_details, new.status, now()
  )
  on conflict (id) do update set
    property_type = excluded.property_type,
    city = excluded.city,
    address = excluded.address,
    pincode = excluded.pincode,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    length = excluded.length,
    width = excluded.width,
    total_area = excluded.total_area,
    rate_per_sqft = excluded.rate_per_sqft,
    total_amount = excluded.total_amount,
    facing = excluded.facing,
    land_details = excluded.land_details,
    status = excluded.status,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists properties_sync_public_location on public.properties;
create trigger properties_sync_public_location
  after insert or update or delete on public.properties
  for each row execute function public.sync_public_property_location();

insert into public.public_property_locations (
  id, property_type, city, address, pincode, latitude, longitude,
  length, width, total_area, rate_per_sqft, total_amount, facing,
  land_details, status
)
select id::text, property_type, city, address, pincode, latitude, longitude,
       length, width, total_area, rate_per_sqft, total_amount, to_jsonb(facing),
       land_details, status
from public.properties p
where latitude between -90 and 90 and longitude between -180 and 180
  and coalesce((to_jsonb(p)->>'archived')::boolean, false) = false
  and lower(coalesce(status, '')) not in ('archived', 'deleted', 'inactive', 'draft')
on conflict (id) do update set
  property_type = excluded.property_type,
  city = excluded.city,
  address = excluded.address,
  pincode = excluded.pincode,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  length = excluded.length,
  width = excluded.width,
  total_area = excluded.total_area,
  rate_per_sqft = excluded.rate_per_sqft,
  total_amount = excluded.total_amount,
  facing = excluded.facing,
  land_details = excluded.land_details,
  status = excluded.status,
  updated_at = now();

