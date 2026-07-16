import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { AdminFormDialog } from "@/components/admin/AdminFormDialog";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { DataTable } from "@/components/admin/DataTable";
import { FormField } from "@/components/admin/FormField";
import { VisibilityField } from "@/components/admin/VisibilityField";
import { adminInputClass, adminTextareaClass } from "@/components/admin/admin-styles";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdminTestimonials, useAdminTestimonialMutations } from "@/hooks/useAdmin";
import type { Testimonial } from "@/types";

const empty = (): Partial<Testimonial> & { name: string; content: string } => ({
  name: "",
  content: "",
  rating: 5,
  location: "",
  trip_name: "",
  is_visible: true,
});

export default function AdminTestimonialsPage() {
  const { data: items = [], isLoading } = useAdminTestimonials();
  const { save, remove } = useAdminTestimonialMutations();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty());
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = async () => {
    if (!form.name || !form.content) return toast.error("Name and content required");
    try {
      await save.mutateAsync({ ...form, id: editingId ?? undefined });
      toast.success("Saved");
      setOpen(false);
    } catch {
      toast.error("Failed to save");
    }
  };

  return (
    <AdminPageShell
      title="Testimonials"
      description="Customer testimonials for homepage"
      action={
        <Button className="h-11 rounded-lg" onClick={() => { setForm(empty()); setEditingId(null); setOpen(true); }}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      }
    >
      <DataTable
        loading={isLoading}
        data={items}
        keyExtractor={(t) => t.id}
        columns={[
          { key: "name", header: "Name", cell: (t) => <span className="font-medium">{t.name}</span> },
          { key: "trip", header: "Trip", cell: (t) => t.trip_name ?? "—" },
          { key: "rating", header: "Rating", cell: (t) => `${t.rating}/5` },
          { key: "content", header: "Content", cell: (t) => <span className="line-clamp-2 max-w-xs">{t.content}</span> },
          {
            key: "actions",
            header: "Actions",
            cell: (t) => (
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => { setForm(t); setEditingId(t.id); setOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-red-600" onClick={async () => {
                  if (confirm("Delete?")) { await remove.mutateAsync(t.id); toast.success("Deleted"); }
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
        title={editingId ? "Edit Testimonial" : "Add Testimonial"}
        onCancel={() => setOpen(false)}
        onSave={handleSave}
        saving={save.isPending}
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Name">
            <Input className={adminInputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </FormField>
          <FormField label="Location">
            <Input className={adminInputClass} value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </FormField>
        </div>
        <FormField label="Trip Name">
          <Input className={adminInputClass} value={form.trip_name ?? ""} onChange={(e) => setForm({ ...form, trip_name: e.target.value })} />
        </FormField>
        <FormField label="Content">
          <Textarea className={adminTextareaClass} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={3} />
        </FormField>
        <FormField label="Rating (1-5)">
          <Input className={adminInputClass} type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
        </FormField>
        <ImageUpload value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} folder="testimonials" />
        <VisibilityField
          label="Visible"
          description="Show this testimonial on the homepage"
          checked={form.is_visible ?? true}
          onCheckedChange={(v) => setForm({ ...form, is_visible: v })}
        />
      </AdminFormDialog>
    </AdminPageShell>
  );
}
