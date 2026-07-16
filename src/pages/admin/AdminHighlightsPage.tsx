import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ImagePlus,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useAdminHighlights, useAdminHighlightMutations } from "@/hooks/useAdmin";
import { mockId } from "@/lib/admin-mock-store";
import type { Highlight, Story } from "@/types/highlight";

const emptyHighlight = (): Partial<Highlight> & { title: string } => ({
  title: "",
  cover: "",
  stories: [],
  is_visible: true,
});

const emptyStory = (): Story => ({
  id: mockId("story"),
  image: "",
  caption: "",
  date: new Date().toISOString().split("T")[0],
});

export default function AdminHighlightsPage() {
  const { data: highlights = [], isLoading } = useAdminHighlights();
  const { save, remove, reorder } = useAdminHighlightMutations();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyHighlight());
  const [editingId, setEditingId] = useState<string | null>(null);

  const sorted = [...highlights].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const moveHighlight = async (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= sorted.length) return;
    const reordered = [...sorted];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    await reorder.mutateAsync(reordered);
    toast.success("Order updated");
  };

  const openCreate = () => {
    setForm(emptyHighlight());
    setEditingId(null);
    setOpen(true);
  };

  const openEdit = (item: Highlight) => {
    setForm({ ...item, stories: [...item.stories] });
    setEditingId(item.id);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.title?.trim() || !form.cover?.trim()) {
      toast.error("Title and cover image are required");
      return;
    }
    if (!form.stories?.length) {
      toast.error("Add at least one story slide");
      return;
    }
    try {
      await save.mutateAsync({
        ...form,
        id: editingId ?? undefined,
        title: form.title.trim(),
        sort_order: editingId ? form.sort_order : sorted.length,
        stories: form.stories ?? [],
      });
      toast.success(editingId ? "Highlight updated" : "Highlight created");
      setOpen(false);
    } catch (e) {
      toast.error((e as Error).message || "Failed to save highlight");
    }
  };

  const updateStory = (index: number, patch: Partial<Story>) => {
    const stories = [...(form.stories ?? [])];
    stories[index] = { ...stories[index], ...patch };
    setForm({ ...form, stories });
  };

  const addStory = () => {
    setForm({ ...form, stories: [...(form.stories ?? []), emptyStory()] });
  };

  const removeStory = (index: number) => {
    const stories = (form.stories ?? []).filter((_, i) => i !== index);
    setForm({ ...form, stories });
  };

  if (isLoading) return <div className="text-gray-500">Loading...</div>;

  return (
    <AdminPageShell
      title="Story Highlights"
      description="Manage Instagram-style homepage highlights and their story slides"
      action={
        <Button className="h-11 rounded-lg" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Highlight
        </Button>
      }
    >
      <div className="space-y-3">
        {sorted.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-gray-500">
              No highlights yet. Add your first story highlight.
            </CardContent>
          </Card>
        )}
        {sorted.map((item, index) => (
          <Card key={item.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <GripVertical className="h-5 w-5 shrink-0 text-gray-400" />
              <div className="h-14 w-14 shrink-0 rounded-full border-2 border-[#3a3b3c] bg-[#111] p-0.5">
                <img
                  src={item.cover}
                  alt=""
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-white">{item.title}</p>
                  {!item.is_visible && <Badge variant="secondary">Hidden</Badge>}
                  <Badge variant="outline">{item.stories.length} stories</Badge>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={index === 0}
                  onClick={() => moveHighlight(index, -1)}
                  aria-label="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={index === sorted.length - 1}
                  onClick={() => moveHighlight(index, 1)}
                  aria-label="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => openEdit(item)} aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-red-600"
                  aria-label="Delete"
                  onClick={async () => {
                    if (confirm(`Delete "${item.title}"?`)) {
                      await remove.mutateAsync(item.id);
                      toast.success("Highlight deleted");
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
        title={editingId ? "Edit Highlight" : "Add Highlight"}
        onCancel={() => setOpen(false)}
        onSave={handleSave}
        saving={save.isPending}
        size="lg"
      >
        <FormField label="Title">
          <Input
            className={adminInputClass}
            value={form.title ?? ""}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Tungnath"
          />
        </FormField>

        <ImageUpload
          value={form.cover}
          onChange={(url) => setForm({ ...form, cover: url })}
          folder="highlights"
          label="Cover image"
        />

        <VisibilityField
          label="Visible on homepage"
          description="Show this highlight to visitors"
          checked={form.is_visible ?? true}
          onCheckedChange={(v) => setForm({ ...form, is_visible: v })}
        />

        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-200">Story slides</span>
            <Button type="button" size="sm" variant="secondary" onClick={addStory}>
              <ImagePlus className="h-4 w-4" />
              Add slide
            </Button>
          </div>

          {(form.stories ?? []).map((story, index) => (
            <Card key={story.id} className="border-dashed">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-400">Slide {index + 1}</span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-600"
                    onClick={() => removeStory(index)}
                    aria-label="Remove slide"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <ImageUpload
                  value={story.image}
                  onChange={(url) => updateStory(index, { image: url })}
                  folder="highlights/stories"
                />
                <FormField label="Caption">
                  <Input
                    className={adminInputClass}
                    value={story.caption ?? ""}
                    onChange={(e) => updateStory(index, { caption: e.target.value })}
                    placeholder="Story caption"
                  />
                </FormField>
                <FormField label="Date">
                  <Input
                    className={adminInputClass}
                    type="date"
                    value={story.date ?? ""}
                    onChange={(e) => updateStory(index, { date: e.target.value })}
                  />
                </FormField>
              </CardContent>
            </Card>
          ))}
        </div>
      </AdminFormDialog>
    </AdminPageShell>
  );
}
