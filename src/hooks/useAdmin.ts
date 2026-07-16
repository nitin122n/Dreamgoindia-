import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  mockAdminStats,
  type NewsletterSubscriber,
  type AdminStats,
} from "@/data/admin-mock-data";
import { defaultSettings } from "@/data/mock-data";
import { getAdminMockStore, mockId, slugify } from "@/lib/admin-mock-store";
import { CMS_UNLOCK_SQL_HINT, isPermissionDenied, useMockCms } from "@/lib/cms-mode";
import { mapSettingsRow } from "@/lib/settings-map";
import type {
  Blog,
  Booking,
  BookingStatus,
  ContactForm,
  Coupon,
  Destination,
  FAQ,
  GalleryItem,
  HeroSlide,
  MediaItem,
  Profile,
  Review,
  ReviewStatus,
  SiteSettings,
  Testimonial,
  Trip,
  TripCategory,
  UserRole,
} from "@/types";
import type { Highlight } from "@/types/highlight";

function assertNoError(error: { message?: string; code?: string } | null) {
  if (error) throw cmsError(error);
}

function cmsError(error: unknown): Error {
  const err = error as { message?: string; code?: string };
  if (isPermissionDenied(err)) {
    return new Error(`Database permission denied. ${CMS_UNLOCK_SQL_HINT}`);
  }
  return error instanceof Error ? error : new Error(err?.message ?? "CMS operation failed");
}

const adminKeys = {
  stats: ["admin", "stats"] as const,
  heroSlides: ["admin", "hero-slides"] as const,
  destinations: ["admin", "destinations"] as const,
  categories: ["admin", "categories"] as const,
  trips: ["admin", "trips"] as const,
  bookings: ["admin", "bookings"] as const,
  users: ["admin", "users"] as const,
  blogs: ["admin", "blogs"] as const,
  gallery: ["admin", "gallery"] as const,
  reviews: ["admin", "reviews"] as const,
  testimonials: ["admin", "testimonials"] as const,
  faqs: ["admin", "faqs"] as const,
  coupons: ["admin", "coupons"] as const,
  newsletter: ["admin", "newsletter"] as const,
  contact: ["admin", "contact"] as const,
  settings: ["admin", "settings"] as const,
  media: ["admin", "media"] as const,
  highlights: ["admin", "highlights"] as const,
};

export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats,
    queryFn: async (): Promise<AdminStats> => {
      if (useMockCms()) return mockAdminStats;

      const [bookings, users, reviews] = await Promise.all([
        supabase.from("bookings").select("total_amount, status, created_at"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);

      const rows = bookings.data ?? [];
      const totalRevenue = rows
        .filter((b) => b.status === "confirmed" || b.status === "completed")
        .reduce((sum, b) => sum + (b.total_amount ?? 0), 0);

      return {
        totalBookings: rows.length,
        totalRevenue,
        totalUsers: users.count ?? 0,
        pendingBookings: rows.filter((b) => b.status === "pending").length,
        pendingReviews: reviews.count ?? 0,
        monthlyBookings: mockAdminStats.monthlyBookings,
        monthlyRevenue: mockAdminStats.monthlyRevenue,
      };
    },
  });
}

export function useAdminHeroSlides() {
  return useQuery({
    queryKey: adminKeys.heroSlides,
    queryFn: async () => {
      if (useMockCms()) return getAdminMockStore().heroSlides;
      const { data, error } = await supabase.from("hero_slides").select("*").order("sort_order");
      assertNoError(error);
      return data as HeroSlide[];
    },
  });
}

export function useAdminHeroMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: adminKeys.heroSlides });
    qc.invalidateQueries({ queryKey: ["hero-slides"] });
  };

  const save = useMutation({
    mutationFn: async (slide: Partial<HeroSlide> & { id?: string }) => {
      if (useMockCms()) {
        const store = getAdminMockStore();
        if (slide.id) {
          const idx = store.heroSlides.findIndex((s) => s.id === slide.id);
          if (idx >= 0) store.heroSlides[idx] = { ...store.heroSlides[idx], ...slide } as HeroSlide;
        } else {
          store.heroSlides.push({
            id: mockId("hero"),
            title: slide.title ?? "",
            subtitle: slide.subtitle ?? null,
            image_url: slide.image_url ?? "",
            cta_text: slide.cta_text ?? "Explore",
            cta_link: slide.cta_link ?? "/trips",
            secondary_cta_text: slide.secondary_cta_text ?? null,
            secondary_cta_link: slide.secondary_cta_link ?? null,
            sort_order: slide.sort_order ?? store.heroSlides.length,
            is_visible: slide.is_visible ?? true,
          });
        }
        return;
      }
      if (slide.id) {
        const { error } = await supabase.from("hero_slides").update(slide).eq("id", slide.id);
        assertNoError(error);
      } else {
        const { error } = await supabase.from("hero_slides").insert(slide);
        assertNoError(error);
      }
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (useMockCms()) {
        const store = getAdminMockStore();
        store.heroSlides = store.heroSlides.filter((s) => s.id !== id);
        return;
      }

      const { data: row, error: fetchError } = await supabase
        .from("hero_slides")
        .select("id, image_url")
        .eq("id", id)
        .maybeSingle();
      assertNoError(fetchError);

      const { error } = await supabase.from("hero_slides").delete().eq("id", id);
      assertNoError(error);

      if (row?.image_url) {
        const { deleteStorageByPublicUrls } = await import("@/lib/supabase-storage");
        await deleteStorageByPublicUrls([row.image_url as string]);
        await supabase.from("media_library").delete().eq("file_url", row.image_url);
      }
    },
    onSuccess: invalidate,
  });

  const reorder = useMutation({
    mutationFn: async (ordered: HeroSlide[]) => {
      if (useMockCms()) {
        getAdminMockStore().heroSlides = ordered.map((s, i) => ({ ...s, sort_order: i }));
        return;
      }
      await Promise.all(
        ordered.map((s, i) => supabase.from("hero_slides").update({ sort_order: i }).eq("id", s.id))
      );
    },
    onSuccess: invalidate,
  });

  return { save, remove, reorder };
}

type TravelHighlightRow = {
  id: string;
  title: string;
  cover_image: string;
  display_order: number;
  is_active: boolean;
  travel_stories?: Array<{
    id: string;
    highlight_id: string;
    image_url: string;
    caption: string | null;
    display_order: number;
  }>;
};

function mapTravelHighlightToAdmin(row: TravelHighlightRow): Highlight {
  const stories = [...(row.travel_stories ?? [])]
    .sort((a, b) => a.display_order - b.display_order)
    .map((s) => ({
      id: s.id,
      image: s.image_url,
      caption: s.caption ?? undefined,
    }));

  return {
    id: row.id,
    title: row.title,
    cover: row.cover_image,
    stories:
      stories.length > 0
        ? stories
        : [{ id: "cover", image: row.cover_image, caption: row.title }],
    sort_order: row.display_order,
    is_visible: row.is_active,
  };
}

export function useAdminHighlights() {
  return useQuery({
    queryKey: adminKeys.highlights,
    queryFn: async () => {
      if (useMockCms()) {
        return [...getAdminMockStore().highlights].sort(
          (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
        );
      }

      const { data, error } = await supabase
        .from("travel_highlights")
        .select("*, travel_stories(*)")
        .order("display_order");

      assertNoError(error);
      return ((data as TravelHighlightRow[]) ?? []).map(mapTravelHighlightToAdmin);
    },
  });
}

export function useAdminHighlightMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: adminKeys.highlights });
    qc.invalidateQueries({ queryKey: ["travel-highlights"] });
    qc.invalidateQueries({ queryKey: ["travel-stories"] });
  };

  const save = useMutation({
    mutationFn: async (item: Partial<Highlight> & { id?: string; title: string }) => {
      if (useMockCms()) {
        const store = getAdminMockStore();
        if (item.id) {
          const idx = store.highlights.findIndex((h) => h.id === item.id);
          if (idx >= 0) {
            store.highlights[idx] = { ...store.highlights[idx], ...item } as Highlight;
          }
        } else {
          store.highlights.push({
            id: mockId("highlight"),
            title: item.title,
            cover: item.cover ?? "",
            stories: item.stories ?? [],
            sort_order: item.sort_order ?? store.highlights.length,
            is_visible: item.is_visible ?? true,
          });
        }
        return;
      }

      const payload = {
        title: item.title,
        cover_image: item.cover ?? "",
        display_order: item.sort_order ?? 0,
        is_active: item.is_visible !== false,
      };

      let highlightId = item.id;

      if (highlightId) {
        const { error } = await supabase
          .from("travel_highlights")
          .update(payload)
          .eq("id", highlightId);
        assertNoError(error);
      } else {
        const { data, error } = await supabase
          .from("travel_highlights")
          .insert(payload)
          .select("id")
          .single();
        assertNoError(error);
        if (!data?.id) throw new Error("Failed to create highlight");
        highlightId = data.id as string;
      }

      await supabase.from("travel_stories").delete().eq("highlight_id", highlightId);

      const storyRows = (item.stories ?? [])
        .filter((s) => s.image)
        .map((s, i) => ({
          highlight_id: highlightId!,
          image_url: s.image,
          caption: s.caption ?? null,
          display_order: i,
        }));

      if (storyRows.length) {
        const { error: storyError } = await supabase.from("travel_stories").insert(storyRows);
        if (storyError) throw storyError;
      }
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (useMockCms()) {
        getAdminMockStore().highlights = getAdminMockStore().highlights.filter((h) => h.id !== id);
        return;
      }
      const { error } = await supabase.from("travel_highlights").delete().eq("id", id);
      assertNoError(error);
    },
    onSuccess: invalidate,
  });

  const reorder = useMutation({
    mutationFn: async (ordered: Highlight[]) => {
      if (useMockCms()) {
        getAdminMockStore().highlights = ordered.map((h, i) => ({ ...h, sort_order: i }));
        return;
      }
      await Promise.all(
        ordered.map((h, i) =>
          supabase.from("travel_highlights").update({ display_order: i }).eq("id", h.id)
        )
      );
    },
    onSuccess: invalidate,
  });

  return { save, remove, reorder };
}

export function useAdminDestinations() {
  return useQuery({
    queryKey: adminKeys.destinations,
    queryFn: async () => {
      if (useMockCms()) return getAdminMockStore().destinations;
      const { data, error } = await supabase.from("destinations").select("*").order("sort_order");
      assertNoError(error);
      return data as Destination[];
    },
  });
}

export function useAdminDestinationMutations() {
  const qc = useQueryClient();
  const invalidate = () => { qc.invalidateQueries({ queryKey: adminKeys.destinations }); qc.invalidateQueries({ queryKey: ["destinations"] }); };

  const save = useMutation({
    mutationFn: async (item: Partial<Destination> & { id?: string; name: string }) => {
      const slug = item.slug ?? slugify(item.name);
      if (useMockCms()) {
        const store = getAdminMockStore();
        if (item.id) {
          const idx = store.destinations.findIndex((d) => d.id === item.id);
          if (idx >= 0) store.destinations[idx] = { ...store.destinations[idx], ...item, slug } as Destination;
        } else {
          store.destinations.push({
            id: mockId("dest"),
            name: item.name,
            slug,
            state: item.state ?? null,
            country: item.country ?? "India",
            description: item.description ?? null,
            short_description: item.short_description ?? null,
            image_url: item.image_url ?? null,
            cover_image_url: item.cover_image_url ?? null,
            gallery: item.gallery ?? [],
            map_lat: item.map_lat ?? null,
            map_lng: item.map_lng ?? null,
            best_season: item.best_season ?? null,
            altitude: item.altitude ?? null,
            is_featured: item.is_featured ?? false,
            is_visible: item.is_visible ?? true,
            sort_order: item.sort_order ?? store.destinations.length,
            seo_title: item.seo_title ?? null,
            seo_description: item.seo_description ?? null,
          });
        }
        return;
      }
      const payload = { ...item, slug };
      if (item.id) {
        const { error } = await supabase.from("destinations").update(payload).eq("id", item.id);
        assertNoError(error);
      } else {
        const { error } = await supabase.from("destinations").insert(payload);
        assertNoError(error);
      }
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (useMockCms()) {
        getAdminMockStore().destinations = getAdminMockStore().destinations.filter((d) => d.id !== id);
        return;
      }
      const { error } = await supabase.from("destinations").delete().eq("id", id);
      assertNoError(error);
    },
    onSuccess: invalidate,
  });

  return { save, remove };
}

export function useAdminCategories() {
  return useQuery({
    queryKey: adminKeys.categories,
    queryFn: async () => {
      if (useMockCms()) return getAdminMockStore().categories;
      const { data, error } = await supabase.from("trip_categories").select("*").order("sort_order");
      assertNoError(error);
      return data as TripCategory[];
    },
  });
}

export function useAdminCategoryMutations() {
  const qc = useQueryClient();
  const invalidate = () => { qc.invalidateQueries({ queryKey: adminKeys.categories }); qc.invalidateQueries({ queryKey: ["trip-categories"] }); };

  const save = useMutation({
    mutationFn: async (item: Partial<TripCategory> & { id?: string; name: string }) => {
      const slug = item.slug ?? slugify(item.name);
      if (useMockCms()) {
        const store = getAdminMockStore();
        if (item.id) {
          const idx = store.categories.findIndex((c) => c.id === item.id);
          if (idx >= 0) store.categories[idx] = { ...store.categories[idx], ...item, slug } as TripCategory;
        } else {
          store.categories.push({
            id: mockId("cat"),
            name: item.name,
            slug,
            icon: item.icon ?? null,
            description: item.description ?? null,
            season: item.season ?? "all",
            sort_order: item.sort_order ?? store.categories.length,
            is_visible: item.is_visible ?? true,
          });
        }
        return;
      }
      const payload = { ...item, slug };
      if (item.id) {
        const { error } = await supabase.from("trip_categories").update(payload).eq("id", item.id);
        assertNoError(error);
      } else {
        const { error } = await supabase.from("trip_categories").insert(payload);
        assertNoError(error);
      }
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (useMockCms()) {
        getAdminMockStore().categories = getAdminMockStore().categories.filter((c) => c.id !== id);
        return;
      }
      const { error } = await supabase.from("trip_categories").delete().eq("id", id);
      assertNoError(error);
    },
    onSuccess: invalidate,
  });

  return { save, remove };
}

export function useAdminTrips() {
  return useQuery({
    queryKey: adminKeys.trips,
    queryFn: async () => {
      if (useMockCms()) return getAdminMockStore().trips;
      const { data, error } = await supabase
        .from("trips")
        .select("*, trip_images(*), destination:destinations(*), category:trip_categories(*)")
        .order("created_at", { ascending: false });
      assertNoError(error);
      return data as Trip[];
    },
  });
}

export function useAdminTripMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: adminKeys.trips });
    qc.invalidateQueries({ queryKey: ["trips"] });
    qc.invalidateQueries({ queryKey: ["trip"] });
  };

  const save = useMutation({
    mutationFn: async (
      item: Partial<Trip> & { id?: string; title: string; cover_url?: string }
    ) => {
      const slug = item.slug?.trim() || slugify(item.title);
      const coverUrl = item.cover_url?.trim() || "";

      if (useMockCms()) {
        const store = getAdminMockStore();
        if (item.id) {
          const idx = store.trips.findIndex((t) => t.id === item.id);
          if (idx >= 0) {
            const prev = store.trips[idx];
            store.trips[idx] = {
              ...prev,
              ...item,
              slug,
              trip_images: coverUrl
                ? [
                    {
                      id: prev.trip_images?.[0]?.id ?? mockId("img"),
                      trip_id: prev.id,
                      image_url: coverUrl,
                      alt_text: item.title,
                      sort_order: 0,
                      is_cover: true,
                    },
                  ]
                : prev.trip_images,
            } as Trip;
          }
        } else {
          const id = mockId("trip");
          store.trips.push({
            id,
            title: item.title,
            slug,
            destination_id: item.destination_id ?? null,
            category_id: item.category_id ?? null,
            description: item.description ?? null,
            overview: item.overview ?? null,
            location: item.location ?? null,
            duration_days: item.duration_days ?? 1,
            duration_nights: item.duration_nights ?? 0,
            price: item.price ?? 0,
            discount_price: item.discount_price ?? null,
            difficulty: item.difficulty ?? "easy",
            max_seats: item.max_seats ?? 20,
            seats_left: item.seats_left ?? 20,
            rating: item.rating ?? 0,
            review_count: item.review_count ?? 0,
            season: item.season ?? "all",
            trip_type: item.trip_type ?? "trek",
            highlights: item.highlights ?? [],
            itinerary: item.itinerary ?? [],
            inclusions: item.inclusions ?? [],
            exclusions: item.exclusions ?? [],
            faqs: item.faqs ?? [],
            map_lat: item.map_lat ?? null,
            map_lng: item.map_lng ?? null,
            altitude: item.altitude ?? null,
            is_featured: item.is_featured ?? false,
            is_popular: item.is_popular ?? false,
            is_trending: item.is_trending ?? false,
            is_visible: item.is_visible ?? true,
            seo_title: item.seo_title ?? null,
            seo_description: item.seo_description ?? null,
            created_at: new Date().toISOString(),
            trip_images: coverUrl
              ? [
                  {
                    id: mockId("img"),
                    trip_id: id,
                    image_url: coverUrl,
                    alt_text: item.title,
                    sort_order: 0,
                    is_cover: true,
                  },
                ]
              : [],
          });
        }
        return;
      }

      // Flat columns only — never send nested joins to PostgREST
      const payload: Record<string, unknown> = {
        title: item.title,
        slug,
        destination_id: item.destination_id ?? null,
        category_id: item.category_id ?? null,
        description: item.description ?? null,
        overview: item.overview ?? null,
        location: item.location ?? null,
        duration_days: item.duration_days ?? 1,
        duration_nights: item.duration_nights ?? 0,
        price: item.price ?? 0,
        discount_price: item.discount_price ?? null,
        difficulty: item.difficulty ?? "moderate",
        max_seats: item.max_seats ?? 20,
        seats_left: item.seats_left ?? 20,
        season: item.season ?? "all",
        is_featured: item.is_featured ?? false,
        is_popular: item.is_popular ?? false,
        is_trending: item.is_trending ?? false,
        is_visible: item.is_visible !== false,
        rating: item.rating ?? 0,
        map_lat: item.map_lat ?? null,
        map_lng: item.map_lng ?? null,
        altitude: item.altitude ?? null,
      };

      // trip_type may be missing on older DBs — try with it, retry without
      if (item.trip_type) payload.trip_type = item.trip_type;

      let tripId = item.id;

      if (tripId) {
        let { error } = await supabase.from("trips").update(payload).eq("id", tripId);
        if (error && /trip_type/i.test(error.message ?? "")) {
          delete payload.trip_type;
          ({ error } = await supabase.from("trips").update(payload).eq("id", tripId));
        }
        assertNoError(error);
      } else {
        let { data, error } = await supabase.from("trips").insert(payload).select("id").single();
        if (error && /trip_type/i.test(error.message ?? "")) {
          delete payload.trip_type;
          ({ data, error } = await supabase.from("trips").insert(payload).select("id").single());
        }
        assertNoError(error);
        tripId = data?.id as string;
      }

      if (coverUrl && tripId) {
        await supabase.from("trip_images").delete().eq("trip_id", tripId).eq("is_cover", true);
        const { error: imgError } = await supabase.from("trip_images").insert({
          trip_id: tripId,
          image_url: coverUrl,
          alt_text: item.title,
          sort_order: 0,
          is_cover: true,
        });
        assertNoError(imgError);
      }
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (useMockCms()) {
        getAdminMockStore().trips = getAdminMockStore().trips.filter((t) => t.id !== id);
        return;
      }
      const { error } = await supabase.from("trips").delete().eq("id", id);
      assertNoError(error);
    },
    onSuccess: invalidate,
  });

  return { save, remove };
}

export function useAdminBookings() {
  return useQuery({
    queryKey: adminKeys.bookings,
    queryFn: async () => {
      if (useMockCms()) return getAdminMockStore().bookings;
      const { data, error } = await supabase
        .from("bookings")
        .select("*, trip:trips(*), profile:profiles(*)")
        .order("created_at", { ascending: false });
      assertNoError(error);
      return data as Booking[];
    },
  });
}

export function useAdminBookingMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: adminKeys.bookings });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BookingStatus }) => {
      if (useMockCms()) {
        const booking = getAdminMockStore().bookings.find((b) => b.id === id);
        if (booking) booking.status = status;
        return;
      }
      const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
      assertNoError(error);
    },
    onSuccess: invalidate,
  });

  return { updateStatus };
}

export function useAdminUsers() {
  return useQuery({
    queryKey: adminKeys.users,
    queryFn: async () => {
      if (useMockCms()) return getAdminMockStore().profiles;
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      assertNoError(error);
      return data as Profile[];
    },
  });
}

export function useAdminUserMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: adminKeys.users });

  const updateRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: UserRole }) => {
      if (useMockCms()) {
        const user = getAdminMockStore().profiles.find((p) => p.id === id);
        if (user) user.role = role;
        return;
      }
      const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
      assertNoError(error);
    },
    onSuccess: invalidate,
  });

  return { updateRole };
}

export function useAdminBlogs() {
  return useQuery({
    queryKey: adminKeys.blogs,
    queryFn: async () => {
      if (useMockCms()) return getAdminMockStore().blogs;
      const { data, error } = await supabase.from("blogs").select("*").order("created_at", { ascending: false });
      assertNoError(error);
      return data as Blog[];
    },
  });
}

export function useAdminBlogMutations() {
  const qc = useQueryClient();
  const invalidate = () => { qc.invalidateQueries({ queryKey: adminKeys.blogs }); qc.invalidateQueries({ queryKey: ["blogs"] }); qc.invalidateQueries({ queryKey: ["blog"] }); };

  const save = useMutation({
    mutationFn: async (item: Partial<Blog> & { id?: string; title: string }) => {
      const slug = item.slug ?? slugify(item.title);
      if (useMockCms()) {
        const store = getAdminMockStore();
        if (item.id) {
          const idx = store.blogs.findIndex((b) => b.id === item.id);
          if (idx >= 0) store.blogs[idx] = { ...store.blogs[idx], ...item, slug } as Blog;
        } else {
          store.blogs.push({
            id: mockId("blog"),
            title: item.title,
            slug,
            excerpt: item.excerpt ?? null,
            content: item.content ?? null,
            featured_image: item.featured_image ?? null,
            category_id: item.category_id ?? null,
            tags: item.tags ?? [],
            status: item.status ?? "draft",
            is_featured: item.is_featured ?? false,
            view_count: 0,
            published_at: item.status === "published" ? new Date().toISOString() : null,
            created_at: new Date().toISOString(),
          });
        }
        return;
      }
      const payload = { ...item, slug };
      if (item.id) {
        const { error } = await supabase.from("blogs").update(payload).eq("id", item.id);
        assertNoError(error);
      } else {
        const { error } = await supabase.from("blogs").insert(payload);
        assertNoError(error);
      }
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (useMockCms()) {
        getAdminMockStore().blogs = getAdminMockStore().blogs.filter((b) => b.id !== id);
        return;
      }
      const { error } = await supabase.from("blogs").delete().eq("id", id);
      assertNoError(error);
    },
    onSuccess: invalidate,
  });

  return { save, remove };
}

export function useAdminGallery() {
  return useQuery({
    queryKey: adminKeys.gallery,
    queryFn: async () => {
      if (useMockCms()) return getAdminMockStore().gallery;
      const { data, error } = await supabase.from("gallery").select("*").order("sort_order");
      assertNoError(error);
      return data as GalleryItem[];
    },
  });
}

export function useAdminGalleryMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: adminKeys.gallery });
    qc.invalidateQueries({ queryKey: ["gallery"] });
    qc.invalidateQueries({ queryKey: adminKeys.media });
  };

  const save = useMutation({
    mutationFn: async (item: Partial<GalleryItem> & { id?: string }) => {
      if (useMockCms()) {
        const store = getAdminMockStore();
        if (item.id) {
          const idx = store.gallery.findIndex((g) => g.id === item.id);
          if (idx >= 0) store.gallery[idx] = { ...store.gallery[idx], ...item } as GalleryItem;
        } else {
          store.gallery.push({
            id: mockId("gallery"),
            title: item.title ?? null,
            image_url: item.image_url ?? null,
            video_url: item.video_url ?? null,
            media_type: item.media_type ?? "image",
            category: item.category ?? null,
            album: item.album ?? null,
            sort_order: item.sort_order ?? store.gallery.length,
            is_visible: item.is_visible ?? true,
          });
        }
        return;
      }
      const payload = {
        title: item.title ?? null,
        image_url: item.image_url ?? null,
        video_url: item.video_url ?? null,
        media_type: item.media_type ?? "image",
        category: item.category ?? null,
        album: item.album ?? null,
        sort_order: item.sort_order ?? 0,
        is_visible: item.is_visible !== false,
      };
      if (item.id) {
        const { error } = await supabase.from("gallery").update(payload).eq("id", item.id);
        assertNoError(error);
      } else {
        const { error } = await supabase.from("gallery").insert(payload);
        assertNoError(error);
      }
    },
    onSuccess: invalidate,
  });

  const saveMany = useMutation({
    mutationFn: async (
      items: Array<{
        title?: string | null;
        image_url: string;
        category?: string | null;
        is_visible?: boolean;
      }>
    ) => {
      if (!items.length) return;

      if (useMockCms()) {
        const store = getAdminMockStore();
        const base = store.gallery.length;
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          store.gallery.push({
            id: mockId("gallery"),
            title: item.title ?? null,
            image_url: item.image_url,
            video_url: null,
            media_type: "image",
            category: item.category ?? "trekking",
            album: null,
            sort_order: base + i,
            is_visible: item.is_visible !== false,
          });
        }
        return;
      }

      const { count } = await supabase
        .from("gallery")
        .select("id", { count: "exact", head: true });
      const base = count ?? 0;

      const rows = items.map((item, i) => ({
        title: item.title ?? null,
        image_url: item.image_url,
        video_url: null,
        media_type: "image" as const,
        category: item.category ?? "trekking",
        album: null,
        sort_order: base + i,
        is_visible: item.is_visible !== false,
      }));

      const { error } = await supabase.from("gallery").insert(rows);
      assertNoError(error);
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (useMockCms()) {
        getAdminMockStore().gallery = getAdminMockStore().gallery.filter((g) => g.id !== id);
        return;
      }

      const { data: row, error: fetchError } = await supabase
        .from("gallery")
        .select("id, image_url")
        .eq("id", id)
        .maybeSingle();
      assertNoError(fetchError);

      const { error } = await supabase.from("gallery").delete().eq("id", id);
      assertNoError(error);

      if (row?.image_url) {
        const { deleteStorageByPublicUrls } = await import("@/lib/supabase-storage");
        await deleteStorageByPublicUrls([row.image_url]);
        await supabase.from("media_library").delete().eq("file_url", row.image_url);
      }
    },
    onSuccess: invalidate,
  });

  const removeMany = useMutation({
    mutationFn: async (ids: string[]) => {
      if (!ids.length) return;

      if (useMockCms()) {
        const set = new Set(ids);
        getAdminMockStore().gallery = getAdminMockStore().gallery.filter((g) => !set.has(g.id));
        return;
      }

      const { data: rows, error: fetchError } = await supabase
        .from("gallery")
        .select("id, image_url")
        .in("id", ids);
      assertNoError(fetchError);

      const { error } = await supabase.from("gallery").delete().in("id", ids);
      assertNoError(error);

      const urls = (rows ?? []).map((r) => r.image_url as string | null);
      const { deleteStorageByPublicUrls } = await import("@/lib/supabase-storage");
      await deleteStorageByPublicUrls(urls);

      for (const url of urls) {
        if (!url) continue;
        await supabase.from("media_library").delete().eq("file_url", url);
      }
    },
    onSuccess: invalidate,
  });

  return { save, saveMany, remove, removeMany };
}

export function useAdminReviews() {
  return useQuery({
    queryKey: adminKeys.reviews,
    queryFn: async () => {
      if (useMockCms()) return getAdminMockStore().reviews;
      const { data, error } = await supabase
        .from("reviews")
        .select("*, profile:profiles(*), trip:trips(*)")
        .order("created_at", { ascending: false });
      assertNoError(error);
      return data as Review[];
    },
  });
}

export function useAdminReviewMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: adminKeys.reviews });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ReviewStatus }) => {
      if (useMockCms()) {
        const review = getAdminMockStore().reviews.find((r) => r.id === id);
        if (review) review.status = status;
        return;
      }
      const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
      assertNoError(error);
    },
    onSuccess: invalidate,
  });

  return { updateStatus };
}

export function useAdminTestimonials() {
  return useQuery({
    queryKey: adminKeys.testimonials,
    queryFn: async () => {
      if (useMockCms()) return getAdminMockStore().testimonials;
      const { data, error } = await supabase.from("testimonials").select("*").order("sort_order");
      assertNoError(error);
      return data as Testimonial[];
    },
  });
}

export function useAdminTestimonialMutations() {
  const qc = useQueryClient();
  const invalidate = () => { qc.invalidateQueries({ queryKey: adminKeys.testimonials }); qc.invalidateQueries({ queryKey: ["testimonials"] }); };

  const save = useMutation({
    mutationFn: async (item: Partial<Testimonial> & { id?: string; name: string; content: string }) => {
      if (useMockCms()) {
        const store = getAdminMockStore();
        if (item.id) {
          const idx = store.testimonials.findIndex((t) => t.id === item.id);
          if (idx >= 0) store.testimonials[idx] = { ...store.testimonials[idx], ...item } as Testimonial;
        } else {
          store.testimonials.push({
            id: mockId("testimonial"),
            name: item.name,
            location: item.location ?? null,
            content: item.content,
            rating: item.rating ?? 5,
            image_url: item.image_url ?? null,
            video_url: item.video_url ?? null,
            trip_name: item.trip_name ?? null,
            sort_order: item.sort_order ?? store.testimonials.length,
            is_visible: item.is_visible ?? true,
          });
        }
        return;
      }
      if (item.id) {
        const { error } = await supabase.from("testimonials").update(item).eq("id", item.id);
        assertNoError(error);
      } else {
        const { error } = await supabase.from("testimonials").insert(item);
        assertNoError(error);
      }
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (useMockCms()) {
        getAdminMockStore().testimonials = getAdminMockStore().testimonials.filter((t) => t.id !== id);
        return;
      }
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      assertNoError(error);
    },
    onSuccess: invalidate,
  });

  return { save, remove };
}

export function useAdminFaqs() {
  return useQuery({
    queryKey: adminKeys.faqs,
    queryFn: async () => {
      if (useMockCms()) return getAdminMockStore().faqs;
      const { data, error } = await supabase.from("faq").select("*").order("sort_order");
      assertNoError(error);
      return data as FAQ[];
    },
  });
}

export function useAdminFaqMutations() {
  const qc = useQueryClient();
  const invalidate = () => { qc.invalidateQueries({ queryKey: adminKeys.faqs }); qc.invalidateQueries({ queryKey: ["faqs"] }); };

  const save = useMutation({
    mutationFn: async (item: Partial<FAQ> & { id?: string; question: string; answer: string }) => {
      if (useMockCms()) {
        const store = getAdminMockStore();
        if (item.id) {
          const idx = store.faqs.findIndex((f) => f.id === item.id);
          if (idx >= 0) store.faqs[idx] = { ...store.faqs[idx], ...item } as FAQ;
        } else {
          store.faqs.push({
            id: mockId("faq"),
            question: item.question,
            answer: item.answer,
            category: item.category ?? "general",
            sort_order: item.sort_order ?? store.faqs.length,
            is_visible: item.is_visible ?? true,
          });
        }
        return;
      }
      if (item.id) {
        const { error } = await supabase.from("faq").update(item).eq("id", item.id);
        assertNoError(error);
      } else {
        const { error } = await supabase.from("faq").insert(item);
        assertNoError(error);
      }
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (useMockCms()) {
        getAdminMockStore().faqs = getAdminMockStore().faqs.filter((f) => f.id !== id);
        return;
      }
      const { error } = await supabase.from("faq").delete().eq("id", id);
      assertNoError(error);
    },
    onSuccess: invalidate,
  });

  return { save, remove };
}

export function useAdminCoupons() {
  return useQuery({
    queryKey: adminKeys.coupons,
    queryFn: async () => {
      if (useMockCms()) return getAdminMockStore().coupons;
      const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
      assertNoError(error);
      return data as Coupon[];
    },
  });
}

export function useAdminCouponMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: adminKeys.coupons });

  const save = useMutation({
    mutationFn: async (item: Partial<Coupon> & { id?: string; code: string }) => {
      if (useMockCms()) {
        const store = getAdminMockStore();
        if (item.id) {
          const idx = store.coupons.findIndex((c) => c.id === item.id);
          if (idx >= 0) store.coupons[idx] = { ...store.coupons[idx], ...item } as Coupon;
        } else {
          store.coupons.push({
            id: mockId("coupon"),
            code: item.code.toUpperCase(),
            description: item.description ?? null,
            type: item.type ?? "percentage",
            value: item.value ?? 10,
            min_order_amount: item.min_order_amount ?? null,
            max_discount: item.max_discount ?? null,
            usage_limit: item.usage_limit ?? null,
            usage_count: 0,
            valid_from: item.valid_from ?? new Date().toISOString(),
            valid_until: item.valid_until ?? null,
            is_active: item.is_active ?? true,
            trip_ids: item.trip_ids ?? [],
            created_at: new Date().toISOString(),
          });
        }
        return;
      }
      const payload = { ...item, code: item.code.toUpperCase() };
      if (item.id) {
        const { error } = await supabase.from("coupons").update(payload).eq("id", item.id);
        assertNoError(error);
      } else {
        const { error } = await supabase.from("coupons").insert(payload);
        assertNoError(error);
      }
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (useMockCms()) {
        getAdminMockStore().coupons = getAdminMockStore().coupons.filter((c) => c.id !== id);
        return;
      }
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      assertNoError(error);
    },
    onSuccess: invalidate,
  });

  return { save, remove };
}

export function useAdminNewsletter() {
  return useQuery({
    queryKey: adminKeys.newsletter,
    queryFn: async () => {
      if (useMockCms()) return getAdminMockStore().newsletter;
      const { data, error } = await supabase.from("newsletter").select("*").order("subscribed_at", { ascending: false });
      assertNoError(error);
      return data as NewsletterSubscriber[];
    },
  });
}

export function useAdminContactForms() {
  return useQuery({
    queryKey: adminKeys.contact,
    queryFn: async () => {
      if (useMockCms()) return getAdminMockStore().contactForms;
      const { data, error } = await supabase.from("contact_forms").select("*").order("created_at", { ascending: false });
      assertNoError(error);
      return data as ContactForm[];
    },
  });
}

export function useAdminContactMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: adminKeys.contact });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ContactForm["status"] }) => {
      if (useMockCms()) {
        const form = getAdminMockStore().contactForms.find((f) => f.id === id);
        if (form) form.status = status;
        return;
      }
      const { error } = await supabase.from("contact_forms").update({ status }).eq("id", id);
      assertNoError(error);
    },
    onSuccess: invalidate,
  });

  return { updateStatus };
}

export function useAdminSettings() {
  return useQuery({
    queryKey: adminKeys.settings,
    queryFn: async (): Promise<SiteSettings> => {
      if (useMockCms()) return getAdminMockStore().settings;

      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

      // Permission / empty DB → still open Settings with defaults (editable in mock until grants run)
      if (error) {
        console.warn("Settings load failed, using defaults:", error.message);
        return { ...getAdminMockStore().settings };
      }
      if (!data) return { ...defaultSettings };

      return mapSettingsRow(data as Record<string, unknown>);
    },
  });
}

export function useAdminSettingsMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: adminKeys.settings });
    qc.invalidateQueries({ queryKey: ["settings"] });
  };

  const save = useMutation({
    mutationFn: async (settings: SiteSettings) => {
      if (useMockCms()) {
        getAdminMockStore().settings = settings;
        return;
      }

      const payload = {
        id: 1,
        site_name: settings.site_name,
        logo_url: settings.logo_url,
        favicon_url: settings.favicon_url,
        primary_color: settings.primary_color,
        contact_email: settings.contact_email,
        contact_phone: settings.contact_phone,
        whatsapp: settings.whatsapp,
        address: settings.address,
        social_links: settings.social_links,
        footer_text: settings.footer_text,
        google_analytics_id: settings.google_analytics_id,
        seo_default_title: settings.seo_default_title,
        seo_default_description: settings.seo_default_description,
        payment_razorpay_key: settings.payment_razorpay_key || null,
        home_marquee_text: settings.home_marquee_text || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("settings").upsert(payload, { onConflict: "id" });
      assertNoError(error);
    },
    onSuccess: () => {
      invalidate();
      window.dispatchEvent(new CustomEvent("dgi:settings-updated"));
    },
  });

  return { save };
}

export function useAdminMedia() {
  return useQuery({
    queryKey: adminKeys.media,
    queryFn: async () => {
      if (useMockCms()) return getAdminMockStore().media;
      const { data, error } = await supabase
        .from("media_library")
        .select("*")
        .order("created_at", { ascending: false });
      assertNoError(error);
      return ((data ?? []) as Record<string, unknown>[]).map(mapMediaRow);
    },
  });
}

export function useAdminMediaMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: adminKeys.media });

  const save = useMutation({
    mutationFn: async (item: Omit<MediaItem, "id" | "created_at"> & { id?: string }) => {
      if (useMockCms()) {
        getAdminMockStore().media.unshift({
          id: mockId("media"),
          filename: item.filename,
          url: item.url,
          mime_type: item.mime_type,
          size_bytes: item.size_bytes,
          alt_text: item.alt_text ?? null,
          folder: item.folder ?? null,
          uploaded_by: item.uploaded_by ?? null,
          created_at: new Date().toISOString(),
        });
        return;
      }
      const { error } = await supabase.from("media_library").insert({
        file_name: item.filename,
        file_url: item.url,
        file_type: item.mime_type,
        file_size: item.size_bytes,
        bucket: item.folder,
        alt_text: item.alt_text,
        uploaded_by: item.uploaded_by?.startsWith("local-") ? null : item.uploaded_by,
      });
      assertNoError(error);
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (useMockCms()) {
        getAdminMockStore().media = getAdminMockStore().media.filter((m) => m.id !== id);
        return;
      }

      const { data: row, error: fetchError } = await supabase
        .from("media_library")
        .select("id, file_url, bucket")
        .eq("id", id)
        .maybeSingle();
      assertNoError(fetchError);

      const { error } = await supabase.from("media_library").delete().eq("id", id);
      assertNoError(error);

      if (row?.file_url) {
        const { deleteStorageByPublicUrls } = await import("@/lib/supabase-storage");
        await deleteStorageByPublicUrls([row.file_url as string]);
      }
    },
    onSuccess: invalidate,
  });

  const removeMany = useMutation({
    mutationFn: async (ids: string[]) => {
      if (!ids.length) return;
      if (useMockCms()) {
        const set = new Set(ids);
        getAdminMockStore().media = getAdminMockStore().media.filter((m) => !set.has(m.id));
        return;
      }

      const { data: rows, error: fetchError } = await supabase
        .from("media_library")
        .select("id, file_url")
        .in("id", ids);
      assertNoError(fetchError);

      const { error } = await supabase.from("media_library").delete().in("id", ids);
      assertNoError(error);

      const { deleteStorageByPublicUrls } = await import("@/lib/supabase-storage");
      await deleteStorageByPublicUrls((rows ?? []).map((r) => r.file_url as string));
    },
    onSuccess: invalidate,
  });

  return { save, remove, removeMany };
}

export function useUploadImage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, folder = "uploads" }: { file: File; folder?: string }) => {
      if (useMockCms()) {
        const url = URL.createObjectURL(file);
        const store = getAdminMockStore();
        store.media.unshift({
          id: mockId("media"),
          filename: file.name,
          url,
          mime_type: file.type || "image/jpeg",
          size_bytes: file.size,
          alt_text: file.name,
          folder,
          uploaded_by: null,
          created_at: new Date().toISOString(),
        });
        return { url, path: `${folder}/${file.name}`, bucket: "media" };
      }

      const bucket = resolveStorageBucket(folder);
      const safeName = sanitizeFileName(file.name);
      const path = `${folder.replace(/^\/+|\/+$/g, "")}/${Date.now()}-${safeName}`;

      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "application/octet-stream",
      });
      assertNoError(error);

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);

      // Auto-register in media library so all website uploads show in admin
      await supabase.from("media_library").insert({
        file_name: file.name,
        file_url: data.publicUrl,
        file_type: file.type || "image/jpeg",
        file_size: file.size,
        bucket,
        alt_text: file.name,
      });

      return { url: data.publicUrl, path, bucket };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.media });
    },
  });
}

function mapMediaRow(row: Record<string, unknown>): MediaItem {
  return {
    id: String(row.id),
    filename: String(row.file_name ?? row.filename ?? "file"),
    url: String(row.file_url ?? row.url ?? ""),
    mime_type: String(row.file_type ?? row.mime_type ?? "image/jpeg"),
    size_bytes: Number(row.file_size ?? row.size_bytes ?? 0),
    alt_text: (row.alt_text as string | null) ?? null,
    folder: (row.bucket as string | null) ?? (row.folder as string | null) ?? null,
    uploaded_by: (row.uploaded_by as string | null) ?? null,
    created_at: String(row.created_at ?? new Date().toISOString()),
  };
}

function sanitizeFileName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "");
}

/** Map admin upload folders to the correct public storage buckets */
function resolveStorageBucket(folder: string) {
  const root = folder.split("/")[0]?.toLowerCase() ?? "uploads";
  const map: Record<string, string> = {
    hero: "hero-images",
    branding: "media",
    destinations: "destination-images",
    trips: "trip-images",
    gallery: "gallery-images",
    blogs: "blog-images",
    blog: "blog-images",
    highlights: "media",
    media: "media",
    uploads: "media",
    avatars: "avatars",
  };
  return map[root] ?? "media";
}

