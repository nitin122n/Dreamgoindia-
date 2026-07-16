import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { AdminFormDialog } from "@/components/admin/AdminFormDialog";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { DataTable } from "@/components/admin/DataTable";
import { FormField } from "@/components/admin/FormField";
import { VisibilityField } from "@/components/admin/VisibilityField";
import { adminInputClass, adminSelectTriggerClass } from "@/components/admin/admin-styles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminCoupons, useAdminCouponMutations } from "@/hooks/useAdmin";
import type { Coupon } from "@/types";

const emptyCoupon = (): Partial<Coupon> & { code: string } => ({
  code: "",
  description: "",
  type: "percentage",
  value: 10,
  is_active: true,
  usage_limit: 100,
  valid_from: new Date().toISOString().split("T")[0],
});

export default function AdminCouponsPage() {
  const { data: coupons = [], isLoading } = useAdminCoupons();
  const { save, remove } = useAdminCouponMutations();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyCoupon());
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = async () => {
    if (!form.code?.trim()) return toast.error("Code is required");
    try {
      await save.mutateAsync({ ...form, id: editingId ?? undefined });
      toast.success("Coupon saved");
      setOpen(false);
    } catch {
      toast.error("Failed to save");
    }
  };

  return (
    <AdminPageShell
      title="Coupons"
      description="Discount codes and promotions"
      action={
        <Button className="h-11 rounded-lg" onClick={() => { setForm(emptyCoupon()); setEditingId(null); setOpen(true); }}>
          <Plus className="h-4 w-4" /> Add Coupon
        </Button>
      }
    >
      <DataTable
        loading={isLoading}
        data={coupons}
        keyExtractor={(c) => c.id}
        columns={[
          { key: "code", header: "Code", cell: (c) => <span className="font-mono font-bold">{c.code}</span> },
          { key: "type", header: "Type", cell: (c) => `${c.type === "percentage" ? `${c.value}%` : `₹${c.value}`}` },
          { key: "usage", header: "Usage", cell: (c) => `${c.usage_count}/${c.usage_limit ?? "∞"}` },
          { key: "active", header: "Status", cell: (c) => <Badge variant={c.is_active ? "default" : "secondary"}>{c.is_active ? "Active" : "Inactive"}</Badge> },
          { key: "valid", header: "Valid Until", cell: (c) => c.valid_until ? format(new Date(c.valid_until), "dd MMM yyyy") : "No expiry" },
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
        title={editingId ? "Edit Coupon" : "Create Coupon"}
        onCancel={() => setOpen(false)}
        onSave={handleSave}
        saving={save.isPending}
      >
        <FormField label="Code">
          <Input className={adminInputClass} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
        </FormField>
        <FormField label="Description">
          <Input className={adminInputClass} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Type">
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Coupon["type"] })}>
              <SelectTrigger className={adminSelectTriggerClass}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Value">
            <Input className={adminInputClass} type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Min Order (₹)">
            <Input className={adminInputClass} type="number" value={form.min_order_amount ?? ""} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value ? Number(e.target.value) : null })} />
          </FormField>
          <FormField label="Usage Limit">
            <Input className={adminInputClass} type="number" value={form.usage_limit ?? ""} onChange={(e) => setForm({ ...form, usage_limit: e.target.value ? Number(e.target.value) : null })} />
          </FormField>
        </div>
        <VisibilityField
          label="Active"
          description="Enable this coupon for customers"
          checked={form.is_active ?? true}
          onCheckedChange={(v) => setForm({ ...form, is_active: v })}
        />
      </AdminFormDialog>
    </AdminPageShell>
  );
}
