import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Search, MapPin } from "lucide-react";
import { SEO } from "@/components/common/SEO";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <>
      <SEO title="Page Not Found" description="The page you're looking for doesn't exist." noIndex />

      <section className="flex min-h-[70vh] items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-8xl font-bold text-gradient">404</p>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 md:text-3xl">
            Oops! You&apos;re off the trail
          </h1>
          <p className="mx-auto mt-3 max-w-md text-gray-600">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you
            back on track.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/">
              <Button>
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </Link>
            <Link to="/trips">
              <Button variant="outline">
                <Search className="h-4 w-4" />
                Browse Trips
              </Button>
            </Link>
            <Link to="/destinations">
              <Button variant="secondary">
                <MapPin className="h-4 w-4" />
                Destinations
              </Button>
            </Link>
          </div>

          <div className="mt-12 opacity-20">
            <svg viewBox="0 0 200 100" className="mx-auto h-24 w-48" fill="currentColor">
              <path d="M0 80 L40 50 L70 65 L100 30 L130 55 L160 25 L200 60 L200 100 L0 100 Z" className="text-primary" />
            </svg>
          </div>
        </motion.div>
      </section>
    </>
  );
}
