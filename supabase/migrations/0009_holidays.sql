-- Sri Lankan holidays cache + manual salon closures.
--
-- Populated from Google's public SL holiday calendar (synced by an admin action)
-- and/or added by hand for salon-specific closures. The booking calendar reads
-- from here (not Google) so heavy user traffic never hits the Google API — a
-- durable DB cache that also survives restarts/deploys.
--
-- Website-only standalone DB extra (see standalone-db-extras memory).

create table if not exists holidays (
  date date primary key,                 -- salon-local calendar day (YYYY-MM-DD)
  name text not null,                     -- e.g. "Poson Full Moon Poya Day"
  source text not null default 'manual'   -- 'google' (synced) | 'manual' (admin-added)
    check (source in ('google', 'manual')),
  is_closed boolean not null default true,-- true = not bookable on the calendar
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists holidays_date_idx on holidays (date);

alter table holidays enable row level security;

-- Anyone can read holidays (the public booking calendar needs them).
drop policy if exists "public read holidays" on holidays;
create policy "public read holidays" on holidays
  for select using (true);

-- Only authenticated admins can add/edit/remove (RLS; server actions also gate).
drop policy if exists "admin all holidays" on holidays;
create policy "admin all holidays" on holidays
  for all to authenticated using (true) with check (true);
