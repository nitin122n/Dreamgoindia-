import { motion } from "framer-motion";
import {
  Target,
  Eye,
  Compass,
  Award,
  Users,
  MapPin,
  Leaf,
  Shield,
  Route,
  Mountain,
  ChevronRight,
  Home,
} from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/common/SEO";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";

const WHY_CHOOSE = [
  {
    icon: Compass,
    title: "Experienced Guides",
    description: "Local guides with deep knowledge of trails, culture, and terrain on every journey.",
  },
  {
    icon: Shield,
    title: "Safe Travel Arrangements",
    description: "Carefully planned logistics, safety protocols, and support throughout your trip.",
  },
  {
    icon: Route,
    title: "Well-Planned Itineraries",
    description: "Every trip is thoughtfully designed for comfort, excitement, and memorable experiences.",
  },
  {
    icon: Leaf,
    title: "Responsible Tourism",
    description: "We promote sustainable travel that respects nature, local communities, and heritage.",
  },
];

const ACHIEVEMENTS = [
  { icon: Users, value: "5,000+", label: "Happy Travelers" },
  { icon: MapPin, value: "50+", label: "Destinations Covered" },
  { icon: Award, value: "4.9★", label: "Customer Rating" },
  { icon: Mountain, value: "Himalayas", label: "Our Playground" },
];

const CERTIFICATIONS = [
  { name: "Nehru Institute of Mountaineering, Uttarkashi", image: "/images/certifications/nim-uttarkashi.png" },
  { name: "Uttarakhand Tourism", image: "/images/certifications/uttarakhand-tourism.png" },
  { name: "MSME — Govt. of India", image: "/images/certifications/msme.png" },
  { name: "Indian Military Academy", image: "/images/certifications/ima.png" },
  { name: "Indian Army", image: "/images/certifications/defence-crest.png" },
  { name: "Adventure Tour Operators Association of India", image: "/images/certifications/atoai.png" },
  { name: "Uttarakhand Forest Department", image: "/images/certifications/uttarakhand-forest.png" },
  { name: "Uttarakhand Shasan", image: "/images/certifications/uttarakhand-shasan.png" },
];

const JOURNEY = [
  {
    year: "2018",
    title: "Awakening the Soul of Adventure",
    description:
      "Dream Go India began with a vision to create travel experiences that deeply connect with the essence of adventure and exploration — a passion that turned into unforgettable journeys filled with soul and purpose.",
  },
  {
    year: "2020",
    title: "Growing the Adventure Portfolio",
    description:
      "We expanded our horizons with camping, snow treks, and pilgrimage tours — refining our offerings and setting a new benchmark for Himalayan travel services.",
  },
  {
    year: "2023",
    title: "Advancements and Achievements",
    description:
      "A year of milestones where we introduced innovative services and created extraordinary experiences for our travelers, cementing our reputation across India.",
  },
  {
    year: "Today",
    title: "Scaling New Peaks of Excellence",
    description:
      "Fully independent operations, experienced guides, and well-planned itineraries — offering unmatched travel experiences that blend adventure with comfort.",
  },
];

function AboutBanner({ siteName }: { siteName: string }) {
  return (
    <section className="relative overflow-hidden bg-gray-950 pt-24 pb-16 text-white md:pb-20">
      {/* Atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(229,57,53,0.22),transparent_55%),radial-gradient(ellipse_at_90%_70%,rgba(229,57,53,0.08),transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      <div className="container relative z-10 mx-auto grid items-center gap-10 px-4 lg:grid-cols-2 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <nav className="mb-5 flex items-center gap-1.5 text-sm text-white/55">
            <Link to="/" className="inline-flex items-center gap-1 transition hover:text-primary">
              <Home className="h-3.5 w-3.5" />
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-white/85">about-us</span>
          </nav>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            About
          </h1>
          <p className="mt-2 text-2xl font-bold text-primary sm:text-3xl">{siteName}</p>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/70 sm:text-lg">
            Under the Himalayan sky, every journey shines brighter
          </p>
        </motion.div>

        {/* Line-art mountains (TripMySoul-style accent, brand red) */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="relative mx-auto hidden w-full max-w-lg lg:block"
          aria-hidden
        >
          <svg viewBox="0 0 520 280" className="h-auto w-full text-primary/80" fill="none">
            <path
              d="M20 240 L120 110 L180 170 L260 60 L340 150 L400 90 L500 240"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M60 240 L140 150 L200 200 L280 100 L360 180 L420 130 L480 240"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.45"
              strokeLinejoin="round"
            />
            <path
              d="M100 240 C140 210 170 215 200 240 C230 215 270 200 310 240 C350 210 390 220 430 240"
              stroke="currentColor"
              strokeWidth="1.2"
              opacity="0.7"
            />
            <circle cx="420" cy="48" r="18" stroke="currentColor" strokeWidth="1.4" opacity="0.9" />
            <circle cx="420" cy="48" r="8" fill="currentColor" opacity="0.35" />
            <path
              d="M70 240 L95 210 L115 230 L140 195 L165 225 L190 205 L210 240"
              stroke="currentColor"
              strokeWidth="1.1"
              opacity="0.55"
            />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  const { settings } = useSettings();
  const siteName = settings.site_name || "Dream Go India";
  const founderImage = settings.about_founder_image || "/images/sanoj-chauhan.jpg";

  return (
    <>
      <SEO
        title="About Us"
        description={`${siteName} — founded by passionate mountaineer Sanoj Chauhan. Treks, expeditions, and unforgettable Himalayan journeys across India.`}
      />

      <AboutBanner siteName={siteName} />

      {/* Founder — “Meet Our Team” style */}
      <section className="relative overflow-hidden bg-white py-16 dark:bg-gray-950 md:py-20">
        {/* Line-art: mountain on the right */}
        <svg
          aria-hidden
          viewBox="0 0 300 220"
          fill="none"
          className="pointer-events-none absolute -right-8 bottom-8 hidden h-56 w-auto text-gray-200 dark:text-white/10 lg:block"
        >
          <path d="M10 200 L110 60 L160 120 L220 30 L290 200" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M200 60 L220 30 L242 62" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
        </svg>

        <div className="container relative mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
              The Mind Behind Your <span className="text-primary">Adventures</span>
            </h2>
            <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">Meet the Founder</p>
          </motion.div>

          {/* Centered circular photo with name below */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="mx-auto mt-10 max-w-xs text-center"
          >
            <div className="relative mx-auto aspect-square w-56 sm:w-64">
              <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-white shadow-xl ring-1 ring-black/5 dark:border-gray-900 dark:ring-white/10">
                <img
                  src={founderImage}
                  alt="Sanoj Chauhan — founder of Dream Go India"
                  className="h-full w-full object-cover object-[center_18%]"
                />
              </div>
            </div>
            <p className="mt-5 font-display text-2xl font-semibold text-gray-900 dark:text-white">
              Sanoj Chauhan
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Founder · Mountaineer · Explorer
            </p>
          </motion.div>

          {/* Bio — “Meet the Soul Behind the Journeys” */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.12 }}
            className="mx-auto mt-14 max-w-3xl"
          >
            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white md:text-2xl">
                Meet the Soul Behind the Journeys
              </h3>
            </div>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-gray-600 dark:text-gray-300">
              <p>
                Sanoj Chauhan is an explorer, entrepreneur, and professional mountaineer —
                a passionate mountaineer, aspiring climber, and expedition enthusiast.
                Traveling was the only thing he always wanted to do in his life.
              </p>
              <p>
                Hailing from Gangad, this avid traveler started exploring when he was a small
                boy — beginning with nearby places alongside family and friends, and growing
                into Himalayan expeditions that shape every journey at {siteName}.
              </p>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <span className="rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
                Professional Mountaineer
              </span>
              <span className="rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
                Expedition Enthusiast
              </span>
              <span className="rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
                From Gangad
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Company overview */}
      <section className="border-y border-gray-100 bg-gray-50 py-16 dark:border-white/5 dark:bg-gray-900/60">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
            Our story
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            {siteName} is a trusted travel and adventure company dedicated to delivering
            unforgettable journeys across India. We specialize in trekking, adventure tours,
            pilgrimage trips, and customized travel experiences for solo travelers, families,
            and groups.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            From the majestic Himalayas to spiritual destinations and scenic landscapes, our
            mission is to help travelers discover the true beauty of India while promoting
            responsible and sustainable tourism.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="container mx-auto px-4 py-16 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 dark:border-white/10 dark:bg-gray-900">
            <Target className="mb-4 h-10 w-10 text-primary" />
            <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
            <p className="leading-relaxed text-gray-600 dark:text-gray-300">
              To help travelers discover the true beauty of India — from the majestic Himalayas
              to spiritual destinations — through safe, well-organized journeys that promote
              responsible and sustainable tourism.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-8 dark:border-white/10 dark:bg-gray-900">
            <Eye className="mb-4 h-10 w-10 text-primary" />
            <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Our Vision</h2>
            <p className="leading-relaxed text-gray-600 dark:text-gray-300">
              To become India&apos;s most trusted travel and adventure company — known for
              exceptional service, experienced local guides, and journeys that inspire
              exploration while respecting nature and local communities.
            </p>
          </div>
        </div>
      </section>

      {/* How We Began — journey timeline */}
      <section className="relative overflow-hidden border-t border-gray-100 bg-[#faf6f0] py-16 dark:border-white/5 dark:bg-gray-900 md:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 top-1/3 h-80 w-80 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10"
        />
        <div className="container relative mx-auto max-w-4xl px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
              How We Began:{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                The {siteName} Journey
              </span>
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 md:text-base">
              From a dream to extraordinary journeys — discover the story behind our passion.
            </p>
          </motion.div>

          <div className="relative mt-12">
            {/* Vertical rail on the right */}
            <div
              aria-hidden
              className="absolute bottom-7 right-7 top-7 w-px bg-gray-300 dark:bg-white/15"
            />

            <div className="space-y-12">
              {JOURNEY.map((item, i) => {
                const isLast = i === JOURNEY.length - 1;
                return (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ delay: Math.min(i * 0.08, 0.32) }}
                    className="flex items-start gap-6 sm:gap-10"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {item.title}
                      </h3>
                      <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                        {item.description}
                      </p>
                    </div>
                    <div
                      className={
                        isLast
                          ? "relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-lg shadow-primary/30"
                          : "relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white dark:bg-white/10 dark:text-gray-200"
                      }
                    >
                      {item.year}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-950 py-16 text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="mb-10 text-center text-3xl font-bold">
            Why Choose {siteName}?
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_CHOOSE.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center"
              >
                <item.icon className="mx-auto mb-4 h-10 w-10 text-primary" />
                <h3 className="mb-2 font-bold">{item.title}</h3>
                <p className="text-sm text-white/65">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="container mx-auto px-4 py-16 lg:px-8">
        <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
          Our Achievements
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ACHIEVEMENTS.map((item) => (
            <motion.div
              key={item.label}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-gray-100 bg-white p-8 text-center premium-shadow dark:border-white/10 dark:bg-gray-900"
            >
              <item.icon className="mx-auto mb-4 h-10 w-10 text-primary" />
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{item.value}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Certifications & Affiliations */}
      <section className="border-t border-gray-100 bg-gray-50 py-16 dark:border-white/5 dark:bg-gray-900/60 md:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
            Our Certifications <span className="text-primary">&amp;</span> Affiliations
          </h2>
          <div className="mx-auto grid max-w-5xl grid-cols-3 gap-4 sm:grid-cols-4 md:gap-6 lg:grid-cols-5">
            {CERTIFICATIONS.map((cert, i) => (
              <motion.div
                key={cert.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: Math.min(i * 0.05, 0.3) }}
                className="flex aspect-square items-center justify-center rounded-2xl border border-gray-100 bg-white p-4 premium-shadow transition-transform hover:-translate-y-1 dark:border-white/10"
                title={cert.name}
              >
                <img
                  src={cert.image}
                  alt={cert.name}
                  loading="lazy"
                  className="max-h-full max-w-full object-contain"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100 bg-gradient-to-br from-primary/5 via-white to-gray-50 py-16 dark:border-white/5 dark:from-primary/10 dark:via-gray-950 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
            Ready to explore with us?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-gray-600 dark:text-gray-300">
            Whether you&apos;re planning a trek, pilgrimage, or a customized family trip —
            we&apos;re here to make it unforgettable.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/trips">Browse Trips</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
