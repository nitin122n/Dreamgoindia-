import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { AdminFormDialog } from "@/components/admin/AdminFormDialog";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { DataTable } from "@/components/admin/DataTable";
import { FormField } from "@/components/admin/FormField";
import { VisibilityField } from "@/components/admin/VisibilityField";
import { adminInputClass, adminSelectTriggerClass, adminTextareaClass } from "@/components/admin/admin-styles";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminBlogs, useAdminBlogMutations } from "@/hooks/useAdmin";
import type { Blog } from "@/types";

const emptyBlog = (): Partial<Blog> & { title: string } => ({
  title: "",
  excerpt: "",
  content: "",
  status: "draft",
  is_featured: false,
  tags: [],
});

export default function AdminBlogsPage() {
  const { data: blogs = [], isLoading } = useAdminBlogs();
  const { save, remove } = useAdminBlogMutations();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyBlog());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState("");

  const handleSave = async () => {
    if (!form.title?.trim()) return toast.error("Title is required");
    try {
      await save.mutateAsync({
        ...form,
        id: editingId ?? undefined,
        tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      });
      toast.success("Blog saved");
      setOpen(false);
    } catch {
      toast.error("Failed to save");
    }
  };

  return (
    <AdminPageShell
      title="Blogs"
      description="Content management with rich text editor"
      action={
        <Button className="h-11 rounded-lg" onClick={() => { setForm(emptyBlog()); setTagsInput(""); setEditingId(null); setOpen(true); }}>
          <Plus className="h-4 w-4" /> New Post
        </Button>
      }
    >
      <DataTable
        loading={isLoading}
        data={blogs}
        keyExtractor={(b) => b.id}
        columns={[
          { key: "title", header: "Title", cell: (b) => <span className="font-medium">{b.title}</span> },
          { key: "status", header: "Status", cell: (b) => <Badge variant={b.status === "published" ? "default" : "secondary"}>{b.status}</Badge> },
          { key: "views", header: "Views", cell: (b) => b.view_count },
          {
            key: "actions",
            header: "Actions",
            cell: (b) => (
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => {
                  setForm(b); setTagsInput(b.tags.join(", ")); setEditingId(b.id); setOpen(true);
                }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-red-600" onClick={async () => {
                  if (confirm("Delete?")) { await remove.mutateAsync(b.id); toast.success("Deleted"); }
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
        title={editingId ? "Edit Blog Post" : "Create Blog Post"}
        onCancel={() => setOpen(false)}
        onSave={handleSave}
        saving={save.isPending}
        size="2xl"
      >
        <FormField label="Title">
          <Input className={adminInputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </FormField>
        <FormField label="Excerpt">
          <Textarea className={adminTextareaClass} value={form.excerpt ?? ""} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} />
        </FormField>
        <ImageUpload value={form.featured_image} onChange={(url) => setForm({ ...form, featured_image: url })} folder="blogs" label="Featured Image" />
        <FormField label="Content">
          <RichTextEditor value={form.content} onChange={(html) => setForm({ ...form, content: html })} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Status">
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Blog["status"] })}>
              <SelectTrigger className={adminSelectTriggerClass}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Tags (comma separated)">
            <Input className={adminInputClass} value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
          </FormField>
        </div>
        <VisibilityField
          label="Featured"
          description="Highlight this post on the homepage"
          checked={form.is_featured ?? false}
          onCheckedChange={(v) => setForm({ ...form, is_featured: v })}
        />
      </AdminFormDialog>
    </AdminPageShell>
  );
}
