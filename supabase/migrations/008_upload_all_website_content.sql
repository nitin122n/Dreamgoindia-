-- =============================================================================
-- 008 — Upload ALL website content to Supabase
-- Project: erhlxhvpefhchrjuvzxa
-- Safe to re-run (ON CONFLICT / IF NOT EXISTS)
-- =============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
END;
$$;

DO $$ BEGIN CREATE TYPE trip_type AS ENUM ('trek', 'dham');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN ALTER TABLE public.trips ADD COLUMN trip_type trip_type NOT NULL DEFAULT 'trek';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  cover TEXT NOT NULL,
  stories JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read visible highlights" ON public.highlights;
CREATE POLICY "Public can read visible highlights" ON public.highlights
  FOR SELECT USING (is_visible = true OR public.is_admin());
DROP POLICY IF EXISTS "Admins manage highlights" ON public.highlights;
CREATE POLICY "Admins manage highlights" ON public.highlights
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('media', 'media', true, 52428800, ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']),
  ('hero-images', 'hero-images', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('trip-images', 'trip-images', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('destination-images', 'destination-images', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('gallery-images', 'gallery-images', true, 20971520, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('blog-images', 'blog-images', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read media" ON storage.objects;
CREATE POLICY "Public read media" ON storage.objects FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth upload media" ON storage.objects;
CREATE POLICY "Auth upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Auth update media" ON storage.objects;
CREATE POLICY "Auth update media" ON storage.objects FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "Auth delete media" ON storage.objects;
CREATE POLICY "Auth delete media" ON storage.objects FOR DELETE TO authenticated USING (true);


-- ===== Base seed (002) =====
-- ============================================================================
-- Dream Go India - Seed Data Migration
-- Realistic Indian travel content for Uttarakhand & Himalayas
-- ============================================================================

-- ============================================================================
-- SETTINGS (singleton)
-- ============================================================================

INSERT INTO public.settings (
  id,
  site_name,
  logo_url,
  favicon_url,
  primary_color,
  contact_email,
  contact_phone,
  whatsapp,
  address,
  social_links,
  footer_text,
  google_analytics_id,
  seo_default_title,
  seo_default_description
) VALUES (
  1,
  'Dream Go India',
  NULL,
  NULL,
  '#E53935',
  'hello@dreamgoindia.com',
  '+91 98765 43210',
  '+91 98765 43210',
  'Shop No. 12, Rajpur Road, Dehradun, Uttarakhand 248001, India',
  '{
    "facebook": "https://facebook.com/dreamgoindia",
    "instagram": "https://instagram.com/dreamgoindia",
    "twitter": "https://twitter.com/dreamgoindia",
    "youtube": "https://youtube.com/@dreamgoindia",
    "linkedin": "https://linkedin.com/company/dreamgoindia"
  }'::jsonb,
  'Dream Go India — Your gateway to unforgettable Himalayan adventures. Licensed tour operator based in Dehradun, Uttarakhand.',
  NULL,
  'Dream Go India | Premium Trekking & Travel Packages in India',
  'Book curated trekking, camping, and adventure trips across Uttarakhand, Ladakh, Spiti, Himachal & Goa. Expert guides, safe travel, best prices.'
)
ON CONFLICT (id) DO UPDATE SET
  site_name = EXCLUDED.site_name,
  primary_color = EXCLUDED.primary_color,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone,
  whatsapp = EXCLUDED.whatsapp,
  address = EXCLUDED.address,
  social_links = EXCLUDED.social_links,
  footer_text = EXCLUDED.footer_text,
  seo_default_title = EXCLUDED.seo_default_title,
  seo_default_description = EXCLUDED.seo_default_description;


-- ============================================================================
-- HERO SLIDES (Uttarakhand themed)
-- ============================================================================

INSERT INTO public.hero_slides (id, title, subtitle, image_url, cta_text, cta_link, secondary_cta_text, secondary_cta_link, sort_order, is_visible) VALUES
(
  'a1000001-0000-4000-8000-000000000001',
  'Explore Uttarakhand',
  'Discover pristine valleys, ancient temples, and snow-capped peaks in the Dev Bhoomi of India',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
  'View Treks',
  '/trips?destination=uttarakhand',
  'Plan Custom Trip',
  '/contact',
  1,
  true
),
(
  'a1000001-0000-4000-8000-000000000002',
  'Ladakh — Land of High Passes',
  'Ride through Khardung La, camp under starlit skies, and witness the magic of Pangong Lake',
  'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=1920&q=80',
  'Explore Ladakh',
  '/destinations/ladakh',
  'View Packages',
  '/trips?destination=ladakh',
  2,
  true
),
(
  'a1000001-0000-4000-8000-000000000003',
  'Spiti Valley Expedition',
  'Journey through the cold desert, ancient monasteries, and turquoise rivers of Himachal Pradesh',
  'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1920&q=80',
  'Book Spiti Trip',
  '/trips?destination=spiti',
  'Learn More',
  '/destinations/spiti',
  3,
  true
),
(
  'a1000001-0000-4000-8000-000000000004',
  'Valley of Flowers Trek',
  'Walk through a UNESCO World Heritage Site carpeted with rare Himalayan wildflowers',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80',
  'Book Now',
  '/trips/valley-of-flowers-trek',
  'View Itinerary',
  '/trips/valley-of-flowers-trek#itinerary',
  4,
  true
);

-- ============================================================================
-- DESTINATIONS
-- ============================================================================

INSERT INTO public.destinations (id, name, slug, state, country, description, short_description, image_url, cover_image_url, gallery, map_lat, map_lng, best_season, altitude, is_featured, is_visible, sort_order, seo_title, seo_description) VALUES
(
  'b2000001-0000-4000-8000-000000000001',
  'Dehradun',
  'dehradun',
  'Uttarakhand',
  'India',
  'The capital of Uttarakhand, Dehradun is nestled in the Doon Valley between the Ganges and Yamuna rivers. A perfect gateway to the Himalayas, it offers colonial charm, Robber''s Cave, Sahastradhara waterfalls, and easy access to Mussoorie, Haridwar, and Rishikesh.',
  'Gateway to the Himalayas with colonial charm and natural beauty',
  'https://images.unsplash.com/photo-1587474260583-136574528ed5?w=800&q=80',
  'https://images.unsplash.com/photo-1587474260583-136574528ed5?w=1920&q=80',
  ARRAY['https://images.unsplash.com/photo-1587474260583-136574528ed5?w=800&q=80', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'],
  30.3165, 78.0322,
  'March to June, September to November',
  '640 m',
  true, true, 1,
  'Dehradun Travel Guide | Dream Go India',
  'Explore Dehradun — the perfect base for Himalayan adventures. Book treks, tours and weekend getaways from Dehradun.'
),
(
  'b2000001-0000-4000-8000-000000000002',
  'Har Ki Dun',
  'har-ki-dun',
  'Uttarakhand',
  'India',
  'Known as the Valley of Gods, Har Ki Dun is a cradle-shaped valley in the Garhwal Himalayas. The trek passes through ancient villages like Osla and Gangad, dense pine forests, and offers stunning views of Swargarohini peaks. Rich in mythology, it is believed to be the path taken by the Pandavas to heaven.',
  'The Valley of Gods — a mythical trek through Garhwal Himalayas',
  'https://images.unsplash.com/photo-1454496522488-7a8e488e86b7?w=800&q=80',
  'https://images.unsplash.com/photo-1454496522488-7a8e488e86b7?w=1920&q=80',
  ARRAY['https://images.unsplash.com/photo-1454496522488-7a8e488e86b7?w=800&q=80'],
  31.1167, 78.4667,
  'May to June, September to November',
  '3,566 m',
  true, true, 2,
  'Har Ki Dun Trek | Valley of Gods Uttarakhand',
  'Book Har Ki Dun trek — 7-day adventure through Garhwal Himalayas. Ancient villages, alpine meadows, and Swargarohini views.'
),
(
  'b2000001-0000-4000-8000-000000000003',
  'Valley of Flowers',
  'valley-of-flowers',
  'Uttarakhand',
  'India',
  'A UNESCO World Heritage Site in Chamoli district, the Valley of Flowers National Park blooms with over 600 species of exotic flowers including Brahma Kamal, Blue Poppy, and Cobra Lily. Combined with Hemkund Sahib, this is one of India''s most spectacular monsoon treks.',
  'UNESCO World Heritage Site with 600+ Himalayan wildflower species',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80',
  ARRAY['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80'],
  30.7333, 79.6000,
  'July to September',
  '3,658 m',
  true, true, 3,
  'Valley of Flowers Trek Uttarakhand | Dream Go India',
  'Trek the Valley of Flowers UNESCO site. Monsoon blooms, Hemkund Sahib, and alpine beauty in Uttarakhand.'
),
(
  'b2000001-0000-4000-8000-000000000004',
  'Auli',
  'auli',
  'Uttarakhand',
  'India',
  'India''s premier ski destination, Auli offers panoramic views of Nanda Devi, Mana Parvat, and Kamet. With Asia''s longest cable car from Joshimath, pristine slopes, and winter sports, Auli is a must-visit for snow lovers and adventure seekers alike.',
  'India''s top ski destination with Nanda Devi views',
  'https://images.unsplash.com/photo-1551524164-687a55dd1126?w=800&q=80',
  'https://images.unsplash.com/photo-1551524164-687a55dd1126?w=1920&q=80',
  ARRAY['https://images.unsplash.com/photo-1551524164-687a55dd1126?w=800&q=80'],
  30.4889, 79.5667,
  'December to March (skiing), April to June (trekking)',
  '2,800 m',
  true, true, 4,
  'Auli Ski Resort & Snow Trek | Uttarakhand',
  'Book Auli snow trek and skiing packages. Cable car rides, Nanda Devi views, and winter adventures in Uttarakhand.'
),
(
  'b2000001-0000-4000-8000-000000000005',
  'Nainital',
  'nainital',
  'Uttarakhand',
  'India',
  'The Lake District of India, Nainital is built around the emerald Naini Lake. Enjoy boating, Mall Road shopping, Naina Devi Temple, Snow View Point, and nearby attractions like Bhimtal and Sattal. Perfect for family vacations and weekend getaways.',
  'The Lake District of India — boating, hills, and colonial charm',
  'https://images.unsplash.com/photo-1593693397690-362cb3106fc9?w=800&q=80',
  'https://images.unsplash.com/photo-1593693397690-362cb3106fc9?w=1920&q=80',
  ARRAY['https://images.unsplash.com/photo-1593693397690-362cb3106fc9?w=800&q=80'],
  29.3803, 79.4636,
  'March to June, September to November',
  '2,084 m',
  true, true, 5,
  'Nainital Tour Packages | Lake District Uttarakhand',
  'Book Nainital family tours and weekend packages. Lake boating, hill stations, and Kumaon experiences.'
),
(
  'b2000001-0000-4000-8000-000000000006',
  'Ladakh',
  'ladakh',
  'Ladakh',
  'India',
  'The Land of High Passes — Ladakh offers otherworldly landscapes, ancient Buddhist monasteries, high-altitude lakes like Pangong and Tso Moriri, and thrilling road trips on the Manali-Leh and Srinagar-Leh highways. A bucket-list destination for every Indian traveler.',
  'Land of High Passes — monasteries, lakes, and high-altitude adventures',
  'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=800&q=80',
  'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=1920&q=80',
  ARRAY['https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=800&q=80'],
  34.1526, 77.5771,
  'May to September',
  '3,500 m (Leh)',
  true, true, 6,
  'Ladakh Tour Packages | Bike Trips & Sightseeing',
  'Book Ladakh bike trips, road trips, and sightseeing packages. Pangong Lake, Nubra Valley, and monasteries.'
),
(
  'b2000001-0000-4000-8000-000000000007',
  'Spiti',
  'spiti',
  'Himachal Pradesh',
  'India',
  'Spiti Valley — the Middle Land between India and Tibet — features barren mountains, ancient monasteries like Key and Tabo, the turquoise Spiti River, and villages like Kaza, Kibber, and Langza. One of India''s most remote and photogenic destinations.',
  'Cold desert valley with ancient monasteries and stark beauty',
  'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80',
  'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1920&q=80',
  ARRAY['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80'],
  32.2460, 78.0332,
  'May to September',
  '3,800 m (Kaza)',
  true, true, 7,
  'Spiti Valley Tour Packages | Himachal Pradesh',
  'Book Spiti Valley road trips and expeditions. Key Monastery, Chandratal, and Himalayan cold desert.'
),
(
  'b2000001-0000-4000-8000-000000000008',
  'Manali',
  'manali',
  'Himachal Pradesh',
  'India',
  'Nestled in the Kullu Valley along the Beas River, Manali is Himachal''s adventure capital. Enjoy paragliding, river rafting, Solang Valley skiing, Rohtang Pass, Old Manali cafes, and gateway access to Spiti, Leh, and Hampta Pass.',
  'Adventure capital of Himachal — rafting, paragliding, and snow',
  'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&q=80',
  'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1920&q=80',
  ARRAY['https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&q=80'],
  32.2432, 77.1892,
  'March to June, October to February',
  '2,050 m',
  true, true, 8,
  'Manali Tour Packages | Himachal Adventure Trips',
  'Book Manali packages — Solang Valley, Rohtang Pass, rafting, and backpacking trips in Himachal Pradesh.'
),
(
  'b2000001-0000-4000-8000-000000000009',
  'Goa',
  'goa',
  'Goa',
  'India',
  'India''s beach paradise — golden sands, Portuguese heritage, vibrant nightlife, water sports, and seafood shacks. From North Goa''s party beaches to South Goa''s serene coves, Goa offers the perfect coastal escape for every traveler.',
  'Beaches, nightlife, and Portuguese heritage on the Arabian Sea',
  'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80',
  'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1920&q=80',
  ARRAY['https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80'],
  15.2993, 74.1240,
  'November to February',
  'Sea level',
  true, true, 9,
  'Goa Tour Packages | Beach Holidays India',
  'Book Goa beach packages — water sports, nightlife, heritage tours, and coastal getaways.'
),
(
  'b2000001-0000-4000-8000-000000000010',
  'Rishikesh',
  'rishikesh',
  'Uttarakhand',
  'India',
  'The Yoga Capital of the World and India''s adventure hub on the Ganges. Experience white-water rafting, bungee jumping, yoga retreats, Ganga Aarti at Triveni Ghat, and the iconic Laxman Jhula. Gateway to Char Dham Yatra.',
  'Yoga capital and adventure hub on the holy Ganges',
  'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80',
  'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1920&q=80',
  ARRAY['https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80'],
  30.0869, 78.2676,
  'September to April',
  '372 m',
  true, true, 10,
  'Rishikesh Adventure Packages | Rafting & Yoga',
  'Book Rishikesh rafting, camping, and yoga retreats. Ganga Aarti, bungee jumping, and weekend trips.'
),
(
  'b2000001-0000-4000-8000-000000000011',
  'Kasol',
  'kasol',
  'Himachal Pradesh',
  'India',
  'Mini Israel of India — Kasol in Parvati Valley is a backpacker haven with riverside cafes, trekking to Kheerganga, Malana, and Tosh. Lush pine forests, the Parvati River, and a laid-back vibe make it perfect for young travelers.',
  'Backpacker paradise in Parvati Valley with riverside charm',
  'https://images.unsplash.com/photo-1622397333309-3fceaa455043?w=800&q=80',
  'https://images.unsplash.com/photo-1622397333309-3fceaa455043?w=1920&q=80',
  ARRAY['https://images.unsplash.com/photo-1622397333309-3fceaa455043?w=800&q=80'],
  32.0103, 77.3154,
  'March to June, September to November',
  '1,580 m',
  true, true, 11,
  'Kasol & Kheerganga Trek Packages | Parvati Valley',
  'Book Kasol backpacking trips and Kheerganga hot spring trek in Himachal Parvati Valley.'
),
(
  'b2000001-0000-4000-8000-000000000012',
  'Chopta',
  'chopta',
  'Uttarakhand',
  'India',
  'Known as the Mini Switzerland of India, Chopta is the base for Tungnath Temple (highest Shiva temple) and Chandrashila summit trek. Pristine meadows, rhododendron forests, and 360-degree Himalayan views await trekkers year-round.',
  'Mini Switzerland — base for Tungnath and Chandrashila trek',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
  ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'],
  30.4873, 79.2167,
  'March to June, September to December',
  '2,680 m',
  true, true, 12,
  'Chopta Tungnath Chandrashila Trek | Uttarakhand',
  'Book Chopta Chandrashila trek — Tungnath temple, snow views, and meadow camping in Uttarakhand.'
),
(
  'b2000001-0000-4000-8000-000000000013',
  'Kedarnath',
  'kedarnath',
  'Uttarakhand',
  'India',
  'One of the holiest Char Dham pilgrimage sites, Kedarnath Temple sits at 3,583m near the Mandakini River. Surrounded by snow peaks, this sacred shrine dedicated to Lord Shiva draws millions of devotees and trekkers each year.',
  'Sacred Char Dham shrine nestled in the Garhwal Himalayas',
  'https://images.unsplash.com/photo-1609137144813-7d988331fbe7?w=800&q=80',
  'https://images.unsplash.com/photo-1609137144813-7d988331fbe7?w=1920&q=80',
  ARRAY['https://images.unsplash.com/photo-1609137144813-7d988331fbe7?w=800&q=80'],
  30.7346, 79.0669,
  'May to June, September to October',
  '3,583 m',
  true, true, 13,
  'Kedarnath Yatra Packages | Char Dham Trek',
  'Book Kedarnath Yatra packages with guided trek, helicopter options, and Char Dham pilgrimage support.'
);

-- ============================================================================
-- TRIP CATEGORIES
-- ============================================================================

INSERT INTO public.trip_categories (id, name, slug, icon, description, season, sort_order, is_visible) VALUES
('c3000001-0000-4000-8000-000000000001', 'Winter', 'winter', 'snowflake', 'Snow treks, skiing, and winter wonderland adventures', 'winter', 1, true),
('c3000001-0000-4000-8000-000000000002', 'Summer', 'summer', 'sun', 'High-altitude escapes and cool mountain retreats', 'summer', 2, true),
('c3000001-0000-4000-8000-000000000003', 'Monsoon', 'monsoon', 'cloud-rain', 'Valley of Flowers, lush green trails, and monsoon magic', 'monsoon', 3, true),
('c3000001-0000-4000-8000-000000000004', 'Family', 'family', 'users', 'Kid-friendly tours with comfortable stays and easy trails', 'all', 4, true),
('c3000001-0000-4000-8000-000000000005', 'Adventure', 'adventure', 'mountain', 'Trekking, rafting, camping, and adrenaline-packed trips', 'all', 5, true),
('c3000001-0000-4000-8000-000000000006', 'Weekend', 'weekend', 'calendar', 'Quick 2-3 day getaways from Delhi and Dehradun', 'all', 6, true),
('c3000001-0000-4000-8000-000000000007', 'International', 'international', 'globe', 'Curated international tours beyond India', 'all', 7, true);

-- ============================================================================
-- TRIPS
-- ============================================================================

INSERT INTO public.trips (
  id, title, slug, destination_id, category_id, description, overview, location,
  duration_days, duration_nights, price, discount_price, difficulty, max_seats, seats_left,
  rating, review_count, season, highlights, itinerary, inclusions, exclusions, faqs,
  map_lat, map_lng, altitude, is_featured, is_popular, is_trending, is_visible,
  seo_title, seo_description
) VALUES
(
  'd4000001-0000-4000-8000-000000000001',
  'Har Ki Dun Trek',
  'har-ki-dun-trek',
  'b2000001-0000-4000-8000-000000000002',
  'c3000001-0000-4000-8000-000000000005',
  'A 7-day trek through the mythical Valley of Gods in Garhwal Himalayas.',
  'Har Ki Dun, meaning Valley of Gods, is one of Uttarakhand''s most scenic and culturally rich treks. The trail winds through Govind Pashu Vihar National Park, ancient villages like Osla and Gangad, and offers breathtaking views of Swargarohini, Bandarpoonch, and Kala Nag peaks. Perfect for beginners and experienced trekkers alike.',
  'Sankri, Uttarkashi, Uttarakhand',
  7, 6, 12999, 10999, 'moderate', 18, 12,
  4.8, 156, 'summer',
  ARRAY['Ancient Osla village with 2,000-year-old temple', 'Stunning views of Swargarohini peaks', 'Walk through Govind National Park', 'Camping beside Thamsa River', 'Rich local culture and cuisine'],
  '[
    {"day": 1, "title": "Dehradun to Sankri", "description": "Drive from Dehradun to Sankri (200 km, 8-9 hrs). Overnight in guesthouse."},
    {"day": 2, "title": "Sankri to Taluka to Seema", "description": "Trek 14 km through forests and villages. Camp at Seema."},
    {"day": 3, "title": "Seema to Har Ki Dun", "description": "Trek 11 km to the valley. Explore meadows and peaks. Camp at Har Ki Dun."},
    {"day": 4, "title": "Har Ki Dun Exploration", "description": "Day excursion to Maninda Lake or Jaundhar Glacier viewpoint."},
    {"day": 5, "title": "Har Ki Dun to Seema", "description": "Descend back to Seema campsite."},
    {"day": 6, "title": "Seema to Sankri", "description": "Trek back to Sankri. Celebration dinner."},
    {"day": 7, "title": "Sankri to Dehradun", "description": "Drive back to Dehradun. Trip ends by evening."}
  ]'::jsonb,
  ARRAY['All meals during trek', 'Camping equipment & tents', 'Certified trek leader & guide', 'Forest permits & entry fees', 'First aid kit', 'Transport Dehradun-Sankri-Dehradun'],
  ARRAY['Personal trekking gear', 'Travel insurance', 'Porter charges (optional)', 'Anything not mentioned in inclusions'],
  '[
    {"question": "Is Har Ki Dun trek suitable for beginners?", "answer": "Yes, it is rated moderate and suitable for fit beginners with some prior walking experience."},
    {"question": "What is the best time for Har Ki Dun?", "answer": "May-June and September-November offer the best weather and clear views."},
    {"question": "Are there washroom facilities on the trek?", "answer": "Basic toilet tents are provided at campsites. No facilities during day trekking."}
  ]'::jsonb,
  31.1167, 78.4667, '3,566 m',
  true, true, true, true,
  'Har Ki Dun Trek 7 Days | ₹10,999 | Dream Go India',
  'Book Har Ki Dun trek — 7 days, all-inclusive from Dehradun. Moderate difficulty, max 18 trekkers.'
),
(
  'd4000001-0000-4000-8000-000000000002',
  'Valley of Flowers Trek',
  'valley-of-flowers-trek',
  'b2000001-0000-4000-8000-000000000003',
  'c3000001-0000-4000-8000-000000000003',
  'Witness the magical bloom of 600+ wildflower species in this UNESCO World Heritage Site.',
  'The Valley of Flowers trek is a once-in-a-lifetime monsoon experience. Trek through the national park as it transforms into a vibrant carpet of Brahma Kamal, Blue Poppy, Anemones, and hundreds more species. Combined with a visit to the sacred Hemkund Sahib gurudwara, this 6-day journey is both spiritual and spectacular.',
  'Govindghat, Chamoli, Uttarakhand',
  6, 5, 11499, 9999, 'moderate', 20, 8,
  4.9, 203, 'monsoon',
  ARRAY['UNESCO World Heritage Site', '600+ species of Himalayan wildflowers', 'Visit Hemkund Sahib gurudwara', 'Brahma Kamal and Blue Poppy sightings', 'Monsoon trekking experience'],
  '[
    {"day": 1, "title": "Dehradun to Govindghat", "description": "Drive via Joshimath to Govindghat. Overnight stay."},
    {"day": 2, "title": "Govindghat to Ghangaria", "description": "Trek 14 km along Pushpawati River. Stay in Ghangaria."},
    {"day": 3, "title": "Ghangaria to Valley of Flowers", "description": "Enter the national park. Full day exploring the valley."},
    {"day": 4, "title": "Ghangaria to Hemkund Sahib", "description": "Trek to Hemkund Sahib (4,329 m). Return to Ghangaria."},
    {"day": 5, "title": "Ghangaria to Govindghat", "description": "Descend to Govindghat."},
    {"day": 6, "title": "Govindghat to Dehradun", "description": "Drive back to Dehradun. Trip ends."}
  ]'::jsonb,
  ARRAY['All meals', 'GMVN guesthouse / camp stay', 'Trek leader and guide', 'National park entry fees', 'Transport from Dehradun'],
  ARRAY['Rain gear (can be rented)', 'Personal expenses', 'Pony charges if needed'],
  '[
    {"question": "When is the Valley of Flowers open?", "answer": "The park is open from June to October, with peak bloom in July-August."},
    {"question": "Is rain gear necessary?", "answer": "Yes, monsoon trekking requires good rain jacket, poncho, and waterproof bags."}
  ]'::jsonb,
  30.7333, 79.6000, '3,658 m',
  true, true, true, true,
  'Valley of Flowers Trek 6 Days | Dream Go India',
  'Book Valley of Flowers trek — UNESCO site, monsoon blooms, Hemkund Sahib. From ₹9,999.'
),
(
  'd4000001-0000-4000-8000-000000000003',
  'Auli Snow Trek & Ski Experience',
  'auli-snow-trek',
  'b2000001-0000-4000-8000-000000000004',
  'c3000001-0000-4000-8000-000000000001',
  'Experience India''s best skiing destination with snow trekking and cable car rides.',
  'Auli in winter is a snow lover''s paradise. This 5-day package includes skiing lessons for beginners, snow trekking, Asia''s longest cable car ride from Joshimath, and stunning views of Nanda Devi and Mana Parvat. Stay in cozy mountain resorts with bonfire evenings.',
  'Auli, Chamoli, Uttarakhand',
  5, 4, 14999, 12999, 'easy', 15, 10,
  4.7, 89, 'winter',
  ARRAY['Skiing lessons for beginners', 'Asia''s longest cable car (4 km)', 'Nanda Devi panoramic views', 'Snow trekking and activities', 'Bonfire and mountain resort stay'],
  '[
    {"day": 1, "title": "Dehradun to Joshimath", "description": "Scenic drive along Alaknanda River. Overnight in Joshimath."},
    {"day": 2, "title": "Joshimath to Auli", "description": "Cable car to Auli. Skiing introduction. Resort check-in."},
    {"day": 3, "title": "Auli Ski Day", "description": "Full day skiing and snow activities on Auli slopes."},
    {"day": 4, "title": "Snow Trek & Gorson Bugyal", "description": "Trek to Gorson Bugyal meadows with Nanda Devi views."},
    {"day": 5, "title": "Auli to Dehradun", "description": "Cable car down, drive back to Dehradun."}
  ]'::jsonb,
  ARRAY['Resort accommodation', 'All meals', 'Cable car tickets', 'Ski equipment rental', 'Ski instructor', 'Transport'],
  ARRAY['Winter clothing (jackets available on rent)', 'Travel insurance'],
  '[
    {"question": "Do I need prior skiing experience?", "answer": "No, beginners are welcome. Basic skiing lessons are included."},
    {"question": "What temperatures to expect?", "answer": "December to February temperatures range from -2°C to 10°C. Heavy snow expected."}
  ]'::jsonb,
  30.4889, 79.5667, '2,800 m',
  true, true, false, true,
  'Auli Snow Trek & Ski Package | Winter 2026',
  'Book Auli snow trek with skiing, cable car, and Nanda Devi views. 5 days from ₹12,999.'
),
(
  'd4000001-0000-4000-8000-000000000004',
  'Kedarnath Yatra Package',
  'kedarnath-yatra',
  'b2000001-0000-4000-8000-000000000013',
  'c3000001-0000-4000-8000-000000000004',
  'Guided Char Dham pilgrimage to the sacred Kedarnath Temple with full support.',
  'Embark on a spiritually enriching journey to Kedarnath, one of the holiest Char Dham shrines. Our guided package includes trek support from Gaurikund, comfortable stays, VIP darshan assistance, meals, medical support, and helicopter upgrade options. Suitable for families and elderly with pony/palki arrangements.',
  'Kedarnath, Rudraprayag, Uttarakhand',
  4, 3, 8999, 7999, 'moderate', 25, 18,
  4.9, 312, 'summer',
  ARRAY['Guided trek from Gaurikund (16 km)', 'VIP darshan assistance', 'Helicopter upgrade available', 'Medical & oxygen support', 'Pony/palki arrangements for elderly'],
  '[
    {"day": 1, "title": "Dehradun to Guptkashi", "description": "Drive via Devprayag and Rudraprayag. Overnight in Guptkashi."},
    {"day": 2, "title": "Guptkashi to Kedarnath", "description": "Drive to Gaurikund, trek 16 km to Kedarnath. Evening aarti."},
    {"day": 3, "title": "Kedarnath Darshan & Return", "description": "Morning darshan, trek back to Gaurikund. Stay in Guptkashi."},
    {"day": 4, "title": "Guptkashi to Dehradun", "description": "Drive back to Dehradun with temple stops en route."}
  ]'::jsonb,
  ARRAY['Accommodation', 'All vegetarian meals', 'Trek guide', 'Medical kit', 'Transport', 'Temple registration assistance'],
  ARRAY['Helicopter tickets (optional upgrade)', 'Pony/palki charges', 'Personal expenses'],
  '[
    {"question": "Can elderly people do this yatra?", "answer": "Yes, pony, palki, and helicopter options are available for elderly pilgrims."},
    {"question": "When is Kedarnath temple open?", "answer": "The temple opens in late April/early May and closes in November, depending on the Hindu calendar."}
  ]'::jsonb,
  30.7346, 79.0669, '3,583 m',
  true, true, true, true,
  'Kedarnath Yatra Package 4 Days | Char Dham',
  'Book Kedarnath Yatra — guided trek, VIP darshan, helicopter option. From ₹7,999.'
),
(
  'd4000001-0000-4000-8000-000000000005',
  'Ladakh Bike Expedition',
  'ladakh-bike-expedition',
  'b2000001-0000-4000-8000-000000000006',
  'c3000001-0000-4000-8000-000000000005',
  '10-day motorcycle adventure through the highest motorable roads in the world.',
  'Ride through Khardung La (18,380 ft), cross Nubra Valley''s sand dunes, camp beside Pangong Lake, and explore ancient monasteries. Royal Enfield 350cc bikes, backup vehicle, mechanic, and experienced road captain included. The ultimate Ladakh experience for bikers.',
  'Leh, Ladakh',
  10, 9, 32999, 29999, 'difficult', 12, 6,
  4.8, 178, 'summer',
  ARRAY['Royal Enfield 350cc with fuel', 'Khardung La & Chang La passes', 'Pangong Lake camping', 'Nubra Valley sand dunes', 'Backup vehicle with mechanic'],
  '[
    {"day": 1, "title": "Arrive Leh — Acclimatization", "description": "Airport pickup, rest day for altitude acclimatization."},
    {"day": 2, "title": "Leh Local Sightseeing", "description": "Shanti Stupa, Leh Palace, local market."},
    {"day": 3, "title": "Leh to Nubra Valley", "description": "Ride over Khardung La. Diskit Monastery, sand dunes."},
    {"day": 4, "title": "Nubra to Pangong Lake", "description": "Ride via Shyok route to Pangong. Lakeside camping."},
    {"day": 5, "title": "Pangong to Leh", "description": "Return via Chang La pass."},
    {"day": 6, "title": "Leh to Lamayuru", "description": "Moonland landscapes, oldest monastery."},
    {"day": 7, "title": "Lamayuru to Leh", "description": "Return with Magnetic Hill and confluence stops."},
    {"day": 8, "title": "Leh to Tso Moriri (optional)", "description": "High-altitude lake excursion."},
    {"day": 9, "title": "Free Day in Leh", "description": "Shopping, cafes, rest."},
    {"day": 10, "title": "Departure", "description": "Airport drop. Ride complete."}
  ]'::jsonb,
  ARRAY['Royal Enfield bike with fuel', 'Backup vehicle', 'Mechanic & road captain', 'Accommodation', 'Meals', 'Inner line permits', 'Helmets & riding gear'],
  ARRAY['Flight to/from Leh', 'Travel insurance', 'Personal riding gear (jackets, gloves)'],
  '[
    {"question": "Do I need a motorcycle license?", "answer": "Yes, a valid two-wheeler license is mandatory. International license accepted."},
    {"question": "What if I cannot ride?", "answer": "Pillion seats on group bikes or jeep tour option available at adjusted pricing."}
  ]'::jsonb,
  34.1526, 77.5771, '3,500 m',
  true, true, true, true,
  'Ladakh Bike Trip 10 Days | Royal Enfield Expedition',
  'Book Ladakh bike expedition — Khardung La, Pangong, Nubra. Royal Enfield included. From ₹29,999.'
),
(
  'd4000001-0000-4000-8000-000000000006',
  'Rishikesh Rafting & Camping Weekend',
  'rishikesh-rafting-weekend',
  'b2000001-0000-4000-8000-000000000010',
  'c3000001-0000-4000-8000-000000000006',
  '2-day adrenaline-packed weekend with Ganga rafting, camping, and cliff jumping.',
  'Escape Delhi for a thrilling weekend in Rishikesh. Grade III-IV white-water rafting on the Ganges, riverside camping with bonfire, cliff jumping, and Ganga Aarti at Triveni Ghat. Perfect for groups, corporates, and weekend warriors.',
  'Rishikesh, Uttarakhand',
  2, 1, 3499, 2999, 'easy', 30, 22,
  4.6, 421, 'all',
  ARRAY['16 km white-water rafting (Grade III-IV)', 'Riverside camping with bonfire', 'Cliff jumping', 'Ganga Aarti experience', 'All meals included'],
  '[
    {"day": 1, "title": "Delhi/Dehradun to Rishikesh", "description": "Arrive by morning. Rafting session. Camp setup. Bonfire night."},
    {"day": 2, "title": "Camp to Rishikesh & Return", "description": "Morning activities. Ganga Aarti. Return by evening."}
  ]'::jsonb,
  ARRAY['Rafting with safety gear', 'Camping equipment', 'All meals', 'Certified rafting instructor', 'Bonfire'],
  ARRAY['Transport (Delhi pickup available at extra cost)', 'Adventure activities beyond rafting'],
  '[
    {"question": "Is swimming required for rafting?", "answer": "Swimming is not mandatory but recommended. Life jackets are provided."},
    {"question": "Can non-swimmers join?", "answer": "Yes, with life jackets and experienced guides, non-swimmers can enjoy rafting safely."}
  ]'::jsonb,
  30.0869, 78.2676, '372 m',
  false, true, true, true,
  'Rishikesh Rafting Weekend | 2 Days from ₹2,999',
  'Book Rishikesh rafting and camping weekend — Grade III-IV rapids, bonfire, Ganga Aarti.'
),
(
  'd4000001-0000-4000-8000-000000000007',
  'Spiti Valley Road Trip',
  'spiti-valley-road-trip',
  'b2000001-0000-4000-8000-000000000007',
  'c3000001-0000-4000-8000-000000000005',
  '7-day road expedition through the cold desert of Spiti Valley.',
  'Journey through one of the most remote regions of India. Cross Rohtang Pass or Kunzum Pass, visit Key Monastery, Tabo (oldest monastery), Chandratal Lake, and villages of Kaza, Kibber, Langza, and Hikkim (world''s highest post office). Homestays and camping under billion-star skies.',
  'Kaza, Spiti Valley, Himachal Pradesh',
  7, 6, 18999, 16999, 'moderate', 14, 9,
  4.8, 134, 'summer',
  ARRAY['Key Monastery & Tabo ancient caves', 'Chandratal Lake camping', 'Langza Buddha statue & fossil village', 'Hikkim highest post office', 'Kunzum Pass crossing'],
  '[
    {"day": 1, "title": "Manali to Kaza via Rohtang", "description": "Cross Rohtang Pass, enter Spiti. Overnight Kaza."},
    {"day": 2, "title": "Kaza — Key, Kibber, Chicham", "description": "Monastery visits, highest bridge, village walks."},
    {"day": 3, "title": "Kaza to Langza, Hikkim, Komic", "description": "Fossil village, post office, highest village."},
    {"day": 4, "title": "Kaza to Chandratal", "description": "Drive to Moon Lake. Lakeside camping."},
    {"day": 5, "title": "Chandratal to Tabo", "description": "Ancient monastery and caves."},
    {"day": 6, "title": "Tabo to Manali", "description": "Return via Kunzum Pass."},
    {"day": 7, "title": "Manali to Delhi/Dehradun", "description": "Overnight travel. Trip ends."}
  ]'::jsonb,
  ARRAY['Tempo traveller / SUV transport', 'Accommodation & camping', 'All meals', 'Inner line permits', 'Experienced driver-guide'],
  ARRAY['Flight/train to Manali', 'Personal expenses'],
  '[
    {"question": "Which route is taken?", "answer": "We take Manali-Kaza-Chandratal-Tabo-Manali circuit via Rohtang and Kunzum passes."},
    {"question": "Is altitude sickness a concern?", "answer": "Kaza is at 3,800m. We carry oxygen cylinders and recommend 1-day acclimatization."}
  ]'::jsonb,
  32.2460, 78.0332, '3,800 m',
  true, false, true, true,
  'Spiti Valley Road Trip 7 Days | Dream Go India',
  'Book Spiti Valley expedition — Key Monastery, Chandratal, cold desert. From ₹16,999.'
),
(
  'd4000001-0000-4000-8000-000000000008',
  'Chopta Chandrashila Trek',
  'chopta-chandrashila-trek',
  'b2000001-0000-4000-8000-000000000012',
  'c3000001-0000-4000-8000-000000000006',
  'Weekend trek to Tungnath Temple and Chandrashila summit with 360° Himalayan views.',
  'A perfect weekend trek from Dehradun/Delhi. Hike to the highest Shiva temple in the world (Tungnath at 3,680m), then summit Chandrashila (4,000m) for panoramic views of Nanda Devi, Trishul, Chaukhamba, and Kedar Dome. Rhododendron forests in spring, snow trails in winter.',
  'Chopta, Rudraprayag, Uttarakhand',
  3, 2, 4999, 4499, 'easy', 20, 15,
  4.7, 267, 'all',
  ARRAY['Highest Shiva temple — Tungnath', 'Chandrashila 360° summit views', 'Rhododendron forests (spring)', 'Snow trek option (winter)', 'Perfect weekend getaway'],
  '[
    {"day": 1, "title": "Dehradun to Chopta", "description": "Drive via Devprayag and Ukhimath. Camp in Chopta meadows."},
    {"day": 2, "title": "Chopta to Tungnath to Chandrashila", "description": "Trek 5 km up to Tungnath and Chandrashila summit. Return to Chopta."},
    {"day": 3, "title": "Chopta to Dehradun", "description": "Morning at leisure. Drive back."}
  ]'::jsonb,
  ARRAY['Camping / guesthouse', 'Meals', 'Trek guide', 'Forest permits', 'Transport from Dehradun'],
  ARRAY['Personal trekking gear', 'Porter if needed'],
  '[
    {"question": "Can beginners do Chandrashila?", "answer": "Yes, it is an easy to moderate trek suitable for fit beginners."},
    {"question": "Is it available in winter?", "answer": "Yes, winter batches offer snow trekking with microspikes. Extra warm gear recommended."}
  ]'::jsonb,
  30.4873, 79.2167, '4,000 m',
  false, true, false, true,
  'Chopta Chandrashila Weekend Trek | 3 Days',
  'Book Chopta Tungnath Chandrashila trek — weekend trip from Dehradun. From ₹4,499.'
);

-- ============================================================================
-- TRIP IMAGES
-- ============================================================================

INSERT INTO public.trip_images (trip_id, image_url, alt_text, sort_order, is_cover) VALUES
('d4000001-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1454496522488-7a8e488e86b7?w=1200&q=80', 'Har Ki Dun valley with snow peaks', 0, true),
('d4000001-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', 'Trekking through alpine meadows', 1, false),
('d4000001-0000-4000-8000-000000000002', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80', 'Valley of Flowers in full bloom', 0, true),
('d4000001-0000-4000-8000-000000000002', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', 'Himalayan wildflowers close-up', 1, false),
('d4000001-0000-4000-8000-000000000003', 'https://images.unsplash.com/photo-1551524164-687a55dd1126?w=1200&q=80', 'Auli snow slopes with skiers', 0, true),
('d4000001-0000-4000-8000-000000000004', 'https://images.unsplash.com/photo-1609137144813-7d988331fbe7?w=1200&q=80', 'Kedarnath temple with mountains', 0, true),
('d4000001-0000-4000-8000-000000000005', 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=1200&q=80', 'Ladakh mountain road biking', 0, true),
('d4000001-0000-4000-8000-000000000006', 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&q=80', 'Ganga white water rafting Rishikesh', 0, true),
('d4000001-0000-4000-8000-000000000007', 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=80', 'Spiti Valley monastery and mountains', 0, true),
('d4000001-0000-4000-8000-000000000008', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', 'Chandrashila summit Himalayan panorama', 0, true);

-- ============================================================================
-- TRIP DEPARTURES (upcoming)
-- ============================================================================

INSERT INTO public.trip_departures (trip_id, departure_date, return_date, seats_available, price_override, is_active) VALUES
('d4000001-0000-4000-8000-000000000001', '2026-05-10', '2026-05-16', 12, NULL, true),
('d4000001-0000-4000-8000-000000000001', '2026-05-24', '2026-05-30', 18, NULL, true),
('d4000001-0000-4000-8000-000000000001', '2026-09-14', '2026-09-20', 15, 10499, true),
('d4000001-0000-4000-8000-000000000002', '2026-07-12', '2026-07-17', 8, NULL, true),
('d4000001-0000-4000-8000-000000000002', '2026-08-02', '2026-08-07', 14, NULL, true),
('d4000001-0000-4000-8000-000000000003', '2026-01-15', '2026-01-19', 10, NULL, true),
('d4000001-0000-4000-8000-000000000003', '2026-02-08', '2026-02-12', 12, 12499, true),
('d4000001-0000-4000-8000-000000000004', '2026-05-18', '2026-05-21', 18, NULL, true),
('d4000001-0000-4000-8000-000000000004', '2026-06-01', '2026-06-04', 22, NULL, true),
('d4000001-0000-4000-8000-000000000005', '2026-06-15', '2026-06-24', 6, NULL, true),
('d4000001-0000-4000-8000-000000000005', '2026-07-05', '2026-07-14', 8, 28999, true),
('d4000001-0000-4000-8000-000000000006', '2026-07-11', '2026-07-12', 22, NULL, true),
('d4000001-0000-4000-8000-000000000006', '2026-07-18', '2026-07-19', 28, 2799, true),
('d4000001-0000-4000-8000-000000000007', '2026-06-20', '2026-06-26', 9, NULL, true),
('d4000001-0000-4000-8000-000000000008', '2026-04-04', '2026-04-06', 15, NULL, true),
('d4000001-0000-4000-8000-000000000008', '2026-11-07', '2026-11-09', 18, NULL, true);

-- ============================================================================
-- COUPONS
-- ============================================================================

INSERT INTO public.coupons (code, description, discount_type, discount_value, min_amount, max_discount, usage_limit, valid_from, valid_until, is_active) VALUES
('WELCOME10', '10% off on your first booking', 'percentage', 10, 3000, 2000, 500, now(), '2026-12-31', true),
('SUMMER2026', 'Flat ₹1,500 off on summer treks', 'fixed', 1500, 8000, NULL, 200, '2026-04-01', '2026-06-30', true),
('TREK500', '₹500 off on any trek booking', 'fixed', 500, 4000, NULL, NULL, now(), '2026-12-31', true);

-- ============================================================================
-- TESTIMONIALS
-- ============================================================================

INSERT INTO public.testimonials (name, location, content, rating, image_url, trip_name, sort_order, is_visible) VALUES
(
  'Priya Sharma',
  'Mumbai, Maharashtra',
  'Har Ki Dun trek with Dream Go India was absolutely magical! Our guide Ravi knew every trail and shared fascinating stories about Osla village. The camping setup was comfortable and meals were surprisingly delicious. Already booked Valley of Flowers for monsoon!',
  5,
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
  'Har Ki Dun Trek',
  1, true
),
(
  'Arjun Mehta',
  'Bangalore, Karnataka',
  'The Ladakh bike expedition was the adventure of a lifetime. Well-maintained Royal Enfields, an excellent road captain, and a backup vehicle gave us confidence on Khardung La. Pangong Lake camping under the stars — unforgettable!',
  5,
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
  'Ladakh Bike Expedition',
  2, true
),
(
  'Sneha & Rahul Kapoor',
  'Delhi NCR',
  'We did the Kedarnath Yatra with my parents (aged 62 and 58). Dream Go India arranged palki for mom and the team was incredibly patient and caring. VIP darshan was seamless. Highly recommend for family pilgrimages.',
  5,
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
  'Kedarnath Yatra Package',
  3, true
),
(
  'Vikram Singh',
  'Pune, Maharashtra',
  'Rishikesh rafting weekend was perfectly organized — Grade IV rapids were thrilling! Bonfire night by the Ganges, great food, and the Ganga Aarti experience was spiritual. Best ₹3,000 I have spent on a weekend.',
  4,
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
  'Rishikesh Rafting Weekend',
  4, true
),
(
  'Ananya Reddy',
  'Hyderabad, Telangana',
  'Valley of Flowers exceeded every expectation. Our trek leader helped us identify Brahma Kamal and Blue Poppies. The monsoon trek was muddy but totally worth it. Dream Go India''s team made us feel safe throughout.',
  5,
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
  'Valley of Flowers Trek',
  5, true
);

-- ============================================================================
-- WHY CHOOSE US
-- ============================================================================

INSERT INTO public.why_choose_us (title, description, icon, sort_order, is_visible) VALUES
('Expert Local Guides', 'Our certified trek leaders and guides are born in the Himalayas with 10+ years of mountain experience. Safety and local knowledge guaranteed.', 'users', 1, true),
('All-Inclusive Packages', 'No hidden costs. Transport, meals, camping gear, permits, and guide fees — everything included in one transparent price.', 'package', 2, true),
('Small Group Sizes', 'We cap groups at 15-20 for treks to minimize environmental impact and maximize your experience. No crowded tours.', 'users-round', 3, true),
('24/7 Support', 'From booking to trek completion, our Dehradun team is available on phone, WhatsApp, and email around the clock.', 'headphones', 4, true),
('Safety First', 'First aid certified guides, oxygen cylinders on high-altitude trips, satellite phones, and comprehensive risk protocols on every expedition.', 'shield', 5, true),
('Best Price Guarantee', 'Find a lower price for the same trek? We will match it. Direct operator pricing with no middleman markup.', 'badge-indian-rupee', 6, true);

-- ============================================================================
-- FAQ
-- ============================================================================

INSERT INTO public.faq (question, answer, category, sort_order, is_visible) VALUES
('How do I book a trip?', 'Browse our trips, select your preferred departure date, fill in traveler details, and pay online. You will receive a confirmation email with booking number and itinerary within minutes.', 'booking', 1, true),
('What is your cancellation policy?', 'Free cancellation up to 15 days before departure. 50% refund between 7-15 days. No refund within 7 days, but you can reschedule to another batch within 6 months.', 'booking', 2, true),
('Are trips suitable for beginners?', 'Many of our treks are rated easy to moderate and welcome fit beginners. Each trip page shows difficulty level and fitness requirements. Contact us for personalized recommendations.', 'treks', 3, true),
('What should I pack for a Himalayan trek?', 'Sturdy trekking shoes, warm layers, rain gear, sunscreen, personal medicines, and a day backpack. We provide a detailed packing list after booking. Sleeping bags and tents are included.', 'treks', 4, true),
('Do you provide trekking equipment?', 'Yes — tents, sleeping bags, mats, kitchen equipment, and safety gear are included. Personal items like trekking poles and shoes can be rented from us at nominal charges.', 'treks', 5, true),
('Is travel insurance mandatory?', 'We strongly recommend travel insurance covering medical emergencies and trip cancellation. It is mandatory for Ladakh, Spiti, and high-altitude treks above 4,000m.', 'general', 6, true),
('How do I reach the starting point?', 'Most trips start from Dehradun or Delhi. We provide pickup from Dehradun ISBT/railway station. Delhi pickup available at extra cost. Ladakh trips require flight to Leh.', 'general', 7, true),
('Can I customize a private trip?', 'Absolutely! We organize private and corporate trips with custom itineraries, dates, and group sizes. Contact us at hello@dreamgoindia.com or WhatsApp +91 98765 43210.', 'booking', 8, true),
('What payment methods do you accept?', 'We accept UPI, credit/debit cards, net banking via Razorpay, and bank transfers. EMI options available on select packages above ₹15,000.', 'payment', 9, true),
('Are meals vegetarian on treks?', 'Yes, all trek meals are pure vegetarian (satvik where possible). Vegan options available on request. Non-veg is available on Rishikesh and Goa trips only.', 'treks', 10, true);

-- ============================================================================
-- BLOG CATEGORIES
-- ============================================================================

INSERT INTO public.blog_categories (id, name, slug, description) VALUES
('e5000001-0000-4000-8000-000000000001', 'Travel Guides', 'travel-guides', 'Comprehensive destination guides and travel tips for India'),
('e5000001-0000-4000-8000-000000000002', 'Adventure', 'adventure', 'Trekking stories, adventure tips, and expedition reports'),
('e5000001-0000-4000-8000-000000000003', 'Packing Tips', 'packing-tips', 'What to pack for treks, seasons, and destinations'),
('e5000001-0000-4000-8000-000000000004', 'Top Destinations', 'top-destinations', 'Featured destinations and must-visit places in India');

-- ============================================================================
-- BLOGS (sample published posts)
-- ============================================================================

INSERT INTO public.blogs (title, slug, excerpt, content, featured_image, category_id, tags, status, is_featured, view_count, published_at) VALUES
(
  'Complete Guide to Har Ki Dun Trek 2026',
  'har-ki-dun-trek-guide-2026',
  'Everything you need to know about the Valley of Gods trek — best time, itinerary, packing list, and costs.',
  '<p>Har Ki Dun is one of Uttarakhand''s most rewarding treks, offering a perfect blend of natural beauty, mythology, and cultural immersion...</p><p>The trek begins from Sankri village and passes through dense forests, alpine meadows, and ancient villages before reaching the stunning Har Ki Dun valley at 3,566 meters.</p>',
  'https://images.unsplash.com/photo-1454496522488-7a8e488e86b7?w=1200&q=80',
  'e5000001-0000-4000-8000-000000000001',
  ARRAY['har ki dun', 'uttarakhand', 'trekking', 'garhwal'],
  'published', true, 1240,
  '2026-03-15'
),
(
  '10 Essential Items for a Himalayan Winter Trek',
  'himalayan-winter-trek-packing-list',
  'Don''t freeze on your next snow trek! Here are 10 must-have items for winter trekking in the Himalayas.',
  '<p>Winter trekking in the Himalayas is magical but demands proper preparation. From layered clothing to microspikes, here is what you need...</p>',
  'https://images.unsplash.com/photo-1551524164-687a55dd1126?w=1200&q=80',
  'e5000001-0000-4000-8000-000000000003',
  ARRAY['packing', 'winter trek', 'gear', 'tips'],
  'published', false, 856,
  '2026-02-20'
),
(
  'Why Ladakh Should Be Your Next Road Trip',
  'ladakh-road-trip-guide',
  'From Pangong Lake to Nubra Valley — discover why Ladakh is India''s ultimate road trip destination.',
  '<p>Ladakh isn''t just a destination, it''s an experience that transforms you. The dramatic landscapes, ancient Buddhist culture, and thrilling high-altitude passes make it unmissable...</p>',
  'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=1200&q=80',
  'e5000001-0000-4000-8000-000000000004',
  ARRAY['ladakh', 'road trip', 'bike trip', 'pangong'],
  'published', true, 2103,
  '2026-01-10'
);

-- ============================================================================
-- GALLERY
-- ============================================================================

INSERT INTO public.gallery (title, image_url, media_type, category, album, sort_order, is_visible) VALUES
('Har Ki Dun Sunrise', 'https://images.unsplash.com/photo-1454496522488-7a8e488e86b7?w=800&q=80', 'image', 'trekking', 'Uttarakhand Treks', 1, true),
('Valley of Flowers Bloom', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', 'image', 'trekking', 'Uttarakhand Treks', 2, true),
('Pangong Lake Ladakh', 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=800&q=80', 'image', 'landscapes', 'Ladakh Expedition', 3, true),
('Auli Snow Slopes', 'https://images.unsplash.com/photo-1551524164-687a55dd1126?w=800&q=80', 'image', 'winter', 'Winter Adventures', 4, true),
('Ganga Rafting Rishikesh', 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80', 'image', 'adventure', 'Rishikesh', 5, true),
('Spiti Key Monastery', 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80', 'image', 'culture', 'Spiti Valley', 6, true),
('Kedarnath Temple', 'https://images.unsplash.com/photo-1609137144813-7d988331fbe7?w=800&q=80', 'image', 'pilgrimage', 'Char Dham', 7, true),
('Chandrashila Summit', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', 'image', 'trekking', 'Uttarakhand Treks', 8, true);

-- ============================================================================
-- CMS PAGES
-- ============================================================================

INSERT INTO public.pages (title, slug, content, seo_title, seo_description, is_published) VALUES
(
  'About Us',
  'about',
  '<h2>Our Mission</h2><p>Dream Go India was founded in Dehradun with a simple mission: make Himalayan adventures accessible, safe, and unforgettable for every Indian traveler.</p><h2>Our Vision</h2><p>To become India''s most trusted adventure travel brand, promoting responsible tourism in the Himalayas.</p><h2>Our Journey</h2><p>Started in 2018 with weekend treks from Dehradun, we now operate 50+ trips across Uttarakhand, Himachal, Ladakh, and Goa.</p>',
  'About Dream Go India | Himalayan Adventure Travel Company',
  'Learn about Dream Go India — Dehradun-based adventure travel company offering treks, tours, and expeditions across India.',
  true
),
(
  'Privacy Policy',
  'privacy-policy',
  '<h2>Privacy Policy</h2><p>Dream Go India respects your privacy. We collect only necessary information for bookings and do not sell data to third parties. Payment data is processed securely via Razorpay.</p>',
  'Privacy Policy | Dream Go India',
  'Dream Go India privacy policy — how we collect, use, and protect your personal information.',
  true
),
(
  'Terms & Conditions',
  'terms',
  '<h2>Terms & Conditions</h2><p>By booking with Dream Go India, you agree to our cancellation policy, safety guidelines, and code of conduct on treks. Participants must disclose medical conditions before high-altitude trips.</p>',
  'Terms & Conditions | Dream Go India',
  'Terms and conditions for booking trips with Dream Go India.',
  true
);


-- =============================================================================
-- Website catalog (homepage trips / highlights / media) + admin confirm
-- =============================================================================

INSERT INTO public.destinations (id, name, slug, state, country, image_url, is_featured, is_visible, sort_order) VALUES
  ('b2000001-0000-4000-8000-000000000001', 'Dehradun', 'dehradun', 'Uttarakhand', 'India', 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80', true, true, 0),
  ('b2000001-0000-4000-8000-000000000002', 'Har Ki Dun', 'har-ki-dun', 'Uttarakhand', 'India', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', true, true, 1),
  ('b2000001-0000-4000-8000-000000000003', 'Valley of Flowers', 'valley-of-flowers', 'Uttarakhand', 'India', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', true, true, 2),
  ('b2000001-0000-4000-8000-000000000004', 'Auli', 'auli', 'Uttarakhand', 'India', 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&q=80', true, true, 3),
  ('b2000001-0000-4000-8000-000000000005', 'Nainital', 'nainital', 'Uttarakhand', 'India', 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80', true, true, 4),
  ('b2000001-0000-4000-8000-000000000006', 'Ladakh', 'ladakh', 'Ladakh', 'India', 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&q=80', true, true, 5),
  ('b2000001-0000-4000-8000-000000000007', 'Kedarnath', 'kedarnath', 'Uttarakhand', 'India', 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80', true, true, 6)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, image_url = EXCLUDED.image_url, is_featured = true, is_visible = true;

INSERT INTO public.trip_categories (id, name, slug, icon, description, season, sort_order, is_visible) VALUES
  ('c3000001-0000-4000-8000-000000000001', 'Winter', 'winter', 'snowflake', 'Snow treks', 'winter', 0, true),
  ('c3000001-0000-4000-8000-000000000002', 'Summer', 'summer', 'sun', 'Summer treks', 'summer', 1, true),
  ('c3000001-0000-4000-8000-000000000008', 'Dham Yatra', 'dham', 'temple', 'Pilgrimage', 'summer', 7, true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, is_visible = true;

INSERT INTO public.trips (
  id, title, slug, destination_id, category_id, description, overview, location,
  duration_days, duration_nights, price, discount_price, difficulty, max_seats, seats_left,
  rating, review_count, season, trip_type, highlights, altitude,
  is_featured, is_popular, is_trending, is_visible
) VALUES
('d4000001-0000-4000-8000-000000000101', 'Kedarkantha Trek', 'kedarkantha-trek', 'b2000001-0000-4000-8000-000000000002', 'c3000001-0000-4000-8000-000000000001', 'Kedarkantha Trek', 'Famous winter summit trek with snow-covered trails', 'Uttarkashi, Uttarakhand', 6, 5, 9499, 8499, 'moderate', 20, 10, 4.9, 312, 'winter', 'trek', ARRAY['Snow summit','Pine forests'], '3810m', true, true, true, true),
('d4000001-0000-4000-8000-000000000102', 'Kuari Pass Trek', 'kuari-pass-trek', 'b2000001-0000-4000-8000-000000000004', 'c3000001-0000-4000-8000-000000000001', 'Kuari Pass', 'Winter trek with Nanda Devi views', 'Chamoli, Uttarakhand', 6, 5, 9999, NULL, 'moderate', 20, 10, 4.8, 186, 'winter', 'trek', ARRAY['Nanda Devi views'], '3650m', true, true, false, true),
('d4000001-0000-4000-8000-000000000103', 'Chopta Tungnath Trek', 'chopta-tungnath-trek', 'b2000001-0000-4000-8000-000000000004', 'c3000001-0000-4000-8000-000000000001', 'Chopta Tungnath', 'Short winter trek to Tungnath temple', 'Rudraprayag, Uttarakhand', 4, 3, 6999, NULL, 'easy', 20, 10, 4.8, 245, 'winter', 'trek', ARRAY['Tungnath Temple'], '3680m', true, false, true, true),
('d4000001-0000-4000-8000-000000000104', 'Chari Top Trek', 'chari-top-trek', 'b2000001-0000-4000-8000-000000000002', 'c3000001-0000-4000-8000-000000000001', 'Chari Top', 'Offbeat winter trail', 'Uttarkashi, Uttarakhand', 5, 4, 7999, NULL, 'moderate', 20, 10, 4.7, 98, 'winter', 'trek', ARRAY['Offbeat trail'], '3400m', true, false, false, true),
('d4000001-0000-4000-8000-000000000201', 'Har Ki Dun Trek', 'har-ki-dun-trek', 'b2000001-0000-4000-8000-000000000002', 'c3000001-0000-4000-8000-000000000002', 'Har Ki Dun', 'Valley of Gods summer trek', 'Uttarkashi, Uttarakhand', 5, 4, 8999, 7999, 'moderate', 20, 10, 4.8, 124, 'summer', 'trek', ARRAY['Valley of Gods'], '3566m', true, true, true, true),
('d4000001-0000-4000-8000-000000000202', 'Bali Pass Trek', 'bali-pass-trek', 'b2000001-0000-4000-8000-000000000002', 'c3000001-0000-4000-8000-000000000002', 'Bali Pass', 'Challenging high-pass trek', 'Uttarkashi, Uttarakhand', 8, 7, 14999, NULL, 'difficult', 20, 10, 4.9, 76, 'summer', 'trek', ARRAY['High pass'], '4950m', true, false, true, true),
('d4000001-0000-4000-8000-000000000203', 'Ruinsara Tal Trek', 'ruinsara-tal-trek', 'b2000001-0000-4000-8000-000000000002', 'c3000001-0000-4000-8000-000000000002', 'Ruinsara Tal', 'Alpine lake trek', 'Uttarkashi, Uttarakhand', 7, 6, 11999, NULL, 'moderate', 20, 10, 4.8, 64, 'summer', 'trek', ARRAY['Alpine lake'], '3600m', true, false, false, true),
('d4000001-0000-4000-8000-000000000204', 'Phulara Ridge Trek', 'phulara-ridge-trek', 'b2000001-0000-4000-8000-000000000002', 'c3000001-0000-4000-8000-000000000002', 'Phulara Ridge', 'Scenic ridge walk', 'Uttarkashi, Uttarakhand', 6, 5, 10499, NULL, 'moderate', 20, 10, 4.7, 52, 'summer', 'trek', ARRAY['Ridge walk'], '3700m', true, false, false, true),
('d4000001-0000-4000-8000-000000000205', 'Hampta Pass Trek', 'hampta-pass-trek', 'b2000001-0000-4000-8000-000000000006', 'c3000001-0000-4000-8000-000000000002', 'Hampta Pass', 'Crossover trek to Lahaul', 'Kullu, Himachal Pradesh', 5, 4, 8999, NULL, 'moderate', 20, 10, 4.8, 198, 'summer', 'trek', ARRAY['Crossover trek'], '4270m', true, true, false, true),
('d4000001-0000-4000-8000-000000000206', 'Valley of Flowers Trek', 'valley-of-flowers-trek', 'b2000001-0000-4000-8000-000000000003', 'c3000001-0000-4000-8000-000000000002', 'Valley of Flowers', 'UNESCO valley trek', 'Chamoli, Uttarakhand', 6, 5, 10999, NULL, 'moderate', 20, 10, 4.9, 89, 'summer', 'trek', ARRAY['UNESCO site'], '3658m', true, true, false, true),
('d4000001-0000-4000-8000-000000000207', 'Sar Pass Trek', 'sar-pass-trek', 'b2000001-0000-4000-8000-000000000006', 'c3000001-0000-4000-8000-000000000002', 'Sar Pass', 'Parvati Valley classic', 'Kasol, Himachal Pradesh', 5, 4, 8499, NULL, 'moderate', 20, 10, 4.7, 143, 'summer', 'trek', ARRAY['Parvati Valley'], '4200m', true, false, true, true),
('d4000001-0000-4000-8000-000000000301', 'Char Dham Yatra', 'char-dham-yatra', 'b2000001-0000-4000-8000-000000000007', 'c3000001-0000-4000-8000-000000000008', 'Char Dham', 'Complete Char Dham pilgrimage', 'Uttarakhand', 12, 11, 24999, NULL, 'easy', 30, 15, 4.9, 420, 'summer', 'dham', ARRAY['Yamunotri','Gangotri','Kedarnath','Badrinath'], '3583m', true, true, true, true),
('d4000001-0000-4000-8000-000000000302', 'Do Dham Yatra', 'do-dham-yatra', 'b2000001-0000-4000-8000-000000000007', 'c3000001-0000-4000-8000-000000000008', 'Do Dham', 'Kedarnath & Badrinath', 'Uttarakhand', 7, 6, 14999, NULL, 'easy', 30, 15, 4.8, 267, 'summer', 'dham', ARRAY['Kedarnath','Badrinath'], '3583m', true, true, false, true),
('d4000001-0000-4000-8000-000000000303', 'Kedarnath Yatra', 'kedarnath-yatra', 'b2000001-0000-4000-8000-000000000007', 'c3000001-0000-4000-8000-000000000008', 'Kedarnath Yatra', 'Kedarnath temple pilgrimage', 'Rudraprayag, Uttarakhand', 3, 2, 5999, NULL, 'moderate', 30, 15, 4.9, 201, 'summer', 'dham', ARRAY['Kedarnath Temple'], '3583m', true, true, false, true)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  discount_price = EXCLUDED.discount_price,
  trip_type = EXCLUDED.trip_type,
  is_visible = true,
  is_featured = EXCLUDED.is_featured,
  overview = EXCLUDED.overview,
  location = EXCLUDED.location;

INSERT INTO public.trip_images (id, trip_id, image_url, alt_text, sort_order, is_cover) VALUES
  ('e5000001-0000-4000-8000-000000000101', 'd4000001-0000-4000-8000-000000000101', 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&q=80', 'Kedarkantha', 0, true),
  ('e5000001-0000-4000-8000-000000000102', 'd4000001-0000-4000-8000-000000000102', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', 'Kuari Pass', 0, true),
  ('e5000001-0000-4000-8000-000000000103', 'd4000001-0000-4000-8000-000000000103', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', 'Chopta', 0, true),
  ('e5000001-0000-4000-8000-000000000104', 'd4000001-0000-4000-8000-000000000104', 'https://images.unsplash.com/photo-1478131143088-5e7e85b1958b?w=800&q=80', 'Chari Top', 0, true),
  ('e5000001-0000-4000-8000-000000000201', 'd4000001-0000-4000-8000-000000000201', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', 'Har Ki Dun', 0, true),
  ('e5000001-0000-4000-8000-000000000202', 'd4000001-0000-4000-8000-000000000202', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', 'Bali Pass', 0, true),
  ('e5000001-0000-4000-8000-000000000205', 'd4000001-0000-4000-8000-000000000205', 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&q=80', 'Hampta Pass', 0, true),
  ('e5000001-0000-4000-8000-000000000206', 'd4000001-0000-4000-8000-000000000206', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', 'Valley of Flowers', 0, true),
  ('e5000001-0000-4000-8000-000000000207', 'd4000001-0000-4000-8000-000000000207', 'https://images.unsplash.com/photo-1478131143088-5e7e85b1958b?w=800&q=80', 'Sar Pass', 0, true),
  ('e5000001-0000-4000-8000-000000000301', 'd4000001-0000-4000-8000-000000000301', 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80', 'Char Dham', 0, true),
  ('e5000001-0000-4000-8000-000000000302', 'd4000001-0000-4000-8000-000000000302', 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80', 'Do Dham', 0, true),
  ('e5000001-0000-4000-8000-000000000303', 'd4000001-0000-4000-8000-000000000303', 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80', 'Kedarnath', 0, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.highlights (id, title, cover, stories, sort_order, is_visible) VALUES
(
  'f6000001-0000-4000-8000-000000000001', 'Dehradun',
  'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=80',
  '[{"id":"1","image":"https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80","caption":"Dehradun gateway"},{"id":"2","image":"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80","caption":"Hills around Dehradun"}]'::jsonb,
  0, true
),
(
  'f6000001-0000-4000-8000-000000000002', 'Har Ki Dun',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
  '[{"id":"1","image":"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80","caption":"Valley of Gods"},{"id":"2","image":"https://images.unsplash.com/photo-1478131143088-5e7e85b1958b?w=800&q=80","caption":"Camp life"}]'::jsonb,
  1, true
),
(
  'f6000001-0000-4000-8000-000000000003', 'Valley of Flowers',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80',
  '[{"id":"1","image":"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80","caption":"Blooming meadows"}]'::jsonb,
  2, true
),
(
  'f6000001-0000-4000-8000-000000000004', 'Kedarkantha',
  'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=400&q=80',
  '[{"id":"1","image":"https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&q=80","caption":"Snow summit"}]'::jsonb,
  3, true
),
(
  'f6000001-0000-4000-8000-000000000005', 'Char Dham',
  'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&q=80',
  '[{"id":"1","image":"https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80","caption":"Kedarnath temple"}]'::jsonb,
  4, true
)
ON CONFLICT (id) DO UPDATE SET cover = EXCLUDED.cover, stories = EXCLUDED.stories, is_visible = true;

INSERT INTO public.media_library (file_name, file_url, file_type, file_size, bucket, alt_text)
SELECT u.file_name, u.url, 'image/jpeg', 0, u.bucket, u.alt
FROM (VALUES
  ('hero-mountain.jpg', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80', 'hero-images', 'Hero mountain'),
  ('kedarkantha.jpg', 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&q=80', 'trip-images', 'Kedarkantha'),
  ('valley-of-flowers.jpg', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', 'trip-images', 'Valley of Flowers'),
  ('kedarnath.jpg', 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80', 'trip-images', 'Kedarnath'),
  ('ladakh.jpg', 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&q=80', 'destination-images', 'Ladakh'),
  ('camping.jpg', 'https://images.unsplash.com/photo-1478131143088-5e7e85b1958b?w=800&q=80', 'gallery-images', 'Camping'),
  ('rafting.jpg', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80', 'gallery-images', 'Rafting'),
  ('dehradun.jpg', 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80', 'destination-images', 'Dehradun')
) AS u(file_name, url, bucket, alt)
WHERE NOT EXISTS (SELECT 1 FROM public.media_library m WHERE m.file_url = u.url);

UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
WHERE email = 'dreamgoindia5@gmail.com';

INSERT INTO public.profiles (id, email, full_name, role, referral_code)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', 'Admin User'), 'admin',
       upper(substring(md5(random()::text) from 1 for 8))
FROM auth.users
WHERE email = 'dreamgoindia5@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin', email = EXCLUDED.email;

UPDATE public.profiles SET role = 'admin' WHERE email = 'dreamgoindia5@gmail.com';
