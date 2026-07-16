import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const migrations = path.join(root, "supabase", "migrations");

const grants = `-- =============================================================================
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
`;

const websiteCatalog = fs.readFileSync(
  path.join(root, "supabase", "scripts", "website_catalog_snippet.sql"),
  "utf8"
);

let seed002 = fs.readFileSync(path.join(migrations, "002_seed_data.sql"), "utf8");
seed002 = seed002.replace(
  /INSERT INTO public\.settings \([\s\S]*?\);/m,
  (m) =>
    m.replace(
      /;\s*$/,
      ""
    ) +
    `\nON CONFLICT (id) DO UPDATE SET
  site_name = EXCLUDED.site_name,
  primary_color = EXCLUDED.primary_color,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone,
  whatsapp = EXCLUDED.whatsapp,
  address = EXCLUDED.address,
  social_links = EXCLUDED.social_links,
  footer_text = EXCLUDED.footer_text,
  seo_default_title = EXCLUDED.seo_default_title,
  seo_default_description = EXCLUDED.seo_default_description;\n`
);

const out =
  grants +
  "\n\n-- ===== Base seed (002) =====\n" +
  seed002 +
  "\n\n" +
  websiteCatalog;

const outPath = path.join(migrations, "008_upload_all_website_content.sql");
fs.writeFileSync(outPath, out);
console.log("Wrote", outPath, "bytes", out.length);
