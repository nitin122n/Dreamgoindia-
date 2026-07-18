-- ============================================================================
-- Dream Go India - Initial Schema Migration
-- Premium Travel Booking Platform
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('admin', 'customer');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'rejected', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE blog_status AS ENUM ('draft', 'published');
CREATE TYPE difficulty_level AS ENUM ('easy', 'moderate', 'difficult', 'extreme');
CREATE TYPE season_type AS ENUM ('winter', 'summer', 'monsoon', 'all');

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, avatar_url, referral_code, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name'
    ),
    NULLIF(btrim(NEW.raw_user_meta_data ->> 'phone'), ''),
    NEW.raw_user_meta_data ->> 'avatar_url',
    upper(substring(md5(random()::text) from 1 for 8)),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ============================================================================
-- TABLES
-- ============================================================================

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  interests TEXT[] NOT NULL DEFAULT '{}',
  referral_code TEXT UNIQUE,
  language TEXT NOT NULL DEFAULT 'en',
  dark_mode BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Site settings (singleton row)
CREATE TABLE public.settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  site_name TEXT NOT NULL DEFAULT 'Dream Go India',
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#E53935',
  contact_email TEXT,
  contact_phone TEXT,
  whatsapp TEXT,
  address TEXT,
  social_links JSONB NOT NULL DEFAULT '{}',
  footer_text TEXT,
  google_analytics_id TEXT,
  seo_default_title TEXT,
  seo_default_description TEXT,
  payment_razorpay_key TEXT,
  payment_stripe_key TEXT,
  home_marquee_text TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Hero slider
CREATE TABLE public.hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  cta_text TEXT NOT NULL DEFAULT 'Explore Now',
  cta_link TEXT NOT NULL DEFAULT '/trips',
  secondary_cta_text TEXT,
  secondary_cta_link TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Destinations
CREATE TABLE public.destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  state TEXT,
  country TEXT NOT NULL DEFAULT 'India',
  description TEXT,
  short_description TEXT,
  image_url TEXT,
  cover_image_url TEXT,
  gallery TEXT[] NOT NULL DEFAULT '{}',
  map_lat DOUBLE PRECISION,
  map_lng DOUBLE PRECISION,
  best_season TEXT,
  altitude TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trip categories
CREATE TABLE public.trip_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  season season_type NOT NULL DEFAULT 'all',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trips
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.trip_categories(id) ON DELETE SET NULL,
  description TEXT,
  overview TEXT,
  location TEXT,
  duration_days INTEGER NOT NULL DEFAULT 1,
  duration_nights INTEGER NOT NULL DEFAULT 0,
  price NUMERIC(12, 2) NOT NULL,
  discount_price NUMERIC(12, 2),
  difficulty difficulty_level NOT NULL DEFAULT 'moderate',
  max_seats INTEGER NOT NULL DEFAULT 20,
  seats_left INTEGER NOT NULL DEFAULT 20,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  season season_type NOT NULL DEFAULT 'all',
  highlights TEXT[] NOT NULL DEFAULT '{}',
  itinerary JSONB NOT NULL DEFAULT '[]',
  inclusions TEXT[] NOT NULL DEFAULT '{}',
  exclusions TEXT[] NOT NULL DEFAULT '{}',
  faqs JSONB NOT NULL DEFAULT '[]',
  map_lat DOUBLE PRECISION,
  map_lng DOUBLE PRECISION,
  altitude TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_trending BOOLEAN NOT NULL DEFAULT false,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  seo_title TEXT,
  seo_description TEXT,
  itinerary_pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trip images
CREATE TABLE public.trip_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trip departures
CREATE TABLE public.trip_departures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  departure_date DATE NOT NULL,
  return_date DATE,
  seats_available INTEGER NOT NULL DEFAULT 0,
  price_override NUMERIC(12, 2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Coupons
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(12, 2) NOT NULL,
  min_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  max_discount NUMERIC(12, 2),
  usage_limit INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bookings
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE RESTRICT,
  departure_id UUID REFERENCES public.trip_departures(id) ON DELETE SET NULL,
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
  travelers JSONB NOT NULL DEFAULT '[]',
  total_amount NUMERIC(12, 2) NOT NULL,
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status booking_status NOT NULL DEFAULT 'pending',
  special_requests TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_method TEXT,
  transaction_id TEXT,
  status payment_status NOT NULL DEFAULT 'pending',
  payment_gateway TEXT,
  gateway_response JSONB,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  video_url TEXT,
  status review_status NOT NULL DEFAULT 'pending',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Testimonials
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  image_url TEXT,
  video_url TEXT,
  trip_name TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Gallery
CREATE TABLE public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  image_url TEXT,
  video_url TEXT,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  category TEXT,
  album TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Blog categories
CREATE TABLE public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Blogs
CREATE TABLE public.blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  featured_image TEXT,
  category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  status blog_status NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Blog comments
CREATE TABLE public.blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id UUID NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT,
  author_email TEXT,
  content TEXT NOT NULL,
  status review_status NOT NULL DEFAULT 'pending',
  parent_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FAQ
CREATE TABLE public.faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CMS Pages (About, Privacy, Terms, etc.)
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  seo_title TEXT,
  seo_description TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contact form submissions
CREATE TABLE public.contact_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  admin_reply TEXT,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Newsletter subscribers
CREATE TABLE public.newsletter (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ
);

-- Wishlist
CREATE TABLE public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, trip_id)
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Media library
CREATE TABLE public.media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  bucket TEXT,
  alt_text TEXT,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activity logs (admin audit trail)
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Why Choose Us
CREATE TABLE public.why_choose_us (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_referral_code ON public.profiles(referral_code);

CREATE INDEX idx_hero_slides_sort ON public.hero_slides(sort_order) WHERE is_visible = true;

CREATE INDEX idx_destinations_slug ON public.destinations(slug);
CREATE INDEX idx_destinations_featured ON public.destinations(is_featured) WHERE is_visible = true;
CREATE INDEX idx_destinations_sort ON public.destinations(sort_order);

CREATE INDEX idx_trip_categories_slug ON public.trip_categories(slug);
CREATE INDEX idx_trip_categories_season ON public.trip_categories(season);

CREATE INDEX idx_trips_slug ON public.trips(slug);
CREATE INDEX idx_trips_destination ON public.trips(destination_id);
CREATE INDEX idx_trips_category ON public.trips(category_id);
CREATE INDEX idx_trips_season ON public.trips(season);
CREATE INDEX idx_trips_difficulty ON public.trips(difficulty);
CREATE INDEX idx_trips_price ON public.trips(price);
CREATE INDEX idx_trips_featured ON public.trips(is_featured) WHERE is_visible = true;
CREATE INDEX idx_trips_popular ON public.trips(is_popular) WHERE is_visible = true;
CREATE INDEX idx_trips_trending ON public.trips(is_trending) WHERE is_visible = true;
CREATE INDEX idx_trips_visible ON public.trips(is_visible);

CREATE INDEX idx_trip_images_trip ON public.trip_images(trip_id);
CREATE INDEX idx_trip_images_cover ON public.trip_images(trip_id) WHERE is_cover = true;

CREATE INDEX idx_trip_departures_trip ON public.trip_departures(trip_id);
CREATE INDEX idx_trip_departures_date ON public.trip_departures(departure_date) WHERE is_active = true;

CREATE INDEX idx_coupons_code ON public.coupons(code) WHERE is_active = true;

CREATE INDEX idx_bookings_user ON public.bookings(user_id);
CREATE INDEX idx_bookings_trip ON public.bookings(trip_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_number ON public.bookings(booking_number);
CREATE INDEX idx_bookings_created ON public.bookings(created_at DESC);

CREATE INDEX idx_payments_booking ON public.payments(booking_id);
CREATE INDEX idx_payments_user ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_transaction ON public.payments(transaction_id);

CREATE INDEX idx_reviews_trip ON public.reviews(trip_id);
CREATE INDEX idx_reviews_user ON public.reviews(user_id);
CREATE INDEX idx_reviews_status ON public.reviews(status);
CREATE INDEX idx_reviews_featured ON public.reviews(is_featured) WHERE status = 'approved';

CREATE INDEX idx_testimonials_sort ON public.testimonials(sort_order) WHERE is_visible = true;

CREATE INDEX idx_gallery_category ON public.gallery(category) WHERE is_visible = true;
CREATE INDEX idx_gallery_album ON public.gallery(album) WHERE is_visible = true;

CREATE INDEX idx_blog_categories_slug ON public.blog_categories(slug);

CREATE INDEX idx_blogs_slug ON public.blogs(slug);
CREATE INDEX idx_blogs_category ON public.blogs(category_id);
CREATE INDEX idx_blogs_status ON public.blogs(status);
CREATE INDEX idx_blogs_featured ON public.blogs(is_featured) WHERE status = 'published';
CREATE INDEX idx_blogs_published ON public.blogs(published_at DESC) WHERE status = 'published';

CREATE INDEX idx_blog_comments_blog ON public.blog_comments(blog_id);
CREATE INDEX idx_blog_comments_status ON public.blog_comments(status);

CREATE INDEX idx_faq_category ON public.faq(category) WHERE is_visible = true;
CREATE INDEX idx_faq_sort ON public.faq(sort_order);

CREATE INDEX idx_pages_slug ON public.pages(slug);
CREATE INDEX idx_pages_published ON public.pages(is_published);

CREATE INDEX idx_contact_forms_read ON public.contact_forms(is_read);
CREATE INDEX idx_contact_forms_created ON public.contact_forms(created_at DESC);

CREATE INDEX idx_newsletter_email ON public.newsletter(email);
CREATE INDEX idx_newsletter_active ON public.newsletter(is_active);

CREATE INDEX idx_wishlist_user ON public.wishlist(user_id);
CREATE INDEX idx_wishlist_trip ON public.wishlist(trip_id);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id) WHERE is_read = false;

CREATE INDEX idx_media_library_bucket ON public.media_library(bucket);
CREATE INDEX idx_media_library_uploaded_by ON public.media_library(uploaded_by);

CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created ON public.activity_logs(created_at DESC);

CREATE INDEX idx_why_choose_us_sort ON public.why_choose_us(sort_order) WHERE is_visible = true;

-- ============================================================================
-- TRIGGERS: updated_at
-- ============================================================================

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_hero_slides_updated_at
  BEFORE UPDATE ON public.hero_slides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_destinations_updated_at
  BEFORE UPDATE ON public.destinations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_trip_categories_updated_at
  BEFORE UPDATE ON public.trip_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_trip_departures_updated_at
  BEFORE UPDATE ON public.trip_departures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_gallery_updated_at
  BEFORE UPDATE ON public.gallery
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_blog_categories_updated_at
  BEFORE UPDATE ON public.blog_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_blogs_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_blog_comments_updated_at
  BEFORE UPDATE ON public.blog_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_faq_updated_at
  BEFORE UPDATE ON public.faq
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_why_choose_us_updated_at
  BEFORE UPDATE ON public.why_choose_us
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_departures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.why_choose_us ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------

CREATE POLICY "Public can read profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins have full access to profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- settings
-- ----------------------------------------------------------------------------

CREATE POLICY "Anyone can read settings"
  ON public.settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update settings"
  ON public.settings FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can insert settings"
  ON public.settings FOR INSERT
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- hero_slides
-- ----------------------------------------------------------------------------

CREATE POLICY "Public can read visible hero slides"
  ON public.hero_slides FOR SELECT
  USING (is_visible = true OR public.is_admin());

CREATE POLICY "Admins manage hero slides"
  ON public.hero_slides FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- destinations
-- ----------------------------------------------------------------------------

CREATE POLICY "Public can read visible destinations"
  ON public.destinations FOR SELECT
  USING (is_visible = true OR public.is_admin());

CREATE POLICY "Admins manage destinations"
  ON public.destinations FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- trip_categories
-- ----------------------------------------------------------------------------

CREATE POLICY "Public can read visible trip categories"
  ON public.trip_categories FOR SELECT
  USING (is_visible = true OR public.is_admin());

CREATE POLICY "Admins manage trip categories"
  ON public.trip_categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- trips
-- ----------------------------------------------------------------------------

CREATE POLICY "Public can read visible trips"
  ON public.trips FOR SELECT
  USING (is_visible = true OR public.is_admin());

CREATE POLICY "Admins manage trips"
  ON public.trips FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- trip_images
-- ----------------------------------------------------------------------------

CREATE POLICY "Public can read trip images for visible trips"
  ON public.trip_images FOR SELECT
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.trips t
      WHERE t.id = trip_images.trip_id AND t.is_visible = true
    )
  );

CREATE POLICY "Admins manage trip images"
  ON public.trip_images FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- trip_departures
-- ----------------------------------------------------------------------------

CREATE POLICY "Public can read active departures for visible trips"
  ON public.trip_departures FOR SELECT
  USING (
    public.is_admin()
    OR (
      is_active = true
      AND EXISTS (
        SELECT 1 FROM public.trips t
        WHERE t.id = trip_departures.trip_id AND t.is_visible = true
      )
    )
  );

CREATE POLICY "Admins manage trip departures"
  ON public.trip_departures FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- coupons
-- ----------------------------------------------------------------------------

CREATE POLICY "Authenticated users can read active coupons"
  ON public.coupons FOR SELECT
  USING (
    public.is_admin()
    OR (
      auth.role() = 'authenticated'
      AND is_active = true
      AND (valid_from IS NULL OR valid_from <= now())
      AND (valid_until IS NULL OR valid_until >= now())
    )
  );

CREATE POLICY "Admins manage coupons"
  ON public.coupons FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- bookings
-- ----------------------------------------------------------------------------

CREATE POLICY "Users can read own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can create own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage all bookings"
  ON public.bookings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- payments
-- ----------------------------------------------------------------------------

CREATE POLICY "Users can read own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can create own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage all payments"
  ON public.payments FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- reviews
-- ----------------------------------------------------------------------------

CREATE POLICY "Public can read approved reviews"
  ON public.reviews FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Authenticated users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage all reviews"
  ON public.reviews FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- testimonials
-- ----------------------------------------------------------------------------

CREATE POLICY "Public can read visible testimonials"
  ON public.testimonials FOR SELECT
  USING (is_visible = true OR public.is_admin());

CREATE POLICY "Admins manage testimonials"
  ON public.testimonials FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- gallery
-- ----------------------------------------------------------------------------

CREATE POLICY "Public can read visible gallery items"
  ON public.gallery FOR SELECT
  USING (is_visible = true OR public.is_admin());

CREATE POLICY "Admins manage gallery"
  ON public.gallery FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- blog_categories
-- ----------------------------------------------------------------------------

CREATE POLICY "Public can read blog categories"
  ON public.blog_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins manage blog categories"
  ON public.blog_categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- blogs
-- ----------------------------------------------------------------------------

CREATE POLICY "Public can read published blogs"
  ON public.blogs FOR SELECT
  USING (status = 'published' OR public.is_admin());

CREATE POLICY "Admins manage blogs"
  ON public.blogs FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- blog_comments
-- ----------------------------------------------------------------------------

CREATE POLICY "Public can read approved blog comments"
  ON public.blog_comments FOR SELECT
  USING (
    status = 'approved'
    OR auth.uid() = user_id
    OR public.is_admin()
  );

CREATE POLICY "Anyone can submit blog comments"
  ON public.blog_comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own pending comments"
  ON public.blog_comments FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage blog comments"
  ON public.blog_comments FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- faq
-- ----------------------------------------------------------------------------

CREATE POLICY "Public can read visible faqs"
  ON public.faq FOR SELECT
  USING (is_visible = true OR public.is_admin());

CREATE POLICY "Admins manage faqs"
  ON public.faq FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- pages
-- ----------------------------------------------------------------------------

CREATE POLICY "Public can read published pages"
  ON public.pages FOR SELECT
  USING (is_published = true OR public.is_admin());

CREATE POLICY "Admins manage pages"
  ON public.pages FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- contact_forms
-- ----------------------------------------------------------------------------

CREATE POLICY "Anyone can submit contact forms"
  ON public.contact_forms FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins manage contact forms"
  ON public.contact_forms FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- newsletter
-- ----------------------------------------------------------------------------

CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins manage newsletter"
  ON public.newsletter FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- wishlist
-- ----------------------------------------------------------------------------

CREATE POLICY "Users can read own wishlist"
  ON public.wishlist FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can add to own wishlist"
  ON public.wishlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from own wishlist"
  ON public.wishlist FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins manage wishlist"
  ON public.wishlist FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- notifications
-- ----------------------------------------------------------------------------

CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage notifications"
  ON public.notifications FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- media_library
-- ----------------------------------------------------------------------------

CREATE POLICY "Public can read media library"
  ON public.media_library FOR SELECT
  USING (true);

CREATE POLICY "Admins manage media library"
  ON public.media_library FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- activity_logs
-- ----------------------------------------------------------------------------

CREATE POLICY "Admins can read activity logs"
  ON public.activity_logs FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can insert activity logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (public.is_admin() OR auth.uid() = user_id);

CREATE POLICY "Admins manage activity logs"
  ON public.activity_logs FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- why_choose_us
-- ----------------------------------------------------------------------------

CREATE POLICY "Public can read visible why choose us"
  ON public.why_choose_us FOR SELECT
  USING (is_visible = true OR public.is_admin());

CREATE POLICY "Admins manage why choose us"
  ON public.why_choose_us FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('hero-images', 'hero-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('trip-images', 'trip-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('destination-images', 'destination-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('gallery-images', 'gallery-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('blog-images', 'blog-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('media', 'media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- hero-images
CREATE POLICY "Public read hero images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'hero-images');

CREATE POLICY "Admins upload hero images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'hero-images' AND public.is_admin());

CREATE POLICY "Admins update hero images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'hero-images' AND public.is_admin());

CREATE POLICY "Admins delete hero images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'hero-images' AND public.is_admin());

-- trip-images
CREATE POLICY "Public read trip images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'trip-images');

CREATE POLICY "Admins upload trip images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'trip-images' AND public.is_admin());

CREATE POLICY "Admins update trip images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'trip-images' AND public.is_admin());

CREATE POLICY "Admins delete trip images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'trip-images' AND public.is_admin());

-- destination-images
CREATE POLICY "Public read destination images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'destination-images');

CREATE POLICY "Admins upload destination images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'destination-images' AND public.is_admin());

CREATE POLICY "Admins update destination images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'destination-images' AND public.is_admin());

CREATE POLICY "Admins delete destination images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'destination-images' AND public.is_admin());

-- gallery-images
CREATE POLICY "Public read gallery images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery-images');

CREATE POLICY "Admins upload gallery images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gallery-images' AND public.is_admin());

CREATE POLICY "Admins update gallery images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'gallery-images' AND public.is_admin());

CREATE POLICY "Admins delete gallery images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'gallery-images' AND public.is_admin());

-- blog-images
CREATE POLICY "Public read blog images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

CREATE POLICY "Admins upload blog images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'blog-images' AND public.is_admin());

CREATE POLICY "Admins update blog images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'blog-images' AND public.is_admin());

CREATE POLICY "Admins delete blog images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'blog-images' AND public.is_admin());

-- avatars
CREATE POLICY "Public read avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND (public.is_admin() OR auth.uid()::text = (storage.foldername(name))[1])
  );

CREATE POLICY "Users update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND (public.is_admin() OR auth.uid()::text = (storage.foldername(name))[1])
  );

CREATE POLICY "Users delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND (public.is_admin() OR auth.uid()::text = (storage.foldername(name))[1])
  );

-- media (admin-managed general media)
CREATE POLICY "Public read media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

CREATE POLICY "Admins upload media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'media' AND public.is_admin());

CREATE POLICY "Admins update media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'media' AND public.is_admin());

CREATE POLICY "Admins delete media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'media' AND public.is_admin());

-- Review image uploads (authenticated users)
CREATE POLICY "Authenticated users upload review images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'media'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'reviews'
  );
