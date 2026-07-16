-- ============================================================================
-- Profiles + Trips core schema + Dream Go India seed trips
-- Safe to re-run (IF NOT EXISTS / ON CONFLICT)
-- Project: erhlxhvpefhchrjuvzxa
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'customer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE difficulty_level AS ENUM ('easy', 'moderate', 'difficult', 'extreme');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE season_type AS ENUM ('winter', 'summer', 'monsoon', 'all');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE trip_type AS ENUM ('trek', 'dham');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url',
    upper(substring(md5(random()::text) from 1 for 8))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  interests TEXT[] NOT NULL DEFAULT '{}',
  referral_code TEXT UNIQUE,
  language TEXT NOT NULL DEFAULT 'en',
  dark_mode BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Destinations
CREATE TABLE IF NOT EXISTS public.destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  state TEXT,
  country TEXT NOT NULL DEFAULT 'India',
  description TEXT,
  short_description TEXT,
  image_url TEXT,
  cover_image_url TEXT,
  gallery TEXT[] NOT NULL DEFAULT '{}',
  map_lat DOUBLE PRECISION,
  map_lng DOUBLE PRECISION,
  best_season TEXT,
  altitude TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trip categories
CREATE TABLE IF NOT EXISTS public.trip_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  season season_type NOT NULL DEFAULT 'all',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trips
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.trip_categories(id) ON DELETE SET NULL,
  description TEXT,
  overview TEXT,
  location TEXT,
  duration_days INTEGER NOT NULL DEFAULT 1,
  duration_nights INTEGER NOT NULL DEFAULT 0,
  price NUMERIC(12, 2) NOT NULL,
  discount_price NUMERIC(12, 2),
  difficulty difficulty_level NOT NULL DEFAULT 'moderate',
  max_seats INTEGER NOT NULL DEFAULT 20,
  seats_left INTEGER NOT NULL DEFAULT 20,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  season season_type NOT NULL DEFAULT 'all',
  trip_type trip_type NOT NULL DEFAULT 'trek',
  highlights TEXT[] NOT NULL DEFAULT '{}',
  itinerary JSONB NOT NULL DEFAULT '[]',
  inclusions TEXT[] NOT NULL DEFAULT '{}',
  exclusions TEXT[] NOT NULL DEFAULT '{}',
  faqs JSONB NOT NULL DEFAULT '[]',
  map_lat DOUBLE PRECISION,
  map_lng DOUBLE PRECISION,
  altitude TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_trending BOOLEAN NOT NULL DEFAULT false,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add trip_type if table already existed without it
DO $$ BEGIN
  ALTER TABLE public.trips ADD COLUMN trip_type trip_type NOT NULL DEFAULT 'trek';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.trip_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_trips_slug ON public.trips(slug);
CREATE INDEX IF NOT EXISTS idx_trips_season ON public.trips(season);
CREATE INDEX IF NOT EXISTS idx_trips_trip_type ON public.trips(trip_type);
CREATE INDEX IF NOT EXISTS idx_trips_visible ON public.trips(is_visible);

DROP TRIGGER IF EXISTS set_trips_updated_at ON public.trips;
CREATE TRIGGER set_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read profiles" ON public.profiles;
CREATE POLICY "Public can read profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
CREATE POLICY "Admins have full access to profiles" ON public.profiles FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can read destinations" ON public.destinations;
CREATE POLICY "Public can read destinations" ON public.destinations FOR SELECT
  USING (is_visible = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage destinations" ON public.destinations;
CREATE POLICY "Admins manage destinations" ON public.destinations FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can read categories" ON public.trip_categories;
CREATE POLICY "Public can read categories" ON public.trip_categories FOR SELECT
  USING (is_visible = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage categories" ON public.trip_categories;
CREATE POLICY "Admins manage categories" ON public.trip_categories FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can read visible trips" ON public.trips;
CREATE POLICY "Public can read visible trips" ON public.trips FOR SELECT
  USING (is_visible = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage trips" ON public.trips;
CREATE POLICY "Admins manage trips" ON public.trips FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can read trip images" ON public.trip_images;
CREATE POLICY "Public can read trip images" ON public.trip_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = trip_id AND (t.is_visible = true OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Admins manage trip images" ON public.trip_images;
CREATE POLICY "Admins manage trip images" ON public.trip_images FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================================
-- SEED: destinations
-- ============================================================================

INSERT INTO public.destinations (id, name, slug, state, country, image_url, is_featured, is_visible, sort_order) VALUES
  ('b2000001-0000-4000-8000-000000000001', 'Dehradun', 'dehradun', 'Uttarakhand', 'India', 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80', true, true, 0),
  ('b2000001-0000-4000-8000-000000000002', 'Har Ki Dun', 'har-ki-dun', 'Uttarakhand', 'India', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', true, true, 1),
  ('b2000001-0000-4000-8000-000000000003', 'Valley of Flowers', 'valley-of-flowers', 'Uttarakhand', 'India', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', true, true, 2),
  ('b2000001-0000-4000-8000-000000000004', 'Auli', 'auli', 'Uttarakhand', 'India', 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&q=80', true, true, 3),
  ('b2000001-0000-4000-8000-000000000005', 'Nainital', 'nainital', 'Uttarakhand', 'India', 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80', true, true, 4),
  ('b2000001-0000-4000-8000-000000000006', 'Ladakh', 'ladakh', 'Ladakh', 'India', 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&q=80', true, true, 5),
  ('b2000001-0000-4000-8000-000000000007', 'Kedarnath', 'kedarnath', 'Uttarakhand', 'India', 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80', true, true, 6)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SEED: categories
-- ============================================================================

INSERT INTO public.trip_categories (id, name, slug, icon, description, season, sort_order, is_visible) VALUES
  ('c3000001-0000-4000-8000-000000000001', 'Winter', 'winter', 'snowflake', 'Snow treks Dec–Mar', 'winter', 0, true),
  ('c3000001-0000-4000-8000-000000000002', 'Summer', 'summer', 'sun', 'Summer treks Apr–Oct', 'summer', 1, true),
  ('c3000001-0000-4000-8000-000000000003', 'Monsoon', 'monsoon', 'cloud-rain', 'Monsoon trails', 'monsoon', 2, true),
  ('c3000001-0000-4000-8000-000000000004', 'Family', 'family', 'users', 'Family packages', 'all', 3, true),
  ('c3000001-0000-4000-8000-000000000005', 'Adventure', 'adventure', 'mountain', 'Adventure trips', 'all', 4, true),
  ('c3000001-0000-4000-8000-000000000006', 'Weekend', 'weekend', 'calendar', 'Weekend getaways', 'all', 5, true),
  ('c3000001-0000-4000-8000-000000000007', 'International', 'international', 'globe', 'International tours', 'all', 6, true),
  ('c3000001-0000-4000-8000-000000000008', 'Dham Yatra', 'dham', 'temple', 'Pilgrimage packages', 'summer', 7, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SEED: trips (winter + summer + dham)
-- ============================================================================

INSERT INTO public.trips (
  id, title, slug, destination_id, category_id, description, overview, location,
  duration_days, duration_nights, price, discount_price, difficulty, max_seats, seats_left,
  rating, review_count, season, trip_type, highlights, altitude,
  is_featured, is_popular, is_trending, is_visible
) VALUES
-- Winter
('d4000001-0000-4000-8000-000000000101', 'Kedarkantha Trek', 'kedarkantha-trek',
  'b2000001-0000-4000-8000-000000000002', 'c3000001-0000-4000-8000-000000000001',
  'Explore Kedarkantha Trek with Dream Go India.', 'A curated trek experience in the Himalayas.',
  'Uttarkashi, Uttarakhand', 6, 5, 9499, 8499, 'moderate', 20, 10, 4.9, 312, 'winter', 'trek',
  ARRAY['Snow summit', 'Pine forests', '360° Himalayan views'], '3810m', true, true, true, true),

('d4000001-0000-4000-8000-000000000102', 'Kuari Pass Trek', 'kuari-pass-trek',
  'b2000001-0000-4000-8000-000000000004', 'c3000001-0000-4000-8000-000000000001',
  'Explore Kuari Pass Trek with Dream Go India.', 'A curated trek experience in the Himalayas.',
  'Chamoli, Uttarakhand', 6, 5, 9999, NULL, 'moderate', 20, 10, 4.8, 186, 'winter', 'trek',
  ARRAY['Nanda Devi views', 'Oak forests', 'Curzon Trail'], '3650m', true, true, false, true),

('d4000001-0000-4000-8000-000000000103', 'Chopta Tungnath Trek', 'chopta-tungnath-trek',
  'b2000001-0000-4000-8000-000000000004', 'c3000001-0000-4000-8000-000000000001',
  'Explore Chopta Tungnath Trek with Dream Go India.', 'A curated trek experience in the Himalayas.',
  'Rudraprayag, Uttarakhand', 4, 3, 6999, NULL, 'easy', 20, 10, 4.8, 245, 'winter', 'trek',
  ARRAY['Tungnath Temple', 'Chandrashila summit', 'Rhododendron trails'], '3680m', true, false, true, true),

('d4000001-0000-4000-8000-000000000104', 'Chari Top Trek', 'chari-top-trek',
  'b2000001-0000-4000-8000-000000000002', 'c3000001-0000-4000-8000-000000000001',
  'Explore Chari Top Trek with Dream Go India.', 'A curated trek experience in the Himalayas.',
  'Uttarkashi, Uttarakhand', 5, 4, 7999, NULL, 'moderate', 20, 10, 4.7, 98, 'winter', 'trek',
  ARRAY['Offbeat trail', 'Snow meadows', 'Remote villages'], '3400m', true, false, false, true),

-- Summer
('d4000001-0000-4000-8000-000000000201', 'Har Ki Dun Trek', 'har-ki-dun-trek',
  'b2000001-0000-4000-8000-000000000002', 'c3000001-0000-4000-8000-000000000002',
  'Explore Har Ki Dun Trek with Dream Go India.', 'A curated trek experience in the Himalayas.',
  'Uttarkashi, Uttarakhand', 5, 4, 8999, 7999, 'moderate', 20, 10, 4.8, 124, 'summer', 'trek',
  ARRAY['Valley of Gods', 'Ancient villages', 'Alpine meadows'], '3566m', true, true, true, true),

('d4000001-0000-4000-8000-000000000202', 'Bali Pass Trek', 'bali-pass-trek',
  'b2000001-0000-4000-8000-000000000002', 'c3000001-0000-4000-8000-000000000002',
  'Explore Bali Pass Trek with Dream Go India.', 'A curated trek experience in the Himalayas.',
  'Uttarkashi, Uttarakhand', 8, 7, 14999, NULL, 'difficult', 20, 10, 4.9, 76, 'summer', 'trek',
  ARRAY['High pass crossing', 'Ruinsara Lake', 'Dramatic landscapes'], '4950m', true, false, true, true),

('d4000001-0000-4000-8000-000000000203', 'Ruinsara Tal Trek', 'ruinsara-tal-trek',
  'b2000001-0000-4000-8000-000000000002', 'c3000001-0000-4000-8000-000000000002',
  'Explore Ruinsara Tal Trek with Dream Go India.', 'A curated trek experience in the Himalayas.',
  'Uttarkashi, Uttarakhand', 7, 6, 11999, NULL, 'moderate', 20, 10, 4.8, 64, 'summer', 'trek',
  ARRAY['Alpine lake', 'Har Ki Dun valley', 'Less crowded route'], '3600m', true, false, false, true),

('d4000001-0000-4000-8000-000000000204', 'Phulara Ridge Trek', 'phulara-ridge-trek',
  'b2000001-0000-4000-8000-000000000002', 'c3000001-0000-4000-8000-000000000002',
  'Explore Phulara Ridge Trek with Dream Go India.', 'A curated trek experience in the Himalayas.',
  'Uttarkashi, Uttarakhand', 6, 5, 10499, NULL, 'moderate', 20, 10, 4.7, 52, 'summer', 'trek',
  ARRAY['Ridge walk', 'Panoramic views', 'Offbeat trail'], '3700m', true, false, false, true),

('d4000001-0000-4000-8000-000000000205', 'Hampta Pass Trek', 'hampta-pass-trek',
  'b2000001-0000-4000-8000-000000000006', 'c3000001-0000-4000-8000-000000000002',
  'Explore Hampta Pass Trek with Dream Go India.', 'A curated trek experience in the Himalayas.',
  'Kullu, Himachal Pradesh', 5, 4, 8999, NULL, 'moderate', 20, 10, 4.8, 198, 'summer', 'trek',
  ARRAY['Crossover trek', 'Chandratal Lake', 'Lahaul valley'], '4270m', true, true, false, true),

('d4000001-0000-4000-8000-000000000206', 'Valley of Flowers Trek', 'valley-of-flowers-trek',
  'b2000001-0000-4000-8000-000000000003', 'c3000001-0000-4000-8000-000000000002',
  'Explore Valley of Flowers Trek with Dream Go India.', 'A curated trek experience in the Himalayas.',
  'Chamoli, Uttarakhand', 6, 5, 10999, NULL, 'moderate', 20, 10, 4.9, 89, 'summer', 'trek',
  ARRAY['UNESCO site', 'Hemkund Sahib', 'Rare wildflowers'], '3658m', true, true, false, true),

('d4000001-0000-4000-8000-000000000207', 'Sar Pass Trek', 'sar-pass-trek',
  'b2000001-0000-4000-8000-000000000006', 'c3000001-0000-4000-8000-000000000002',
  'Explore Sar Pass Trek with Dream Go India.', 'A curated trek experience in the Himalayas.',
  'Kasol, Himachal Pradesh', 5, 4, 8499, NULL, 'moderate', 20, 10, 4.7, 143, 'summer', 'trek',
  ARRAY['Parvati Valley', 'Snow slides', 'Perfect for beginners'], '4200m', true, false, true, true),

-- Dham
('d4000001-0000-4000-8000-000000000301', 'Char Dham Yatra', 'char-dham-yatra',
  'b2000001-0000-4000-8000-000000000007', 'c3000001-0000-4000-8000-000000000008',
  'Complete Char Dham pilgrimage with Dream Go India.',
  'Complete Char Dham pilgrimage covering all four sacred shrines with guided assistance.',
  'Uttarakhand', 12, 11, 24999, NULL, 'easy', 30, 15, 4.9, 420, 'summer', 'dham',
  ARRAY['Yamunotri', 'Gangotri', 'Kedarnath', 'Badrinath'], '3583m', true, true, true, true),

('d4000001-0000-4000-8000-000000000302', 'Do Dham Yatra', 'do-dham-yatra',
  'b2000001-0000-4000-8000-000000000007', 'c3000001-0000-4000-8000-000000000008',
  'Sacred Do Dham yatra with Dream Go India.',
  'Sacred Do Dham yatra to Kedarnath and Badrinath with seamless logistics.',
  'Uttarakhand', 7, 6, 14999, NULL, 'easy', 30, 15, 4.8, 267, 'summer', 'dham',
  ARRAY['Kedarnath', 'Badrinath', 'Comfortable stays', 'VIP darshan support'], '3583m', true, true, false, true),

('d4000001-0000-4000-8000-000000000303', 'Kedarnath Yatra', 'kedarnath-yatra',
  'b2000001-0000-4000-8000-000000000007', 'c3000001-0000-4000-8000-000000000008',
  'Spiritual journey to Kedarnath Temple.',
  'Spiritual journey to Kedarnath — one of the holiest Shiva temples in the Himalayas.',
  'Rudraprayag, Uttarakhand', 3, 2, 5999, NULL, 'moderate', 30, 15, 4.9, 201, 'summer', 'dham',
  ARRAY['Kedarnath Temple', 'Mandakini River', 'Helicopter option'], '3583m', true, true, false, true)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  discount_price = EXCLUDED.discount_price,
  trip_type = EXCLUDED.trip_type,
  season = EXCLUDED.season,
  is_featured = EXCLUDED.is_featured,
  is_visible = true;

-- Cover images
INSERT INTO public.trip_images (id, trip_id, image_url, alt_text, sort_order, is_cover) VALUES
  ('e5000001-0000-4000-8000-000000000101', 'd4000001-0000-4000-8000-000000000101', 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&q=80', 'Kedarkantha Trek', 0, true),
  ('e5000001-0000-4000-8000-000000000102', 'd4000001-0000-4000-8000-000000000102', 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&q=80', 'Kuari Pass Trek', 0, true),
  ('e5000001-0000-4000-8000-000000000103', 'd4000001-0000-4000-8000-000000000103', 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&q=80', 'Chopta Tungnath Trek', 0, true),
  ('e5000001-0000-4000-8000-000000000104', 'd4000001-0000-4000-8000-000000000104', 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&q=80', 'Chari Top Trek', 0, true),
  ('e5000001-0000-4000-8000-000000000201', 'd4000001-0000-4000-8000-000000000201', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', 'Har Ki Dun Trek', 0, true),
  ('e5000001-0000-4000-8000-000000000202', 'd4000001-0000-4000-8000-000000000202', 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&q=80', 'Bali Pass Trek', 0, true),
  ('e5000001-0000-4000-8000-000000000203', 'd4000001-0000-4000-8000-000000000203', 'https://images.unsplash.com/photo-1478131143088-5e7e85b1958b?w=800&q=80', 'Ruinsara Tal Trek', 0, true),
  ('e5000001-0000-4000-8000-000000000204', 'd4000001-0000-4000-8000-000000000204', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', 'Phulara Ridge Trek', 0, true),
  ('e5000001-0000-4000-8000-000000000205', 'd4000001-0000-4000-8000-000000000205', 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&q=80', 'Hampta Pass Trek', 0, true),
  ('e5000001-0000-4000-8000-000000000206', 'd4000001-0000-4000-8000-000000000206', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', 'Valley of Flowers Trek', 0, true),
  ('e5000001-0000-4000-8000-000000000207', 'd4000001-0000-4000-8000-000000000207', 'https://images.unsplash.com/photo-1478131143088-5e7e85b1958b?w=800&q=80', 'Sar Pass Trek', 0, true),
  ('e5000001-0000-4000-8000-000000000301', 'd4000001-0000-4000-8000-000000000301', 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80', 'Char Dham Yatra', 0, true),
  ('e5000001-0000-4000-8000-000000000302', 'd4000001-0000-4000-8000-000000000302', 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80', 'Do Dham Yatra', 0, true),
  ('e5000001-0000-4000-8000-000000000303', 'd4000001-0000-4000-8000-000000000303', 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80', 'Kedarnath Yatra', 0, true)
ON CONFLICT (id) DO NOTHING;

-- Promote first signed-up admin (run after you create a user in Auth)
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
