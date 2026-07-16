import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useUpcomingDepartures } from "@/hooks/useCMS";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function UpcomingDepartures() {
  const { data: departures = [] } = useUpcomingDepartures();

  if (departures.length === 0) return null;

  return (
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 lg:text-3xl">Upcoming Departures</h2>
          <p className="mt-2 text-gray-500">Don't miss these scheduled adventures</p>
        </div>

        <div className="relative">
          <div className="absolute left-8 top-0 hidden h-full w-0.5 bg-primary/20 lg:block" />
          <div className="space-y-6">
            {departures.map((dep, i) => (
              <motion.div
                key={dep.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative lg:pl-20"
              >
                <div className="absolute left-6 top-6 hidden h-4 w-4 rounded-full border-4 border-primary bg-white lg:block" />
                <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 premium-shadow sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{dep.trip?.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-primary" />
                        {format(new Date(dep.departure_date), "MMM dd, yyyy")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-primary" />
                        {dep.seats_available} seats left
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(dep.price_override ?? dep.trip?.price ?? 0)}
                    </span>
                    <Button asChild>
                      <Link to={`/trips/${dep.trip?.slug}/book`}>Book Now</Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
