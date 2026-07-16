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
