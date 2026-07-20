-- Instagram posts shown on the homepage "Instagram images" section.
-- Managed from Admin → Instagram.

CREATE TABLE IF NOT EXISTS public.instagram_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permalink TEXT NOT NULL DEFAULT '',
  subtitle TEXT,
  caption TEXT,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS instagram_posts_visible_order_idx
  ON public.instagram_posts (is_visible, sort_order);

ALTER TABLE public.instagram_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "instagram_posts_public_read" ON public.instagram_posts;
DROP POLICY IF EXISTS "instagram_posts_public_write" ON public.instagram_posts;

CREATE POLICY "instagram_posts_public_read"
  ON public.instagram_posts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "instagram_posts_public_write"
  ON public.instagram_posts FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.instagram_posts TO anon, authenticated, service_role;

-- Seed the current homepage posts (idempotent)
INSERT INTO public.instagram_posts (id, permalink, subtitle, caption, image_url, sort_order, is_visible)
VALUES
  ('c1000001-0000-4000-8000-000000000001', 'https://www.instagram.com/p/DaCUvPXD4zB/', 'Hampta Pass · Balu Ka Ghera', 'Hampta Pass has a beautiful surprise before the pass', '/instagram/DaCUvPXD4zB.jpg', 0, true),
  ('c1000001-0000-4000-8000-000000000002', 'https://www.instagram.com/p/DX008xAjzdt/', 'Hampta Pass Trek', 'Where green valleys meet snow deserts', '/instagram/DX008xAjzdt.jpg', 1, true),
  ('c1000001-0000-4000-8000-000000000003', 'https://www.instagram.com/p/DTKCNYqjzqs/', 'Kedarkantha · Winter trek', 'Standing above the clouds at Kedarkantha', '/instagram/DTKCNYqjzqs.jpg', 2, true)
ON CONFLICT (id) DO NOTHING;
