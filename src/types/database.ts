export type UserRole = "admin" | "customer";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "rejected" | "completed";
export type DifficultyLevel = "easy" | "moderate" | "difficult" | "extreme";
export type SeasonType = "winter" | "summer" | "monsoon" | "all";
export type TripType = "trek" | "dham";
export type ReviewStatus = "pending" | "approved" | "rejected";
export type BlogStatus = "draft" | "published";
export type MediaType = "image" | "video";
export type PageStatus = "draft" | "published";
export type ContactFormStatus = "new" | "read" | "replied" | "archived";
export type CouponType = "percentage" | "fixed";
export type NotificationType = "booking" | "promo" | "system" | "reminder";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  interests: string[];
  referral_code: string | null;
  language: string;
  dark_mode: boolean;
  created_at: string;
  updated_at: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  cta_text: string;
  cta_link: string;
  secondary_cta_text: string | null;
  secondary_cta_link: string | null;
  sort_order: number;
  is_visible: boolean;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  state: string | null;
  country: string;
  description: string | null;
  short_description: string | null;
  image_url: string | null;
  cover_image_url: string | null;
  gallery: string[];
  map_lat: number | null;
  map_lng: number | null;
  best_season: string | null;
  altitude: string | null;
  is_featured: boolean;
  is_visible: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
}

export interface TripCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  season: SeasonType;
  sort_order: number;
  is_visible: boolean;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Trip {
  id: string;
  title: string;
  slug: string;
  destination_id: string | null;
  category_id: string | null;
  description: string | null;
  overview: string | null;
  location: string | null;
  duration_days: number;
  duration_nights: number;
  price: number;
  discount_price: number | null;
  difficulty: DifficultyLevel;
  max_seats: number;
  seats_left: number;
  rating: number;
  review_count: number;
  season: SeasonType;
  trip_type?: TripType;
  highlights: string[];
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  faqs: FAQItem[];
  map_lat: number | null;
  map_lng: number | null;
  altitude: string | null;
  is_featured: boolean;
  is_popular: boolean;
  is_trending: boolean;
  is_visible: boolean;
  seo_title: string | null;
  seo_description: string | null;
  /** Detailed itinerary PDF (uploaded in admin) */
  itinerary_pdf_url: string | null;
  /** Homepage position — lower number shows first (admin-managed) */
  sort_order: number;
  created_at: string;
  trip_images?: TripImage[];
  destination?: Destination;
  category?: TripCategory;
}

export interface TripImage {
  id: string;
  trip_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_cover: boolean;
}

export interface TripDeparture {
  id: string;
  trip_id: string;
  departure_date: string;
  return_date: string | null;
  seats_available: number;
  price_override: number | null;
  is_active: boolean;
  trip?: Trip;
}

export interface Traveler {
  name: string;
  age: number;
  gender: string;
  phone?: string;
  email?: string;
}

export interface Booking {
  id: string;
  booking_number: string;
  user_id: string;
  trip_id: string;
  departure_id: string | null;
  travelers: Traveler[];
  total_amount: number;
  discount_amount: number;
  status: BookingStatus;
  special_requests: string | null;
  created_at: string;
  trip?: Trip;
  departure?: TripDeparture;
  profile?: Profile;
}

export interface Review {
  id: string;
  trip_id: string | null;
  user_id: string | null;
  rating: number;
  title: string | null;
  content: string | null;
  images: string[];
  video_url: string | null;
  status: ReviewStatus;
  is_featured: boolean;
  created_at: string;
  profile?: Profile;
  trip?: Trip;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string | null;
  content: string;
  rating: number;
  image_url: string | null;
  video_url: string | null;
  trip_name: string | null;
  sort_order: number;
  is_visible: boolean;
}

/** Homepage “Instagram images” card (managed in Admin → Instagram) */
export interface InstagramPost {
  id: string;
  permalink: string;
  subtitle: string | null;
  caption: string | null;
  image_url: string;
  sort_order: number;
  is_visible: boolean;
}

export interface GalleryItem {
  id: string;
  title: string | null;
  image_url: string | null;
  video_url: string | null;
  media_type: MediaType;
  category: string | null;
  album: string | null;
  sort_order: number;
  is_visible: boolean;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  category_id: string | null;
  tags: string[];
  status: BlogStatus;
  is_featured: boolean;
  view_count: number;
  published_at: string | null;
  created_at: string;
  blog_category?: BlogCategory;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_visible: boolean;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  featured_image: string | null;
  status: PageStatus;
  seo_title: string | null;
  seo_description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ContactForm {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: ContactFormStatus;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  type: CouponType;
  value: number;
  min_order_amount: number | null;
  max_discount: number | null;
  usage_limit: number | null;
  usage_count: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  trip_ids: string[];
  created_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  group: string;
  label: string | null;
  updated_at: string;
}

export interface SiteSettings {
  site_name: string;
  logo_url: string;
  favicon_url: string;
  primary_color: string;
  contact_email: string;
  contact_phone: string;
  whatsapp: string;
  address: string;
  social_links: Record<string, string>;
  footer_text: string;
  google_analytics_id: string;
  seo_default_title: string;
  seo_default_description: string;
  /** Razorpay Key ID (rzp_test_… or rzp_live_…) — safe for client checkout */
  payment_razorpay_key: string;
  /** Scrolling banner under story highlights on the homepage */
  home_marquee_text: string;
  /** Founder photo shown on the About page */
  about_founder_image: string;
}

export interface WhyChooseUs {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_visible: boolean;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  trip_id: string;
  created_at: string;
  trip?: Trip;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface MediaItem {
  id: string;
  filename: string;
  url: string;
  mime_type: string;
  size_bytes: number;
  alt_text: string | null;
  folder: string | null;
  uploaded_by: string | null;
  created_at: string;
}

type TableDef<T> = {
  Row: T;
  Insert: Partial<T>;
  Update: Partial<T>;
};

export interface Database {
  public: {
    Tables: {
      profiles: TableDef<Profile>;
      hero_slides: TableDef<HeroSlide>;
      destinations: TableDef<Destination>;
      trip_categories: TableDef<TripCategory>;
      trips: TableDef<Trip>;
      trip_images: TableDef<TripImage>;
      trip_departures: TableDef<TripDeparture>;
      bookings: TableDef<Booking>;
      reviews: TableDef<Review>;
      testimonials: TableDef<Testimonial>;
      gallery: TableDef<GalleryItem>;
      blog_categories: TableDef<BlogCategory>;
      blogs: TableDef<Blog>;
      faq: TableDef<FAQ>;
      pages: TableDef<Page>;
      contact_forms: TableDef<ContactForm>;
      coupons: TableDef<Coupon>;
      settings: TableDef<Setting>;
      why_choose_us: TableDef<WhyChooseUs>;
      wishlist: TableDef<WishlistItem>;
      notifications: TableDef<Notification>;
      media_library: TableDef<MediaItem>;
      newsletter: TableDef<{ id: string; email: string; is_active: boolean; subscribed_at: string }>;
      payments: TableDef<{ id: string; booking_id: string; amount: number; status: string; created_at: string }>;
      blog_comments: TableDef<{ id: string; blog_id: string; content: string; created_at: string }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      booking_status: BookingStatus;
      difficulty_level: DifficultyLevel;
      season_type: SeasonType;
      review_status: ReviewStatus;
      blog_status: BlogStatus;
      media_type: MediaType;
      page_status: PageStatus;
      contact_form_status: ContactFormStatus;
      coupon_type: CouponType;
      notification_type: NotificationType;
    };
  };
}
