import { Helmet } from "react-helmet-async";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingCard } from "@/components/dashboard/BookingCard";
import { useBookings } from "@/hooks/useDashboard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function BookingsPage() {
  const { data: bookings, isLoading } = useBookings();

  return (
    <>
      <Helmet>
        <title>My Bookings - Dream Go India</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Bookings</h2>
            <p className="text-gray-500 dark:text-gray-400">
              View and manage your trip bookings
            </p>
          </div>
          <Button asChild>
            <Link to="/trips">Book New Trip</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        ) : bookings && bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No bookings found.</p>
            <Button className="mt-4" asChild>
              <Link to="/trips">Browse Trips</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
