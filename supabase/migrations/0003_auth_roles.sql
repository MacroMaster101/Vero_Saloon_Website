-- ── profiles (one row per auth user) ───────────────────────
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null default 'user' check (role in ('user','staff','admin')),
  stylist_id  uuid references stylists(id) on delete set null,
  full_name   text,
  email       text,
  created_at  timestamptz not null default now()
);
alter table profiles enable row level security;

-- ── auto-create profile on signup ──────────────────────────
create function handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── RLS helper functions (security definer; read profiles directly) ──
create function auth_role() returns text
  language sql stable security definer set search_path = public as $$
  select coalesce((select role from profiles where id = auth.uid()), 'user');
$$;

create function auth_stylist_id() returns uuid
  language sql stable security definer set search_path = public as $$
  select stylist_id from profiles where id = auth.uid();
$$;

-- ── block self-promotion: non-admins can't change role/stylist_id ──
create function protect_profile_privileges() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if auth_role() <> 'admin' then
    new.role := old.role;
    new.stylist_id := old.stylist_id;
  end if;
  return new;
end; $$;

create trigger profiles_protect_privileges
  before update on profiles
  for each row execute function protect_profile_privileges();

-- ── profiles policies ──────────────────────────────────────
create policy "self read profile"   on profiles for select using (id = auth.uid());
create policy "self update profile" on profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "admin all profiles"  on profiles for all
  using (auth_role() = 'admin') with check (auth_role() = 'admin');

-- ── bookings.user_id ───────────────────────────────────────
alter table bookings add column user_id uuid references auth.users(id) on delete set null;
create index bookings_user_id_idx on bookings (user_id);

-- ── rewrite blanket admin policies → role-aware ────────────
drop policy "admin all services" on services;
drop policy "admin all stylists" on stylists;
drop policy "admin all hours"    on business_hours;
drop policy "admin all blocks"   on blocked_slots;
drop policy "admin all bookings" on bookings;
drop policy "admin all gallery"  on gallery;

-- reference data: writes admin-only (public read policies from 0001 remain)
create policy "admin write services" on services       for all using (auth_role()='admin') with check (auth_role()='admin');
create policy "admin write stylists" on stylists       for all using (auth_role()='admin') with check (auth_role()='admin');
create policy "admin write hours"    on business_hours for all using (auth_role()='admin') with check (auth_role()='admin');
create policy "admin write gallery"  on gallery        for all using (auth_role()='admin') with check (auth_role()='admin');

-- blocked_slots: admin write; staff+admin read all (public future-read from 0001 remains)
create policy "admin write blocks"   on blocked_slots for all using (auth_role()='admin') with check (auth_role()='admin');
create policy "staff read blocks"    on blocked_slots for select using (auth_role() in ('staff','admin'));

-- bookings: admin all; staff own-assigned read+update; user own read
create policy "admin all bookings"   on bookings for all using (auth_role()='admin') with check (auth_role()='admin');
create policy "staff read bookings"  on bookings for select using (auth_role()='staff' and stylist_id = auth_stylist_id());
create policy "staff update bookings" on bookings for update
  using (auth_role()='staff' and stylist_id = auth_stylist_id())
  with check (auth_role()='staff' and stylist_id = auth_stylist_id());
create policy "user read own bookings" on bookings for select using (user_id = auth.uid());
-- (public/guest insert still has NO policy: booking creation uses the service-role action)
