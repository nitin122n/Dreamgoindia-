-- Inside banner for trip detail page (recommended 1600×600)
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS banner_image_url TEXT;
