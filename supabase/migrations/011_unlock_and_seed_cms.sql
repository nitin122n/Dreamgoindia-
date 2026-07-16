-- =============================================================================
-- UNLOCK CMS: grants + open write for app (anon key) + seed website catalog
-- Project: erhlxhvpefhchrjuvzxa
-- Paste into SQL Editor and Run once
-- =============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;

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

-- Open read policies (content must be visible to website + admin)
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'settings','hero_slides','destinations','trip_categories','trips','trip_images',
    'trip_departures','gallery','blogs','blog_categories','testimonials','faq',
    'why_choose_us','pages','coupons','highlights','media_library','profiles',
    'bookings','reviews','newsletter','contact_forms'
  ]
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      EXECUTE format('DROP POLICY IF EXISTS "dgi_public_read_%s" ON public.%I', t, t);
      EXECUTE format(
        'CREATE POLICY "dgi_public_read_%s" ON public.%I FOR SELECT TO anon, authenticated USING (true)',
        t, t
      );
      EXECUTE format('DROP POLICY IF EXISTS "dgi_public_write_%s" ON public.%I', t, t);
      EXECUTE format(
        'CREATE POLICY "dgi_public_write_%s" ON public.%I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)',
        t, t
      );
    EXCEPTION WHEN undefined_table THEN
      NULL;
    END;
  END LOOP;
END $$;

-- Storage
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
DROP POLICY IF EXISTS "Anon upload media" ON storage.objects;
CREATE POLICY "Anon upload media" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Anon update media" ON storage.objects;
CREATE POLICY "Anon update media" ON storage.objects FOR UPDATE TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Anon delete media" ON storage.objects;
CREATE POLICY "Anon delete media" ON storage.objects FOR DELETE TO anon, authenticated USING (true);

-- Settings
INSERT INTO public.settings (
  id, site_name, logo_url, favicon_url, primary_color,
  contact_email, contact_phone, whatsapp, address,
  social_links, footer_text, seo_default_title, seo_default_description
) VALUES (
  1, 'Dream Go India', NULL, NULL, '#E53935',
  'hello@dreamgoindia.com', '+91 98765 43210', '+91 98765 43210',
  'Dehradun, Uttarakhand, India',
  '{"instagram":"https://instagram.com/dreamgoindia","facebook":"https://facebook.com/dreamgoindia","youtube":"https://youtube.com/dreamgoindia"}'::jsonb,
  'Dream Go India — trusted travel & adventure company.',
  'Dream Go India - Travel, Trekking & Adventure Tours',
  'Book trekking tours, pilgrimage trips and adventure packages across India.'
) ON CONFLICT (id) DO UPDATE SET site_name = EXCLUDED.site_name, primary_color = EXCLUDED.primary_color;

-- Destinations
INSERT INTO public.destinations (id, name, slug, state, country, image_url, is_featured, is_visible, sort_order) VALUES
  ('b2000001-0000-4000-8000-000000000001', 'Dehradun', 'dehradun', 'Uttarakhand', 'India', 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80', true, true, 0),
  ('b2000001-0000-4000-8000-000000000002', 'Har Ki Dun', 'har-ki-dun', 'Uttarakhand', 'India', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', true, true, 1),
  ('b2000001-0000-4000-8000-000000000003', 'Valley of Flowers', 'valley-of-flowers', 'Uttarakhand', 'India', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', true, true, 2),
  ('b2000001-0000-4000-8000-000000000004', 'Auli', 'auli', 'Uttarakhand', 'India', 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&q=80', true, true, 3),
  ('b2000001-0000-4000-8000-000000000005', 'Nainital', 'nainital', 'Uttarakhand', 'India', 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80', true, true, 4),
  ('b2000001-0000-4000-8000-000000000006', 'Ladakh', 'ladakh', 'Ladakh', 'India', 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&q=80', true, true, 5),
  ('b2000001-0000-4000-8000-000000000007', 'Kedarnath', 'kedarnath', 'Uttarakhand', 'India', 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80', true, true, 6)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, image_url = EXCLUDED.image_url, is_visible = true, is_featured = true;

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
('d4000001-0000-4000-8000-000000000101', 'Kedarkantha Trek', 'kedarkantha-trek', 'b2000001-0000-4000-8000-000000000002', 'c3000001-0000-4000-8000-000000000001', 'Kedarkantha Trek', 'Famous winter summit trek', 'Uttarkashi, Uttarakhand', 6, 5, 9499, 8499, 'moderate', 20, 10, 4.9, 312, 'winter', 'trek', ARRAY['Snow summit'], '3810m', true, true, true, true),
('d4000001-0000-4000-8000-000000000102', 'Kuari Pass Trek', 'kuari-pass-trek', 'b2000001-0000-4000-8000-000000000004', 'c3000001-0000-4000-8000-000000000001', 'Kuari Pass', 'Winter trek', 'Chamoli, Uttarakhand', 6, 5, 9999, NULL, 'moderate', 20, 10, 4.8, 186, 'winter', 'trek', ARRAY['Nanda Devi'], '3650m', true, true, false, true),
('d4000001-0000-4000-8000-000000000103', 'Chopta Tungnath Trek', 'chopta-tungnath-trek', 'b2000001-0000-4000-8000-000000000004', 'c3000001-0000-4000-8000-000000000001', 'Chopta Tungnath', 'Short winter trek', 'Rudraprayag, Uttarakhand', 4, 3, 6999, NULL, 'easy', 20, 10, 4.8, 245, 'winter', 'trek', ARRAY['Tungnath'], '3680m', true, false, true, true),
('d4000001-0000-4000-8000-000000000104', 'Chari Top Trek', 'chari-top-trek', 'b2000001-0000-4000-8000-000000000002', 'c3000001-0000-4000-8000-000000000001', 'Chari Top', 'Offbeat winter trail', 'Uttarkashi, Uttarakhand', 5, 4, 7999, NULL, 'moderate', 20, 10, 4.7, 98, 'winter', 'trek', ARRAY['Offbeat'], '3400m', true, false, false, true),
('d4000001-0000-4000-8000-000000000201', 'Har Ki Dun Trek', 'har-ki-dun-trek', 'b2000001-0000-4000-8000-000000000002', 'c3000001-0000-4000-8000-000000000002', 'Har Ki Dun', 'Valley of Gods', 'Uttarkashi, Uttarakhand', 5, 4, 8999, 7999, 'moderate', 20, 10, 4.8, 124, 'summer', 'trek', ARRAY['Valley of Gods'], '3566m', true, true, true, true),
('d4000001-0000-4000-8000-000000000202', 'Bali Pass Trek', 'bali-pass-trek', 'b2000001-0000-4000-8000-000000000002', 'c3000001-0000-4000-8000-000000000002', 'Bali Pass', 'High pass trek', 'Uttarkashi, Uttarakhand', 8, 7, 14999, NULL, 'difficult', 20, 10, 4.9, 76, 'summer', 'trek', ARRAY['High pass'], '4950m', true, false, true, true),
('d4000001-0000-4000-8000-000000000203', 'Ruinsara Tal Trek', 'ruinsara-tal-trek', 'b2000001-0000-4000-8000-000000000002', 'c3000001-0000-4000-8000-000000000002', 'Ruinsara Tal', 'Alpine lake', 'Uttarkashi, Uttarakhand', 7, 6, 11999, NULL, 'moderate', 20, 10, 4.8, 64, 'summer', 'trek', ARRAY['Alpine lake'], '3600m', true, false, false, true),
('d4000001-0000-4000-8000-000000000204', 'Phulara Ridge Trek', 'phulara-ridge-trek', 'b2000001-0000-4000-8000-000000000002', 'c3000001-0000-4000-8000-000000000002', 'Phulara Ridge', 'Ridge walk', 'Uttarkashi, Uttarakhand', 6, 5, 10499, NULL, 'moderate', 20, 10, 4.7, 52, 'summer', 'trek', ARRAY['Ridge'], '3700m', true, false, false, true),
('d4000001-0000-4000-8000-000000000205', 'Hampta Pass Trek', 'hampta-pass-trek', 'b2000001-0000-4000-8000-000000000006', 'c3000001-0000-4000-8000-000000000002', 'Hampta Pass', 'Crossover trek', 'Kullu, Himachal', 5, 4, 8999, NULL, 'moderate', 20, 10, 4.8, 198, 'summer', 'trek', ARRAY['Crossover'], '4270m', true, true, false, true),
('d4000001-0000-4000-8000-000000000206', 'Valley of Flowers Trek', 'valley-of-flowers-trek', 'b2000001-0000-4000-8000-000000000003', 'c3000001-0000-4000-8000-000000000002', 'Valley of Flowers', 'UNESCO trek', 'Chamoli, Uttarakhand', 6, 5, 10999, NULL, 'moderate', 20, 10, 4.9, 89, 'summer', 'trek', ARRAY['UNESCO'], '3658m', true, true, false, true),
('d4000001-0000-4000-8000-000000000207', 'Sar Pass Trek', 'sar-pass-trek', 'b2000001-0000-4000-8000-000000000006', 'c3000001-0000-4000-8000-000000000002', 'Sar Pass', 'Parvati Valley', 'Kasol, Himachal', 5, 4, 8499, NULL, 'moderate', 20, 10, 4.7, 143, 'summer', 'trek', ARRAY['Parvati'], '4200m', true, false, true, true),
('d4000001-0000-4000-8000-000000000301', 'Char Dham Yatra', 'char-dham-yatra', 'b2000001-0000-4000-8000-000000000007', 'c3000001-0000-4000-8000-000000000008', 'Char Dham', 'Full Char Dham', 'Uttarakhand', 12, 11, 24999, NULL, 'easy', 30, 15, 4.9, 420, 'summer', 'dham', ARRAY['Yamunotri','Gangotri','Kedarnath','Badrinath'], '3583m', true, true, true, true),
('d4000001-0000-4000-8000-000000000302', 'Do Dham Yatra', 'do-dham-yatra', 'b2000001-0000-4000-8000-000000000007', 'c3000001-0000-4000-8000-000000000008', 'Do Dham', 'Kedarnath & Badrinath', 'Uttarakhand', 7, 6, 14999, NULL, 'easy', 30, 15, 4.8, 267, 'summer', 'dham', ARRAY['Kedarnath','Badrinath'], '3583m', true, true, false, true),
('d4000001-0000-4000-8000-000000000303', 'Kedarnath Yatra', 'kedarnath-yatra', 'b2000001-0000-4000-8000-000000000007', 'c3000001-0000-4000-8000-000000000008', 'Kedarnath Yatra', 'Kedarnath temple', 'Rudraprayag, Uttarakhand', 3, 2, 5999, NULL, 'moderate', 30, 15, 4.9, 201, 'summer', 'dham', ARRAY['Kedarnath'], '3583m', true, true, false, true)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, price = EXCLUDED.price, trip_type = EXCLUDED.trip_type, is_visible = true, is_featured = EXCLUDED.is_featured;

INSERT INTO public.trip_images (id, trip_id, image_url, alt_text, sort_order, is_cover) VALUES
  ('e5000001-0000-4000-8000-000000000101', 'd4000001-0000-4000-8000-000000000101', 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&q=80', 'Kedarkantha', 0, true),
  ('e5000001-0000-4000-8000-000000000201', 'd4000001-0000-4000-8000-000000000201', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', 'Har Ki Dun', 0, true),
  ('e5000001-0000-4000-8000-000000000206', 'd4000001-0000-4000-8000-000000000206', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', 'Valley of Flowers', 0, true),
  ('e5000001-0000-4000-8000-000000000301', 'd4000001-0000-4000-8000-000000000301', 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80', 'Char Dham', 0, true),
  ('e5000001-0000-4000-8000-000000000303', 'd4000001-0000-4000-8000-000000000303', 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80', 'Kedarnath', 0, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hero_slides (id, title, subtitle, image_url, cta_text, cta_link, sort_order, is_visible) VALUES
  ('a1000001-0000-4000-8000-000000000001', 'Explore Uttarakhand', 'Mountains are calling...', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80', 'View Treks', '/trips', 0, true),
  ('a1000001-0000-4000-8000-000000000002', 'Discover Ladakh', 'Land of high passes', 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1600&q=80', 'Explore', '/destinations/ladakh', 1, true),
  ('a1000001-0000-4000-8000-000000000003', 'Valley of Flowers', 'Nature''s paradise', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80', 'Book Now', '/trips', 2, true)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, image_url = EXCLUDED.image_url, is_visible = true;

INSERT INTO public.gallery (id, title, image_url, media_type, category, sort_order, is_visible) VALUES
  ('aa000001-0000-4000-8000-000000000001', 'Himalayan Sunrise', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80', 'image', 'trekking', 0, true),
  ('aa000001-0000-4000-8000-000000000002', 'Camping Night', 'https://images.unsplash.com/photo-1478131143088-5e7e85b1958b?w=600&q=80', 'image', 'camping', 1, true),
  ('aa000001-0000-4000-8000-000000000003', 'River Rafting', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80', 'image', 'adventure', 2, true),
  ('aa000001-0000-4000-8000-000000000004', 'Ladakh Roads', 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80', 'image', 'biking', 3, true),
  ('aa000001-0000-4000-8000-000000000005', 'Valley Trek', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80', 'image', 'trekking', 4, true),
  ('aa000001-0000-4000-8000-000000000006', 'Snow Peaks', 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&q=80', 'image', 'winter', 5, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.testimonials (id, name, location, content, rating, image_url, trip_name, sort_order, is_visible) VALUES
  ('bb000001-0000-4000-8000-000000000001', 'Priya Sharma', 'Delhi', 'Har Ki Dun trek was magical!', 5, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80', 'Har Ki Dun Trek', 0, true),
  ('bb000001-0000-4000-8000-000000000002', 'Rahul Verma', 'Mumbai', 'Best trekking experience of my life.', 5, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', 'Valley of Flowers', 1, true),
  ('bb000001-0000-4000-8000-000000000003', 'Ananya Patel', 'Bangalore', 'Ladakh bike trip was epic!', 5, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80', 'Ladakh Expedition', 2, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.faq (id, question, answer, category, sort_order, is_visible) VALUES
  ('cc000001-0000-4000-8000-000000000001', 'What is included in the trip price?', 'Accommodation, meals, guide fees, permits, and transportation as per itinerary.', 'booking', 0, true),
  ('cc000001-0000-4000-8000-000000000002', 'What is the cancellation policy?', 'Full refund if cancelled 30+ days before departure. 50% refund for 15-30 days.', 'booking', 1, true),
  ('cc000001-0000-4000-8000-000000000003', 'Do I need prior trekking experience?', 'Easy treks need no experience; moderate treks need basic fitness.', 'trekking', 2, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.highlights (id, title, cover, stories, sort_order, is_visible) VALUES
  ('f6000001-0000-4000-8000-000000000001', 'Dehradun', 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=80', '[{"id":"1","image":"https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80","caption":"Dehradun"}]'::jsonb, 0, true),
  ('f6000001-0000-4000-8000-000000000002', 'Har Ki Dun', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', '[{"id":"1","image":"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80","caption":"Valley of Gods"}]'::jsonb, 1, true),
  ('f6000001-0000-4000-8000-000000000003', 'Kedarkantha', 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=400&q=80', '[{"id":"1","image":"https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&q=80","caption":"Snow summit"}]'::jsonb, 2, true),
  ('f6000001-0000-4000-8000-000000000004', 'Char Dham', 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&q=80', '[{"id":"1","image":"https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80","caption":"Kedarnath"}]'::jsonb, 3, true)
ON CONFLICT (id) DO UPDATE SET cover = EXCLUDED.cover, stories = EXCLUDED.stories, is_visible = true;

INSERT INTO public.media_library (file_name, file_url, file_type, file_size, bucket, alt_text)
SELECT v.file_name, v.url, 'image/jpeg', 0, v.bucket, v.alt
FROM (VALUES
  ('kedarkantha.jpg', 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&q=80', 'trip-images', 'Kedarkantha'),
  ('har-ki-dun.jpg', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', 'trip-images', 'Har Ki Dun'),
  ('valley.jpg', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', 'trip-images', 'Valley of Flowers'),
  ('ladakh.jpg', 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&q=80', 'destination-images', 'Ladakh'),
  ('camping.jpg', 'https://images.unsplash.com/photo-1478131143088-5e7e85b1958b?w=800&q=80', 'gallery-images', 'Camping')
) AS v(file_name, url, bucket, alt)
WHERE NOT EXISTS (SELECT 1 FROM public.media_library m WHERE m.file_url = v.url);

-- Confirm admin account
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email = 'dreamgoindia5@gmail.com';

INSERT INTO public.profiles (id, email, full_name, role, referral_code)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', 'Admin User'), 'admin',
       upper(substring(md5(random()::text) from 1 for 8))
FROM auth.users WHERE email = 'dreamgoindia5@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

UPDATE public.profiles SET role = 'admin' WHERE email = 'dreamgoindia5@gmail.com';
