-- Homepage position for trips (lower number = earlier position).
-- Managed from Admin → Trips / Ongoing Trips with up/down arrows.
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
