import { Check, X } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminReviews, useAdminReviewMutations } from "@/hooks/useAdmin";
import type { ReviewStatus } from "@/types";

export default function AdminReviewsPage() {
  const { data: reviews = [], isLoading } = useAdminReviews();
  const { updateStatus } = useAdminReviewMutations();

  const handleStatus = async (id: string, status: ReviewStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success(`Review ${status}`);
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    <AdminPageShell
      title="Reviews"
      description="Moderate customer trip reviews"
    >
      <DataTable
        loading={isLoading}
        data={reviews}
        keyExtractor={(r) => r.id}
        columns={[
          { key: "user", header: "User", cell: (r) => r.profile?.full_name ?? "Anonymous" },
          { key: "trip", header: "Trip", cell: (r) => r.trip?.title ?? "—" },
          { key: "rating", header: "Rating", cell: (r) => `${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}` },
          { key: "content", header: "Review", cell: (r) => <span className="line-clamp-2 max-w-xs">{r.content}</span> },
          { key: "status", header: "Status", cell: (r) => <Badge variant={r.status === "approved" ? "default" : r.status === "pending" ? "secondary" : "destructive"}>{r.status}</Badge> },
          { key: "date", header: "Date", cell: (r) => format(new Date(r.created_at), "dd MMM yyyy") },
          {
            key: "actions",
            header: "Actions",
            cell: (r) =>
              r.status === "pending" ? (
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="text-green-600" onClick={() => handleStatus(r.id, "approved")}>
                    <Check className="h-4 w-4" /> Approve
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleStatus(r.id, "rejected")}>
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
