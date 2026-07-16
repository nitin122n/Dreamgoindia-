import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { TravelHighlight } from "@/types/highlight";

export const highlightKeys = {
  all: ["travel-highlights"] as const,
  stories: (highlightId: string) => ["travel-stories", highlightId] as const,
};

export function useHighlights() {
  return useQuery({
    queryKey: highlightKeys.all,
    queryFn: async (): Promise<TravelHighlight[]> => {
      if (!isSupabaseConfigured) return [];

      const { data, error } = await supabase
        .from("travel_highlights")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) {
        console.warn("travel_highlights fetch failed:", error.message);
        return [];
      }

      return (data ?? []).map((row) => ({
        id: String(row.id),
        title: String(row.title ?? ""),
        cover_image: String(row.cover_image ?? ""),
        display_order: Number(row.display_order ?? 0),
        is_active: row.is_active !== false,
        created_at: row.created_at ? String(row.created_at) : undefined,
      }));
    },
    staleTime: 60_000,
    enabled: isSupabaseConfigured,
  });
}
