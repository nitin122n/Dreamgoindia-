import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";

export function HomeCTA() {
  const { settings } = useSettings();

  return (
    <section className="relative overflow-hidden bg-gray-900 py-16 text-white">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/95 to-gray-900/80" />

      <div className="container relative mx-auto px-4 text-center lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold md:text-4xl">
            Ready for Your Next Adventure?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-300">
            Plan your dream trip with Dream Go India — trekking, pilgrimage, or a
            customized family vacation across India.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="gap-2">
              <Link to="/trips">
                Browse Trips <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-900">
              <Link to="/contact">Contact Us</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-white hover:bg-white/10">
              <a href={`tel:${settings.contact_phone}`}>
                <Phone className="mr-2 h-4 w-4" />
                {settings.contact_phone}
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
