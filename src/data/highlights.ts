import { mockDestinations, mockGallery, mockTrips } from "@/data/mock-data";
import type { Highlight, Story } from "@/types/highlight";

function galleryStory(g: (typeof mockGallery)[number], prefix: string): Story {
  return {
    id: `${prefix}-g-${g.id}`,
    image: g.image_url ?? "",
    caption: g.title ?? undefined,
    date: "2026-03-01",
  };
}

/** Builds highlight reels from featured destinations, trips, and gallery images on the site */
export function getWebsiteHighlights(): Highlight[] {
  const destinationHighlights: Highlight[] = mockDestinations
    .filter((d) => d.is_featured && d.is_visible && d.image_url)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((dest, index) => {
      const galleryOffset = index * 2;
      const extraStories = mockGallery
        .slice(galleryOffset, galleryOffset + 2)
        .map((g) => galleryStory(g, dest.id));

      const stories: Story[] = [
        {
          id: `${dest.id}-cover`,
          image: dest.image_url!,
          caption: `${dest.name}, ${dest.state} — explore with Dream Go India`,
          date: "2026-03-01",
        },
        ...extraStories,
      ];

      return {
        id: dest.id,
        title: dest.name,
        cover: dest.image_url!,
        stories,
      };
    });

  const tripHighlights: Highlight[] = mockTrips
    .filter((t) => t.is_featured && t.is_visible)
    .slice(0, 3)
    .map((trip) => {
      const cover =
        trip.trip_images?.find((img) => img.is_cover)?.image_url ||
        trip.trip_images?.[0]?.image_url ||
        "";

      const stories: Story[] =
        trip.trip_images && trip.trip_images.length > 0
          ? trip.trip_images.map((img) => ({
              id: `${trip.id}-img-${img.id}`,
              image: img.image_url,
              caption: trip.title,
              date: trip.created_at.split("T")[0],
            }))
          : cover
            ? [
                {
                  id: `${trip.id}-cover`,
                  image: cover,
                  caption: trip.overview ?? trip.title,
                  date: trip.created_at.split("T")[0],
                },
              ]
            : [];

      const shortTitle = trip.title.replace(/ Trek| Yatra/g, "");

      return {
        id: `trip-${trip.id}`,
        title: shortTitle,
        cover,
        stories,
      };
    })
    .filter((h) => h.cover && h.stories.length > 0);

  const seen = new Set<string>();
  return [...destinationHighlights, ...tripHighlights].filter((h) => {
    const key = h.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Initial seed for admin mock store */
export function getSeedHighlights(): Highlight[] {
  return getWebsiteHighlights().map((h, index) => ({
    ...h,
    sort_order: index,
    is_visible: true,
  }));
}

export const seedHighlights = getSeedHighlights();
