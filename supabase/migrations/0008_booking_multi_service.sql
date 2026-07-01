-- Multiple services per booking.
--
-- A booking can now bundle several services into one continuous time block with
-- one stylist. To stay non-breaking for the shared database (the mobile-app repo
-- reads bookings.service_id directly), this is purely additive:
--   • service_id  — unchanged; keeps the FIRST selected service (the "primary").
--   • service_ids — NEW nullable array of ALL selected services (incl. the first).
--
-- Combined duration is already baked into starts_at/ends_at at insert time, so the
-- no_overlap EXCLUDE constraint and availability logic keep working untouched.
-- Old rows (single-service) have service_ids = null; readers should fall back to
-- [service_id] when service_ids is null.

alter table bookings
  add column if not exists service_ids uuid[];
