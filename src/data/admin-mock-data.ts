import type {
  Booking,
  Blog,
  ContactForm,
  Coupon,
  Destination,
  FAQ,
  GalleryItem,
  HeroSlide,
  MediaItem,
  Profile,
  Review,
  SiteSettings,
  Testimonial,
  Trip,
  TripCategory,
} from "@/types";
import {
  defaultSettings,
  mockBlogs,
  mockCategories,
  mockDestinations,
  mockFaqs,
  mockGallery,
  mockHeroSlides,
  mockTestimonials,
  mockTrips,
} from "@/data/mock-data";
import { seedHighlights } from "@/data/highlights";
import type { Highlight } from "@/types/highlight";

export interface NewsletterSubscriber {
  id: string;
  email: string;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export interface AdminStats {
  totalBookings: number;
  totalRevenue: number;
  totalUsers: number;
  pendingBookings: number;
  pendingReviews: number;
  monthlyBookings: { month: string; count: number }[];
  monthlyRevenue: { month: string; amount: number }[];
}

export const mockProfiles: Profile[] = [
  {
    id: "user-1",
    email: "priya@example.com",
    full_name: "Priya Sharma",
    phone: "+91 98765 43210",
    avatar_url: null,
    role: "customer",
    interests: ["trekking"],
    referral_code: "PRIYA10",
    language: "en",
    dark_mode: false,
    created_at: "2025-06-01T10:00:00Z",
    updated_at: "2025-06-01T10:00:00Z",
  },
  {
    id: "user-2",
    email: "rahul@example.com",
    full_name: "Rahul Verma",
    phone: "+91 91234 56789",
    avatar_url: null,
    role: "customer",
    interests: ["adventure"],
    referral_code: null,
    language: "en",
    dark_mode: false,
    created_at: "2025-07-15T10:00:00Z",
    updated_at: "2025-07-15T10:00:00Z",
  },
  {
    id: "mock-admin",
    email: "admin@dreamgoindia.com",
    full_name: "Admin User",
    phone: null,
    avatar_url: null,
    role: "admin",
    interests: [],
    referral_code: null,
    language: "en",
    dark_mode: false,
    created_at: "2025-01-01T10:00:00Z",
    updated_at: "2025-01-01T10:00:00Z",
  },
];

export const mockBookings: Booking[] = [
  {
    id: "bk-1",
    booking_number: "DGI-2026-001",
    user_id: "user-1",
    trip_id: "1",
    departure_id: "1",
    travelers: [{ name: "Priya Sharma", age: 28, gender: "female" }],
    total_amount: 7999,
    discount_amount: 0,
    status: "pending",
    special_requests: "Vegetarian meals",
    created_at: "2026-03-01T09:00:00Z",
    trip: mockTrips[0],
    profile: mockProfiles[0],
  },
  {
    id: "bk-2",
    booking_number: "DGI-2026-002",
    user_id: "user-2",
    trip_id: "2",
    departure_id: "2",
    travelers: [{ name: "Rahul Verma", age: 32, gender: "male" }],
    total_amount: 10999,
    discount_amount: 500,
    status: "confirmed",
    special_requests: null,
    created_at: "2026-02-20T14:30:00Z",
    trip: mockTrips[1],
    profile: mockProfiles[1],
  },
  {
    id: "bk-3",
    booking_number: "DGI-2026-003",
    user_id: "user-1",
    trip_id: "3",
    departure_id: "3",
    travelers: [{ name: "Priya Sharma", age: 28, gender: "female" }],
    total_amount: 6499,
    discount_amount: 0,
    status: "completed",
    special_requests: null,
    created_at: "2026-01-10T11:00:00Z",
    trip: mockTrips[2],
    profile: mockProfiles[0],
  },
];

export const mockReviews: Review[] = [
  {
    id: "rev-1",
    trip_id: "1",
    user_id: "user-1",
    rating: 5,
    title: "Amazing trek!",
    content: "Har Ki Dun was breathtaking. Great guides and organization.",
    images: [],
    video_url: null,
    status: "pending",
    is_featured: false,
    created_at: "2026-03-02T10:00:00Z",
    profile: mockProfiles[0],
    trip: mockTrips[0],
  },
  {
    id: "rev-2",
    trip_id: "2",
    user_id: "user-2",
    rating: 4,
    title: "Beautiful valley",
    content: "Valley of Flowers exceeded expectations.",
    images: [],
    video_url: null,
    status: "approved",
    is_featured: true,
    created_at: "2026-02-25T08:00:00Z",
    profile: mockProfiles[1],
    trip: mockTrips[1],
  },
];

export const mockCoupons: Coupon[] = [
  {
    id: "cp-1",
    code: "WELCOME10",
    description: "10% off first booking",
    type: "percentage",
    value: 10,
    min_order_amount: 5000,
    max_discount: 2000,
    usage_limit: 100,
    usage_count: 24,
    valid_from: "2026-01-01T00:00:00Z",
    valid_until: "2026-12-31T23:59:59Z",
    is_active: true,
    trip_ids: [],
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "cp-2",
    code: "FLAT500",
    description: "Flat ₹500 off",
    type: "fixed",
    value: 500,
    min_order_amount: 3000,
    max_discount: null,
    usage_limit: 50,
    usage_count: 12,
    valid_from: "2026-03-01T00:00:00Z",
    valid_until: null,
    is_active: true,
    trip_ids: ["1", "2"],
    created_at: "2026-03-01T00:00:00Z",
  },
];

export const mockContactForms: ContactForm[] = [
  {
    id: "cf-1",
    name: "Amit Kumar",
    email: "amit@example.com",
    phone: "+91 99887 76655",
    subject: "Group booking inquiry",
    message: "We are a group of 15 looking for a Ladakh trip in July.",
    status: "new",
    created_at: "2026-03-05T10:00:00Z",
  },
  {
    id: "cf-2",
    name: "Sneha Reddy",
    email: "sneha@example.com",
    phone: null,
    subject: "Cancellation policy",
    message: "What is your cancellation policy for monsoon treks?",
    status: "read",
    created_at: "2026-03-04T15:30:00Z",
  },
];

export const mockNewsletter: NewsletterSubscriber[] = [
  { id: "nl-1", email: "subscriber1@example.com", is_active: true, subscribed_at: "2026-01-15T10:00:00Z", unsubscribed_at: null },
  { id: "nl-2", email: "subscriber2@example.com", is_active: true, subscribed_at: "2026-02-01T10:00:00Z", unsubscribed_at: null },
  { id: "nl-3", email: "old@example.com", is_active: false, subscribed_at: "2025-06-01T10:00:00Z", unsubscribed_at: "2025-12-01T10:00:00Z" },
];

export const mockMedia: MediaItem[] = [
  {
    id: "media-1",
    filename: "hero-mountain.jpg",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    mime_type: "image/jpeg",
    size_bytes: 245000,
    alt_text: "Mountain landscape",
    folder: "hero",
    uploaded_by: "mock-admin",
    created_at: "2026-01-10T10:00:00Z",
  },
  {
    id: "media-2",
    filename: "trek-camp.jpg",
    url: "https://images.unsplash.com/photo-1478131143088-5e7e85b1958b?w=800&q=80",
    mime_type: "image/jpeg",
    size_bytes: 198000,
    alt_text: "Camping at night",
    folder: "gallery",
    uploaded_by: "mock-admin",
    created_at: "2026-02-05T10:00:00Z",
  },
];

/** Collect all website image URLs into the media library so admin can manage them. */
function collectWebsiteMedia(): MediaItem[] {
  const seen = new Set<string>();
  const items: MediaItem[] = [];

  const push = (url: string | null | undefined, folder: string, alt: string) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    const filename = url.split("/").pop()?.split("?")[0] || `${folder}-image`;
    items.push({
      id: `site-${items.length + 1}`,
      filename,
      url,
      mime_type: "image/jpeg",
      size_bytes: 0,
      alt_text: alt,
      folder,
      uploaded_by: "mock-admin",
      created_at: new Date().toISOString(),
    });
  };

  mockHeroSlides.forEach((s) => push(s.image_url, "hero", s.title));
  mockDestinations.forEach((d) => push(d.image_url, "destinations", d.name));
  mockTrips.forEach((t) => {
    t.trip_images?.forEach((img) => push(img.image_url, "trips", img.alt_text || t.title));
  });
  mockGallery.forEach((g) => push(g.image_url, "gallery", g.title || "Gallery"));
  mockBlogs.forEach((b) => push(b.featured_image, "blogs", b.title));
  mockTestimonials.forEach((t) => push(t.image_url, "testimonials", t.name));
  seedHighlights.forEach((h) => {
    push(h.cover, "highlights", h.title);
    h.stories?.forEach((s, i) => push(s.image, "highlights", `${h.title} · ${i + 1}`));
  });
  mockMedia.forEach((m) => push(m.url, m.folder ?? "media", m.alt_text ?? m.filename));

  return items;
}

export const mockAdminStats: AdminStats = {
  totalBookings: 156,
  totalRevenue: 1245000,
  totalUsers: 89,
  pendingBookings: 8,
  pendingReviews: 3,
  monthlyBookings: [
    { month: "Oct", count: 12 },
    { month: "Nov", count: 18 },
    { month: "Dec", count: 22 },
    { month: "Jan", count: 15 },
    { month: "Feb", count: 28 },
    { month: "Mar", count: 24 },
  ],
  monthlyRevenue: [
    { month: "Oct", amount: 96000 },
    { month: "Nov", amount: 144000 },
    { month: "Dec", amount: 176000 },
    { month: "Jan", amount: 120000 },
    { month: "Feb", amount: 224000 },
    { month: "Mar", amount: 192000 },
  ],
};

export function createAdminMockStore() {
  return {
    highlights: structuredClone(seedHighlights) as Highlight[],
    heroSlides: structuredClone(mockHeroSlides) as HeroSlide[],
    destinations: structuredClone(mockDestinations) as Destination[],
    categories: structuredClone(mockCategories) as TripCategory[],
    trips: structuredClone(mockTrips) as Trip[],
    testimonials: structuredClone(mockTestimonials) as Testimonial[],
    gallery: structuredClone(mockGallery) as GalleryItem[],
    blogs: structuredClone(mockBlogs) as Blog[],
    faqs: structuredClone(mockFaqs) as FAQ[],
    bookings: structuredClone(mockBookings) as Booking[],
    reviews: structuredClone(mockReviews) as Review[],
    coupons: structuredClone(mockCoupons) as Coupon[],
    contactForms: structuredClone(mockContactForms) as ContactForm[],
    newsletter: structuredClone(mockNewsletter) as NewsletterSubscriber[],
    media: collectWebsiteMedia(),
    profiles: structuredClone(mockProfiles) as Profile[],
    settings: structuredClone({ ...defaultSettings, google_analytics_id: "" }) as SiteSettings,
  };
}

export type AdminMockStore = ReturnType<typeof createAdminMockStore>;
