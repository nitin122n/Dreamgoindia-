import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { AdminFormDialog } from "@/components/admin/AdminFormDialog";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { DataTable } from "@/components/admin/DataTable";
import { FormField } from "@/components/admin/FormField";
import { VisibilityField } from "@/components/admin/VisibilityField";
import { adminInputClass } from "@/components/admin/admin-styles";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAdminDestinations, useAdminDestinationMutations } from "@/hooks/useAdmin";
import type { Destination } from "@/types";

const emptyDest = (): Partial<Destination> & { name: string } => ({
  name: "",
  state: "Uttarakhand",
  country: "India",
  is_featured: false,
  is_visible: true,
});

export default function AdminDestinationsPage() {
  const { data: destinations = [], isLoading } = useAdminDestinations();
  const { save, remove } = useAdminDestinationMutations();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyDest());
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = async () => {
    if (!form.name?.trim()) return toast.error("Name is required");
    try {
      await save.mutateAsync({ ...form, id: editingId ?? undefined });
      toast.success(editingId ? "Updated" : "Created");
      setOpen(false);
    } catch {
      toast.error("Failed to save");
    }
  };

  return (
    <AdminPageShell
      title="Destinations"
      description="Manage travel destinations"
      action={
        <Button className="h-11 rounded-lg" onClick={() => { setForm(emptyDest()); setEditingId(null); setOpen(true); }}>
          <Plus className="h-4 w-4" /> Add Destination
        </Button>
      }
    >
      <DataTable
        loading={isLoading}
        data={destinations}
        keyExtractor={(d) => d.id}
        columns={[
          {
            key: "name",
            header: "Destination",
            cell: (d) => (
              <div className="flex items-center gap-3">
                {d.image_url && <img src={d.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />}
                <span className="font-medium">{d.name}</span>
              </div>
            ),
          },
          { key: "state", header: "State", cell: (d) => d.state ?? "—" },
          {
            key: "featured",
            header: "Featured",
            cell: (d) => <Badge variant={d.is_featured ? "default" : "secondary"}>{d.is_featured ? "Yes" : "No"}</Badge>,
          },
          {
            key: "actions",
            header: "Actions",
            cell: (d) => (
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => { setForm(d); setEditingId(d.id); setOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-red-600" onClick={async () => {
                  if (confirm("Delete?")) { await remove.mutateAsync(d.id); toast.success("Deleted"); }
                }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      <AdminFormDialog
        open={open}
        onOpenChange={setOpen}
        title={editingId ? "Edit Destination" : "Add Destination"}
        onCancel={() => setOpen(false)}
        onSave={handleSave}
        saving={save.isPending}
      >
        <FormField label="Name">
          <Input className={adminInputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="State">
            <Input className={adminInputClass} value={form.state ?? ""} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </FormField>
          <FormField label="Country">
            <Input className={adminInputClass} value={form.country ?? ""} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </FormField>
        </div>
        <ImageUpload value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} folder="destinations" />
        <VisibilityField
          label="Featured"
          description="Highlight this destination on the homepage"
          checked={form.is_featured ?? false}
          onCheckedChange={(v) => setForm({ ...form, is_featured: v })}
        />
        <VisibilityField
          label="Visible"
          description="Show this destination on the website"
          checked={form.is_visible ?? true}
          onCheckedChange={(v) => setForm({ ...form, is_visible: v })}
        />
      </AdminFormDialog>
    </AdminPageShell>
  );
}
