import { Link } from "react-router-dom";
import { MapPin, Clock, Star } from "lucide-react";
import { motion } from "framer-motion";
import type { Trip } from "@/types";
import { formatPrice } from "@/lib/utils";

interface HomeTripCardProps {
  trip: Trip;
  index?: number;
}

/** Compact trip card matching the home page reference design */
export function HomeTripCard({ trip, index = 0 }: HomeTripCardProps) {
  const coverImage =
    trip.trip_images?.find((img) => img.is_cover)?.image_url ||
    trip.trip_images?.[0]?.image_url ||
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80";

  const displayPrice = trip.discount_price ?? trip.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/trips/${trip.slug}`} className="group block">
        <div className="overflow-hidden rounded-2xl bg-white premium-shadow transition-shadow hover:premium-shadow-lg">
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={coverImage}
              alt={trip.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <div className="p-3">
            <h3 className="mb-1.5 text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-primary">
              {trip.title}
            </h3>
            <div className="mb-1 flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="line-clamp-1">{trip.location}</span>
            </div>
            <div className="mb-2 flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3 shrink-0" />
              <span>
                {trip.duration_days} Days / {trip.duration_nights} Nights
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-primary">{formatPrice(displayPrice)}</span>
                <span className="text-[10px] text-gray-500"> / person</span>
              </div>
              <div className="flex items-center gap-0.5">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-semibold text-gray-700">{trip.rating}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
