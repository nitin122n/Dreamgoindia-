import type { Trip } from "@/types";

const DHAM_RE = /dham|yatra|kedarnath|badrinath|gangotri|yamunotri/i;

/** Pilgrimage / Char Dham style packages */
export function isDhamTrip(trip: Trip): boolean {
  if (trip.trip_type === "dham") return true;
  if (trip.category?.slug === "dham") return true;
  return DHAM_RE.test(`${trip.title} ${trip.slug}`);
}

/** Trekking packages (everything that is not a dham yatra) */
export function isTrekTrip(trip: Trip): boolean {
  if (trip.trip_type === "dham") return false;
  return !isDhamTrip(trip);
}

export function matchesSeason(
  trip: Trip,
  season: "winter" | "summer" | "monsoon"
): boolean {
  if (trip.season === season) return true;
  if (trip.category?.slug === season) return true;
  return false;
}

/** Homepage Treks tabs: winter / summer / monsoon / Char Dham */
export function filterHomepageTreks(
  trips: Trip[],
  tab: "winter" | "summer" | "monsoon" | "dham"
): Trip[] {
  const visible = trips.filter((t) => t.is_visible !== false);

  let filtered: Trip[];
  if (tab === "dham") {
    filtered = visible.filter(isDhamTrip);
  } else {
    filtered = visible.filter((t) => isTrekTrip(t) && matchesSeason(t, tab));
  }

  // Admin-managed position first (lower sort_order = earlier), then featured, then rating
  return filtered.sort((a, b) => {
    const ao = a.sort_order ?? 0;
    const bo = b.sort_order ?? 0;
    if (ao !== bo) return ao - bo;
    const af = a.is_featured ? 1 : 0;
    const bf = b.is_featured ? 1 : 0;
    if (bf !== af) return bf - af;
    return (b.rating ?? 0) - (a.rating ?? 0);
  });
}
