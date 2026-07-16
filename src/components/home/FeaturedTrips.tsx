import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { TripCard } from "@/components/trips/TripCard";
import { useTripCategories, useTrips } from "@/hooks/useCMS";
import { cn } from "@/lib/utils";

export function FeaturedTrips() {
  const { data: categories = [] } = useTripCategories();
  const [activeCategory, setActiveCategory] = useState("");
  const { data: trips = [] } = useTrips({ category: activeCategory || undefined });

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].slug);
    }
  }, [categories, activeCategory]);

  if (categories.length === 0) return null;

  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 lg:text-3xl">Featured Trips</h2>
          <Link
            to={`/trips?category=${activeCategory}`}
            className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Category pills — evenly aligned, horizontal scroll on mobile */}
        <div className="mb-8 -mx-4 px-4 lg:mx-0 lg:px-0">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.slug)}
                className={cn(
                  "shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200",
                  activeCategory === cat.slug
                    ? "bg-primary text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Trip grid */}
        {trips.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {trips.slice(0, 8).map((trip, i) => (
              <TripCard key={trip.id} trip={trip} index={i} />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-gray-500">
            No trips available in this category yet.
          </p>
        )}
      </div>
    </section>
  );
}
