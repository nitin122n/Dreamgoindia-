import { Check, X } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminBookings, useAdminBookingMutations } from "@/hooks/useAdmin";
import type { BookingStatus } from "@/types";

const statusVariant: Record<BookingStatus, "default" | "secondary" | "destructive"> = {
  pending: "secondary",
  confirmed: "default",
  cancelled: "destructive",
  rejected: "destructive",
  completed: "default",
};

export default function AdminBookingsPage() {
  const { data: bookings = [], isLoading } = useAdminBookings();
  const { updateStatus } = useAdminBookingMutations();

  const handleStatus = async (id: string, status: BookingStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success(`Booking ${status}`);
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    <AdminPageShell
      title="Bookings"
      description="Review and manage customer bookings"
    >
      <DataTable
        loading={isLoading}
        data={bookings}
        keyExtractor={(b) => b.id}
        columns={[
          { key: "number", header: "Booking #", cell: (b) => <span className="font-mono text-xs">{b.booking_number}</span> },
          { key: "customer", header: "Customer", cell: (b) => b.profile?.full_name ?? b.profile?.email ?? "—" },
          { key: "trip", header: "Trip", cell: (b) => b.trip?.title ?? "—" },
          { key: "amount", header: "Amount", cell: (b) => `₹${b.total_amount.toLocaleString("en-IN")}` },
          {
            key: "status",
            header: "Status",
            cell: (b) => <Badge variant={statusVariant[b.status]}>{b.status}</Badge>,
          },
          {
            key: "date",
            header: "Date",
            cell: (b) => format(new Date(b.created_at), "dd MMM yyyy"),
          },
          {
            key: "actions",
            header: "Actions",
            cell: (b) =>
              b.status === "pending" ? (
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="text-green-600" onClick={() => handleStatus(b.id, "confirmed")}>
                    <Check className="h-4 w-4" /> Approve
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleStatus(b.id, "rejected")}>
                    <X className="h-4 w-4" /> Reject
                  </Button>
                </div>
              ) : (
                <span className="text-xs text-gray-400">—</span>
              ),
          },
        ]}
      />
    </AdminPageShell>
  );
}
