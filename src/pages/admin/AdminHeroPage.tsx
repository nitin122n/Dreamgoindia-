import { useState } from "react";
import { Plus, Pencil, Trash2, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { AdminFormDialog } from "@/components/admin/AdminFormDialog";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { FormField } from "@/components/admin/FormField";
import { VisibilityField } from "@/components/admin/VisibilityField";
import { adminInputClass } from "@/components/admin/admin-styles";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminHeroSlides, useAdminHeroMutations } from "@/hooks/useAdmin";
import type { HeroSlide } from "@/types";

const emptySlide = (): Partial<HeroSlide> => ({
  title: "",
  subtitle: "",
  image_url: "",
  cta_text: "Explore Trips",
  cta_link: "/trips",
  secondary_cta_text: null,
  secondary_cta_link: null,
  is_visible: true,
});

export default function AdminHeroPage() {
  const { data: slides = [], isLoading } = useAdminHeroSlides();
  const { save, remove, reorder } = useAdminHeroMutations();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptySlide());
  const [editingId, setEditingId] = useState<string | null>(null);

  const sorted = [...slides].sort((a, b) => a.sort_order - b.sort_order);

  const moveSlide = async (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= sorted.length) return;
    const reordered = [...sorted];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    await reorder.mutateAsync(reordered);
    toast.success("Order updated");
  };

  const handleSave = async () => {
    if (!form.title || !form.image_url) {
      toast.error("Title and image are required");
      return;
    }
    try {
      await save.mutateAsync({
        ...form,
        id: editingId ?? undefined,
        sort_order: editingId ? form.sort_order : sorted.length,
      });
      toast.success(editingId ? "Slide updated" : "Slide created");
      setOpen(false);
    } catch {
      toast.error("Failed to save slide");
    }
  };

  if (isLoading) return <div className="text-gray-500">Loading...</div>;

  return (
    <AdminPageShell
      title="Hero Slider"
      description="Manage homepage hero slides — drag order with arrows"
      action={
        <Button className="h-11 rounded-lg" onClick={() => { setForm(emptySlide()); setEditingId(null); setOpen(true); }}>
          <Plus className="h-4 w-4" />
          Add Slide
        </Button>
      }
    >
      <div className="space-y-3">
        {sorted.map((slide, index) => (
          <Card key={slide.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <GripVertical className="h-5 w-5 shrink-0 text-gray-400" />
              <img src={slide.image_url} alt="" className="h-16 w-28 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">{slide.title}</p>
                <p className="truncate text-sm text-gray-500">{slide.subtitle}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" disabled={index === 0} onClick={() => moveSlide(index, -1)}>
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" disabled={index === sorted.length - 1} onClick={() => moveSlide(index, 1)}>
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => { setForm(slide); setEditingId(slide.id); setOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-red-600"
                  onClick={async () => {
                    if (confirm("Delete slide?")) {
                      await remove.mutateAsync(slide.id);
                      toast.success("Slide deleted");
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AdminFormDialog
        open={open}
        onOpenChange={setOpen}
        title={editingId ? "Edit Slide" : "Add Slide"}
        onCancel={() => setOpen(false)}
        onSave={handleSave}
        saving={save.isPending}
      >
        <FormField label="Title">
          <Input className={adminInputClass} value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </FormField>
        <FormField label="Subtitle">
          <Input className={adminInputClass} value={form.subtitle ?? ""} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
        </FormField>
        <ImageUpload value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} folder="hero" />
        <div className="grid grid-cols-2 gap-4">
          <FormField label="CTA Text">
            <Input className={adminInputClass} value={form.cta_text ?? ""} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} />
          </FormField>
          <FormField label="CTA Link">
            <Input className={adminInputClass} value={form.cta_link ?? ""} onChange={(e) => setForm({ ...form, cta_link: e.target.value })} />
          </FormField>
        </div>
        <VisibilityField
          label="Visible"
          description="Show this slide on the homepage"
          checked={form.is_visible ?? true}
          onCheckedChange={(v) => setForm({ ...form, is_visible: v })}
        />
      </AdminFormDialog>
    </AdminPageShell>
  );
}
