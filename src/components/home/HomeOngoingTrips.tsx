import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { HomeTripCard } from "@/components/trips/HomeTripCard";
import { useOngoingTrips } from "@/hooks/useCMS";

/** Homepage “Ongoing Trip” section — managed from Admin → Ongoing Trips */
export function HomeOngoingTrips() {
  const { data: trips = [], isLoading } = useOngoingTrips();

  return (
    <section className="bg-gray-50 py-8 dark:bg-gray-900 lg:py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
            Ongoing Trip
          </h2>
          <Link
            to="/trips?ongoing=1"
            className="flex items-center gap-0.5 text-sm font-semibold text-primary hover:underline"
          >
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Currently running adventures — book your seat before batches fill up.
        </p>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="aspect-[4/3] animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <p className="py-10 text-center text-gray-500">
            No ongoing trips yet. Add them from Admin → Ongoing Trips.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {trips.slice(0, 8).map((trip, i) => (
              <HomeTripCard key={trip.id} trip={trip} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
