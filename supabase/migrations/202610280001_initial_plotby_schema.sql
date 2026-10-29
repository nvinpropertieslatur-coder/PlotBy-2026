create extension if not exists pgcrypto;

create type public.plot_status as enum ('draft', 'active', 'sold', 'inactive');
create type public.plot_discount_type as enum ('flat', 'percentage');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index profiles_phone_unique
  on public.profiles ((regexp_replace(phone, '[^0-9]', '', 'g')))
  where phone is not null and btrim(phone) <> '';

create table public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  state text not null default 'Maharashtra',
  slug text not null unique,
  latitude numeric(9,6) not null check (latitude between -90 and 90),
  longitude numeric(9,6) not null check (longitude between -180 and 180),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.plots (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  property_type text not null default 'plot' check (property_type = 'plot'),
  city_id uuid not null references public.cities(id),
  locality text,
  address text not null,
  town text not null,
  taluka text,
  district text,
  state text not null default 'Maharashtra',
  pincode text check (pincode is null or pincode ~ '^[0-9]{6}$'),
  google_maps_url text,
  latitude numeric(9,6) check (latitude is null or latitude between -90 and 90),
  longitude numeric(9,6) check (longitude is null or longitude between -180 and 180),
  area_sqft numeric(12,2) not null check (area_sqft > 0),
  width numeric(12,2) check (width is null or width > 0),
  length numeric(12,2) check (length is null or length > 0),
  primary_facing text check (primary_facing is null or primary_facing in ('North', 'South', 'East', 'West')),
  rate_per_sqft numeric(14,2) not null check (rate_per_sqft >= 0),
  original_rate_per_sqft numeric(14,2) check (original_rate_per_sqft is null or original_rate_per_sqft >= 0),
  base_amount numeric(16,2) not null check (base_amount >= 0),
  discount_type public.plot_discount_type,
  discount_value numeric(14,2) check (discount_value is null or discount_value >= 0),
  discount_amount numeric(16,2) not null default 0 check (discount_amount >= 0),
  final_amount numeric(16,2) not null check (final_amount >= 0),
  is_negotiable boolean not null default false,
  na_type text,
  layout_sanctioned boolean,
  ownership_type text,
  description text,
  search_keywords text[] not null default '{}',
  status public.plot_status not null default 'draft',
  is_featured boolean not null default false,
  published_at timestamptz,
  contact_name text,
  contact_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plots_coordinates_pair check ((latitude is null) = (longitude is null)),
  constraint plots_discount_shape check (
    (discount_type is null and coalesce(discount_value, 0) = 0 and discount_amount = 0)
    or
    (discount_type is not null and discount_value is not null)
  ),
  constraint plots_percentage_discount check (discount_type <> 'percentage' or discount_value <= 100),
  constraint plots_pricing_consistent check (
    base_amount = round(area_sqft * rate_per_sqft, 2)
    and discount_amount <= base_amount
    and final_amount = round(base_amount - discount_amount, 2)
  ),
  constraint plots_publication_consistent check (
    (status = 'active' and published_at is not null and latitude is not null and longitude is not null) or status <> 'active'
  )
);

create table public.plot_road_sides (
  id uuid primary key default gen_random_uuid(),
  plot_id uuid not null references public.plots(id) on delete cascade,
  direction text not null check (direction in ('north', 'south', 'east', 'west')),
  width_ft numeric(8,2) not null check (width_ft > 0),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  unique (plot_id, direction),
  unique (plot_id, sort_order)
);

create table public.plot_images (
  id uuid primary key default gen_random_uuid(),
  plot_id uuid not null references public.plots(id) on delete cascade,
  storage_path text not null unique,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_cover boolean not null default false,
  created_at timestamptz not null default now(),
  unique (plot_id, sort_order)
);

create unique index plot_images_one_cover on public.plot_images(plot_id) where is_cover;

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plot_id uuid not null references public.plots(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, plot_id)
);

create table public.plot_offers (
  id uuid primary key default gen_random_uuid(),
  plot_id uuid not null references public.plots(id) on delete cascade,
  title text not null,
  description text,
  discount_type public.plot_discount_type not null,
  discount_value numeric(14,2) not null check (discount_value > 0),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (discount_type <> 'percentage' or discount_value <= 100)
);

create table public.plot_inquiries (
  id uuid primary key default gen_random_uuid(),
  plot_id uuid not null references public.plots(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null check (char_length(btrim(message)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index plots_public_city_page on public.plots(city_id, published_at desc, id desc)
  where status = 'active' and published_at is not null;
create index plots_owner_updated on public.plots(owner_id, updated_at desc);
create index plot_road_sides_plot on public.plot_road_sides(plot_id, sort_order);
create index plot_images_plot on public.plot_images(plot_id, sort_order);
create index favorites_user on public.favorites(user_id, created_at desc);
create index plot_offers_visible on public.plot_offers(plot_id, starts_at, ends_at)
  where is_active;
create index plot_inquiries_plot on public.plot_inquiries(plot_id, created_at desc);
create index plot_inquiries_user on public.plot_inquiries(user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.calculate_plot_pricing()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.base_amount = round(new.area_sqft * new.rate_per_sqft, 2);
  if new.discount_type is null then
    new.discount_value = null;
    new.discount_amount = 0;
  elsif new.discount_type = 'percentage' then
    new.discount_amount = round(new.base_amount * least(new.discount_value, 100) / 100, 2);
  else
    new.discount_amount = least(new.base_amount, new.discount_value);
  end if;
  new.final_amount = round(greatest(0, new.base_amount - new.discount_amount), 2);
  return new;
end;
$$;

create trigger plots_calculate_pricing before insert or update of area_sqft, rate_per_sqft, discount_type, discount_value
on public.plots for each row execute function public.calculate_plot_pricing();

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger plots_set_updated_at before update on public.plots
for each row execute function public.set_updated_at();

create or replace function public.enforce_plot_image_limit()
returns trigger language plpgsql set search_path = '' as $$
begin
  if (select count(*) from public.plot_images where plot_id = new.plot_id) >= 10 then
    raise exception 'A plot may have at most 10 images' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger plot_images_enforce_limit before insert on public.plot_images
for each row execute function public.enforce_plot_image_limit();

create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, phone)
  values (new.id, new.phone)
  on conflict (id) do update set phone = excluded.phone;
  return new;
end;
$$;

create trigger on_auth_user_created_or_phone_changed
after insert or update of phone on auth.users for each row execute function public.handle_new_auth_user();

insert into public.cities (id, name, state, slug, latitude, longitude) values
  ('10000000-0000-4000-8000-000000000001', 'Latur', 'Maharashtra', 'latur', 18.410417, 76.533286),
  ('10000000-0000-4000-8000-000000000002', 'Mumbai', 'Maharashtra', 'mumbai', 18.897533, 72.812664),
  ('10000000-0000-4000-8000-000000000003', 'Nagpur', 'Maharashtra', 'nagpur', 21.169892, 79.050886),
  ('10000000-0000-4000-8000-000000000004', 'Nashik', 'Maharashtra', 'nashik', 20.029900, 73.798300),
  ('10000000-0000-4000-8000-000000000005', 'Pune', 'Maharashtra', 'pune', 18.520000, 73.850000),
  ('10000000-0000-4000-8000-000000000006', 'Solapur', 'Maharashtra', 'solapur', 17.670282, 75.922909),
  ('10000000-0000-4000-8000-000000000007', 'Kolhapur', 'Maharashtra', 'kolhapur', 16.670000, 74.240000),
  ('10000000-0000-4000-8000-000000000008', 'Nanded', 'Maharashtra', 'nanded', 19.150000, 77.300000),
  ('10000000-0000-4000-8000-000000000009', 'Chhatrapati Sambhajinagar', 'Maharashtra', 'chhatrapati-sambhajinagar', 19.877570, 75.342260),
  ('10000000-0000-4000-8000-000000000010', 'Amravati', 'Maharashtra', 'amravati', 20.950000, 77.780000),
  ('10000000-0000-4000-8000-000000000011', 'Satara', 'Maharashtra', 'satara', 17.690000, 74.030000),
  ('10000000-0000-4000-8000-000000000012', 'Thane', 'Maharashtra', 'thane', 19.180000, 72.980000);
