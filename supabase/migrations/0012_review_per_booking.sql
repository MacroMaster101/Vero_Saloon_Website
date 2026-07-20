-- One review per booking.
--
-- 0007 gave stylist_reviews no link back to the booking it came from, so
-- account/review-actions.ts could be replayed for the same completed booking
-- without limit — each call inserted another public testimonial and moved the
-- stylist's running average. Ownership was checked; "already reviewed" was not.
--
-- booking_id is NULLABLE and the uniqueness is a PARTIAL index: rows written
-- before this migration have no booking to point at, and the mobile app that
-- shares these shapes inserts without it. New website submissions always set it,
-- so the constraint bites exactly where the replay was possible.

alter table stylist_reviews
  add column if not exists booking_id uuid references bookings(id) on delete set null;

create unique index if not exists stylist_reviews_booking_id_key
  on stylist_reviews (booking_id)
  where booking_id is not null;
