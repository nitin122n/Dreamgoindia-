import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { TripCard } from "@/components/trips/TripCard";
import { Button } from "@/components/ui/button";
import { useTrips } from "@/hooks/useCMS";

export function FeaturedTripsPreview() {
  const { data: trips = [] } = useTrips({ featured: true });
  const preview = trips.slice(0, 4);

  if (preview.length === 0) return null;

  return (
    <section className="bg-gray-50 py-12 dark:bg-gray-900 lg:py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white lg:text-3xl">
              Featured Trips
            </h2>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Handpicked adventures for your next journey
            </p>
          </div>
          <Link
            to="/trips/packages"
            className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline sm:flex"
          >
            Browse by category <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {preview.map((trip, i) => (
            <TripCard key={trip.id} trip={trip} index={i} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Button asChild variant="outline">
            <Link to="/trips">View All Trips</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
