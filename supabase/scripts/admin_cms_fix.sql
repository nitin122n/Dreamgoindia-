-- =============================================================================
-- FIX ADMIN CMS: grants + open RLS so website + admin panel share one database
-- Project: erhlxhvpefhchrjuvzxa (Dream Go India)
--
-- Paste this entire file into Supabase → SQL Editor → Run
-- Required once. Safe to re-run.
-- =============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public
  TO anon, authenticated, service_role;

GRANT ALL ON ALL SEQUENCES IN SCHEMA public
  TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;

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

-- Travel Highlights (Instagram-style)
CREATE TABLE IF NOT EXISTS public.travel_highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  cover_image text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.travel_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  highlight_id uuid NOT NULL REFERENCES public.travel_highlights (id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS travel_highlights_active_order_idx
  ON public.travel_highlights (is_active, display_order);
CREATE INDEX IF NOT EXISTS travel_stories_highlight_order_idx
  ON public.travel_stories (highlight_id, display_order);

-- Open RLS on all CMS tables (anon key can read/write for admin panel CMS)
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'settings','hero_slides','destinations','trip_categories','trips','trip_images',
    'trip_departures','gallery','blogs','blog_categories','testimonials','faq',
    'why_choose_us','pages','coupons','highlights','media_library','profiles',
    'bookings','reviews','newsletter','contact_forms',
    'travel_highlights','travel_stories'
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
      EXECUTE format(
        'GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO anon, authenticated, service_role',
        t
      );
    EXCEPTION
      WHEN undefined_table THEN NULL;
    END;
  END LOOP;
END $$;

-- Storage buckets for uploads
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

-- Ensure settings row exists
INSERT INTO public.settings (id, site_name, primary_color, contact_email)
VALUES (1, 'Dream Go India', '#E53935', 'hello@dreamgoindia.com')
ON CONFLICT (id) DO NOTHING;

-- Seed travel highlights if empty
INSERT INTO public.travel_highlights (id, title, cover_image, display_order, is_active)
SELECT v.id, v.title, v.cover_image, v.display_order, true
FROM (VALUES
  ('a1000001-0000-4000-8000-000000000001'::uuid, 'Dehradun', 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=80', 0),
  ('a1000001-0000-4000-8000-000000000002'::uuid, 'Har Ki Dun', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', 1),
  ('a1000001-0000-4000-8000-000000000003'::uuid, 'Valley of Flowers', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80', 2),
  ('a1000001-0000-4000-8000-000000000004'::uuid, 'Auli', 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=400&q=80', 3),
  ('a1000001-0000-4000-8000-000000000005'::uuid, 'Nainital', 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=80', 4),
  ('a1000001-0000-4000-8000-000000000006'::uuid, 'Ladakh', 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=400&q=80', 5)
) AS v(id, title, cover_image, display_order)
WHERE NOT EXISTS (SELECT 1 FROM public.travel_highlights LIMIT 1);

INSERT INTO public.travel_stories (id, highlight_id, image_url, caption, display_order)
SELECT v.id, v.highlight_id, v.image_url, v.caption, v.display_order
FROM (VALUES
  ('b1000001-0000-4000-8000-000000000001'::uuid, 'a1000001-0000-4000-8000-000000000001'::uuid, 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=80', 'Dehradun, Uttarakhand — explore with Dream Go India', 0),
  ('b1000001-0000-4000-8000-000000000002'::uuid, 'a1000001-0000-4000-8000-000000000001'::uuid, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', 'Himalayan sunrise near Dehradun', 1),
  ('b1000001-0000-4000-8000-000000000004'::uuid, 'a1000001-0000-4000-8000-000000000002'::uuid, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', 'Har Ki Dun — Valley of Gods', 0),
  ('b1000001-0000-4000-8000-000000000007'::uuid, 'a1000001-0000-4000-8000-000000000003'::uuid, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80', 'Valley of Flowers in full bloom', 0),
  ('b1000001-0000-4000-8000-000000000009'::uuid, 'a1000001-0000-4000-8000-000000000004'::uuid, 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=1200&q=80', 'Snow slopes of Auli', 0),
  ('b1000001-0000-4000-8000-000000000011'::uuid, 'a1000001-0000-4000-8000-000000000005'::uuid, 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&q=80', 'Nainital lake views', 0),
  ('b1000001-0000-4000-8000-000000000013'::uuid, 'a1000001-0000-4000-8000-000000000006'::uuid, 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1200&q=80', 'Ladakh — land of high passes', 0)
) AS v(id, highlight_id, image_url, caption, display_order)
WHERE NOT EXISTS (SELECT 1 FROM public.travel_stories LIMIT 1);

-- Promote admin profile if auth user already exists
UPDATE public.profiles
SET role = 'admin'
WHERE lower(email) = lower('dreamgoindia5@gmail.com');

NOTIFY pgrst, 'reload schema';
