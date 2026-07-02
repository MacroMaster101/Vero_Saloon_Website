-- Customer contact number on the profile. Self-editable via the existing
-- "self update profile" RLS policy (the protect trigger only guards
-- role/stylist_id). Nullable — users may not share a number.
alter table profiles add column if not exists phone text;
