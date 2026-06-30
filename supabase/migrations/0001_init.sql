-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists btree_gist;

-- ── services ───────────────────────────────────────────────
create table services (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text not null default '',
  category text not null check (category in ('hair','beauty')),
  price_lkr integer not null check (price_lkr >= 0),
  duration_min integer not null check (duration_min > 0),
  icon text not null default 'scissors',
  bookable boolean not null default true,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  -- Highlighted in the mobile app's "Featured" section. Owned canonically by the
  -- mobile app's 0008 migration on the shared DB; included here so a fresh
  -- web-only rebuild matches the live schema.
  is_featured boolean not null default false
);

-- ── stylists ───────────────────────────────────────────────
create table stylists (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  role text not null default '',
  tags text[] not null default '{}',
  avatar_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

-- ── business_hours (minutes from midnight; 1440 = midnight close) ──
create table business_hours (
  day_of_week smallint primary key check (day_of_week between 0 and 6),
  open_minute integer not null check (open_minute between 0 and 1440),
  close_minute integer not null check (close_minute between 0 and 1440),
  is_closed boolean not null default false
);

-- ── blocked_slots (stylist_id null = whole salon) ──────────
create table blocked_slots (
  id uuid primary key default uuid_generate_v4(),
  stylist_id uuid references stylists(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text not null default '',
  check (ends_at > starts_at)
);

-- ── bookings ───────────────────────────────────────────────
create table bookings (
  id uuid primary key default uuid_generate_v4(),
  reference text unique not null,
  service_id uuid not null references services(id),
  stylist_id uuid references stylists(id),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  notes text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'confirmed'
    check (status in ('confirmed','cancelled','completed','no_show')),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

-- Race-proof: a confirmed booking with an assigned stylist cannot overlap
-- another for the same stylist.
alter table bookings add constraint no_overlap
  exclude using gist (
    stylist_id with =,
    tstzrange(starts_at, ends_at) with &&
  ) where (status = 'confirmed' and stylist_id is not null);

create index bookings_starts_at_idx on bookings (starts_at);
create index blocked_slots_starts_at_idx on blocked_slots (starts_at);

-- ── gallery ────────────────────────────────────────────────
create table gallery (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  tag text not null default '',
  category text not null default '',
  image_url text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

-- ── RLS ────────────────────────────────────────────────────
alter table services       enable row level security;
alter table stylists       enable row level security;
alter table business_hours enable row level security;
alter table blocked_slots  enable row level security;
alter table bookings       enable row level security;
alter table gallery        enable row level security;

-- Public read of active reference data
create policy "public read active services" on services
  for select using (is_active);
create policy "public read active stylists" on stylists
  for select using (is_active);
create policy "public read hours" on business_hours
  for select using (true);
create policy "public read gallery" on gallery
  for select using (is_active);
-- Public read of FUTURE blocked slots only (needed for availability)
create policy "public read future blocks" on blocked_slots
  for select using (ends_at > now());

-- Authenticated (admin) full access to everything
create policy "admin all services" on services       for all to authenticated using (true) with check (true);
create policy "admin all stylists" on stylists       for all to authenticated using (true) with check (true);
create policy "admin all hours" on business_hours    for all to authenticated using (true) with check (true);
create policy "admin all blocks" on blocked_slots    for all to authenticated using (true) with check (true);
create policy "admin all bookings" on bookings       for all to authenticated using (true) with check (true);
create policy "admin all gallery" on gallery         for all to authenticated using (true) with check (true);

-- NOTE: bookings have NO public select/insert policy. The booking Server
-- Action uses the service-role key (bypasses RLS) after validation.
