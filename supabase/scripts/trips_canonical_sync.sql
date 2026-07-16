-- ============================================================================
-- Canonical Trek / Yatra list for Dream Go India
-- Project: erhlxhvpefhchrjuvzxa — run in Supabase SQL Editor
-- Removes packages that are not on the official list; upserts the rest.
-- ============================================================================

-- Ensure trip_type exists (safe if already present)
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
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  is_visible = true,
  season = EXCLUDED.season;

-- Remove trips that are NOT on the official list
DELETE FROM public.trips
WHERE slug NOT IN (
  'kedarkantha-trek',
  'kuari-pass-trek',
  'dayara-bugyal-trek',
  'brahmatal-trek',
  'har-ki-dun-trek',
  'bali-pass-trek',
  'ruinsara-tal-trek',
  'chari-top-trek',
  'phulara-trek',
  'chopta-tungnath-trek',
  'valley-of-flowers-trek',
  'hampta-pass-trek',
  'char-dham-yatra',
  'do-dham-yatra',
  'kedarnath-yatra',
  'panch-kedar-yatra'
);

-- Upsert official packages
INSERT INTO public.trips (
  id, title, slug, location, duration_days, duration_nights, price, discount_price,
  difficulty, max_seats, seats_left, rating, review_count, season, trip_type,
  category_id, overview, is_featured, is_popular, is_visible
) VALUES
  -- Winter
  ('d4000001-0000-4000-8000-000000000011', 'Kedarkantha Trek', 'kedarkantha-trek',
   'Uttarkashi, Uttarakhand', 6, 5, 8999, 7999, 'moderate', 30, 18, 4.8, 210,
   'winter', 'trek', 'c3000001-0000-4000-8000-000000000001',
   'India’s most loved winter trek — snow camps and sunrise summit.', true, true, true),
  ('d4000001-0000-4000-8000-000000000013', 'Kuari Pass Trek', 'kuari-pass-trek',
   'Joshimath, Uttarakhand', 6, 5, 9999, 8999, 'moderate', 28, 16, 4.8, 186,
   'winter', 'trek', 'c3000001-0000-4000-8000-000000000001',
   'Classic winter trail with Nanda Devi views along the Curzon Trail.', true, true, true),
  ('d4000001-0000-4000-8000-000000000021', 'Dayara Bugyal Trek', 'dayara-bugyal-trek',
   'Uttarkashi, Uttarakhand', 4, 3, 7499, 6499, 'easy', 30, 20, 4.7, 142,
   'winter', 'trek', 'c3000001-0000-4000-8000-000000000001',
   'Vast snow meadows and panoramic Himalayan views — perfect winter bugyal.', true, false, true),
  ('d4000001-0000-4000-8000-000000000012', 'Brahmatal Trek', 'brahmatal-trek',
   'Chamoli, Uttarakhand', 6, 5, 9499, 8499, 'moderate', 25, 14, 4.7, 156,
   'winter', 'trek', 'c3000001-0000-4000-8000-000000000001',
   'Frozen alpine lake with Mt Trishul & Nanda Ghunti views.', true, true, true),

  -- Summer
  ('d4000001-0000-4000-8000-000000000001', 'Har Ki Dun Trek', 'har-ki-dun-trek',
   'Uttarkashi, Uttarakhand', 7, 6, 12999, 11499, 'moderate', 25, 12, 4.8, 124,
   'summer', 'trek', 'c3000001-0000-4000-8000-000000000002',
   'Valley of Gods trek through ancient villages and alpine meadows.', true, true, true),
  ('d4000001-0000-4000-8000-000000000022', 'Bali Pass Trek', 'bali-pass-trek',
   'Uttarkashi, Uttarakhand', 8, 7, 16999, 14999, 'difficult', 20, 10, 4.9, 76,
   'summer', 'trek', 'c3000001-0000-4000-8000-000000000002',
   'Challenging high-pass trek connecting Har Ki Dun to Yamunotri.', true, false, true),
  ('d4000001-0000-4000-8000-000000000023', 'Ruinsara Tal Trek', 'ruinsara-tal-trek',
   'Uttarkashi, Uttarakhand', 7, 6, 11999, 10499, 'moderate', 22, 12, 4.8, 64,
   'summer', 'trek', 'c3000001-0000-4000-8000-000000000002',
   'Alpine lake trek in the Har Ki Dun valley — serene and less crowded.', true, false, true),
  ('d4000001-0000-4000-8000-000000000024', 'Chari Top Trek', 'chari-top-trek',
   'Uttarkashi, Uttarakhand', 5, 4, 7999, 6999, 'moderate', 24, 14, 4.7, 98,
   'summer', 'trek', 'c3000001-0000-4000-8000-000000000002',
   'Offbeat ridge trek with open meadows and Himalayan panoramas.', true, false, true),
  ('d4000001-0000-4000-8000-000000000025', 'Phulara Trek', 'phulara-trek',
   'Uttarkashi, Uttarakhand', 6, 5, 10499, 9499, 'moderate', 22, 12, 4.7, 52,
   'summer', 'trek', 'c3000001-0000-4000-8000-000000000002',
   'Scenic ridge walk with continuous mountain views.', true, false, true),
  ('d4000001-0000-4000-8000-000000000026', 'Chopta Tungnath Trek', 'chopta-tungnath-trek',
   'Rudraprayag, Uttarakhand', 4, 3, 6999, 5999, 'easy', 30, 18, 4.8, 245,
   'summer', 'trek', 'c3000001-0000-4000-8000-000000000002',
   'Visit Tungnath — the highest Shiva temple — and Chandrashila summit.', true, false, true),

  -- Monsoon
  ('d4000001-0000-4000-8000-000000000002', 'Valley of Flowers Trek', 'valley-of-flowers-trek',
   'Chamoli, Uttarakhand', 6, 5, 11499, 9999, 'moderate', 25, 14, 4.9, 89,
   'monsoon', 'trek', 'c3000001-0000-4000-8000-000000000003',
   'UNESCO valley in full bloom with Hemkund Sahib option.', true, false, true),
  ('d4000001-0000-4000-8000-000000000027', 'Hampta Pass Trek', 'hampta-pass-trek',
   'Kullu, Himachal Pradesh', 5, 4, 8999, 7999, 'moderate', 28, 16, 4.8, 198,
   'monsoon', 'trek', 'c3000001-0000-4000-8000-000000000003',
   'Classic crossover from Kullu to Lahaul with dramatic landscape change.', true, false, true),

  -- Char Dham Yatra
  ('d4000001-0000-4000-8000-000000000014', 'Char Dham Yatra', 'char-dham-yatra',
   'Uttarakhand', 12, 11, 28999, 25999, 'easy', 20, 10, 4.9, 420,
   'summer', 'dham', 'c3000001-0000-4000-8000-000000000008',
   'Complete Char Dham pilgrimage — Yamunotri, Gangotri, Kedarnath, Badrinath.', true, false, true),
  ('d4000001-0000-4000-8000-000000000028', 'Do Dham Yatra', 'do-dham-yatra',
   'Uttarakhand', 7, 6, 14999, 13499, 'easy', 22, 12, 4.8, 267,
   'summer', 'dham', 'c3000001-0000-4000-8000-000000000008',
   'Sacred Do Dham yatra to Kedarnath and Badrinath.', true, false, true),
  ('d4000001-0000-4000-8000-000000000004', 'Kedarnath Yatra', 'kedarnath-yatra',
   'Rudraprayag, Uttarakhand', 3, 2, 8999, 7999, 'moderate', 30, 18, 4.9, 201,
   'summer', 'dham', 'c3000001-0000-4000-8000-000000000008',
   'Spiritual journey to Kedarnath temple with guided support.', true, false, true),
  ('d4000001-0000-4000-8000-000000000029', 'Panch Kedar Yatra', 'panch-kedar-yatra',
   'Uttarakhand', 10, 9, 24999, 22999, 'moderate', 18, 10, 4.8, 88,
   'summer', 'dham', 'c3000001-0000-4000-8000-000000000008',
   'Visit all five Kedar shrines — Kedarnath, Tungnath, Rudranath, Madhyamaheshwar, Kalpeshwar.', true, false, true)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  location = EXCLUDED.location,
  duration_days = EXCLUDED.duration_days,
  duration_nights = EXCLUDED.duration_nights,
  price = EXCLUDED.price,
  discount_price = EXCLUDED.discount_price,
  difficulty = EXCLUDED.difficulty,
  season = EXCLUDED.season,
  trip_type = EXCLUDED.trip_type,
  category_id = EXCLUDED.category_id,
  overview = EXCLUDED.overview,
  is_featured = EXCLUDED.is_featured,
  is_popular = EXCLUDED.is_popular,
  is_visible = true,
  updated_at = now();

-- Cover images for new / updated packages (skip if already present)
INSERT INTO public.trip_images (trip_id, image_url, alt_text, sort_order, is_cover)
SELECT t.id, v.url, t.title, 0, true
FROM public.trips t
JOIN (VALUES
  ('kedarkantha-trek', 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=1200&q=80'),
  ('kuari-pass-trek', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'),
  ('dayara-bugyal-trek', 'https://images.unsplash.com/photo-1478131143088-5e7e85b1958b?w=1200&q=80'),
  ('brahmatal-trek', 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=1200&q=80'),
  ('har-ki-dun-trek', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'),
  ('bali-pass-trek', 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1200&q=80'),
  ('ruinsara-tal-trek', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80'),
  ('chari-top-trek', 'https://images.unsplash.com/photo-1478131143088-5e7e85b1958b?w=1200&q=80'),
  ('phulara-trek', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'),
  ('chopta-tungnath-trek', 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&q=80'),
  ('valley-of-flowers-trek', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80'),
  ('hampta-pass-trek', 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1200&q=80'),
  ('char-dham-yatra', 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&q=80'),
  ('do-dham-yatra', 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&q=80'),
  ('kedarnath-yatra', 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&q=80'),
  ('panch-kedar-yatra', 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&q=80')
) AS v(slug, url) ON v.slug = t.slug
WHERE NOT EXISTS (
  SELECT 1 FROM public.trip_images ti WHERE ti.trip_id = t.id AND ti.is_cover = true
);

-- Verify
SELECT season, trip_type, title, slug, is_visible
FROM public.trips
ORDER BY
  CASE season WHEN 'winter' THEN 1 WHEN 'summer' THEN 2 WHEN 'monsoon' THEN 3 ELSE 4 END,
  CASE trip_type WHEN 'dham' THEN 2 ELSE 1 END,
  title;
