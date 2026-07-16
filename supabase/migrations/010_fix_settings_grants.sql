-- Fix: permission denied for table settings (+ other CMS tables)
-- Run in: https://supabase.com/dashboard/project/erhlxhvpefhchrjuvzxa/sql/new

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon, authenticated;

-- Ensure settings singleton exists
INSERT INTO public.settings (
  id, site_name, logo_url, favicon_url, primary_color,
  contact_email, contact_phone, whatsapp, address,
  social_links, footer_text, seo_default_title, seo_default_description
) VALUES (
  1,
  'Dream Go India',
  NULL,
  NULL,
  '#E53935',
  'hello@dreamgoindia.com',
  '+91 98765 43210',
  '+91 98765 43210',
  'Dehradun, Uttarakhand, India',
  '{"instagram":"https://instagram.com/dreamgoindia","facebook":"https://facebook.com/dreamgoindia","youtube":"https://youtube.com/dreamgoindia"}'::jsonb,
  'Dream Go India — trusted travel & adventure company.',
  'Dream Go India - Travel, Trekking & Adventure Tours',
  'Book trekking tours, pilgrimage trips and adventure packages across India.'
)
ON CONFLICT (id) DO NOTHING;

-- Public read + admin write policies for settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read settings" ON public.settings;
CREATE POLICY "Anyone can read settings" ON public.settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update settings" ON public.settings;
CREATE POLICY "Admins can update settings" ON public.settings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can insert settings" ON public.settings;
CREATE POLICY "Admins can insert settings" ON public.settings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Allow anon/authenticated to update settings for local admin CMS (optional open write)
-- Prefer real admin JWT in production; this unblocks the panel now:
DROP POLICY IF EXISTS "Authenticated can update settings" ON public.settings;
CREATE POLICY "Authenticated can update settings" ON public.settings
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
