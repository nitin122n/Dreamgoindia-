import { motion } from "framer-motion";
import { Target, Eye, Compass, Award, Users, MapPin, Leaf, Shield, Route } from "lucide-react";
import { SEO } from "@/components/common/SEO";
import { PageHero } from "@/components/common/PageHero";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const JOURNEY = [
  {
    year: "2018",
    title: "Dream Go India Founded",
    description: "Started as a passionate travel venture in Dehradun with a focus on Himalayan trekking and local experiences.",
  },
  {
    year: "2020",
    title: "Expanded Adventure Portfolio",
    description: "Added camping, snow trekking, and pilgrimage tours for families, solo travelers, and groups.",
  },
  {
    year: "2023",
    title: "Pan-India Journeys",
    description: "Extended services across spiritual destinations, scenic landscapes, and customized travel packages.",
  },
  {
    year: "Today",
    title: "Trusted Travel Partner",
    description: "Delivering well-planned itineraries, experienced guides, and safe travel across India.",
  },
];

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
  { icon: Compass, value: "8+", label: "Years of Experience" },
];

export default function AboutPage() {
  return (
    <>
      <SEO
        title="About Us"
        description="Dream Go India is a trusted travel and adventure company delivering unforgettable journeys across India — trekking, pilgrimage, and customized tours."
      />

      <PageHero
        title="About Dream Go India"
        subtitle="A trusted travel and adventure company dedicated to delivering unforgettable journeys across India."
        breadcrumbs={[{ label: "About" }]}
      />

      {/* Company overview */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            Dream Go India is a trusted travel and adventure company dedicated to delivering
            unforgettable journeys across India. We specialize in trekking, adventure tours,
            pilgrimage trips, and customized travel experiences designed for solo travelers,
            families, and groups.
          </p>
          <p className="mt-6 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            With a passion for exploration and a commitment to quality service, Dream Go India
            offers well-planned itineraries, experienced guides, and safe travel arrangements to
            ensure every trip is comfortable, exciting, and memorable.
          </p>
          <p className="mt-6 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            From the majestic Himalayas to spiritual destinations and scenic landscapes, our
            mission is to help travelers discover the true beauty of India while promoting
            responsible and sustainable tourism.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-gray-50 py-16 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="border-primary/20">
              <CardContent className="p-8">
                <Target className="mb-4 h-10 w-10 text-primary" />
                <h2 className="mb-3 text-2xl font-bold">Our Mission</h2>
                <p className="leading-relaxed text-gray-600 dark:text-gray-300">
                  To help travelers discover the true beauty of India — from the majestic
                  Himalayas to spiritual destinations and scenic landscapes — through safe,
                  well-organized, and memorable travel experiences that promote responsible
                  and sustainable tourism.
                </p>
              </CardContent>
            </Card>
            <Card className="border-primary/20">
              <CardContent className="p-8">
                <Eye className="mb-4 h-10 w-10 text-primary" />
                <h2 className="mb-3 text-2xl font-bold">Our Vision</h2>
                <p className="leading-relaxed text-gray-600 dark:text-gray-300">
                  To become India&apos;s most trusted travel and adventure company — known for
                  exceptional service, experienced local guides, and journeys that inspire
                  exploration while respecting nature, culture, and local communities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-10 text-center text-3xl font-bold text-gray-900 dark:text-white">
          Why Choose Dream Go India?
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_CHOOSE.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl bg-white p-6 text-center premium-shadow dark:bg-gray-800"
            >
              <item.icon className="mx-auto mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 font-bold text-gray-900 dark:text-white">{item.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Journey */}
      <section className="bg-gray-900 py-16 text-white">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Our Journey</h2>
          <div className="relative mx-auto max-w-2xl">
            <div className="absolute left-4 top-0 h-full w-0.5 bg-primary/50 md:left-1/2" />
            {JOURNEY.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`relative mb-10 flex ${i % 2 === 0 ? "md:justify-start" : "md:justify-end"}`}
              >
                <div className={`ml-10 md:ml-0 md:w-5/12 ${i % 2 === 0 ? "md:pr-8 md:text-right" : "md:pl-8"}`}>
                  <span className="text-sm font-bold text-primary">{item.year}</span>
                  <h3 className="mt-1 text-lg font-bold">{item.title}</h3>
                  <p className="mt-1 text-sm text-gray-400">{item.description}</p>
                </div>
                <div className="absolute left-2.5 top-1 h-3 w-3 rounded-full bg-primary md:left-1/2 md:-translate-x-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="bg-gradient-to-br from-primary/5 to-orange-50 py-16 dark:from-primary/10 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
            Our Achievements
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ACHIEVEMENTS.map((item) => (
              <motion.div
                key={item.label}
                whileHover={{ y: -4 }}
                className="rounded-2xl bg-white p-8 text-center premium-shadow dark:bg-gray-800"
              >
                <item.icon className="mx-auto mb-4 h-10 w-10 text-primary" />
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{item.value}</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Ready to Explore India with Us?
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-gray-600 dark:text-gray-300">
          Whether you&apos;re planning a trek, pilgrimage, or a customized family trip — we&apos;re
          here to make it unforgettable.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link to="/trips">Browse Trips</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
