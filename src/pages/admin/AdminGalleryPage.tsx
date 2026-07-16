import { useRef, useState } from "react";
import { CheckSquare, Pencil, Square, Trash2, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { AdminFormDialog } from "@/components/admin/AdminFormDialog";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { FormField } from "@/components/admin/FormField";
import { VisibilityField } from "@/components/admin/VisibilityField";
import { adminInputClass } from "@/components/admin/admin-styles";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminGallery, useAdminGalleryMutations, useUploadImage } from "@/hooks/useAdmin";
import { cn } from "@/lib/utils";
import type { GalleryItem } from "@/types";

const emptyItem = (): Partial<GalleryItem> => ({
  title: "",
  image_url: "",
  media_type: "image",
  category: "trekking",
  is_visible: true,
});

const ACCEPT =
  ".png,.jpg,.jpeg,.svg,.webp,image/png,image/jpeg,image/svg+xml,image/webp";

export default function AdminGalleryPage() {
  const { data: items = [], isLoading } = useAdminGallery();
  const { save, saveMany, remove, removeMany } = useAdminGalleryMutations();
  const upload = useUploadImage();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyItem());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [defaultCategory, setDefaultCategory] = useState("trekking");

  const selectedCount = selected.size;
  const allSelected = items.length > 0 && selectedCount === items.length;

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(items.map((i) => i.id)));
  };

  const clearSelection = () => setSelected(new Set());

  const handleSave = async () => {
    if (!form.image_url) return toast.error("Image is required");
    try {
      await save.mutateAsync({ ...form, id: editingId ?? undefined });
      toast.success("Saved");
      setOpen(false);
    } catch (e) {
      toast.error((e as Error).message || "Failed to save");
    }
  };

  const handleMultiUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) {
      toast.error("Please choose image files");
      return;
    }

    setUploading(true);
    try {
      const uploaded: Array<{ title: string; image_url: string; category: string }> = [];
      for (const file of list) {
        const result = await upload.mutateAsync({ file, folder: "gallery" });
        uploaded.push({
          title: file.name.replace(/\.[^.]+$/, ""),
          image_url: result.url,
          category: defaultCategory || "trekking",
        });
      }
      await saveMany.mutateAsync(uploaded);
      toast.success(`${uploaded.length} image${uploaded.length > 1 ? "s" : ""} uploaded`);
      clearSelection();
    } catch (e) {
      toast.error((e as Error).message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteOne = async (id: string) => {
    if (!confirm("Delete this image from the website and Supabase?")) return;
    try {
      await remove.mutateAsync(id);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success("Deleted from website & Supabase");
    } catch (e) {
      toast.error((e as Error).message || "Delete failed");
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedCount) return;
    if (
      !confirm(
        `Delete ${selectedCount} selected image${selectedCount > 1 ? "s" : ""} from the website and Supabase storage?`
      )
    ) {
      return;
    }
    try {
      await removeMany.mutateAsync([...selected]);
      clearSelection();
      toast.success(`Deleted ${selectedCount} item${selectedCount > 1 ? "s" : ""} from Supabase`);
    } catch (e) {
      toast.error((e as Error).message || "Bulk delete failed");
    }
  };

  if (isLoading) return <div className="text-gray-500">Loading...</div>;

  return (
    <AdminPageShell
      title="Gallery"
      description="Upload multiple images and delete from website + Supabase"
      action={
        <div className="flex flex-wrap items-center gap-2">
          {selectedCount > 0 && (
            <Button
              variant="destructive"
              className="h-11 rounded-lg"
              onClick={handleDeleteSelected}
              disabled={removeMany.isPending}
            >
              <Trash2 className="h-4 w-4" />
              Delete selected ({selectedCount})
            </Button>
          )}
          <Button
            variant="outline"
            className="h-11 rounded-lg"
            onClick={toggleSelectAll}
            disabled={!items.length}
          >
            {allSelected ? (
              <>
                <CheckSquare className="h-4 w-4" /> Clear selection
              </>
            ) : (
              <>
                <Square className="h-4 w-4" /> Select all
              </>
            )}
          </Button>
          <Button
            className="h-11 rounded-lg"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || saveMany.isPending}
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading..." : "Upload multiple"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            onChange={(e) => void handleMultiUpload(e.target.files)}
          />
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="min-w-[180px] flex-1">
          <label className="mb-1 block text-xs text-gray-400">Default category for uploads</label>
          <Input
            className={adminInputClass}
            value={defaultCategory}
            onChange={(e) => setDefaultCategory(e.target.value)}
            placeholder="trekking"
          />
        </div>
        {selectedCount > 0 && (
          <Button variant="ghost" size="sm" className="text-gray-300" onClick={clearSelection}>
            <X className="h-4 w-4" /> Clear ({selectedCount})
          </Button>
        )}
        <p className="w-full text-xs text-gray-500">
          Tip: select images with the checkbox, then use Delete selected. Files are removed from
          Supabase storage and the live gallery.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 py-16 text-center text-gray-400">
          No gallery images yet. Click <span className="text-white">Upload multiple</span> to add
          some.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => {
            const isSelected = selected.has(item.id);
            return (
              <div
                key={item.id}
                className={cn(
                  "group relative overflow-hidden rounded-xl border bg-white transition",
                  isSelected ? "border-primary ring-2 ring-primary/40" : "border-gray-200"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleSelect(item.id)}
                  className={cn(
                    "absolute left-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-md border shadow",
                    isSelected
                      ? "border-primary bg-primary text-white"
                      : "border-white/80 bg-white/90 text-gray-700"
                  )}
                  aria-label={isSelected ? "Deselect image" : "Select image"}
                >
                  {isSelected ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>

                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.title ?? ""}
                    className="aspect-square w-full object-cover"
                    loading="lazy"
                  />
                )}
                <div className="p-3">
                  <p className="truncate text-sm font-medium">{item.title ?? "Untitled"}</p>
                  <p className="text-xs text-gray-500">{item.category}</p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition group-hover:opacity-100">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setForm(item);
                      setEditingId(item.id);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => void handleDeleteOne(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AdminFormDialog
        open={open}
        onOpenChange={setOpen}
        title={editingId ? "Edit Gallery Item" : "Add Gallery Item"}
        onCancel={() => setOpen(false)}
        onSave={handleSave}
        saving={save.isPending}
      >
        <FormField label="Title">
          <Input
            className={adminInputClass}
            value={form.title ?? ""}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </FormField>
        <FormField label="Category">
          <Input
            className={adminInputClass}
            value={form.category ?? ""}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </FormField>
        <ImageUpload
          value={form.image_url}
          onChange={(url) => setForm({ ...form, image_url: url })}
          folder="gallery"
        />
        <VisibilityField
          label="Visible"
          description="Show this item in the gallery"
          checked={form.is_visible ?? true}
          onCheckedChange={(v) => setForm({ ...form, is_visible: v })}
        />
      </AdminFormDialog>
    </AdminPageShell>
  );
}
