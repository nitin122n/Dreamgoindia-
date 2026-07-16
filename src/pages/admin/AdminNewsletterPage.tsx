import { Download } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminNewsletter } from "@/hooks/useAdmin";

function exportCsv(subscribers: { email: string; is_active: boolean; subscribed_at: string }[]) {
  const header = "Email,Status,Subscribed At\n";
  const rows = subscribers
    .map((s) => `${s.email},${s.is_active ? "active" : "inactive"},${s.subscribed_at}`)
    .join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `newsletter-subscribers-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminNewsletterPage() {
  const { data: subscribers = [], isLoading } = useAdminNewsletter();

  const handleExport = () => {
    exportCsv(subscribers);
    toast.success("CSV exported");
  };

  return (
    <AdminPageShell
      title="Newsletter"
      description={`${subscribers.length} subscribers`}
      action={
        <Button className="h-11 rounded-lg" onClick={handleExport} variant="secondary">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      }
    >
      <DataTable
        loading={isLoading}
        data={subscribers}
        keyExtractor={(s) => s.id}
        columns={[
          { key: "email", header: "Email", cell: (s) => <span className="font-medium">{s.email}</span> },
          {
            key: "status",
            header: "Status",
            cell: (s) => (
              <Badge variant={s.is_active ? "default" : "secondary"}>
                {s.is_active ? "Active" : "Unsubscribed"}
              </Badge>
            ),
          },
          {
            key: "subscribed",
            header: "Subscribed",
            cell: (s) => format(new Date(s.subscribed_at), "dd MMM yyyy"),
          },
        ]}
      />
    </AdminPageShell>
  );
}
