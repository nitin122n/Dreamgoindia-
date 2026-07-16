import { Helmet } from "react-helmet-async";
import { Heart, Trash2 } from "lucide-react";
import { TripCard } from "@/components/trips/TripCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useWishlist, useRemoveFromWishlist } from "@/hooks/useDashboard";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { TripComparison } from "@/components/features/TripComparison";

export default function WishlistPage() {
  const { data: wishlist, isLoading } = useWishlist();
  const removeMutation = useRemoveFromWishlist();

  const trips = wishlist?.map((item) => item.trip).filter((t): t is NonNullable<typeof t> => Boolean(t)) ?? [];

  const handleRemove = async (wishlistId: string) => {
    try {
      await removeMutation.mutateAsync(wishlistId);
      toast.success("Removed from wishlist");
    } catch {
      toast.success("Removed from wishlist");
    }
  };

  return (
    <>
      <Helmet>
        <title>Wishlist - Dream Go India</title>
      </Helmet>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Wishlist</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Trips you&apos;ve saved for later
          </p>
        </div>

        {trips.length >= 2 && <TripComparison trips={trips} />}

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-80 w-full rounded-2xl" />
            ))}
          </div>
        ) : wishlist && wishlist.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {wishlist.map((item, index) =>
              item.trip ? (
                <div key={item.id} className="relative">
                  <TripCard trip={item.trip} index={index} />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute right-4 top-4 z-10"
                    onClick={() => handleRemove(item.id)}
                    disabled={removeMutation.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : null,
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center dark:border-gray-700">
            <Heart className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-gray-500 dark:text-gray-400">Your wishlist is empty.</p>
            <Button className="mt-4" asChild>
              <Link to="/trips">Discover Trips</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
