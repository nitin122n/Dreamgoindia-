-- Instagram-style Travel Highlights (normalized stories)
-- Run this in the Dream Go India Supabase SQL Editor:
-- Project: erhlxhvpefhchrjuvzxa

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

ALTER TABLE public.travel_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "travel_highlights_public_read" ON public.travel_highlights;
DROP POLICY IF EXISTS "travel_highlights_public_write" ON public.travel_highlights;
DROP POLICY IF EXISTS "travel_stories_public_read" ON public.travel_stories;
DROP POLICY IF EXISTS "travel_stories_public_write" ON public.travel_stories;

CREATE POLICY "travel_highlights_public_read"
  ON public.travel_highlights FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "travel_highlights_public_write"
  ON public.travel_highlights FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "travel_stories_public_read"
  ON public.travel_stories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "travel_stories_public_write"
  ON public.travel_stories FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.travel_highlights TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.travel_stories TO anon, authenticated, service_role;

-- Seed sample highlights (idempotent)
INSERT INTO public.travel_highlights (id, title, cover_image, display_order, is_active)
VALUES
  ('a1000001-0000-4000-8000-000000000001', 'Dehradun', 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=80', 0, true),
  ('a1000001-0000-4000-8000-000000000002', 'Har Ki Dun', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', 1, true),
  ('a1000001-0000-4000-8000-000000000003', 'Valley of Flowers', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80', 2, true),
  ('a1000001-0000-4000-8000-000000000004', 'Auli', 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=400&q=80', 3, true),
  ('a1000001-0000-4000-8000-000000000005', 'Nainital', 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=80', 4, true),
  ('a1000001-0000-4000-8000-000000000006', 'Ladakh', 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=400&q=80', 5, true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  cover_image = EXCLUDED.cover_image,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

INSERT INTO public.travel_stories (id, highlight_id, image_url, caption, display_order)
VALUES
  ('b1000001-0000-4000-8000-000000000001', 'a1000001-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=80', 'Dehradun, Uttarakhand — explore with Dream Go India', 0),
  ('b1000001-0000-4000-8000-000000000002', 'a1000001-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', 'Himalayan sunrise near Dehradun', 1),
  ('b1000001-0000-4000-8000-000000000003', 'a1000001-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1478131143088-5e7e85b1958b?w=1200&q=80', 'Camp nights under clear skies', 2),

  ('b1000001-0000-4000-8000-000000000004', 'a1000001-0000-4000-8000-000000000002', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', 'Har Ki Dun — Valley of Gods', 0),
  ('b1000001-0000-4000-8000-000000000005', 'a1000001-0000-4000-8000-000000000002', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80', 'Alpine meadows on the trail', 1),
  ('b1000001-0000-4000-8000-000000000006', 'a1000001-0000-4000-8000-000000000002', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80', 'Rivers that guide the way', 2),

  ('b1000001-0000-4000-8000-000000000007', 'a1000001-0000-4000-8000-000000000003', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80', 'Valley of Flowers in full bloom', 0),
  ('b1000001-0000-4000-8000-000000000008', 'a1000001-0000-4000-8000-000000000003', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', 'Monsoon magic in Uttarakhand', 1),

  ('b1000001-0000-4000-8000-000000000009', 'a1000001-0000-4000-8000-000000000004', 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=1200&q=80', 'Snow slopes of Auli', 0),
  ('b1000001-0000-4000-8000-000000000010', 'a1000001-0000-4000-8000-000000000004', 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1200&q=80', 'Winter adventures await', 1),

  ('b1000001-0000-4000-8000-000000000011', 'a1000001-0000-4000-8000-000000000005', 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&q=80', 'Nainital lake views', 0),
  ('b1000001-0000-4000-8000-000000000012', 'a1000001-0000-4000-8000-000000000005', 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=80', 'Hill-station evenings', 1),

  ('b1000001-0000-4000-8000-000000000013', 'a1000001-0000-4000-8000-000000000006', 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1200&q=80', 'Ladakh — land of high passes', 0),
  ('b1000001-0000-4000-8000-000000000014', 'a1000001-0000-4000-8000-000000000006', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', 'Roads that never end', 1)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  caption = EXCLUDED.caption,
  display_order = EXCLUDED.display_order;
