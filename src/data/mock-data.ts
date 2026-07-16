import type {
  HeroSlide,
  Destination,
  TripCategory,
  Trip,
  Testimonial,
  WhyChooseUs,
  Blog,
  GalleryItem,
  TripDeparture,
  FAQ,
  SiteSettings,
  Profile,
  Booking,
  WishlistItem,
  Notification,
  Review,
} from "@/types";

export const defaultSettings: SiteSettings = {
  site_name: "Dream Go India",
  logo_url: "/logo.svg",
  favicon_url: "/favicon.svg",
  primary_color: "#E53935",
  contact_email: "hello@dreamgoindia.com",
  contact_phone: "+91 87912 76829",
  whatsapp: "918791276829",
  address: "Dehradun, Uttarakhand, India",
  social_links: {
    instagram: "https://instagram.com/dreamgoindia",
    facebook: "https://www.facebook.com/people/Dream-Go-India/61552964515765/",
    youtube: "https://www.youtube.com/@dreamgoindia",
  },
  footer_text: "Dream Go India | Tour and travel company, India. Trusted journeys across India since 2016.",
  seo_default_title: "Dream Go India | Tour and travel company, India",
  seo_default_description:
    "Dream Go India — tour and travel company in India since 2016. Book trekking, pilgrimage, and adventure packages across India.",
  google_analytics_id: "",
  payment_razorpay_key: "",
  home_marquee_text:
    "Welcome to Dream Go India — we welcome you to start a mesmerizing journey",
};

export const mockHeroSlides: HeroSlide[] = [
  {
    id: "1",
    title: "Explore Uttarakhand",
    subtitle: "Mountains are calling...",
    image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80",
    cta_text: "Explore Trips",
    cta_link: "/trips",
    secondary_cta_text: "Search Trips",
    secondary_cta_link: "/trips",
    sort_order: 0,
    is_visible: true,
  },
  {
    id: "2",
    title: "Discover Ladakh",
    subtitle: "Land of high passes awaits",
    image_url: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1600&q=80",
    cta_text: "View Packages",
    cta_link: "/trips?destination=ladakh",
    secondary_cta_text: null,
    secondary_cta_link: null,
    sort_order: 1,
    is_visible: true,
  },
  {
    id: "3",
    title: "Valley of Flowers",
    subtitle: "Nature's paradise in bloom",
    image_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80",
    cta_text: "Book Now",
    cta_link: "/trips/valley-of-flowers-trek",
    secondary_cta_text: null,
    secondary_cta_link: null,
    sort_order: 2,
    is_visible: true,
  },
];

export const mockDestinations: Destination[] = [
  { id: "1", name: "Dehradun", slug: "dehradun", state: "Uttarakhand", country: "India", description: null, short_description: null, image_url: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=80", cover_image_url: null, gallery: [], map_lat: null, map_lng: null, best_season: null, altitude: null, is_featured: true, is_visible: true, sort_order: 0, seo_title: null, seo_description: null },
  { id: "2", name: "Har Ki Dun", slug: "har-ki-dun", state: "Uttarakhand", country: "India", description: null, short_description: null, image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80", cover_image_url: null, gallery: [], map_lat: null, map_lng: null, best_season: null, altitude: null, is_featured: true, is_visible: true, sort_order: 1, seo_title: null, seo_description: null },
  { id: "3", name: "Valley of Flowers", slug: "valley-of-flowers", state: "Uttarakhand", country: "India", description: null, short_description: null, image_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80", cover_image_url: null, gallery: [], map_lat: null, map_lng: null, best_season: null, altitude: null, is_featured: true, is_visible: true, sort_order: 2, seo_title: null, seo_description: null },
  { id: "4", name: "Auli", slug: "auli", state: "Uttarakhand", country: "India", description: null, short_description: null, image_url: "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=400&q=80", cover_image_url: null, gallery: [], map_lat: null, map_lng: null, best_season: null, altitude: null, is_featured: true, is_visible: true, sort_order: 3, seo_title: null, seo_description: null },
  { id: "5", name: "Nainital", slug: "nainital", state: "Uttarakhand", country: "India", description: null, short_description: null, image_url: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=80", cover_image_url: null, gallery: [], map_lat: null, map_lng: null, best_season: null, altitude: null, is_featured: true, is_visible: true, sort_order: 4, seo_title: null, seo_description: null },
  { id: "6", name: "Ladakh", slug: "ladakh", state: "Ladakh", country: "India", description: null, short_description: null, image_url: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=400&q=80", cover_image_url: null, gallery: [], map_lat: null, map_lng: null, best_season: null, altitude: null, is_featured: true, is_visible: true, sort_order: 5, seo_title: null, seo_description: null },
];

export const mockCategories: TripCategory[] = [
  { id: "winter", name: "Winter", slug: "winter", icon: "snowflake", description: null, season: "winter", sort_order: 0, is_visible: true },
  { id: "summer", name: "Summer", slug: "summer", icon: "sun", description: null, season: "summer", sort_order: 1, is_visible: true },
  { id: "monsoon", name: "Monsoon", slug: "monsoon", icon: "cloud-rain", description: null, season: "monsoon", sort_order: 2, is_visible: true },
  { id: "family", name: "Family", slug: "family", icon: "users", description: null, season: "all", sort_order: 3, is_visible: true },
  { id: "adventure", name: "Adventure", slug: "adventure", icon: "mountain", description: null, season: "all", sort_order: 4, is_visible: true },
  { id: "weekend", name: "Weekend", slug: "weekend", icon: "calendar", description: null, season: "all", sort_order: 5, is_visible: true },
  { id: "international", name: "International", slug: "international", icon: "globe", description: null, season: "all", sort_order: 6, is_visible: true },
];

const IMG = {
  snow: "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&q=80",
  snowTrail: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&q=80",
  snowCamp: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&q=80",
  trek: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  valley: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
  pass: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&q=80",
  temple: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80",
  meadow: "https://images.unsplash.com/photo-1478131143088-5e7e85b1958b?w=800&q=80",
};

function tripImage(id: string, tripId: string, url: string, alt: string) {
  return [{ id, trip_id: tripId, image_url: url, alt_text: alt, sort_order: 0, is_cover: true }];
}

function baseTrip(
  partial: Pick<Trip, "id" | "title" | "slug" | "season" | "trip_type" | "location" | "duration_days" | "duration_nights" | "price"> &
    Partial<Trip>
): Trip {
  return {
    destination_id: partial.destination_id ?? "2",
    category_id: partial.season,
    description: partial.description ?? `Explore ${partial.title} with Dream Go India.`,
    overview: partial.overview ?? `A curated ${partial.trip_type === "dham" ? "pilgrimage" : "trek"} experience in the Himalayas.`,
    discount_price: partial.discount_price ?? null,
    difficulty: partial.difficulty ?? "moderate",
    max_seats: partial.max_seats ?? 20,
    seats_left: partial.seats_left ?? 10,
    rating: partial.rating ?? 4.7,
    review_count: partial.review_count ?? 48,
    highlights: partial.highlights ?? [],
    itinerary: [],
    inclusions: [],
    exclusions: [],
    faqs: [],
    map_lat: null,
    map_lng: null,
    altitude: partial.altitude ?? null,
    is_featured: partial.is_featured ?? true,
    is_popular: partial.is_popular ?? false,
    is_trending: partial.is_trending ?? false,
    is_visible: true,
    seo_title: null,
    seo_description: null,
    created_at: new Date().toISOString(),
    trip_images: partial.trip_images ?? tripImage(partial.id, partial.id, IMG.trek, partial.title),
    ...partial,
  };
}

export const mockTrips: Trip[] = [
  // Winter Treks
  baseTrip({
    id: "w1", title: "Kedarkantha Trek", slug: "kedarkantha-trek", season: "winter", trip_type: "trek",
    location: "Uttarkashi, Uttarakhand", duration_days: 6, duration_nights: 5, price: 8999, discount_price: 7999,
    difficulty: "moderate", rating: 4.9, review_count: 312, is_popular: true, is_trending: true,
    altitude: "3810m", highlights: ["Snow summit", "Pine forests", "360° Himalayan views"],
    trip_images: tripImage("w1", "w1", IMG.snow, "Kedarkantha Trek"),
  }),
  baseTrip({
    id: "w2", title: "Kuari Pass Trek", slug: "kuari-pass-trek", season: "winter", trip_type: "trek",
    location: "Joshimath, Uttarakhand", duration_days: 6, duration_nights: 5, price: 9999,
    difficulty: "moderate", rating: 4.8, review_count: 186, is_popular: true,
    altitude: "3650m", highlights: ["Nanda Devi views", "Oak forests", "Curzon Trail"],
    trip_images: tripImage("w2", "w2", IMG.snowTrail, "Kuari Pass Trek"),
  }),
  baseTrip({
    id: "w3", title: "Dayara Bugyal Trek", slug: "dayara-bugyal-trek", season: "winter", trip_type: "trek",
    location: "Uttarkashi, Uttarakhand", duration_days: 4, duration_nights: 3, price: 7499, discount_price: 6499,
    difficulty: "easy", rating: 4.7, review_count: 142, is_trending: true,
    altitude: "3408m", highlights: ["Snow meadows", "Sunrise views", "Beginner friendly"],
    trip_images: tripImage("w3", "w3", IMG.meadow, "Dayara Bugyal Trek"),
  }),
  baseTrip({
    id: "w4", title: "Brahmatal Trek", slug: "brahmatal-trek", season: "winter", trip_type: "trek",
    location: "Chamoli, Uttarakhand", duration_days: 6, duration_nights: 5, price: 9499, discount_price: 8499,
    difficulty: "moderate", rating: 4.7, review_count: 156, is_popular: true,
    altitude: "3720m", highlights: ["Frozen lake", "Mt Trishul views", "Winter camps"],
    trip_images: tripImage("w4", "w4", IMG.snowCamp, "Brahmatal Trek"),
  }),

  // Summer Treks
  baseTrip({
    id: "s1", title: "Har Ki Dun Trek", slug: "har-ki-dun-trek", season: "summer", trip_type: "trek",
    location: "Uttarkashi, Uttarakhand", duration_days: 7, duration_nights: 6, price: 12999, discount_price: 11499,
    difficulty: "moderate", rating: 4.8, review_count: 124, is_popular: true, is_trending: true,
    altitude: "3566m", highlights: ["Valley of Gods", "Ancient villages", "Alpine meadows"],
    trip_images: tripImage("s1", "s1", IMG.trek, "Har Ki Dun Trek"),
  }),
  baseTrip({
    id: "s2", title: "Bali Pass Trek", slug: "bali-pass-trek", season: "summer", trip_type: "trek",
    location: "Uttarkashi, Uttarakhand", duration_days: 8, duration_nights: 7, price: 16999,
    difficulty: "difficult", rating: 4.9, review_count: 76, is_trending: true,
    altitude: "4950m", highlights: ["High pass crossing", "Ruinsara Lake", "Dramatic landscapes"],
    trip_images: tripImage("s2", "s2", IMG.pass, "Bali Pass Trek"),
  }),
  baseTrip({
    id: "s3", title: "Ruinsara Tal Trek", slug: "ruinsara-tal-trek", season: "summer", trip_type: "trek",
    location: "Uttarkashi, Uttarakhand", duration_days: 7, duration_nights: 6, price: 11999,
    difficulty: "moderate", rating: 4.8, review_count: 64,
    altitude: "3600m", highlights: ["Alpine lake", "Har Ki Dun valley", "Less crowded route"],
    trip_images: tripImage("s3", "s3", IMG.meadow, "Ruinsara Tal Trek"),
  }),
  baseTrip({
    id: "s4", title: "Chari Top Trek", slug: "chari-top-trek", season: "summer", trip_type: "trek",
    location: "Uttarkashi, Uttarakhand", duration_days: 5, duration_nights: 4, price: 7999,
    difficulty: "moderate", rating: 4.7, review_count: 98,
    altitude: "3400m", highlights: ["Offbeat trail", "Open meadows", "Himalayan views"],
    trip_images: tripImage("s4", "s4", IMG.trek, "Chari Top Trek"),
  }),
  baseTrip({
    id: "s5", title: "Phulara Trek", slug: "phulara-trek", season: "summer", trip_type: "trek",
    location: "Uttarkashi, Uttarakhand", duration_days: 6, duration_nights: 5, price: 10499,
    difficulty: "moderate", rating: 4.7, review_count: 52,
    altitude: "3700m", highlights: ["Ridge walk", "Panoramic views", "Offbeat trail"],
    trip_images: tripImage("s5", "s5", IMG.trek, "Phulara Trek"),
  }),
  baseTrip({
    id: "s6", title: "Chopta Tungnath Trek", slug: "chopta-tungnath-trek", season: "summer", trip_type: "trek",
    location: "Rudraprayag, Uttarakhand", duration_days: 4, duration_nights: 3, price: 6999,
    difficulty: "easy", rating: 4.8, review_count: 245, is_trending: true,
    altitude: "3680m", highlights: ["Tungnath Temple", "Chandrashila summit", "Rhododendron trails"],
    trip_images: tripImage("s6", "s6", IMG.temple, "Chopta Tungnath Trek"),
  }),

  // Monsoon Treks
  baseTrip({
    id: "m1", title: "Valley of Flowers Trek", slug: "valley-of-flowers-trek", season: "monsoon", trip_type: "trek",
    location: "Chamoli, Uttarakhand", duration_days: 6, duration_nights: 5, price: 11499,
    difficulty: "moderate", rating: 4.9, review_count: 89, is_popular: true,
    altitude: "3658m", highlights: ["UNESCO site", "Hemkund Sahib", "Rare wildflowers"],
    trip_images: tripImage("m1", "m1", IMG.valley, "Valley of Flowers Trek"),
  }),
  baseTrip({
    id: "m2", title: "Hampta Pass Trek", slug: "hampta-pass-trek", season: "monsoon", trip_type: "trek",
    location: "Kullu, Himachal Pradesh", duration_days: 5, duration_nights: 4, price: 8999,
    difficulty: "moderate", rating: 4.8, review_count: 198, is_popular: true,
    altitude: "4270m", highlights: ["Crossover trek", "Chandratal Lake", "Lahaul valley"],
    trip_images: tripImage("m2", "m2", IMG.pass, "Hampta Pass Trek"),
  }),

  // Char Dham Yatra
  baseTrip({
    id: "d1", title: "Char Dham Yatra", slug: "char-dham-yatra", season: "summer", trip_type: "dham",
    location: "Uttarakhand", duration_days: 12, duration_nights: 11, price: 28999,
    difficulty: "easy", rating: 4.9, review_count: 420, is_popular: true, is_trending: true,
    altitude: "3583m", highlights: ["Yamunotri", "Gangotri", "Kedarnath", "Badrinath"],
    overview: "Complete Char Dham pilgrimage covering all four sacred shrines with guided assistance.",
    trip_images: tripImage("d1", "d1", IMG.temple, "Char Dham Yatra"),
  }),
  baseTrip({
    id: "d2", title: "Do Dham Yatra", slug: "do-dham-yatra", season: "summer", trip_type: "dham",
    location: "Uttarakhand", duration_days: 7, duration_nights: 6, price: 14999,
    difficulty: "easy", rating: 4.8, review_count: 267, is_popular: true,
    altitude: "3583m", highlights: ["Kedarnath", "Badrinath", "Comfortable stays", "VIP darshan support"],
    overview: "Sacred Do Dham yatra to Kedarnath and Badrinath with seamless logistics.",
    trip_images: tripImage("d2", "d2", IMG.temple, "Do Dham Yatra"),
  }),
  baseTrip({
    id: "d3", title: "Kedarnath Yatra", slug: "kedarnath-yatra", season: "summer", trip_type: "dham",
    location: "Rudraprayag, Uttarakhand", duration_days: 3, duration_nights: 2, price: 8999,
    difficulty: "moderate", rating: 4.9, review_count: 201, is_popular: true,
    altitude: "3583m", highlights: ["Kedarnath Temple", "Mandakini River", "Helicopter option"],
    overview: "Spiritual journey to Kedarnath — one of the holiest Shiva temples in the Himalayas.",
    trip_images: tripImage("d3", "d3", IMG.temple, "Kedarnath Yatra"),
  }),
  baseTrip({
    id: "d4", title: "Panch Kedar Yatra", slug: "panch-kedar-yatra", season: "summer", trip_type: "dham",
    location: "Uttarakhand", duration_days: 10, duration_nights: 9, price: 24999,
    difficulty: "moderate", rating: 4.8, review_count: 88, is_trending: true,
    altitude: "3680m",
    highlights: ["Kedarnath", "Tungnath", "Rudranath", "Madhyamaheshwar", "Kalpeshwar"],
    overview: "Visit all five Kedar shrines on a guided Himalayan pilgrimage.",
    trip_images: tripImage("d4", "d4", IMG.temple, "Panch Kedar Yatra"),
  }),
];

export const mockTestimonials: Testimonial[] = [
  { id: "1", name: "Priya Sharma", location: "Delhi", content: "Har Ki Dun trek was absolutely magical! Dream Go India made everything seamless.", rating: 5, image_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", video_url: null, trip_name: "Har Ki Dun Trek", sort_order: 0, is_visible: true },
  { id: "2", name: "Rahul Verma", location: "Mumbai", content: "Best trekking experience of my life. Professional guides and great food!", rating: 5, image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", video_url: null, trip_name: "Valley of Flowers", sort_order: 1, is_visible: true },
  { id: "3", name: "Ananya Patel", location: "Bangalore", content: "Kedarkantha winter trek was epic! Highly recommend Dream Go India.", rating: 5, image_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80", video_url: null, trip_name: "Kedarkantha Trek", sort_order: 2, is_visible: true },
];

export const mockWhyChooseUs: WhyChooseUs[] = [
  { id: "1", title: "Experienced Guides", description: "Skilled local guides ensuring safe and insightful journeys on every trip", icon: "compass", sort_order: 0, is_visible: true },
  { id: "2", title: "Safe Travel", description: "Well-planned itineraries with reliable safety arrangements and support", icon: "shield", sort_order: 1, is_visible: true },
  { id: "3", title: "Quality Service", description: "Comfortable, exciting, and memorable experiences for every traveler", icon: "star", sort_order: 2, is_visible: true },
  { id: "4", title: "Sustainable Tourism", description: "Promoting responsible travel that respects nature and local communities", icon: "leaf", sort_order: 3, is_visible: true },
];

export const mockGallery: GalleryItem[] = [
  { id: "1", title: "Himalayan Sunrise", image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80", video_url: null, media_type: "image", category: "trekking", album: null, sort_order: 0, is_visible: true },
  { id: "2", title: "Camping Night", image_url: "https://images.unsplash.com/photo-1478131143088-5e7e85b1958b?w=600&q=80", video_url: null, media_type: "image", category: "camping", album: null, sort_order: 1, is_visible: true },
  { id: "3", title: "River Rafting", image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80", video_url: null, media_type: "image", category: "adventure", album: null, sort_order: 2, is_visible: true },
  { id: "4", title: "Ladakh Roads", image_url: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&q=80", video_url: null, media_type: "image", category: "biking", album: null, sort_order: 3, is_visible: true },
  { id: "5", title: "Valley Trek", image_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80", video_url: null, media_type: "image", category: "trekking", album: null, sort_order: 4, is_visible: true },
  { id: "6", title: "Snow Peaks", image_url: "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&q=80", video_url: null, media_type: "image", category: "winter", album: null, sort_order: 5, is_visible: true },
];

export const mockBlogs: Blog[] = [
  { id: "1", title: "Complete Guide to Har Ki Dun Trek", slug: "har-ki-dun-trek-guide", excerpt: "Everything you need to know before embarking on this beautiful valley trek.", content: null, featured_image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", category_id: "1", tags: ["trekking", "uttarakhand"], status: "published", is_featured: true, view_count: 1250, published_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: "2", title: "Best Time to Visit Ladakh", slug: "best-time-visit-ladakh", excerpt: "Plan your Ladakh adventure with our seasonal guide.", content: null, featured_image: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&q=80", category_id: "2", tags: ["ladakh", "travel-guide"], status: "published", is_featured: false, view_count: 890, published_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: "3", title: "Essential Trekking Packing List", slug: "trekking-packing-list", excerpt: "Don't forget these essentials on your next Himalayan trek.", content: null, featured_image: "https://images.unsplash.com/photo-1478131143088-5e7e85b1958b?w=800&q=80", category_id: "3", tags: ["packing", "tips"], status: "published", is_featured: false, view_count: 2100, published_at: new Date().toISOString(), created_at: new Date().toISOString() },
];

export const mockDepartures: TripDeparture[] = [
  { id: "1", trip_id: "1", departure_date: "2026-07-15", return_date: "2026-07-19", seats_available: 8, price_override: null, is_active: true, trip: mockTrips[0] },
  { id: "2", trip_id: "2", departure_date: "2026-08-01", return_date: "2026-08-06", seats_available: 5, price_override: null, is_active: true, trip: mockTrips[1] },
  { id: "3", trip_id: "3", departure_date: "2026-12-20", return_date: "2026-12-23", seats_available: 12, price_override: null, is_active: true, trip: mockTrips[2] },
];

export const mockFaqs: FAQ[] = [
  { id: "1", question: "What is included in the trip price?", answer: "Accommodation, meals, guide fees, permits, and transportation as per itinerary.", category: "booking", sort_order: 0, is_visible: true },
  { id: "2", question: "What is the cancellation policy?", answer: "Full refund if cancelled 30+ days before departure. 50% refund for 15-30 days.", category: "booking", sort_order: 1, is_visible: true },
  { id: "3", question: "Do I need prior trekking experience?", answer: "It depends on the trek difficulty. Easy treks need no experience; moderate treks need basic fitness.", category: "trekking", sort_order: 2, is_visible: true },
  { id: "4", question: "How do I reach the starting point?", answer: "We provide pickup from the nearest railway station or bus stand. Details are shared after booking.", category: "travel", sort_order: 3, is_visible: true },
  { id: "5", question: "Is travel insurance mandatory?", answer: "We strongly recommend travel insurance for all treks and adventure activities.", category: "booking", sort_order: 4, is_visible: true },
];

export const mockPages = [
  {
    id: "1",
    title: "Privacy Policy",
    slug: "privacy",
    content: "<p>At Dream Go India, we respect your privacy. We collect only the information necessary to process bookings and improve your experience. We never sell your personal data to third parties.</p><p>Data we collect includes name, email, phone number, and payment details for booking purposes. You may request deletion of your data by contacting us at hello@dreamgoindia.com.</p>",
    featured_image: null,
    status: "published" as const,
    seo_title: "Privacy Policy - Dream Go India",
    seo_description: "Learn how Dream Go India protects your personal information.",
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Terms & Conditions",
    slug: "terms",
    content: "<p>By using Dream Go India's website and services, you agree to these terms. All bookings are subject to availability and confirmation.</p><p>Cancellation policies vary by trip. Participants must follow guide instructions and safety protocols. Dream Go India reserves the right to modify itineraries due to weather or safety concerns.</p>",
    featured_image: null,
    status: "published" as const,
    seo_title: "Terms & Conditions - Dream Go India",
    seo_description: "Terms and conditions for booking trips with Dream Go India.",
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockServices = [
  {
    id: "1",
    title: "Trekking Tours",
    description:
      "Guided treks including Kedarkantha, Har Ki Dun, Brahmatal, and more — with experienced trek leaders and full logistics support.",
    icon: "mountain",
  },
  {
    id: "2",
    title: "Adventure Tours",
    description:
      "Camping, hiking, snow trekking, and outdoor expeditions designed for thrill-seekers and nature lovers.",
    icon: "zap",
  },
  {
    id: "3",
    title: "Pilgrimage Tours",
    description:
      "Spiritual journeys including Badrinath Temple, Kedarnath, and complete Char Dham packages with guided assistance.",
    icon: "heart",
  },
  {
    id: "4",
    title: "Customized Tour Packages",
    description:
      "Personalized trips tailored for families, couples, and groups — built around your dates, budget, and interests.",
    icon: "map",
  },
  {
    id: "5",
    title: "Group Tours & Corporate Trips",
    description:
      "Team outings, educational trips, and group adventures with end-to-end planning and on-ground coordination.",
    icon: "users",
  },
  {
    id: "6",
    title: "Hotel & Stay Booking",
    description:
      "Camps, guesthouses, and hotel reservations at scenic locations — from budget stays to premium accommodations.",
    icon: "building",
  },
  {
    id: "7",
    title: "Transportation Services",
    description:
      "Pickup and drop, local transfers, and travel assistance across destinations for a hassle-free journey.",
    icon: "bus",
  },
  {
    id: "8",
    title: "Travel Planning & Guide Services",
    description:
      "Expert itinerary planning with experienced local guides who know the terrain, culture, and hidden gems.",
    icon: "compass",
  },
  {
    id: "9",
    title: "Camping Equipment & Trek Support",
    description:
      "Tents, sleeping bags, meals, and complete trek logistics — everything you need for a comfortable adventure.",
    icon: "tent",
  },
];

export const MOCK_USER_ID = "mock-user-1";

export const mockProfile: Profile = {
  id: MOCK_USER_ID,
  email: "priya.sharma@example.com",
  full_name: "Priya Sharma",
  phone: "+91 98765 43210",
  avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
  role: "customer",
  interests: ["trekking", "adventure", "photography", "mountains"],
  referral_code: "DGI-PRIYA",
  language: "en",
  dark_mode: false,
  created_at: "2025-01-15T10:00:00Z",
  updated_at: new Date().toISOString(),
};

export const mockBookings: Booking[] = [
  {
    id: "b1",
    booking_number: "DGI-MOCK001",
    user_id: MOCK_USER_ID,
    trip_id: "1",
    departure_id: "1",
    travelers: [{ name: "Priya Sharma", age: 28, gender: "female", phone: "+91 98765 43210" }],
    total_amount: 7999,
    discount_amount: 1000,
    status: "confirmed",
    special_requests: "Vegetarian meals preferred",
    created_at: "2026-06-01T08:30:00Z",
    trip: mockTrips[0],
    departure: mockDepartures[0],
  },
  {
    id: "b2",
    booking_number: "DGI-MOCK002",
    user_id: MOCK_USER_ID,
    trip_id: "2",
    departure_id: "2",
    travelers: [
      { name: "Priya Sharma", age: 28, gender: "female" },
      { name: "Rahul Sharma", age: 30, gender: "male" },
    ],
    total_amount: 21998,
    discount_amount: 0,
    status: "completed",
    special_requests: null,
    created_at: "2025-08-10T14:00:00Z",
    trip: mockTrips[1],
    departure: mockDepartures[1],
  },
  {
    id: "b3",
    booking_number: "DGI-MOCK003",
    user_id: MOCK_USER_ID,
    trip_id: "3",
    departure_id: null,
    travelers: [{ name: "Priya Sharma", age: 28, gender: "female" }],
    total_amount: 6499,
    discount_amount: 1000,
    status: "pending",
    special_requests: null,
    created_at: "2026-06-28T09:15:00Z",
    trip: mockTrips[2],
  },
];

export const mockWishlist: WishlistItem[] = [
  { id: "w1", user_id: MOCK_USER_ID, trip_id: "2", created_at: "2026-05-20T10:00:00Z", trip: mockTrips[1] },
  { id: "w2", user_id: MOCK_USER_ID, trip_id: "4", created_at: "2026-06-01T12:00:00Z", trip: mockTrips[3] },
];

export const mockNotifications: Notification[] = [
  {
    id: "n1",
    user_id: MOCK_USER_ID,
    title: "Booking Confirmed",
    message: "Your Har Ki Dun Trek booking (DGI-MOCK001) has been confirmed for Jul 15, 2026.",
    type: "booking",
    link: "/dashboard/bookings",
    is_read: false,
    created_at: "2026-06-02T10:00:00Z",
  },
  {
    id: "n2",
    user_id: MOCK_USER_ID,
    title: "Summer Sale – 15% Off",
    message: "Book any summer trek before August and save 15% with code SUMMER15.",
    type: "promo",
    link: "/trips",
    is_read: false,
    created_at: "2026-06-25T08:00:00Z",
  },
  {
    id: "n3",
    user_id: MOCK_USER_ID,
    title: "Trip Reminder",
    message: "Your Auli Snow Trek departs in 7 days. Check your packing list!",
    type: "reminder",
    link: "/dashboard/bookings",
    is_read: true,
    created_at: "2026-06-20T09:00:00Z",
  },
  {
    id: "n4",
    user_id: MOCK_USER_ID,
    title: "Profile Updated",
    message: "Your profile information was updated successfully.",
    type: "system",
    link: "/dashboard/profile",
    is_read: true,
    created_at: "2026-06-15T11:30:00Z",
  },
];

export const mockUserReviews: Review[] = [
  {
    id: "r1",
    trip_id: "2",
    user_id: MOCK_USER_ID,
    rating: 5,
    title: "Unforgettable Valley Trek",
    content: "The Valley of Flowers exceeded all expectations. Guides were knowledgeable and the scenery was breathtaking.",
    images: ["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80"],
    video_url: null,
    status: "approved",
    is_featured: false,
    created_at: "2025-09-01T16:00:00Z",
    trip: mockTrips[1],
    profile: mockProfile,
  },
];
