import { motion } from "framer-motion";
import {
  Mountain,
  Zap,
  Heart,
  Map,
  Users,
  Building2,
  Bus,
  Compass,
  Tent,
} from "lucide-react";
import { SEO } from "@/components/common/SEO";
import { PageHero } from "@/components/common/PageHero";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { mockServices } from "@/data/mock-data";

const ICON_MAP: Record<string, React.ElementType> = {
  mountain: Mountain,
  zap: Zap,
  heart: Heart,
  map: Map,
  users: Users,
  building: Building2,
  bus: Bus,
  compass: Compass,
  tent: Tent,
};

export default function ServicesPage() {
  return (
    <>
      <SEO
        title="Our Services"
        description="Trekking tours, adventure trips, pilgrimage packages, customized tours, corporate trips, hotel booking, transport, and trek support by Dream Go India."
      />

      <PageHero
        title="Services & Products"
        subtitle="End-to-end travel solutions for solo travelers, families, couples, and groups across India."
        breadcrumbs={[{ label: "Services" }]}
      />

      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockServices.map((service, i) => {
            const Icon = ICON_MAP[service.icon] ?? Mountain;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="h-full transition-all hover:-translate-y-1 hover:premium-shadow-lg dark:bg-gray-800">
                  <CardContent className="p-8">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                      {service.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="bg-gray-50 py-16 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            Need a Custom Package?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-gray-600 dark:text-gray-300">
            Tell us your travel dates, group size, and preferences — we&apos;ll craft a
            personalized itinerary with guides, stays, and transport included.
          </p>
          <Button asChild size="lg">
            <Link to="/contact">Get a Free Quote</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
