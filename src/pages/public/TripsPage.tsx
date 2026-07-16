import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { SEO } from "@/components/common/SEO";
import { PageHero } from "@/components/common/PageHero";
import { TripCard } from "@/components/trips/TripCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrips, useTripCategories } from "@/hooks/useCMS";
import { useDebounce } from "@/hooks/useDebounce";
import type { Trip } from "@/types";

export default function TripsPage() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [season, setSeason] = useState<string>(searchParams.get("season") ?? "all");
  const [tripType, setTripType] = useState<string>(searchParams.get("type") ?? "all");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [duration, setDuration] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const ongoingOnly = searchParams.get("ongoing") === "1";
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const urlSeason = searchParams.get("season");
    const urlType = searchParams.get("type");
    if (urlSeason) setSeason(urlSeason);
    if (urlType) setTripType(urlType);
  }, [searchParams]);

  const { data: trips, isLoading } = useTrips(ongoingOnly ? { ongoing: true } : undefined);
  const { data: categories } = useTripCategories();

  const filteredTrips = useMemo(() => {
    if (!trips) return [];
    return trips.filter((trip: Trip) => {
      const q = debouncedSearch.toLowerCase();
      const matchesSearch =
        !q ||
        trip.title.toLowerCase().includes(q) ||
        trip.location?.toLowerCase().includes(q);
      const matchesSeason = season === "all" || trip.season === season;
      const matchesType = tripType === "all" || trip.trip_type === tripType;
      const matchesDifficulty = difficulty === "all" || trip.difficulty === difficulty;
      const matchesDuration =
        duration === "all" ||
        (duration === "short" && trip.duration_days <= 4) ||
        (duration === "medium" && trip.duration_days >= 5 && trip.duration_days <= 7) ||
        (duration === "long" && trip.duration_days > 7);
      const price = trip.discount_price ?? trip.price;
      const matchesPrice =
        priceRange === "all" ||
        (priceRange === "budget" && price < 8000) ||
        (priceRange === "mid" && price >= 8000 && price < 12000) ||
        (priceRange === "premium" && price >= 12000);
      return matchesSearch && matchesSeason && matchesType && matchesDifficulty && matchesDuration && matchesPrice;
    });
  }, [trips, debouncedSearch, season, tripType, difficulty, duration, priceRange]);

  const clearFilters = () => {
    setSeason("all");
    setTripType("all");
    setDifficulty("all");
    setDuration("all");
    setPriceRange("all");
    setSearch("");
  };

  const hasActiveFilters =
    season !== "all" || tripType !== "all" || difficulty !== "all" || duration !== "all" || priceRange !== "all";

  return (
    <>
      <SEO
        title="All Trips"
        description="Browse premium treks, tours and adventures across India with Dream Go India."
      />

      <PageHero
        title="Explore Our Trips"
        subtitle="Handpicked treks, tours, and adventures across the Himalayas and beyond."
        breadcrumbs={[{ label: "Trips" }]}
      />

      <section className="container mx-auto px-4 py-10">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search trips by name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <aside
            className={`lg:w-64 lg:block ${showFilters ? "block" : "hidden"}`}
          >
            <div className="rounded-2xl bg-white p-6 premium-shadow">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Filters</h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-primary hover:underline">
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Season</label>
                  <Select value={season} onValueChange={setSeason}>
                    <SelectTrigger>
                      <SelectValue placeholder="All seasons" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Seasons</SelectItem>
                      {categories?.map((c) => (
                        <SelectItem key={c.id} value={c.season}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Type</label>
                  <Select value={tripType} onValueChange={setTripType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="trek">Treks</SelectItem>
                      <SelectItem value="dham">Dham Yatra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Difficulty</label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="difficult">Difficult</SelectItem>
                      <SelectItem value="extreme">Extreme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Duration</label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Duration</SelectItem>
                      <SelectItem value="short">1-4 Days</SelectItem>
                      <SelectItem value="medium">5-7 Days</SelectItem>
                      <SelectItem value="long">8+ Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Price Range</label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any price" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Price</SelectItem>
                      <SelectItem value="budget">Under ₹8,000</SelectItem>
                      <SelectItem value="mid">₹8,000 - ₹12,000</SelectItem>
                      <SelectItem value="premium">Above ₹12,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <p className="mb-6 text-sm text-gray-500">
              {filteredTrips.length} trip{filteredTrips.length !== 1 ? "s" : ""} found
            </p>

            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-80 rounded-2xl" />
                ))}
              </div>
            ) : filteredTrips.length === 0 ? (
              <div className="rounded-2xl bg-white p-12 text-center premium-shadow">
                <X className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <h3 className="text-lg font-bold text-gray-900">No trips found</h3>
                <p className="mt-2 text-sm text-gray-500">Try adjusting your filters or search</p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredTrips.map((trip, i) => (
                  <TripCard key={trip.id} trip={trip} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
