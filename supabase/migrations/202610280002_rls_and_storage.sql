alter table public.profiles enable row level security;
alter table public.cities enable row level security;
alter table public.plots enable row level security;
alter table public.plot_road_sides enable row level security;
alter table public.plot_images enable row level security;
alter table public.favorites enable row level security;
alter table public.plot_offers enable row level security;
alter table public.plot_inquiries enable row level security;

create or replace function public.is_public_plot(target_plot_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.plots
    where id = target_plot_id and status = 'active' and published_at is not null
  );
$$;

create or replace function public.is_plot_owner(target_plot_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.plots
    where id = target_plot_id and owner_id = (select auth.uid())
  );
$$;

create view public.public_plots with (security_barrier = true) as
select id, property_type, city_id, locality, address, town, taluka, district, state,
  pincode, google_maps_url, latitude, longitude, area_sqft, width, length,
  primary_facing, rate_per_sqft, original_rate_per_sqft, base_amount, discount_type,
  discount_value, discount_amount, final_amount, is_negotiable, na_type,
  layout_sanctioned, ownership_type, description, search_keywords, status,
  is_featured, published_at, created_at, updated_at
from public.plots
where status = 'active' and published_at is not null;

create policy "active cities are public" on public.cities for select
using (is_active);

create policy "users read own profile" on public.profiles for select to authenticated
using ((select auth.uid()) = id);
create policy "users update own profile" on public.profiles for update to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "owners read own plots" on public.plots for select to authenticated
using ((select auth.uid()) = owner_id);
create policy "users create own plots" on public.plots for insert to authenticated
with check ((select auth.uid()) = owner_id);
create policy "owners update plots" on public.plots for update to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "owners delete plots" on public.plots for delete to authenticated
using ((select auth.uid()) = owner_id);

create policy "road sides follow plot visibility" on public.plot_road_sides for select
using (public.is_public_plot(plot_id) or public.is_plot_owner(plot_id));
create policy "owners create road sides" on public.plot_road_sides for insert to authenticated
with check (exists (select 1 from public.plots p where p.id = plot_id and p.owner_id = (select auth.uid())));
create policy "owners update road sides" on public.plot_road_sides for update to authenticated
using (exists (select 1 from public.plots p where p.id = plot_id and p.owner_id = (select auth.uid())))
with check (exists (select 1 from public.plots p where p.id = plot_id and p.owner_id = (select auth.uid())));
create policy "owners delete road sides" on public.plot_road_sides for delete to authenticated
using (exists (select 1 from public.plots p where p.id = plot_id and p.owner_id = (select auth.uid())));

create policy "images follow plot visibility" on public.plot_images for select
using (public.is_public_plot(plot_id) or public.is_plot_owner(plot_id));
create policy "owners create image rows" on public.plot_images for insert to authenticated
with check (exists (select 1 from public.plots p where p.id = plot_id and p.owner_id = (select auth.uid())));
create policy "owners update image rows" on public.plot_images for update to authenticated
using (exists (select 1 from public.plots p where p.id = plot_id and p.owner_id = (select auth.uid())))
with check (exists (select 1 from public.plots p where p.id = plot_id and p.owner_id = (select auth.uid())));
create policy "owners delete image rows" on public.plot_images for delete to authenticated
using (exists (select 1 from public.plots p where p.id = plot_id and p.owner_id = (select auth.uid())));

create policy "users read own favorites" on public.favorites for select to authenticated
using ((select auth.uid()) = user_id);
create policy "users create own favorites" on public.favorites for insert to authenticated
with check ((select auth.uid()) = user_id and public.is_public_plot(plot_id));
create policy "users delete own favorites" on public.favorites for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "current offers on published plots are public" on public.plot_offers for select
using (
  is_active and starts_at <= now() and ends_at > now()
  and exists (select 1 from public.plots p where p.id = plot_id and p.status = 'active' and p.published_at is not null)
);
create policy "plot owners manage offers" on public.plot_offers for all to authenticated
using (exists (select 1 from public.plots p where p.id = plot_id and p.owner_id = (select auth.uid())))
with check (exists (select 1 from public.plots p where p.id = plot_id and p.owner_id = (select auth.uid())));

create policy "users create own inquiries" on public.plot_inquiries for insert to authenticated
with check ((select auth.uid()) = user_id and public.is_public_plot(plot_id));
create policy "users and plot owners read inquiries" on public.plot_inquiries for select to authenticated
using (
  (select auth.uid()) = user_id
  or exists (select 1 from public.plots p where p.id = plot_id and p.owner_id = (select auth.uid()))
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('plot-images', 'plot-images', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "published plot images are readable" on storage.objects for select
using (
  bucket_id = 'plot-images'
  and exists (
    select 1 from public.plots p
    where p.id::text = (storage.foldername(name))[2]
      and (public.is_public_plot(p.id) or public.is_plot_owner(p.id))
  )
);
create policy "owners upload plot images" on storage.objects for insert to authenticated
with check (
  bucket_id = 'plot-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public.plots p
    where p.id::text = (storage.foldername(name))[2] and p.owner_id = (select auth.uid())
  )
);
create policy "owners update plot images" on storage.objects for update to authenticated
using (
  bucket_id = 'plot-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (select 1 from public.plots p where p.id::text = (storage.foldername(name))[2] and public.is_plot_owner(p.id))
)
with check (
  bucket_id = 'plot-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (select 1 from public.plots p where p.id::text = (storage.foldername(name))[2] and public.is_plot_owner(p.id))
);
create policy "owners delete plot images" on storage.objects for delete to authenticated
using (
  bucket_id = 'plot-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (select 1 from public.plots p where p.id::text = (storage.foldername(name))[2] and public.is_plot_owner(p.id))
);

create or replace function public.update_plot_with_relations(
  target_plot_id uuid,
  plot_values jsonb,
  road_values jsonb,
  image_values jsonb
) returns public.plots
language plpgsql security invoker set search_path = '' as $$
declare updated_plot public.plots;
begin
  if not public.is_plot_owner(target_plot_id) then
    raise exception 'Plot not found or not owned by the current user' using errcode = 'insufficient_privilege';
  end if;

  update public.plots set
    property_type = plot_values->>'property_type', city_id = (plot_values->>'city_id')::uuid,
    locality = nullif(plot_values->>'locality', ''), address = plot_values->>'address',
    town = plot_values->>'town', taluka = nullif(plot_values->>'taluka', ''),
    district = nullif(plot_values->>'district', ''), state = plot_values->>'state',
    pincode = nullif(plot_values->>'pincode', ''), google_maps_url = nullif(plot_values->>'google_maps_url', ''),
    latitude = nullif(plot_values->>'latitude', '')::numeric, longitude = nullif(plot_values->>'longitude', '')::numeric,
    area_sqft = (plot_values->>'area_sqft')::numeric, width = nullif(plot_values->>'width', '')::numeric,
    length = nullif(plot_values->>'length', '')::numeric, primary_facing = nullif(plot_values->>'primary_facing', ''),
    rate_per_sqft = (plot_values->>'rate_per_sqft')::numeric,
    original_rate_per_sqft = nullif(plot_values->>'original_rate_per_sqft', '')::numeric,
    discount_type = nullif(plot_values->>'discount_type', '')::public.plot_discount_type,
    discount_value = nullif(plot_values->>'discount_value', '')::numeric,
    is_negotiable = (plot_values->>'is_negotiable')::boolean,
    na_type = nullif(plot_values->>'na_type', ''), layout_sanctioned = (plot_values->>'layout_sanctioned')::boolean,
    ownership_type = nullif(plot_values->>'ownership_type', ''), description = nullif(plot_values->>'description', ''),
    search_keywords = coalesce(array(select jsonb_array_elements_text(plot_values->'search_keywords')), '{}'),
    status = (plot_values->>'status')::public.plot_status,
    published_at = nullif(plot_values->>'published_at', '')::timestamptz,
    contact_name = nullif(plot_values->>'contact_name', ''), contact_phone = nullif(plot_values->>'contact_phone', '')
  where id = target_plot_id
  returning * into updated_plot;

  delete from public.plot_road_sides where plot_id = target_plot_id;
  insert into public.plot_road_sides (plot_id, direction, width_ft, sort_order)
  select target_plot_id, item->>'direction', (item->>'width_ft')::numeric, (item->>'sort_order')::integer
  from jsonb_array_elements(coalesce(road_values, '[]')) item;

  delete from public.plot_images where plot_id = target_plot_id;
  insert into public.plot_images (plot_id, storage_path, sort_order, is_cover)
  select target_plot_id, item->>'storage_path', (item->>'sort_order')::integer, (item->>'is_cover')::boolean
  from jsonb_array_elements(coalesce(image_values, '[]')) item;

  return updated_plot;
end;
$$;

revoke all on table public.profiles, public.cities, public.plots, public.plot_road_sides,
  public.plot_images, public.favorites, public.plot_offers, public.plot_inquiries
from anon, authenticated;
revoke all on table public.public_plots from anon, authenticated;

grant select on table public.cities, public.public_plots, public.plot_road_sides, public.plot_images, public.plot_offers to anon;
grant select on table public.cities, public.public_plots to authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name, avatar_url) on table public.profiles to authenticated;
grant select, insert, update, delete on table public.plots, public.plot_road_sides, public.plot_images, public.plot_offers to authenticated;
grant select, insert, delete on table public.favorites to authenticated;
grant select, insert on table public.plot_inquiries to authenticated;
grant execute on function public.is_public_plot(uuid), public.is_plot_owner(uuid) to anon, authenticated;
grant execute on function public.update_plot_with_relations(uuid, jsonb, jsonb, jsonb) to authenticated;

revoke execute on function public.set_updated_at(), public.calculate_plot_pricing(),
  public.enforce_plot_image_limit(), public.handle_new_auth_user() from public, anon, authenticated;
