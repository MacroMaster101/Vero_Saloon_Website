-- Reviews + stylist rating aggregates.
--
-- On the old shared database these objects were owned by the mobile-app repo's
-- migrations. This is now a website-only standalone DB, so the website carries
-- them itself. Shapes match lib/supabase/types.ts and the code in
-- account/review-actions.ts, queries.ts (getRecentReviews) and the homepage
-- stylist cards. The running average is recomputed app-side (no DB trigger).

-- ── stylist rating aggregates ──────────────────────────────
alter table stylists
  add column if not exists rating numeric(2,1),
  add column if not exists rating_count integer not null default 0;

-- ── stylist_reviews ────────────────────────────────────────
create table if not exists stylist_reviews (
  id            uuid primary key default uuid_generate_v4(),
  stylist_id    uuid not null references stylists(id) on delete cascade,
  customer_name text not null,
  rating        integer not null check (rating between 1 and 5),
  comment       text not null default '',
  likes_count   integer not null default 0,
  reports_count integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists stylist_reviews_stylist_id_idx on stylist_reviews (stylist_id);
create index if not exists stylist_reviews_created_at_idx  on stylist_reviews (created_at desc);

-- ── RLS ────────────────────────────────────────────────────
alter table stylist_reviews enable row level security;

-- Public read (homepage testimonials + stylist cards).
create policy "public read reviews" on stylist_reviews
  for select using (true);

-- Admin full access (moderation: delete from Admin → Reviews).
-- Customer review submission goes through the service-role action, so no
-- public insert policy is needed (mirrors how bookings are inserted).
create policy "admin all reviews" on stylist_reviews
  for all using (auth_role() = 'admin') with check (auth_role() = 'admin');
