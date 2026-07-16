-- Add trip_type + seed ongoing homepage treks
-- Project: erhlxhvpefhchrjuvzxa — run in SQL Editor if needed

DO $$ BEGIN
  CREATE TYPE trip_type AS ENUM ('trek', 'dham');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS trip_type trip_type NOT NULL DEFAULT 'trek';

-- Char Dham category
INSERT INTO public.trip_categories (id, name, slug, icon, description, season, sort_order, is_visible)
VALUES (
  'c3000001-0000-4000-8000-000000000008',
  'Char Dham',
  'dham',
  'temple',
  'Pilgrimage packages',
  'summer',
  7,
  true
)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, is_visible = true;

-- Classify existing packages
UPDATE public.trips
SET trip_type = 'dham',
    category_id = 'c3000001-0000-4000-8000-000000000008',
    is_featured = true,
    is_visible = true
WHERE slug IN ('kedarnath-yatra')
   OR title ILIKE '%dham%'
   OR title ILIKE '%yatra%';

UPDATE public.trips
SET trip_type = 'trek', season = 'winter', is_featured = true, is_visible = true
WHERE slug IN ('auli-snow-trek');

UPDATE public.trips
SET trip_type = 'trek', season = 'summer', is_featured = true, is_visible = true
WHERE slug IN ('har-ki-dun-trek', 'ladakh-bike-expedition', 'spiti-valley-road-trip');

UPDATE public.trips
SET trip_type = 'trek', season = 'summer', is_featured = true, is_visible = true
WHERE slug = 'valley-of-flowers-trek';

-- Seed popular ongoing winter treks
INSERT INTO public.trips (
  id, title, slug, location, duration_days, duration_nights, price, discount_price,
  difficulty, max_seats, seats_left, rating, review_count, season, trip_type,
  category_id, overview, is_featured, is_visible
) VALUES
  (
    'd4000001-0000-4000-8000-000000000011',
    'Kedarkantha Trek',
    'kedarkantha-trek',
    'Uttarkashi, Uttarakhand',
    6, 5, 8999, 7999,
    'moderate', 30, 18, 4.8, 210, 'winter', 'trek',
    'c3000001-0000-4000-8000-000000000001',
    'India’s most loved winter trek — snow camps and sunrise summit.',
    true, true
  ),
  (
    'd4000001-0000-4000-8000-000000000012',
    'Brahmatal Trek',
    'brahmatal-trek',
    'Chamoli, Uttarakhand',
    6, 5, 9499, 8499,
    'moderate', 25, 14, 4.7, 156, 'winter', 'trek',
    'c3000001-0000-4000-8000-000000000001',
    'Frozen alpine lake with Mt Trishul & Nanda Ghunti views.',
    true, true
  ),
  (
    'd4000001-0000-4000-8000-000000000013',
    'Kuari Pass Trek',
    'kuari-pass-trek',
    'Joshimath, Uttarakhand',
    6, 5, 9999, 8999,
    'moderate', 25, 12, 4.6, 98, 'winter', 'trek',
    'c3000001-0000-4000-8000-000000000001',
    'Lord Curzon’s trail with panoramic Himalayan views.',
    true, true
  ),
  (
    'd4000001-0000-4000-8000-000000000014',
    'Char Dham Yatra',
    'char-dham-yatra',
    'Uttarakhand',
    12, 11, 28999, 25999,
    'moderate', 40, 22, 4.9, 320, 'summer', 'dham',
    'c3000001-0000-4000-8000-000000000008',
    'Complete Char Dham pilgrimage with guided support.',
    true, true
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  season = EXCLUDED.season,
  trip_type = EXCLUDED.trip_type,
  is_featured = true,
  is_visible = true,
  price = EXCLUDED.price,
  discount_price = EXCLUDED.discount_price;

INSERT INTO public.trip_images (id, trip_id, image_url, alt_text, sort_order, is_cover)
VALUES
  ('e5000001-0000-4000-8000-000000000011', 'd4000001-0000-4000-8000-000000000011', 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=1200&q=80', 'Kedarkantha', 0, true),
  ('e5000001-0000-4000-8000-000000000012', 'd4000001-0000-4000-8000-000000000012', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', 'Brahmatal', 0, true),
  ('e5000001-0000-4000-8000-000000000013', 'd4000001-0000-4000-8000-000000000013', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80', 'Kuari Pass', 0, true),
  ('e5000001-0000-4000-8000-000000000014', 'd4000001-0000-4000-8000-000000000014', 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&q=80', 'Char Dham', 0, true)
ON CONFLICT (id) DO UPDATE SET image_url = EXCLUDED.image_url, is_cover = true;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.trips, public.trip_images, public.trip_categories
  TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
