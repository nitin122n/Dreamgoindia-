-- Story highlights for Instagram-style homepage section
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

CREATE INDEX IF NOT EXISTS idx_highlights_sort ON public.highlights(sort_order);
CREATE INDEX IF NOT EXISTS idx_highlights_visible ON public.highlights(is_visible) WHERE is_visible = true;

ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read visible highlights"
  ON public.highlights FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Admins manage highlights"
  ON public.highlights FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE TRIGGER set_highlights_updated_at
  BEFORE UPDATE ON public.highlights
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
