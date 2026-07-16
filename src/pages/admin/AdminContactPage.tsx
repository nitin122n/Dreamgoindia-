import { format } from "date-fns";
import toast from "react-hot-toast";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useAdminContactForms, useAdminContactMutations } from "@/hooks/useAdmin";
import type { ContactForm } from "@/types";

export default function AdminContactPage() {
  const { data: forms = [], isLoading } = useAdminContactForms();
  const { updateStatus } = useAdminContactMutations();
  const [selected, setSelected] = useState<ContactForm | null>(null);

  const markRead = async (id: string) => {
    try {
      await updateStatus.mutateAsync({ id, status: "read" });
      toast.success("Marked as read");
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    <AdminPageShell
      title="Contact Forms"
      description="View customer inquiries and messages"
    >
      <DataTable
        loading={isLoading}
        data={forms}
        keyExtractor={(f) => f.id}
        columns={[
          { key: "name", header: "Name", cell: (f) => <span className="font-medium">{f.name}</span> },
          { key: "email", header: "Email", cell: (f) => f.email },
          { key: "subject", header: "Subject", cell: (f) => f.subject ?? "—" },
          {
            key: "status",
            header: "Status",
            cell: (f) => (
              <Badge variant={f.status === "new" ? "default" : "secondary"}>{f.status}</Badge>
            ),
          },
          {
            key: "date",
            header: "Date",
            cell: (f) => format(new Date(f.created_at), "dd MMM yyyy"),
          },
          {
            key: "actions",
            header: "Actions",
            cell: (f) => (
              <Button size="sm" variant="ghost" onClick={() => {
                setSelected(f);
                if (f.status === "new") markRead(f.id);
              }}>
                View
              </Button>
            ),
          },
        ]}
      />

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.subject ?? "Contact Message"}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <p><strong>From:</strong> {selected.name} ({selected.email})</p>
              {selected.phone && <p><strong>Phone:</strong> {selected.phone}</p>}
              <p><strong>Date:</strong> {format(new Date(selected.created_at), "PPpp")}</p>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="whitespace-pre-wrap text-gray-200">{selected.message}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminPageShell>
  );
}
