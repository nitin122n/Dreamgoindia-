import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  Star,
  Mountain,
  Check,
  X,
  ChevronRight,
  Users,
} from "lucide-react";
import { SEO } from "@/components/common/SEO";
import { LocationMap } from "@/components/common/LocationMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrip, useTestimonials } from "@/hooks/useCMS";
import { useAuth } from "@/hooks/useAuth";
import { formatPrice, cn } from "@/lib/utils";
import type { ItineraryDay, FAQItem } from "@/types";
import toast from "react-hot-toast";

const DEFAULT_ITINERARY: ItineraryDay[] = [
  { day: 1, title: "Arrival & Briefing", description: "Meet at base camp, gear check, and orientation session with your trek leader." },
  { day: 2, title: "Trek Begins", description: "Start the journey through scenic trails with packed lunch en route." },
  { day: 3, title: "Summit Day", description: "Early morning ascent to the viewpoint. Witness breathtaking panoramic views." },
  { day: 4, title: "Descent & Celebration", description: "Trek back to base camp. Certificate ceremony and group dinner." },
];

const DEFAULT_INCLUSIONS = [
  "Accommodation in tents/hotels",
  "All meals during the trek",
  "Certified trek guide",
  "Permits and entry fees",
  "First aid kit",
  "Transport from base to trailhead",
];

const DEFAULT_EXCLUSIONS = [
  "Personal trekking gear",
  "Travel insurance",
  "Meals not mentioned",
  "Porter charges",
  "Any personal expenses",
];

const DEFAULT_FAQS: FAQItem[] = [
  { question: "What fitness level is required?", answer: "Basic cardiovascular fitness is recommended. We provide a pre-trek fitness guide after booking." },
  { question: "What should I pack?", answer: "Warm layers, trekking shoes, rain jacket, sunscreen, and a personal water bottle. A detailed packing list is shared upon confirmation." },
  { question: "Is altitude sickness a concern?", answer: "Our itineraries include acclimatization days. Guides are trained to identify and manage altitude-related symptoms." },
];

export default function TripDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data: trip, isLoading } = useTrip(slug ?? "");
  const { data: testimonials } = useTestimonials();

  const handleBookNow = () => {
    if (!trip) return;
    if (authLoading) return;
    if (!isAuthenticated) {
      toast.error("Please sign in to book this trip");
      navigate("/auth/login", {
        state: { from: { pathname: `/trips/${trip.slug}/book` } },
      });
      return;
    }
    navigate(`/trips/${trip.slug}/book`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Skeleton className="mb-8 h-96 rounded-2xl" />
        <div className="grid gap-8 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Trip not found</h1>
        <Link to="/trips" className="mt-4 inline-block text-primary hover:underline">
          Browse all trips
        </Link>
      </div>
    );
  }

  const images = trip.trip_images?.length
    ? trip.trip_images
    : [{ id: "0", trip_id: trip.id, image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80", alt_text: trip.title, sort_order: 0, is_cover: true }];
  const itinerary = trip.itinerary?.length ? trip.itinerary : DEFAULT_ITINERARY;
  const inclusions = trip.inclusions?.length ? trip.inclusions : DEFAULT_INCLUSIONS;
  const exclusions = trip.exclusions?.length ? trip.exclusions : DEFAULT_EXCLUSIONS;
  const faqs = trip.faqs?.length ? trip.faqs : DEFAULT_FAQS;
  const displayPrice = trip.discount_price ?? trip.price;
  const tripReviews = testimonials?.filter((t) => t.trip_name?.includes(trip.title.split(" ")[0])) ?? testimonials?.slice(0, 3);

  return (
    <>
      <SEO
        title={trip.seo_title ?? trip.title}
        description={trip.seo_description ?? trip.description ?? undefined}
        image={images[0]?.image_url ?? undefined}
        type="article"
      />

      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px]">
        <img
          src={images[0]?.image_url ?? ""}
          alt={trip.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge className="mb-3 capitalize">{trip.difficulty}</Badge>
              <h1 className="text-3xl font-bold text-white md:text-5xl">{trip.title}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-white/90">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {trip.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {trip.duration_days}D / {trip.duration_nights}N
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> {trip.rating} ({trip.review_count} reviews)
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            {/* Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {images.slice(0, 4).map((img) => (
                  <img
                    key={img.id}
                    src={img.image_url}
                    alt={img.alt_text ?? trip.title}
                    className="aspect-square rounded-xl object-cover"
                  />
                ))}
              </div>
            )}

            {/* Highlights */}
            <section>
              <h2 className="mb-4 text-2xl font-bold">Highlights</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {trip.highlights.map((h) => (
                  <div key={h} className="flex items-center gap-2 rounded-xl bg-primary/5 px-4 py-3">
                    <ChevronRight className="h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm font-medium">{h}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Overview */}
            <section>
              <h2 className="mb-4 text-2xl font-bold">Overview</h2>
              <p className="leading-relaxed text-gray-600">{trip.overview ?? trip.description}</p>
              {trip.altitude && (
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                  <Mountain className="h-4 w-4" />
                  Max altitude: {trip.altitude}
                </div>
              )}
            </section>

            {/* Itinerary */}
            <section>
              <h2 className="mb-4 text-2xl font-bold">Itinerary</h2>
              <div className="space-y-4">
                {itinerary.map((day) => (
                  <div key={day.day} className="flex gap-4 rounded-xl border border-gray-100 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                      {day.day}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{day.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{day.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Inclusions / Exclusions */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Check className="h-5 w-5" /> Inclusions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {inclusions.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <X className="h-5 w-5" /> Exclusions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {exclusions.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <section>
              <h2 className="mb-4 text-2xl font-bold">Location</h2>
              <LocationMap
                label={trip.location || trip.title}
                lat={trip.map_lat}
                lng={trip.map_lng}
              />
            </section>

            {/* Difficulty */}
            <section>
              <h2 className="mb-4 text-2xl font-bold">Difficulty Level</h2>
              <div className="flex items-center gap-4">
                <span
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold capitalize",
                    trip.difficulty === "easy" && "bg-green-100 text-green-700",
                    trip.difficulty === "moderate" && "bg-yellow-100 text-yellow-700",
                    trip.difficulty === "difficult" && "bg-orange-100 text-orange-700",
                    trip.difficulty === "extreme" && "bg-red-100 text-red-700"
                  )}
                >
                  {trip.difficulty}
                </span>
                <p className="text-sm text-gray-600">
                  Suitable for trekkers with {trip.difficulty === "easy" ? "no prior" : "some"} experience.
                </p>
              </div>
            </section>

            {/* FAQs */}
            <section>
              <h2 className="mb-4 text-2xl font-bold">FAQs</h2>
              <Accordion type="single" collapsible className="rounded-2xl bg-white px-6 premium-shadow">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            {/* Reviews */}
            <section>
              <h2 className="mb-4 text-2xl font-bold">Reviews</h2>
              <div className="space-y-4">
                {tripReviews?.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <img
                          src={review.image_url ?? ""}
                          alt={review.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold">{review.name}</h4>
                            <div className="flex">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{review.location}</p>
                          <p className="mt-2 text-sm text-gray-600">{review.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* Sticky booking card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="premium-shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-primary">{formatPrice(displayPrice)}</span>
                    <span className="text-sm text-gray-500"> / person</span>
                    {trip.discount_price && (
                      <span className="ml-2 text-lg text-gray-400 line-through">
                        {formatPrice(trip.price)}
                      </span>
                    )}
                  </div>

                  <div className="mb-6 space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      {trip.duration_days} Days / {trip.duration_nights} Nights
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      {trip.seats_left} seats left of {trip.max_seats}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mountain className="h-4 w-4 text-primary" />
                      <span className="capitalize">{trip.difficulty} difficulty</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleBookNow}
                    disabled={authLoading}
                  >
                    {isAuthenticated ? "Book Now" : "Sign in to Book"}
                  </Button>
                  <p className="mt-3 text-center text-xs text-gray-500">
                    {isAuthenticated
                      ? "Free cancellation up to 30 days before departure"
                      : "Create an account or sign in to continue booking"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
