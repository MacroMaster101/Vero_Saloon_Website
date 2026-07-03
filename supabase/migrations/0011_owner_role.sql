-- 0011: add the 'owner' role — the shop owner (also a stylist).
-- Owner = all shop-ops writes; NOT site_content, NOT privileged profile
-- changes, NOT user deletion. Also tightens two pre-existing holes where
-- any authenticated user could write site_content and holidays.

-- ── 1) profiles.role accepts 'owner' ────────────────────────
alter table profiles drop constraint profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('user','staff','admin','owner'));

-- ── 2) shop-ops write policies: admin → admin or owner ──────
drop policy "admin write services" on services;
create policy "admin write services" on services for all
  using (auth_role() in ('admin','owner')) with check (auth_role() in ('admin','owner'));

drop policy "admin write stylists" on stylists;
create policy "admin write stylists" on stylists for all
  using (auth_role() in ('admin','owner')) with check (auth_role() in ('admin','owner'));

drop policy "admin write hours" on business_hours;
create policy "admin write hours" on business_hours for all
  using (auth_role() in ('admin','owner')) with check (auth_role() in ('admin','owner'));

drop policy "admin write gallery" on gallery;
create policy "admin write gallery" on gallery for all
  using (auth_role() in ('admin','owner')) with check (auth_role() in ('admin','owner'));

drop policy "admin write blocks" on blocked_slots;
create policy "admin write blocks" on blocked_slots for all
  using (auth_role() in ('admin','owner')) with check (auth_role() in ('admin','owner'));

drop policy "staff read blocks" on blocked_slots;
create policy "staff read blocks" on blocked_slots for select
  using (auth_role() in ('staff','admin','owner'));

drop policy "admin all bookings" on bookings;
create policy "admin all bookings" on bookings for all
  using (auth_role() in ('admin','owner')) with check (auth_role() in ('admin','owner'));

drop policy "admin all reviews" on stylist_reviews;
create policy "admin all reviews" on stylist_reviews for all
  using (auth_role() in ('admin','owner')) with check (auth_role() in ('admin','owner'));

-- ── 3) tighten holes: were `to authenticated using (true)` ──
drop policy "admin all holidays" on holidays;
create policy "admin all holidays" on holidays for all
  using (auth_role() in ('admin','owner')) with check (auth_role() in ('admin','owner'));

drop policy "admin all site_content" on site_content;
create policy "admin all site_content" on site_content for all
  using (auth_role() = 'admin') with check (auth_role() = 'admin');

-- ── 4) profiles: owner reads all, updates only user/staff rows ──
create policy "owner read profiles" on profiles for select
  using (auth_role() = 'owner');
create policy "owner update team profiles" on profiles for update
  using (auth_role() = 'owner' and role in ('user','staff'))
  with check (auth_role() = 'owner' and role in ('user','staff'));

-- ── 5) privilege trigger: admin free; owner only user↔staff ──
create or replace function protect_profile_privileges() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if auth_role() = 'admin' then
    return new;
  end if;
  if auth_role() = 'owner'
     and old.role in ('user','staff')
     and new.role in ('user','staff') then
    return new;
  end if;
  new.role := old.role;
  new.stylist_id := old.stylist_id;
  return new;
end; $$;
