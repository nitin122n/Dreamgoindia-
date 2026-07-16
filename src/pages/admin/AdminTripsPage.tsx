import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { AdminFormDialog } from "@/components/admin/AdminFormDialog";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { DataTable } from "@/components/admin/DataTable";
import { FormField } from "@/components/admin/FormField";
import { VisibilityField } from "@/components/admin/VisibilityField";
import { ImageUploader } from "@/components/admin/settings/ImageUploader";
import { adminInputClass, adminSelectTriggerClass } from "@/components/admin/admin-styles";
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
import {
  useAdminTrips,
  useAdminTripMutations,
  useAdminDestinations,
  useAdminCategories,
} from "@/hooks/useAdmin";
import type { Trip } from "@/types";

const emptyTrip = (): Partial<Trip> & { title: string; cover_url?: string } => ({
  title: "",
  slug: "",
  destination_id: null,
  category_id: null,
  location: "",
  duration_days: 5,
  duration_nights: 4,
  price: 0,
  discount_price: null,
  difficulty: "moderate",
  max_seats: 20,
  seats_left: 20,
  season: "winter",
  trip_type: "trek",
  is_featured: true,
  is_visible: true,
  description: "",
  overview: "",
  map_lat: null,
  map_lng: null,
  cover_url: "",
});

type TripForm = Partial<Trip> & { title: string; cover_url?: string };

export default function AdminTripsPage() {
  const { data: trips = [], isLoading } = useAdminTrips();
  const { data: destinations = [] } = useAdminDestinations();
  const { data: categories = [] } = useAdminCategories();
  const { save, remove } = useAdminTripMutations();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TripForm>(emptyTrip());
  const [editingId, setEditingId] = useState<string | null>(null);

  const openCreate = () => {
    setForm(emptyTrip());
    setEditingId(null);
    setOpen(true);
  };

  const openEdit = (trip: Trip) => {
    const cover =
      trip.trip_images?.find((i) => i.is_cover)?.image_url ||
      trip.trip_images?.[0]?.image_url ||
      "";
    setForm({ ...trip, cover_url: cover });
    setEditingId(trip.id);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.title?.trim()) {
      toast.error("Title is required");
      return;
    }
    try {
      await save.mutateAsync({
        ...form,
        id: editingId ?? undefined,
        title: form.title.trim(),
        cover_url: form.cover_url,
      } as Partial<Trip> & { id?: string; title: string; cover_url?: string });
      toast.success(editingId ? "Trip updated" : "Trip created");
      setOpen(false);
    } catch (e) {
      toast.error((e as Error).message || "Failed to save trip");
    }
  };

  return (
    <AdminPageShell
      title="Trips"
      description="Manage ongoing treks shown on the homepage (Winter / Summer / Char Dham)"
      action={
        <Button className="h-11 rounded-lg" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Trip
        </Button>
      }
    >
      <DataTable
        loading={isLoading}
        data={trips}
        keyExtractor={(t) => t.id}
        columns={[
          {
            key: "title",
            header: "Title",
            cell: (t) => <span className="font-medium text-white">{t.title}</span>,
          },
          {
            key: "season",
            header: "Season",
            cell: (t) => <span className="capitalize">{t.season ?? "—"}</span>,
          },
          {
            key: "type",
            header: "Type",
            cell: (t) => (
              <Badge variant="secondary" className="capitalize">
                {t.trip_type === "dham" || /yatra|dham/i.test(t.title) ? "Char Dham" : "Trek"}
              </Badge>
            ),
          },
          {
            key: "price",
            header: "Price",
            cell: (t) => `₹${t.discount_price ?? t.price}`,
          },
          {
            key: "homepage",
            header: "Homepage",
            cell: (t) => (
              <Badge variant={t.is_featured ? "default" : "secondary"}>
                {t.is_featured ? "Featured" : "—"}
              </Badge>
            ),
          },
          {
            key: "status",
            header: "Status",
            cell: (t) => (
              <Badge variant={t.is_visible ? "default" : "secondary"}>
                {t.is_visible ? "Visible" : "Hidden"}
              </Badge>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            cell: (t) => (
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => openEdit(t)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600"
                  onClick={async () => {
                    if (!confirm("Delete this trip?")) return;
                    try {
                      await remove.mutateAsync(t.id);
                      toast.success("Trip deleted");
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
        title={editingId ? "Edit Trip" : "Create Trip"}
        onCancel={() => setOpen(false)}
        onSave={handleSave}
        saving={save.isPending}
      >
        <FormField label="Title">
          <Input
            className={adminInputClass}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </FormField>

        <FormField label="Cover image">
          <ImageUploader
            value={form.cover_url}
            onChange={(url) => setForm({ ...form, cover_url: url })}
            folder="trips"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Season (homepage tab)">
            <Select
              value={form.season ?? "winter"}
              onValueChange={(v) => setForm({ ...form, season: v as Trip["season"] })}
            >
              <SelectTrigger className={adminSelectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="winter">Winter</SelectItem>
                <SelectItem value="summer">Summer</SelectItem>
                <SelectItem value="monsoon">Monsoon</SelectItem>
                <SelectItem value="all">All season</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Package type">
            <Select
              value={form.trip_type ?? "trek"}
              onValueChange={(v) => setForm({ ...form, trip_type: v as Trip["trip_type"] })}
            >
              <SelectTrigger className={adminSelectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trek">Trek</SelectItem>
                <SelectItem value="dham">Char Dham</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Destination">
            <Select
              value={form.destination_id ?? ""}
              onValueChange={(v) => setForm({ ...form, destination_id: v || null })}
            >
              <SelectTrigger className={adminSelectTriggerClass}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {destinations.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Category">
            <Select
              value={form.category_id ?? ""}
              onValueChange={(v) => setForm({ ...form, category_id: v || null })}
            >
              <SelectTrigger className={adminSelectTriggerClass}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <FormField
          label="Location"
          hint="Shown on the trip page map (e.g. Joshimath, Uttarakhand)"
        >
          <Input
            className={adminInputClass}
            value={form.location ?? ""}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Joshimath, Uttarakhand"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Map latitude"
            hint="Optional — precise pin. Leave blank to use location name."
          >
            <Input
              className={adminInputClass}
              type="number"
              step="any"
              placeholder="30.555"
              value={form.map_lat ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  map_lat: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </FormField>
          <FormField label="Map longitude">
            <Input
              className={adminInputClass}
              type="number"
              step="any"
              placeholder="79.565"
              value={form.map_lng ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  map_lng: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Price (₹)">
            <Input
              className={adminInputClass}
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
          </FormField>
          <FormField label="Discount Price">
            <Input
              className={adminInputClass}
              type="number"
              value={form.discount_price ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  discount_price: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Days">
            <Input
              className={adminInputClass}
              type="number"
              value={form.duration_days}
              onChange={(e) => setForm({ ...form, duration_days: Number(e.target.value) })}
            />
          </FormField>
          <FormField label="Nights">
            <Input
              className={adminInputClass}
              type="number"
              value={form.duration_nights}
              onChange={(e) => setForm({ ...form, duration_nights: Number(e.target.value) })}
            />
          </FormField>
        </div>

        <FormField label="Difficulty">
          <Select
            value={form.difficulty}
            onValueChange={(v) => setForm({ ...form, difficulty: v as Trip["difficulty"] })}
          >
            <SelectTrigger className={adminSelectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["easy", "moderate", "difficult", "extreme"].map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <VisibilityField
          label="Visible on website"
          description="Show this trip to customers"
          checked={form.is_visible ?? true}
          onCheckedChange={(v) => setForm({ ...form, is_visible: v })}
        />
        <VisibilityField
          label="Show on homepage Treks section"
          description="Featured — appears under Winter, Summer, or Char Dham tabs"
          checked={form.is_featured ?? false}
          onCheckedChange={(v) => setForm({ ...form, is_featured: v })}
        />
        <VisibilityField
          label="Show in Ongoing Trip section"
          description="Appears under homepage Ongoing Trip (also managed in Admin → Ongoing Trips)"
          checked={form.is_popular ?? false}
          onCheckedChange={(v) => setForm({ ...form, is_popular: v })}
        />
      </AdminFormDialog>
    </AdminPageShell>
  );
}
