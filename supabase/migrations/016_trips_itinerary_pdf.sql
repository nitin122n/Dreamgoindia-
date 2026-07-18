-- Detailed itinerary PDF URL per trip (uploaded from Admin → Trips)
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS itinerary_pdf_url TEXT;
