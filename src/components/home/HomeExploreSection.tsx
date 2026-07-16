import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Camera,
  BookOpen,
  Briefcase,
  MessageCircle,
  ChevronRight,
} from "lucide-react";

const PAGES = [
  {
    title: "All Trips",
    description: "Browse treks, tours & adventure packages",
    href: "/trips",
    icon: MapPin,
    color: "from-red-500 to-orange-500",
  },
  {
    title: "Destinations",
    description: "Explore India's most beautiful places",
    href: "/destinations",
    icon: Camera,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Upcoming Departures",
    description: "Book your seat on scheduled trips",
    href: "/departures",
    icon: Calendar,
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Our Services",
    description: "Trekking, pilgrimage, corporate & more",
    href: "/services",
    icon: Briefcase,
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Travel Stories",
    description: "Guides, tips & destination insights",
    href: "/blog",
    icon: BookOpen,
    color: "from-amber-500 to-yellow-500",
  },
  {
    title: "Photo Gallery",
    description: "Moments from our adventures",
    href: "/gallery",
    icon: Camera,
    color: "from-indigo-500 to-violet-500",
  },
  {
    title: "Testimonials",
    description: "What our travelers say about us",
    href: "/testimonials",
    icon: MessageCircle,
    color: "from-rose-500 to-red-500",
  },
  {
    title: "About Us",
    description: "Our story, mission & team",
    href: "/about",
    icon: MapPin,
    color: "from-teal-500 to-green-500",
  },
];

export function HomeExploreSection() {
  return (
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white lg:text-3xl">
            Explore Dream Go India
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Discover everything we offer — each section has its own dedicated page
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PAGES.map((page, i) => (
            <motion.div
              key={page.href}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={page.href}
                className="group flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-6 transition-all hover:-translate-y-1 hover:border-primary/20 hover:premium-shadow-lg dark:border-gray-800 dark:bg-gray-800"
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${page.color} text-white shadow-md`}
                >
                  <page.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-1 font-bold text-gray-900 group-hover:text-primary dark:text-white">
                  {page.title}
                </h3>
                <p className="mb-4 flex-1 text-sm text-gray-500 dark:text-gray-400">
                  {page.description}
                </p>
                <span className="flex items-center gap-1 text-sm font-semibold text-primary">
                  Explore <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
