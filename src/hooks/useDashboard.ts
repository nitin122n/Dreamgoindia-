import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { Booking, WishlistItem, Notification, Review, Profile } from "@/types";

export function useBookings() {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ["bookings", userId ?? "anon"],
    enabled: Boolean(userId && isSupabaseConfigured),
    queryFn: async (): Promise<Booking[]> => {
      if (!userId || !isSupabaseConfigured) return [];

      const { data, error } = await supabase
        .from("bookings")
        .select("*, trip:trips(*, trip_images(*)), departure:trip_departures(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Bookings fetch failed:", error.message);
        return [];
      }
      return (data ?? []) as Booking[];
    },
  });
}

export function useWishlist() {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ["wishlist", userId ?? "anon"],
    enabled: Boolean(userId && isSupabaseConfigured),
    queryFn: async (): Promise<WishlistItem[]> => {
      if (!userId || !isSupabaseConfigured) return [];

      const { data, error } = await supabase
        .from("wishlist")
        .select("*, trip:trips(*, trip_images(*))")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Wishlist fetch failed:", error.message);
        return [];
      }
      return (data ?? []) as WishlistItem[];
    },
  });
}

export function useNotifications() {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications", userId ?? "anon"],
    enabled: Boolean(userId && isSupabaseConfigured),
    queryFn: async (): Promise<Notification[]> => {
      if (!userId || !isSupabaseConfigured) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Notifications fetch failed:", error.message);
        return [];
      }
      return (data ?? []) as Notification[];
    },
  });

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!userId || !isSupabaseConfigured) return;
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("user_id", userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!userId || !isSupabaseConfigured) return;
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    },
  });

  const unreadCount = query.data?.filter((n) => !n.is_read).length ?? 0;

  return { ...query, markAsRead, markAllAsRead, unreadCount };
}

export function useUserReviews() {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ["user-reviews", userId ?? "anon"],
    enabled: Boolean(userId && isSupabaseConfigured),
    queryFn: async (): Promise<Review[]> => {
      if (!userId || !isSupabaseConfigured) return [];

      const { data, error } = await supabase
        .from("reviews")
        .select("*, trip:trips(*, trip_images(*))")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("User reviews fetch failed:", error.message);
        return [];
      }
      return (data ?? []) as Review[];
    },
  });
}

export function useRemoveFromWishlist() {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (wishlistId: string) => {
      if (!userId || !isSupabaseConfigured) return;
      await supabase.from("wishlist").delete().eq("id", wishlistId).eq("user_id", userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist", userId] });
    },
  });
}

export function useUpdateProfile() {
  const { user, refreshProfile } = useAuth();
  const userId = user?.id;

  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!userId || !isSupabaseConfigured) {
        throw new Error("Sign in required to update profile");
      }

      const { data, error } = await supabase
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      return data as Profile;
    },
    onSuccess: async () => {
      await refreshProfile();
    },
  });
}

export function useSubmitReview() {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (review: {
      trip_id: string;
      rating: number;
      title: string;
      content: string;
      images: string[];
    }) => {
      if (!userId || !isSupabaseConfigured) {
        throw new Error("Sign in required to submit a review");
      }

      const payload = {
        ...review,
        user_id: userId,
        status: "pending" as const,
        is_featured: false,
        video_url: null,
      };

      const { data, error } = await supabase.from("reviews").insert(payload).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-reviews", userId] });
    },
  });
}
