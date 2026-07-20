import { useState } from "react";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { AdminFormDialog } from "@/components/admin/AdminFormDialog";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { DataTable } from "@/components/admin/DataTable";
import { FormField } from "@/components/admin/FormField";
import { VisibilityField } from "@/components/admin/VisibilityField";
import { ImageUploader } from "@/components/admin/settings/ImageUploader";
import { adminInputClass } from "@/components/admin/admin-styles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminInstagramPosts, useAdminInstagramMutations } from "@/hooks/useAdmin";
import type { InstagramPost } from "@/types";

type PostForm = Partial<InstagramPost> & { image_url: string };

const emptyPost = (): PostForm => ({
  permalink: "",
  subtitle: "",
  caption: "",
  image_url: "",
  is_visible: true,
});

export default function AdminInstagramPage() {
  const { data: posts = [], isLoading } = useAdminInstagramPosts();
  const { save, remove, reorder } = useAdminInstagramMutations();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<PostForm>(emptyPost());
  const [editingId, setEditingId] = useState<string | null>(null);

  const openCreate = () => {
    setForm(emptyPost());
    setEditingId(null);
    setOpen(true);
  };

  const openEdit = (post: InstagramPost) => {
    setForm({ ...post });
    setEditingId(post.id);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.image_url?.trim()) {
      toast.error("Post image is required");
      return;
    }
    try {
      await save.mutateAsync({ ...form, id: editingId ?? undefined });
      toast.success(editingId ? "Post updated" : "Post added");
      setOpen(false);
    } catch (e) {
      toast.error((e as Error).message || "Failed to save post");
    }
  };

  /** Move a post directly to the chosen position (0-based) */
  const setPosition = async (from: number, to: number) => {
    if (to === from || to < 0 || to >= posts.length) return;
    const next = [...posts];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    try {
      await reorder.mutateAsync(next);
      toast.success(`Moved to position ${to + 1}`);
    } catch (e) {
      toast.error((e as Error).message || "Failed to update position");
    }
  };

  return (
    <AdminPageShell
      title="Instagram"
      description="Posts shown in the homepage “Instagram images” section"
      action={
        <Button className="h-11 rounded-lg" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Post
        </Button>
      }
    >
      <DataTable
        loading={isLoading}
        data={posts}
        keyExtractor={(p) => p.id}
        emptyMessage="No posts yet — click “Add Post” to create one."
        columns={[
          {
            key: "position",
            header: "Position",
            cell: (p) => {
              const index = posts.findIndex((x) => x.id === p.id);
              return (
                <Select
                  value={String(index + 1)}
                  onValueChange={(v) => void setPosition(index, Number(v) - 1)}
                  disabled={reorder.isPending}
                >
                  <SelectTrigger className="h-9 w-[72px] rounded-lg border-white/10 bg-white/5 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {posts.map((_, i) => (
                      <SelectItem key={i} value={String(i + 1)}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            },
          },
          {
            key: "image",
            header: "Image",
            cell: (p) => (
              <img
                src={p.image_url}
                alt={p.caption ?? ""}
                className="h-12 w-12 rounded-lg bg-gray-100 object-cover"
              />
            ),
          },
          {
            key: "subtitle",
            header: "Subtitle",
            cell: (p) => <span className="font-medium text-white">{p.subtitle || "—"}</span>,
          },
          {
            key: "caption",
            header: "Caption",
            cell: (p) => <span className="line-clamp-2 max-w-xs">{p.caption || "—"}</span>,
          },
          {
            key: "link",
            header: "Post link",
            cell: (p) =>
              p.permalink ? (
                <a
                  href={p.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Open <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                "—"
              ),
          },
          {
            key: "status",
            header: "Visible",
            cell: (p) => (
              <Badge variant={p.is_visible ? "default" : "secondary"}>
                {p.is_visible ? "Yes" : "No"}
              </Badge>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            cell: (p) => (
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => openEdit(p)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600"
                  onClick={async () => {
                    if (!confirm("Delete this post?")) return;
                    try {
                      await remove.mutateAsync(p.id);
                      toast.success("Post deleted");
                    } catch (e) {
                      toast.error((e as Error).message || "Delete failed");
                    }
                  }}
                >
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
        title={editingId ? "Edit Instagram post" : "Add Instagram post"}
        onCancel={() => setOpen(false)}
        onSave={handleSave}
        saving={save.isPending}
      >
        <FormField label="Post image" hint="Square image works best (shown as a 1:1 card)">
          <ImageUploader
            value={form.image_url}
            onChange={(url) => setForm({ ...form, image_url: url })}
            folder="instagram"
          />
        </FormField>

        <FormField
          label="Instagram post link"
          hint="e.g. https://www.instagram.com/p/DaCUvPXD4zB/"
        >
          <Input
            className={adminInputClass}
            value={form.permalink ?? ""}
            onChange={(e) => setForm({ ...form, permalink: e.target.value })}
            placeholder="https://www.instagram.com/p/..."
          />
        </FormField>

        <FormField label="Subtitle" hint="Small text under the username, e.g. trek name">
          <Input
            className={adminInputClass}
            value={form.subtitle ?? ""}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            placeholder="Hampta Pass · Balu Ka Ghera"
          />
        </FormField>

        <FormField label="Caption" hint="Bold text shown over the bottom of the photo">
          <Input
            className={adminInputClass}
            value={form.caption ?? ""}
            onChange={(e) => setForm({ ...form, caption: e.target.value })}
            placeholder="Where green valleys meet snow deserts"
          />
        </FormField>

        <VisibilityField
          label="Visible on website"
          description="Show this post in the homepage Instagram section"
          checked={form.is_visible ?? true}
          onCheckedChange={(v) => setForm({ ...form, is_visible: v })}
        />
      </AdminFormDialog>
    </AdminPageShell>
  );
}
