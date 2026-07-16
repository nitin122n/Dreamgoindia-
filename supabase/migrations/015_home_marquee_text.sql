-- Homepage scrolling banner text (editable in Admin → Settings)
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS home_marquee_text TEXT;

UPDATE public.settings
SET home_marquee_text = 'Welcome to Dream Go India — we welcome you to start a mesmerizing journey'
WHERE id = 1
  AND (home_marquee_text IS NULL OR btrim(home_marquee_text) = '');
