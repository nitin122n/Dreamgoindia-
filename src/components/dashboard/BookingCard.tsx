import type { Booking, BookingStatus } from "@/types";
import { formatPrice, cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { InvoiceDownload } from "./InvoiceDownload";

const statusConfig: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  confirmed: { label: "Confirmed", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  completed: { label: "Completed", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
};

interface BookingCardProps {
  booking: Booking;
  showInvoice?: boolean;
}

export function BookingCard({ booking, showInvoice = true }: BookingCardProps) {
  const status = statusConfig[booking.status];
  const coverImage =
    booking.trip?.trip_images?.find((img) => img.is_cover)?.image_url ||
    booking.trip?.trip_images?.[0]?.image_url;

  return (
    <Card className="overflow-hidden dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col sm:flex-row">
        {coverImage && (
          <div className="sm:w-48 shrink-0">
            <img
              src={coverImage}
              alt={booking.trip?.title ?? "Trip"}
              className="h-40 w-full object-cover sm:h-full"
            />
          </div>
        )}
        <CardContent className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                {booking.trip?.title ?? "Trip Booking"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                #{booking.booking_number}
              </p>
            </div>
            <Badge className={cn("border-0", status.className)}>{status.label}</Badge>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            {booking.trip?.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {booking.trip.location}
              </span>
            )}
            {booking.departure?.departure_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(booking.departure.departure_date), "MMM d, yyyy")}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {booking.travelers.length} traveler{booking.travelers.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-lg font-bold text-primary">{formatPrice(booking.total_amount)}</span>
              {booking.discount_amount > 0 && (
                <span className="ml-2 text-sm text-green-600 dark:text-green-400">
                  Saved {formatPrice(booking.discount_amount)}
                </span>
              )}
            </div>
            {showInvoice && (
              <InvoiceDownload booking={booking} />
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
