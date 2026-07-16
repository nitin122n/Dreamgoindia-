import { Link } from "react-router-dom";
import { MapPin, Clock, Star, Heart, Eye } from "lucide-react";
import { motion } from "framer-motion";
import type { Trip } from "@/types";
import { formatPrice, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface TripCardProps {
  trip: Trip;
  index?: number;
}

export function TripCard({ trip, index = 0 }: TripCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const coverImage =
    trip.trip_images?.find((img) => img.is_cover)?.image_url ||
    trip.trip_images?.[0]?.image_url ||
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80";

  const displayPrice = trip.discount_price ?? trip.price;
  const hasDiscount = trip.discount_price && trip.discount_price < trip.price;

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/auth/login");
      return;
    }
    if (isSupabaseConfigured) {
      const { error } = await supabase.from("wishlist").insert({ user_id: user.id, trip_id: trip.id });
      if (error) toast.error("Already in wishlist");
      else toast.success("Added to wishlist!");
    } else {
      toast.success("Added to wishlist!");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/trips/${trip.slug}`} className="group block">
        <div className="overflow-hidden rounded-2xl bg-white premium-shadow transition-all duration-300 hover:premium-shadow-lg hover:-translate-y-1">
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={coverImage}
              alt={trip.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            {hasDiscount && (
              <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-white">
                {Math.round(((trip.price - trip.discount_price!) / trip.price) * 100)}% OFF
              </span>
            )}
            <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={handleWishlist}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 hover:text-primary"
              >
                <Heart className="h-4 w-4" />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 hover:text-primary">
                <Eye className="h-4 w-4" />
              </button>
            </div>
            {trip.seats_left <= 5 && (
              <span className="absolute bottom-3 left-3 rounded-full bg-orange-500 px-2.5 py-1 text-xs font-bold text-white">
                Only {trip.seats_left} seats left
              </span>
            )}
          </div>

          <div className="p-4">
            <h3 className="mb-2 font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
              {trip.title}
            </h3>
            <div className="mb-2 flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">{trip.location}</span>
            </div>
            <div className="mb-3 flex items-center gap-1 text-sm text-gray-500">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>{trip.duration_days} Days / {trip.duration_nights} Nights</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-primary">{formatPrice(displayPrice)}</span>
                <span className="text-xs text-gray-500"> / person</span>
                {hasDiscount && (
                  <span className="ml-2 text-sm text-gray-400 line-through">{formatPrice(trip.price)}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold">{trip.rating}</span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                trip.difficulty === "easy" && "bg-green-100 text-green-700",
                trip.difficulty === "moderate" && "bg-yellow-100 text-yellow-700",
                trip.difficulty === "difficult" && "bg-orange-100 text-orange-700",
                trip.difficulty === "extreme" && "bg-red-100 text-red-700",
              )}>
                {trip.difficulty}
              </span>
              <Button size="sm" onClick={(e) => { e.preventDefault(); navigate(`/trips/${trip.slug}/book`); }}>
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
