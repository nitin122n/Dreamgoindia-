-- Founder photo on the About page (editable from Admin → Settings)
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS about_founder_image TEXT;
