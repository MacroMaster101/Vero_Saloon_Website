-- Business hours: every day 10:00 (600) to midnight (1440)
insert into business_hours (day_of_week, open_minute, close_minute, is_closed) values
  (0, 600, 1440, false), (1, 600, 1440, false), (2, 600, 1440, false),
  (3, 600, 1440, false), (4, 600, 1440, false), (5, 600, 1440, false),
  (6, 600, 1440, false)
on conflict (day_of_week) do update
  set open_minute = excluded.open_minute, close_minute = excluded.close_minute, is_closed = excluded.is_closed;

-- Services — Hair (from the reference menu)
insert into services (slug, name, description, category, price_lkr, duration_min, icon, bookable, sort_order) values
  ('gents-cut',     'Gents Cut & Style',       'Wash, cut & finish.',          'hair',   900,  40,  'scissors', true, 1),
  ('ladies-cut',    'Ladies Cut & Blow-dry',   'Cut, wash & styled finish.',   'hair',  1500,  60,  'scissors', true, 2),
  ('colour-roots',  'Hair Colour (roots)',     'Single-shade touch-up.',       'hair',  3500,  90,  'color',    true, 3),
  ('colour-full',   'Full Hair Colour',        'Root to tip, your shade.',     'hair',  6000, 120,  'color',    true, 4),
  ('hair-spa',      'Hair Treatment & Spa',    'Deep conditioning repair.',    'hair',  2500,  45,  'beauty',   true, 5),
  ('kids-cut',      'Kids'' Cut (under 12)',    'Quick, gentle & patient.',     'hair',   600,  25,  'scissors', true, 6),
  -- Beauty & Bridal
  ('beard',         'Beard Grooming',          'Trim, shape & finish.',        'beauty', 500,  25,  'razor',    true, 7),
  ('facial',        'Clean-up & Facial',       'Glow facial, him or her.',     'beauty',2500,  50,  'beauty',   true, 8),
  ('threading',     'Threading (brow / face)', 'Quick & precise.',             'beauty', 200,  15,  'beauty',   true, 9),
  ('waxing',        'Waxing (full arm)',       'Smooth, clean finish.',        'beauty', 900,  30,  'beauty',   true, 10),
  ('mani-pedi',     'Manicure & Pedicure',     'Hands & feet, together.',      'beauty',2800,  75,  'beauty',   true, 11),
  ('bridal',        'Bridal Package',          'Hair, make-up & dressing.',    'beauty',15000,180, 'star',     true, 12)
on conflict (slug) do nothing;

-- Stylists
insert into stylists (slug, name, role, tags, avatar_url, sort_order) values
  ('ruwan',    'Ruwan',    'Gents Stylist',    array['Cuts','Colour'],          '/images/stylists/ruwan.png', 1),
  ('sanduni',  'Sanduni',  'Ladies Stylist',   array['Cut & style','Blow-dry'], '/images/stylists/sanduni.png', 2),
  ('tharindu', 'Tharindu', 'Barber',           array['Beard','Fades'],          '/images/stylists/tharindu.png', 3),
  ('nadeesha', 'Nadeesha', 'Beauty Therapist', array['Facials','Bridal'],       '/images/stylists/nadeesha.png', 4)
on conflict (slug) do nothing;

-- Gallery (lookbook) — image_url filled by admin uploads later; placeholders for now
insert into gallery (title, tag, category, image_url, sort_order) values
  ('Ladies Colour',  'Colour',   'Balayage, roots & full shades', '/images/lookbook/ladies-colour.png', 1),
  ('Gents Fade',     'Gents',    'Sharp, blended & clean',        '/images/lookbook/gents-fade.png', 2),
  ('Bridal Look',    'Bridal',   'Hair, make-up & dressing',      '/images/lookbook/bridal-look.png', 3),
  ('Hair Treatment', 'Hair Spa', 'Repair, smooth & shine',        '/images/lookbook/hair-spa.png', 4),
  ('Beard Grooming', 'Beard',    'Shaped, lined & oiled',         '/images/lookbook/beard-grooming.png', 5),
  ('Facial & Glow',  'Beauty',   'Clean-ups & facials',           '/images/lookbook/facial-glow.png', 6)
on conflict do nothing;
