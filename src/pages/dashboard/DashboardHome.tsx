import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CalendarCheck, Heart, Bell, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingCard } from "@/components/dashboard/BookingCard";
import { TripRecommendation } from "@/components/features/TripRecommendation";
import { useBookings, useWishlist, useNotifications } from "@/hooks/useDashboard";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardHome() {
  const { profile } = useAuth();
  const { data: bookings = [], isLoading: bookingsLoading } = useBookings();
  const { data: wishlist = [], isLoading: wishlistLoading } = useWishlist();
  const { unreadCount } = useNotifications();

  const recentBookings = bookings.slice(0, 3);
  const wishlistCount = wishlist.length;

  return (
    <>
      <Helmet>
        <title>Dashboard - Dream Go India</title>
      </Helmet>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {profile?.full_name?.split(" ")[0] ?? "Traveler"}!
          </h2>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Here&apos;s an overview of your travel activity.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="dark:border-gray-800 dark:bg-gray-900">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <CalendarCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {bookingsLoading ? "—" : bookings?.length ?? 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:border-gray-800 dark:bg-gray-900">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100 dark:bg-pink-900/30">
                <Heart className="h-6 w-6 text-pink-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Wishlist</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {wishlistLoading ? "—" : wishlistCount}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:border-gray-800 dark:bg-gray-900">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Bell className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Unread Notifications</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{unreadCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent bookings */}
        <Card className="dark:border-gray-800 dark:bg-gray-900">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Bookings</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/bookings">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {bookingsLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))
            ) : recentBookings.length > 0 ? (
              recentBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} showInvoice={false} />
              ))
            ) : (
              <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                No bookings yet.{" "}
                <Link to="/trips" className="text-primary hover:underline">
                  Explore trips
                </Link>
              </p>
            )}
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <TripRecommendation />
      </div>
    </>
  );
}
