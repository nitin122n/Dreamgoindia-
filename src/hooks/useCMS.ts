import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  mockWhyChooseUs,
  mockDepartures,
  mockPages,
  mockFaqs,
} from "@/data/mock-data";
import { getAdminMockStore } from "@/lib/admin-mock-store";
import { useMockCms } from "@/lib/cms-mode";
import type { Trip } from "@/types";

/** Offline / missing-env fallback only */
function store() {
  return getAdminMockStore();
}

/** Public travel highlights — see `@/hooks/useHighlights` */
export { useHighlights } from "@/hooks/useHighlights";

export function useHeroSlides() {
  return useQuery({
    queryKey: ["hero-slides"],
    queryFn: async () => {
      if (useMockCms()) {
        return store()
          .heroSlides.filter((s) => s.is_visible !== false)
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      }
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useDestinations(featured = false) {
  return useQuery({
    queryKey: ["destinations", featured],
    queryFn: async () => {
      if (useMockCms()) {
        let list = store().destinations.filter((d) => d.is_visible !== false);
        if (featured) list = list.filter((d) => d.is_featured);
        return list;
      }
      let query = supabase.from("destinations").select("*").eq("is_visible", true).order("sort_order");
      if (featured) query = query.eq("is_featured", true);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useDestination(slug: string) {
  return useQuery({
    queryKey: ["destination", slug],
    queryFn: async () => {
      if (useMockCms()) return store().destinations.find((d) => d.slug === slug) ?? null;
      const { data, error } = await supabase.from("destinations").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}

export function useTripCategories() {
  return useQuery({
    queryKey: ["trip-categories"],
    queryFn: async () => {
      if (useMockCms()) {
        return store().categories.filter((c) => c.is_visible !== false);
      }
      const { data, error } = await supabase
        .from("trip_categories")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTrips(filters?: {
  category?: string;
  featured?: boolean;
  season?: string;
  tripType?: "trek" | "dham";
  ongoing?: boolean;
}) {
  return useQuery({
    queryKey: ["trips", filters],
    queryFn: async () => {
      if (useMockCms()) {
        let trips = store().trips.filter((t) => t.is_visible !== false);
        if (filters?.category) {
          trips = trips.filter((t) => t.category_id === filters.category || t.season === filters.category);
        }
        if (filters?.season) {
          trips = trips.filter((t) => t.season === filters.season);
        }
        if (filters?.tripType) {
          trips = trips.filter((t) => t.trip_type === filters.tripType);
        }
        if (filters?.featured) trips = trips.filter((t) => t.is_featured);
        if (filters?.ongoing) trips = trips.filter((t) => t.is_popular);
        return trips;
      }

      let query = supabase
        .from("trips")
        .select("*, trip_images(*), destination:destinations(*), category:trip_categories(*)")
        .eq("is_visible", true);

      if (filters?.featured) query = query.eq("is_featured", true);
      if (filters?.ongoing) query = query.eq("is_popular", true);
      if (filters?.season) query = query.eq("season", filters.season);

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;

      let result = (data as Trip[]) ?? [];
      if (filters?.category) {
        result = result.filter(
          (t) => t.category?.slug === filters.category || t.season === filters.category
        );
      }
      if (filters?.tripType) {
        result = result.filter((t) => t.trip_type === filters.tripType);
      }
      return result;
    },
  });
}

/** Trips marked for the homepage “Ongoing Trip” section (`is_popular`) */
export function useOngoingTrips() {
  return useTrips({ ongoing: true });
}

export function useTrip(slug: string) {
  return useQuery({
    queryKey: ["trip", slug],
    queryFn: async () => {
      if (useMockCms()) return store().trips.find((t) => t.slug === slug) ?? null;
      const { data, error } = await supabase
        .from("trips")
        .select("*, trip_images(*), destination:destinations(*), category:trip_categories(*)")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data as Trip | null;
    },
    enabled: !!slug,
  });
}

export function useUpcomingDepartures() {
  return useQuery({
    queryKey: ["departures"],
    queryFn: async () => {
      if (useMockCms()) return mockDepartures;
      const { data, error } = await supabase
        .from("trip_departures")
        .select("*, trip:trips(*, trip_images(*))")
        .eq("is_active", true)
        .gte("departure_date", new Date().toISOString().split("T")[0])
        .order("departure_date")
        .limit(6);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTestimonials() {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      if (useMockCms()) {
        return store().testimonials.filter((t) => t.is_visible !== false);
      }
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useWhyChooseUs() {
  return useQuery({
    queryKey: ["why-choose-us"],
    queryFn: async () => {
      if (useMockCms()) return mockWhyChooseUs;
      const { data, error } = await supabase
        .from("why_choose_us")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useGallery(category?: string) {
  return useQuery({
    queryKey: ["gallery", category],
    queryFn: async () => {
      if (useMockCms()) {
        const items = store().gallery.filter((g) => g.is_visible !== false);
        return category ? items.filter((g) => g.category === category) : items;
      }
      let query = supabase.from("gallery").select("*").eq("is_visible", true).order("sort_order");
      if (category) query = query.eq("category", category);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useBlogs(featured = false) {
  return useQuery({
    queryKey: ["blogs", featured],
    queryFn: async () => {
      if (useMockCms()) {
        let blogs = store().blogs.filter((b) => b.status === "published");
        if (featured) blogs = blogs.filter((b) => b.is_featured);
        return blogs;
      }
      let query = supabase
        .from("blogs")
        .select("*, blog_category:blog_categories(*)")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (featured) query = query.eq("is_featured", true);
      const { data, error } = await query.limit(featured ? 3 : 12);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSearchTrips(query: string) {
  return useQuery({
    queryKey: ["search-trips", query],
    queryFn: async () => {
      if (!query.trim()) return [];
      if (useMockCms()) {
        const q = query.toLowerCase();
        return store().trips.filter(
          (t) =>
            t.is_visible !== false &&
            (t.title.toLowerCase().includes(q) || t.location?.toLowerCase().includes(q))
        );
      }
      const { data, error } = await supabase
        .from("trips")
        .select("*, trip_images(*)")
        .eq("is_visible", true)
        .or(`title.ilike.%${query}%,location.ilike.%${query}%`)
        .limit(10);
      if (error) throw error;
      return (data as Trip[]) ?? [];
    },
    enabled: query.length >= 2,
  });
}

export function useFAQs(category?: string) {
  return useQuery({
    queryKey: ["faqs", category],
    queryFn: async () => {
      if (useMockCms()) {
        const faqs = store().faqs.filter((f) => f.is_visible !== false);
        const list = faqs.length ? faqs : mockFaqs;
        return category ? list.filter((f) => f.category === category) : list;
      }
      let query = supabase.from("faq").select("*").eq("is_visible", true).order("sort_order");
      if (category) query = query.eq("category", category);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useBlog(slug: string) {
  return useQuery({
    queryKey: ["blog", slug],
    queryFn: async () => {
      if (useMockCms()) {
        return store().blogs.find((b) => b.slug === slug && b.status === "published") ?? null;
      }
      const { data, error } = await supabase
        .from("blogs")
        .select("*, blog_category:blog_categories(*)")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}

export function usePage(slug: string) {
  return useQuery({
    queryKey: ["page", slug],
    queryFn: async () => {
      if (useMockCms()) return mockPages.find((p) => p.slug === slug) ?? null;
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}

export function useTripsByDestination(destinationId: string) {
  return useQuery({
    queryKey: ["trips-by-destination", destinationId],
    queryFn: async () => {
      if (useMockCms()) {
        return store().trips.filter(
          (t) => t.destination_id === destinationId && t.is_visible !== false
        );
      }
      const { data, error } = await supabase
        .from("trips")
        .select("*, trip_images(*)")
        .eq("destination_id", destinationId)
        .eq("is_visible", true);
      if (error) throw error;
      return (data as Trip[]) ?? [];
    },
    enabled: !!destinationId,
  });
}
