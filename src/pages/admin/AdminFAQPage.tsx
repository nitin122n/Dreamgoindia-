import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { AdminFormDialog } from "@/components/admin/AdminFormDialog";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { DataTable } from "@/components/admin/DataTable";
import { FormField } from "@/components/admin/FormField";
import { VisibilityField } from "@/components/admin/VisibilityField";
import { adminInputClass, adminTextareaClass } from "@/components/admin/admin-styles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdminFaqs, useAdminFaqMutations } from "@/hooks/useAdmin";
import type { FAQ } from "@/types";

const emptyFaq = (): Partial<FAQ> & { question: string; answer: string } => ({
  question: "",
  answer: "",
  category: "general",
  is_visible: true,
});

export default function AdminFAQPage() {
  const { data: faqs = [], isLoading } = useAdminFaqs();
  const { save, remove } = useAdminFaqMutations();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyFaq());
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = async () => {
    if (!form.question || !form.answer) return toast.error("Question and answer required");
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
      title="FAQs"
      description="Frequently asked questions"
      action={
        <Button className="h-11 rounded-lg" onClick={() => { setForm(emptyFaq()); setEditingId(null); setOpen(true); }}>
          <Plus className="h-4 w-4" /> Add FAQ
        </Button>
      }
    >
      <DataTable
        loading={isLoading}
        data={faqs}
        keyExtractor={(f) => f.id}
        columns={[
          { key: "question", header: "Question", cell: (f) => <span className="font-medium">{f.question}</span> },
          { key: "category", header: "Category", cell: (f) => f.category },
          { key: "answer", header: "Answer", cell: (f) => <span className="line-clamp-2 max-w-md">{f.answer}</span> },
          {
            key: "actions",
            header: "Actions",
            cell: (f) => (
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => { setForm(f); setEditingId(f.id); setOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-red-600" onClick={async () => {
                  if (confirm("Delete?")) { await remove.mutateAsync(f.id); toast.success("Deleted"); }
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
        title={editingId ? "Edit FAQ" : "Add FAQ"}
        onCancel={() => setOpen(false)}
        onSave={handleSave}
        saving={save.isPending}
      >
        <FormField label="Question">
          <Input className={adminInputClass} value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
        </FormField>
        <FormField label="Answer">
          <Textarea className={adminTextareaClass} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} rows={4} />
        </FormField>
        <FormField label="Category">
          <Input className={adminInputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </FormField>
        <VisibilityField
          label="Visible"
          description="Show this FAQ on the website"
          checked={form.is_visible ?? true}
          onCheckedChange={(v) => setForm({ ...form, is_visible: v })}
        />
      </AdminFormDialog>
    </AdminPageShell>
  );
}
