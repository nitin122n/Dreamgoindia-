import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { SEO } from "@/components/common/SEO";
import { PageHero } from "@/components/common/PageHero";
import { Skeleton } from "@/components/ui/skeleton";
import { useDestinations } from "@/hooks/useCMS";

export default function DestinationsPage() {
  const { data: destinations, isLoading } = useDestinations();

  return (
    <>
      <SEO
        title="Destinations"
        description="Explore breathtaking destinations across India with Dream Go India."
      />

      <PageHero
        title="Our Destinations"
        subtitle="From snow-capped peaks to serene valleys — discover India's most beautiful places."
        breadcrumbs={[{ label: "Destinations" }]}
      />

      <section className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destinations?.map((dest, i) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/destinations/${dest.slug}`} className="group block">
                  <div className="relative overflow-hidden rounded-2xl premium-shadow transition-all hover:-translate-y-1 hover:premium-shadow-lg">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={dest.image_url ?? ""}
                        alt={dest.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-xl font-bold text-white group-hover:text-primary-light transition-colors">
                        {dest.name}
                      </h3>
                      <p className="mt-1 flex items-center gap-1 text-sm text-white/80">
                        <MapPin className="h-3.5 w-3.5" />
                        {dest.state}, {dest.country}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
