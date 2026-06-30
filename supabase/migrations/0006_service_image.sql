-- supabase/migrations/0006_service_image.sql
-- Per-service photo for the booking wizard. Nullable; falls back to a
-- category-default image, then the SVG icon, when empty.
alter table public.services
  add column if not exists image_url text;
