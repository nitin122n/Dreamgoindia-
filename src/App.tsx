import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import { MainLayout } from "@/components/layout/MainLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardRoute } from "@/components/auth/DashboardRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";

// Public pages
import HomePage from "@/pages/public/HomePage";
import TripsPage from "@/pages/public/TripsPage";
import TripDetailPage from "@/pages/public/TripDetailPage";
import DestinationsPage from "@/pages/public/DestinationsPage";
import DestinationDetailPage from "@/pages/public/DestinationDetailPage";
import AboutPage from "@/pages/public/AboutPage";
import ServicesPage from "@/pages/public/ServicesPage";
import GalleryPage from "@/pages/public/GalleryPage";
import BlogPage from "@/pages/public/BlogPage";
import BlogDetailPage from "@/pages/public/BlogDetailPage";
import ContactPage from "@/pages/public/ContactPage";
import FAQPage from "@/pages/public/FAQPage";
import PrivacyPage from "@/pages/public/PrivacyPage";
import TermsPage from "@/pages/public/TermsPage";
import BookingPage from "@/pages/public/BookingPage";
import TripPackagesPage from "@/pages/public/TripPackagesPage";
import DeparturesPage from "@/pages/public/DeparturesPage";
import TestimonialsPage from "@/pages/public/TestimonialsPage";
import NotFoundPage from "@/pages/public/NotFoundPage";

// Auth pages
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import AuthCallbackPage from "@/pages/auth/AuthCallbackPage";
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";

// Dashboard pages
import DashboardHome from "@/pages/dashboard/DashboardHome";
import BookingsPage from "@/pages/dashboard/BookingsPage";
import WishlistPage from "@/pages/dashboard/WishlistPage";
import ProfilePage from "@/pages/dashboard/ProfilePage";
import NotificationsPage from "@/pages/dashboard/NotificationsPage";
import ReviewsPage from "@/pages/dashboard/ReviewsPage";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminBookingsPage from "@/pages/admin/AdminBookingsPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminTripsPage from "@/pages/admin/AdminTripsPage";
import AdminOngoingTripsPage from "@/pages/admin/AdminOngoingTripsPage";
import AdminCategoriesPage from "@/pages/admin/AdminCategoriesPage";
import AdminBlogsPage from "@/pages/admin/AdminBlogsPage";
import AdminGalleryPage from "@/pages/admin/AdminGalleryPage";
import AdminReviewsPage from "@/pages/admin/AdminReviewsPage";
import AdminTestimonialsPage from "@/pages/admin/AdminTestimonialsPage";
import AdminFAQPage from "@/pages/admin/AdminFAQPage";
import AdminHeroPage from "@/pages/admin/AdminHeroPage";
import AdminHighlightsPage from "@/pages/admin/AdminHighlightsPage";
import AdminInstagramPage from "@/pages/admin/AdminInstagramPage";
import AdminDestinationsPage from "@/pages/admin/AdminDestinationsPage";
import AdminCouponsPage from "@/pages/admin/AdminCouponsPage";
import AdminNewsletterPage from "@/pages/admin/AdminNewsletterPage";
import AdminContactPage from "@/pages/admin/AdminContactPage";
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";
import AdminMediaPage from "@/pages/admin/AdminMediaPage";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SettingsProvider>
            <AuthProvider>
              <BrowserRouter>
                <ScrollToTop />
                <Routes>
                  {/* Public routes with main layout */}
                  <Route element={<MainLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="trips" element={<TripsPage />} />
                    <Route path="trips/packages" element={<TripPackagesPage />} />
                    <Route path="trips/:slug" element={<TripDetailPage />} />
                    <Route
                      path="trips/:slug/book"
                      element={
                        <ProtectedRoute>
                          <BookingPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="destinations" element={<DestinationsPage />} />
                    <Route path="destinations/:slug" element={<DestinationDetailPage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="services" element={<ServicesPage />} />
                    <Route path="departures" element={<DeparturesPage />} />
                    <Route path="testimonials" element={<TestimonialsPage />} />
                    <Route path="gallery" element={<GalleryPage />} />
                    <Route path="blog" element={<BlogPage />} />
                    <Route path="blog/:slug" element={<BlogDetailPage />} />
                    <Route path="contact" element={<ContactPage />} />
                    <Route path="faq" element={<FAQPage />} />
                    <Route path="privacy" element={<PrivacyPage />} />
                    <Route path="terms" element={<TermsPage />} />
                  </Route>

                  {/* Auth routes (no main layout) */}
                  <Route path="login" element={<Navigate to="/auth/login" replace />} />
                  <Route path="auth/login" element={<LoginPage />} />
                  <Route path="auth/signup" element={<SignupPage />} />
                  <Route path="auth/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="auth/reset-password" element={<ResetPasswordPage />} />
                  <Route path="auth/callback" element={<AuthCallbackPage />} />
                  <Route path="auth/verify-email" element={<VerifyEmailPage />} />

                  {/* Customer dashboard */}
                  <Route
                    path="/dashboard"
                    element={
                      <DashboardRoute>
                        <DashboardLayout />
                      </DashboardRoute>
                    }
                  >
                    <Route index element={<DashboardHome />} />
                    <Route path="bookings" element={<BookingsPage />} />
                    <Route path="wishlist" element={<WishlistPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="reviews" element={<ReviewsPage />} />
                  </Route>

                  {/* Admin login (public — separate from customer login) */}
                  <Route path="/admin/login" element={<AdminLoginPage />} />

                  {/* Admin dashboard */}
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminLayout />
                      </AdminRoute>
                    }
                  >
                    <Route index element={<AdminDashboard />} />
                    <Route path="bookings" element={<AdminBookingsPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="trips" element={<AdminTripsPage />} />
                    <Route path="ongoing-trips" element={<AdminOngoingTripsPage />} />
                    <Route path="categories" element={<AdminCategoriesPage />} />
                    <Route path="blogs" element={<AdminBlogsPage />} />
                    <Route path="gallery" element={<AdminGalleryPage />} />
                    <Route path="reviews" element={<AdminReviewsPage />} />
                    <Route path="testimonials" element={<AdminTestimonialsPage />} />
                    <Route path="faqs" element={<AdminFAQPage />} />
                    <Route path="hero" element={<AdminHeroPage />} />
                    <Route path="highlights" element={<AdminHighlightsPage />} />
                    <Route path="instagram" element={<AdminInstagramPage />} />
                    <Route path="destinations" element={<AdminDestinationsPage />} />
                    <Route path="coupons" element={<AdminCouponsPage />} />
                    <Route path="newsletter" element={<AdminNewsletterPage />} />
                    <Route path="contact" element={<AdminContactPage />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                    <Route path="media" element={<AdminMediaPage />} />
                  </Route>

                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </BrowserRouter>
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    borderRadius: "12px",
                    background: "#1f2937",
                    color: "#fff",
                  },
                }}
              />
            </AuthProvider>
          </SettingsProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
