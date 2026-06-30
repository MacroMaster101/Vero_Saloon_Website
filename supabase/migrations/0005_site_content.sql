-- Key-value editable site copy. One row per homepage block; value is a JSON
-- object whose shape is defined per-block in src/lib/content/blocks.ts.
create table site_content (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table site_content enable row level security;

create policy "public read site_content"
  on site_content for select using (true);

create policy "admin all site_content"
  on site_content for all to authenticated using (true) with check (true);

-- Seed empty rows so admin edit forms have something to update; the app fills
-- any missing field from typed defaults, so empty objects render today's copy.
insert into site_content (key, value) values
  ('quote', '{}'::jsonb),
  ('cta',   '{}'::jsonb),
  ('story', '{}'::jsonb),
  ('hero',  '{}'::jsonb),
  ('stats', '{}'::jsonb),
  ('contact', '{}'::jsonb)
on conflict (key) do nothing;
