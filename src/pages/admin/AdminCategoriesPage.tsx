import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { AdminFormDialog } from "@/components/admin/AdminFormDialog";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { DataTable } from "@/components/admin/DataTable";
import { FormField } from "@/components/admin/FormField";
import { VisibilityField } from "@/components/admin/VisibilityField";
import { adminInputClass, adminSelectTriggerClass } from "@/components/admin/admin-styles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminCategories, useAdminCategoryMutations } from "@/hooks/useAdmin";
import type { TripCategory } from "@/types";

const emptyCat = (): Partial<TripCategory> & { name: string } => ({
  name: "",
  icon: "mountain",
  season: "all",
  is_visible: true,
});

export default function AdminCategoriesPage() {
  const { data: categories = [], isLoading } = useAdminCategories();
  const { save, remove } = useAdminCategoryMutations();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyCat());
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = async () => {
    if (!form.name?.trim()) return toast.error("Name is required");
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
      title="Trip Categories"
      description="Winter, summer, adventure, and more"
      action={
        <Button className="h-11 rounded-lg" onClick={() => { setForm(emptyCat()); setEditingId(null); setOpen(true); }}>
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      }
    >
      <DataTable
        loading={isLoading}
        data={categories}
        keyExtractor={(c) => c.id}
        columns={[
          { key: "name", header: "Name", cell: (c) => <span className="font-medium text-white">{c.name}</span> },
          { key: "slug", header: "Slug", cell: (c) => c.slug },
          { key: "season", header: "Season", cell: (c) => c.season },
          { key: "icon", header: "Icon", cell: (c) => c.icon ?? "—" },
          {
            key: "actions",
            header: "Actions",
            cell: (c) => (
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => { setForm(c); setEditingId(c.id); setOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-red-600" onClick={async () => {
                  if (confirm("Delete?")) { await remove.mutateAsync(c.id); toast.success("Deleted"); }
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
        title={editingId ? "Edit Category" : "Add Category"}
        onCancel={() => setOpen(false)}
        onSave={handleSave}
        saving={save.isPending}
      >
        <FormField label="Name">
          <Input className={adminInputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </FormField>
        <FormField label="Icon" hint="e.g. mountain, sun, snowflake">
          <Input className={adminInputClass} value={form.icon ?? ""} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
        </FormField>
        <FormField label="Season">
          <Select value={form.season} onValueChange={(v) => setForm({ ...form, season: v as TripCategory["season"] })}>
            <SelectTrigger className={adminSelectTriggerClass}><SelectValue /></SelectTrigger>
            <SelectContent>
              {["winter", "summer", "monsoon", "all"].map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <VisibilityField
          label="Visible"
          description="Show this category on the website"
          checked={form.is_visible ?? true}
          onCheckedChange={(v) => setForm({ ...form, is_visible: v })}
        />
      </AdminFormDialog>
    </AdminPageShell>
  );
}
