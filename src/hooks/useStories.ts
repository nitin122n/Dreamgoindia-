import { useQuery } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { TravelStory } from "@/types/highlight";
import { highlightKeys } from "@/hooks/useHighlights";

export function useStories(highlightId: string | null) {
  return useQuery({
    queryKey: highlightKeys.stories(highlightId ?? "none"),
    queryFn: async (): Promise<TravelStory[]> => {
      if (!isSupabaseConfigured || !highlightId) return [];

      const { data, error } = await supabase
        .from("travel_stories")
        .select("*")
        .eq("highlight_id", highlightId)
        .order("display_order", { ascending: true });

      if (error) {
        console.warn("travel_stories fetch failed:", error.message);
        return [];
      }

      return (data ?? []).map((row) => ({
        id: String(row.id),
        highlight_id: String(row.highlight_id),
        image_url: String(row.image_url ?? ""),
        caption: row.caption != null ? String(row.caption) : null,
        display_order: Number(row.display_order ?? 0),
        created_at: row.created_at ? String(row.created_at) : undefined,
      }));
    },
    enabled: Boolean(isSupabaseConfigured && highlightId),
    staleTime: 60_000,
  });
}
