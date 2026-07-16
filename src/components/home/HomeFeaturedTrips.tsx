import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { HomeTripCard } from "@/components/trips/HomeTripCard";
import { useTrips } from "@/hooks/useCMS";
import { filterHomepageTreks } from "@/lib/trip-filters";
import { cn } from "@/lib/utils";

const TREK_TABS = [
  { slug: "winter" as const, label: "Winter", hint: "Best: December – March" },
  { slug: "summer" as const, label: "Summer", hint: "Best: April – June" },
  { slug: "monsoon" as const, label: "Monsoon", hint: "Best: July – September" },
  { slug: "dham" as const, label: "Char Dham", hint: "Best: May – October" },
];

type TrekTab = (typeof TREK_TABS)[number]["slug"];

/** Treks section — ongoing packages from admin (visible trips by season / type) */
export function HomeFeaturedTrips() {
  const [activeTab, setActiveTab] = useState<TrekTab>("winter");
  const { data: allTrips = [], isLoading } = useTrips();

  const trips = useMemo(
    () => filterHomepageTreks(allTrips, activeTab),
    [allTrips, activeTab]
  );

  const activeHint = TREK_TABS.find((t) => t.slug === activeTab)?.hint ?? "";
  const viewAllHref =
    activeTab === "dham"
      ? "/trips?type=dham"
      : `/trips?type=trek&season=${activeTab}`;

  return (
    <section className="bg-white py-8 dark:bg-gray-950 lg:py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">Treks</h2>
          <p className="text-xs text-gray-500 sm:text-sm">{activeHint}</p>
        </div>

        <div className="mb-4 flex rounded-full bg-gray-50 p-1 premium-shadow dark:bg-gray-800">
          {TREK_TABS.map((tab) => (
            <button
              key={tab.slug}
              type="button"
              onClick={() => setActiveTab(tab.slug)}
              className={cn(
                "flex-1 rounded-full py-2.5 text-sm font-semibold transition-all duration-200",
                activeTab === tab.slug
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mb-4 flex justify-end">
          <Link
            to={viewAllHref}
            className="flex items-center gap-0.5 text-sm font-semibold text-primary hover:underline"
          >
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {trips.slice(0, 8).map((trip, i) => (
                <HomeTripCard key={trip.id} trip={trip} index={i} />
              ))}
            </div>

            {trips.length === 0 && (
              <p className="py-10 text-center text-gray-500">
                No ongoing packages in this category yet. Add them from Admin → Trips.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
