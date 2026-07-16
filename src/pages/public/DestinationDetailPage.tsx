import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Cloud, Thermometer, Wind } from "lucide-react";
import { SEO } from "@/components/common/SEO";
import { LocationMap } from "@/components/common/LocationMap";
import { TripCard } from "@/components/trips/TripCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useDestination, useTripsByDestination } from "@/hooks/useCMS";

export default function DestinationDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: destination, isLoading } = useDestination(slug ?? "");
  const { data: trips, isLoading: tripsLoading } = useTripsByDestination(destination?.id ?? "");

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Skeleton className="mb-8 h-80 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Destination not found</h1>
        <Link to="/destinations" className="mt-4 inline-block text-primary hover:underline">
          Browse destinations
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={destination.seo_title ?? destination.name}
        description={destination.seo_description ?? destination.short_description ?? undefined}
        image={destination.cover_image_url ?? destination.image_url ?? undefined}
      />

      <section className="relative h-[40vh] min-h-[320px]">
        <img
          src={destination.cover_image_url ?? destination.image_url ?? ""}
          alt={destination.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto px-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-white md:text-5xl"
            >
              {destination.name}
            </motion.h1>
            <p className="mt-2 flex items-center gap-2 text-white/90">
              <MapPin className="h-4 w-4" />
              {destination.state}, {destination.country}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <section>
              <h2 className="mb-4 text-2xl font-bold">About {destination.name}</h2>
              <p className="leading-relaxed text-gray-600">
                {destination.description ??
                  `Discover the beauty of ${destination.name}, one of India's most sought-after travel destinations. From breathtaking landscapes to rich cultural heritage, this destination offers unforgettable experiences for every traveler.`}
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold">Location</h2>
              <LocationMap
                label={[destination.name, destination.state, destination.country]
                  .filter(Boolean)
                  .join(", ")}
                lat={destination.map_lat}
                lng={destination.map_lng}
              />
            </section>

            {/* Packages */}
            <section>
              <h2 className="mb-6 text-2xl font-bold">Available Packages</h2>
              {tripsLoading ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-80 rounded-2xl" />
                  ))}
                </div>
              ) : trips && trips.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  {trips.map((trip, i) => (
                    <TripCard key={trip.id} trip={trip} index={i} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No packages available for this destination yet.</p>
              )}
            </section>
          </div>

          {/* Weather widget placeholder */}
          <aside>
            <div className="sticky top-24 rounded-2xl bg-white p-6 premium-shadow">
              <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
                <Cloud className="h-5 w-5 text-primary" />
                Weather
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-blue-50 p-4">
                  <div className="flex items-center gap-3">
                    <Thermometer className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">18°C</p>
                      <p className="text-xs text-gray-500">Current</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Partly Cloudy</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {["Mon", "Tue", "Wed"].map((day, i) => (
                    <div key={day} className="rounded-lg bg-gray-50 p-3">
                      <p className="font-medium">{day}</p>
                      <Wind className="mx-auto my-1 h-4 w-4 text-gray-400" />
                      <p>{16 + i}°C</p>
                    </div>
                  ))}
                </div>
                {destination.best_season && (
                  <p className="text-sm text-gray-500">
                    Best season: <strong>{destination.best_season}</strong>
                  </p>
                )}
                {destination.altitude && (
                  <p className="text-sm text-gray-500">
                    Altitude: <strong>{destination.altitude}</strong>
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
