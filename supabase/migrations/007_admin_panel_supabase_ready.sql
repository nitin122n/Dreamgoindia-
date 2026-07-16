-- =============================================================================
-- Dream Go India — make Admin Panel work with Supabase
-- Run once in: https://supabase.com/dashboard/project/erhlxhvpefhchrjuvzxa/sql/new
-- =============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT INSERT, UPDATE, DELETE ON TABLES TO authenticated;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, referral_code, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    upper(substring(md5(random()::text) from 1 for 8)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure profiles / trips RLS readable
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.trip_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.trip_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.newsletter ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contact_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.highlights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read profiles" ON public.profiles;
CREATE POLICY "Public can read profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
CREATE POLICY "Admins have full access to profiles" ON public.profiles FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can read visible trips" ON public.trips;
CREATE POLICY "Public can read visible trips" ON public.trips FOR SELECT
  USING (is_visible = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage trips" ON public.trips;
CREATE POLICY "Admins manage trips" ON public.trips FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can read trip images" ON public.trip_images;
CREATE POLICY "Public can read trip images" ON public.trip_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage trip images" ON public.trip_images;
CREATE POLICY "Admins manage trip images" ON public.trip_images FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can read destinations" ON public.destinations;
CREATE POLICY "Public can read destinations" ON public.destinations FOR SELECT
  USING (COALESCE(is_visible, true) = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage destinations" ON public.destinations;
CREATE POLICY "Admins manage destinations" ON public.destinations FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can read categories" ON public.trip_categories;
CREATE POLICY "Public can read categories" ON public.trip_categories FOR SELECT
  USING (COALESCE(is_visible, true) = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage categories" ON public.trip_categories;
CREATE POLICY "Admins manage categories" ON public.trip_categories FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- trip_type for trek/dham filtering
DO $$ BEGIN CREATE TYPE trip_type AS ENUM ('trek', 'dham');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN ALTER TABLE public.trips ADD COLUMN trip_type trip_type NOT NULL DEFAULT 'trek';
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Seed destinations
INSERT INTO public.destinations (id, name, slug, state, country, image_url, is_featured, is_visible, sort_order) VALUES
  ('b2000001-0000-4000-8000-000000000001', 'Dehradun', 'dehradun', 'Uttarakhand', 'India', 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80', true, true, 0),
  ('b2000001-0000-4000-8000-000000000002', 'Har Ki Dun', 'har-ki-dun', 'Uttarakhand', 'India', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', true, true, 1),
  ('b2000001-0000-4000-8000-000000000003', 'Valley of Flowers', 'valley-of-flowers', 'Uttarakhand', 'India', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', true, true, 2),
  ('b2000001-0000-4000-8000-000000000004', 'Auli', 'auli', 'Uttarakhand', 'India', 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&q=80', true, true, 3),
  ('b2000001-0000-4000-8000-000000000005', 'Nainital', 'nainital', 'Uttarakhand', 'India', 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80', true, true, 4),
  ('b2000001-0000-4000-8000-000000000006', 'Ladakh', 'ladakh', 'Ladakh', 'India', 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&q=80', true, true, 5),
  ('b2000001-0000-4000-8000-000000000007', 'Kedarnath', 'kedarnath', 'Uttarakhand', 'India', 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80', true, true, 6)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.trip_categories (id, name, slug, icon, description, season, sort_order, is_visible) VALUES
  ('c3000001-0000-4000-8000-000000000001', 'Winter', 'winter', 'snowflake', 'Snow treks', 'winter', 0, true),
  ('c3000001-0000-4000-8000-000000000002', 'Summer', 'summer', 'sun', 'Summer treks', 'summer', 1, true),
  ('c3000001-0000-4000-8000-000000000008', 'Dham Yatra', 'dham', 'temple', 'Pilgrimage', 'summer', 7, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.trips (
  id, title, slug, destination_id, category_id, description, overview, location,
  duration_days, duration_nights, price, discount_price, difficulty, max_seats, seats_left,
  rating, review_count, season, trip_type, highlights, altitude,
  is_featured, is_popular, is_trending, is_visible
) VALUES
('d4000001-0000-4000-8000-000000000101', 'Kedarkantha Trek', 'kedarkantha-trek', 'b2000001-0000-4000-8000-000000000002', 'c3000001-0000-4000-8000-000000000001', 'Kedarkantha Trek', 'Winter trek', 'Uttarkashi, Uttarakhand', 6, 5, 9499, 8499, 'moderate', 20, 10, 4.9, 312, 'winter', 'trek', ARRAY['Snow summit','Pine forests'], '3810m', true, true, true, true),
('d4000001-0000-4000-8000-000000000102', 'Kuari Pass Trek', 'kuari-pass-trek', 'b2000001-0000-4000-8000-000000000004', 'c3000001-0000-4000-8000-000000000001', 'Kuari Pass', 'Winter trek', 'Chamoli, Uttarakhand', 6, 5, 9999, NULL, 'moderate', 20, 10, 4.8, 186, 'winter', 'trek', ARRAY['Nanda Devi views'], '3650m', true, true, false, true),
('d4000001-0000-4000-8000-000000000103', 'Chopta Tungnath Trek', 'chopta-tungnath-trek', 'b2000001-0000-4000-8000-000000000004', 'c3000001-0000-4000-8000-000000000001', 'Chopta Tungnath', 'Winter trek', 'Rudraprayag, Uttarakhand', 4, 3, 6999, NULL, 'easy', 20, 10, 4.8, 245, 'winter', 'trek', ARRAY['Tungnath Temple'], '3680m', true, false, true, true),
('d4000001-0000-4000-8000-000000000104', 'Chari Top Trek', 'chari-top-trek', 'b2000001-0000-4000-8000-000000000002', 'c3000001-0000-4000-8000-000000000001', 'Chari Top', 'Winter trek', 'Uttarkashi, Uttarakhand', 5, 4, 7999, NULL, 'moderate', 20, 10, 4.7, 98, 'winter', 'trek', ARRAY['Offbeat trail'], '3400m', true, false, false, true),
('d4000001-0000-4000-8000-000000000201', 'Har Ki Dun Trek', 'har-ki-dun-trek', 'b2000001-0000-4000-8000-000000000002', 'c3000001-0000-4000-8000-000000000002', 'Har Ki Dun', 'Summer trek', 'Uttarkashi, Uttarakhand', 5, 4, 8999, 7999, 'moderate', 20, 10, 4.8, 124, 'summer', 'trek', ARRAY['Valley of Gods'], '3566m', true, true, true, true),
('d4000001-0000-4000-8000-000000000202', 'Bali Pass Trek', 'bali-pass-trek', 'b2000001-0000-4000-8000-000000000002', 'c3000001-0000-4000-8000-000000000002', 'Bali Pass', 'Summer trek', 'Uttarkashi, Uttarakhand', 8, 7, 14999, NULL, 'difficult', 20, 10, 4.9, 76, 'summer', 'trek', ARRAY['High pass'], '4950m', true, false, true, true),
('d4000001-0000-4000-8000-000000000203', 'Ruinsara Tal Trek', 'ruinsara-tal-trek', 'b2000001-0000-4000-8000-000000000002', 'c3000001-0000-4000-8000-000000000002', 'Ruinsara Tal', 'Summer trek', 'Uttarkashi, Uttarakhand', 7, 6, 11999, NULL, 'moderate', 20, 10, 4.8, 64, 'summer', 'trek', ARRAY['Alpine lake'], '3600m', true, false, false, true),
('d4000001-0000-4000-8000-000000000204', 'Phulara Ridge Trek', 'phulara-ridge-trek', 'b2000001-0000-4000-8000-000000000002', 'c3000001-0000-4000-8000-000000000002', 'Phulara Ridge', 'Summer trek', 'Uttarkashi, Uttarakhand', 6, 5, 10499, NULL, 'moderate', 20, 10, 4.7, 52, 'summer', 'trek', ARRAY['Ridge walk'], '3700m', true, false, false, true),
('d4000001-0000-4000-8000-000000000205', 'Hampta Pass Trek', 'hampta-pass-trek', 'b2000001-0000-4000-8000-000000000006', 'c3000001-0000-4000-8000-000000000002', 'Hampta Pass', 'Summer trek', 'Kullu, Himachal Pradesh', 5, 4, 8999, NULL, 'moderate', 20, 10, 4.8, 198, 'summer', 'trek', ARRAY['Crossover trek'], '4270m', true, true, false, true),
('d4000001-0000-4000-8000-000000000206', 'Valley of Flowers Trek', 'valley-of-flowers-trek', 'b2000001-0000-4000-8000-000000000003', 'c3000001-0000-4000-8000-000000000002', 'Valley of Flowers', 'Summer trek', 'Chamoli, Uttarakhand', 6, 5, 10999, NULL, 'moderate', 20, 10, 4.9, 89, 'summer', 'trek', ARRAY['UNESCO site'], '3658m', true, true, false, true),
('d4000001-0000-4000-8000-000000000207', 'Sar Pass Trek', 'sar-pass-trek', 'b2000001-0000-4000-8000-000000000006', 'c3000001-0000-4000-8000-000000000002', 'Sar Pass', 'Summer trek', 'Kasol, Himachal Pradesh', 5, 4, 8499, NULL, 'moderate', 20, 10, 4.7, 143, 'summer', 'trek', ARRAY['Parvati Valley'], '4200m', true, false, true, true),
('d4000001-0000-4000-8000-000000000301', 'Char Dham Yatra', 'char-dham-yatra', 'b2000001-0000-4000-8000-000000000007', 'c3000001-0000-4000-8000-000000000008', 'Char Dham', 'Pilgrimage', 'Uttarakhand', 12, 11, 24999, NULL, 'easy', 30, 15, 4.9, 420, 'summer', 'dham', ARRAY['Yamunotri','Gangotri','Kedarnath','Badrinath'], '3583m', true, true, true, true),
('d4000001-0000-4000-8000-000000000302', 'Do Dham Yatra', 'do-dham-yatra', 'b2000001-0000-4000-8000-000000000007', 'c3000001-0000-4000-8000-000000000008', 'Do Dham', 'Pilgrimage', 'Uttarakhand', 7, 6, 14999, NULL, 'easy', 30, 15, 4.8, 267, 'summer', 'dham', ARRAY['Kedarnath','Badrinath'], '3583m', true, true, false, true),
('d4000001-0000-4000-8000-000000000303', 'Kedarnath Yatra', 'kedarnath-yatra', 'b2000001-0000-4000-8000-000000000007', 'c3000001-0000-4000-8000-000000000008', 'Kedarnath Yatra', 'Pilgrimage', 'Rudraprayag, Uttarakhand', 3, 2, 5999, NULL, 'moderate', 30, 15, 4.9, 201, 'summer', 'dham', ARRAY['Kedarnath Temple'], '3583m', true, true, false, true)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, price = EXCLUDED.price, trip_type = EXCLUDED.trip_type, is_visible = true;

INSERT INTO public.trip_images (id, trip_id, image_url, alt_text, sort_order, is_cover) VALUES
  ('e5000001-0000-4000-8000-000000000101', 'd4000001-0000-4000-8000-000000000101', 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&q=80', 'Kedarkantha', 0, true),
  ('e5000001-0000-4000-8000-000000000201', 'd4000001-0000-4000-8000-000000000201', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', 'Har Ki Dun', 0, true),
  ('e5000001-0000-4000-8000-000000000206', 'd4000001-0000-4000-8000-000000000206', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', 'Valley of Flowers', 0, true),
  ('e5000001-0000-4000-8000-000000000301', 'd4000001-0000-4000-8000-000000000301', 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80', 'Char Dham', 0, true),
  ('e5000001-0000-4000-8000-000000000303', 'd4000001-0000-4000-8000-000000000303', 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80', 'Kedarnath', 0, true)
ON CONFLICT (id) DO NOTHING;

-- Storage buckets for image uploads from admin
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

-- After creating your admin user in Authentication → Users, run:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
