import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, CircleDot } from "lucide-react";
import toast from "react-hot-toast";
import { AdminFormDialog } from "@/components/admin/AdminFormDialog";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { DataTable } from "@/components/admin/DataTable";
import { FormField } from "@/components/admin/FormField";
import { ItineraryEditor, StringListEditor } from "@/components/admin/TripContentEditors";
import { PdfUploader } from "@/components/admin/PdfUploader";
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
  useAdminCategories,
  useAdminDestinations,
} from "@/hooks/useAdmin";
import type { Trip } from "@/types";

type TripForm = Partial<Trip> & { title: string; cover_url?: string };

const emptyTrip = (): TripForm => ({
  title: "",
  location: "",
  duration_days: 6,
  duration_nights: 5,
  price: 0,
  discount_price: null,
  difficulty: "moderate",
  max_seats: 20,
  seats_left: 20,
  season: "winter",
  trip_type: "trek",
  rating: 4.8,
  is_popular: true,
  is_featured: true,
  is_visible: true,
  itinerary: [],
  inclusions: [],
  exclusions: [],
  itinerary_pdf_url: null,
  cover_url: "",
});

export default function AdminOngoingTripsPage() {
  const { data: allTrips = [], isLoading } = useAdminTrips();
  const { data: categories = [] } = useAdminCategories();
  const { data: destinations = [] } = useAdminDestinations();
  const { save } = useAdminTripMutations();

  const ongoing = useMemo(
    () => allTrips.filter((t) => t.is_popular),
    [allTrips]
  );
  const availableToAdd = useMemo(
    () => allTrips.filter((t) => !t.is_popular),
    [allTrips]
  );

  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<TripForm>(emptyTrip());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pickId, setPickId] = useState("");

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
    if (!form.title?.trim()) return toast.error("Title is required");
    try {
      await save.mutateAsync({
        ...form,
        id: editingId ?? undefined,
        title: form.title.trim(),
        is_popular: true,
        cover_url: form.cover_url,
      } as Partial<Trip> & { id?: string; title: string; cover_url?: string });
      toast.success(editingId ? "Ongoing trip updated" : "Ongoing trip created");
      setOpen(false);
    } catch (e) {
      toast.error((e as Error).message || "Save failed");
    }
  };

  const addExisting = async () => {
    if (!pickId) return toast.error("Select a trip");
    const trip = allTrips.find((t) => t.id === pickId);
    if (!trip) return;
    try {
      await save.mutateAsync({
        ...trip,
        id: trip.id,
        title: trip.title,
        is_popular: true,
        is_visible: true,
      });
      toast.success(`“${trip.title}” added to Ongoing Trip`);
      setAddOpen(false);
      setPickId("");
    } catch (e) {
      toast.error((e as Error).message || "Failed to add");
    }
  };

  const removeFromOngoing = async (trip: Trip) => {
    if (!confirm(`Remove “${trip.title}” from the Ongoing Trip section?`)) return;
    try {
      await save.mutateAsync({
        ...trip,
        id: trip.id,
        title: trip.title,
        is_popular: false,
      });
      toast.success("Removed from Ongoing Trip section");
    } catch (e) {
      toast.error((e as Error).message || "Failed");
    }
  };

  return (
    <AdminPageShell
      title="Ongoing Trips"
      description="Packages shown in the homepage Ongoing Trip section"
      action={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="h-11 rounded-lg"
            onClick={() => setAddOpen(true)}
            disabled={!availableToAdd.length}
          >
            <CircleDot className="h-4 w-4" />
            Add existing trip
          </Button>
          <Button className="h-11 rounded-lg" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Create ongoing trip
          </Button>
        </div>
      }
    >
      <DataTable
        loading={isLoading}
        data={ongoing}
        keyExtractor={(t) => t.id}
        columns={[
          {
            key: "title",
            header: "Title",
            cell: (t) => (
              <div className="flex items-center gap-3">
                <img
                  src={
                    t.trip_images?.find((i) => i.is_cover)?.image_url ||
                    t.trip_images?.[0]?.image_url ||
                    ""
                  }
                  alt=""
                  className="h-10 w-14 rounded-md object-cover bg-gray-100"
                />
                <span className="font-medium text-white">{t.title}</span>
              </div>
            ),
          },
          {
            key: "location",
            header: "Location",
            cell: (t) => t.location ?? "—",
          },
          {
            key: "duration",
            header: "Duration",
            cell: (t) => `${t.duration_days}D / ${t.duration_nights}N`,
          },
          {
            key: "price",
            header: "Price",
            cell: (t) => `₹${t.discount_price ?? t.price}`,
          },
          {
            key: "status",
            header: "Visible",
            cell: (t) => (
              <Badge variant={t.is_visible ? "default" : "secondary"}>
                {t.is_visible ? "Yes" : "No"}
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
                  onClick={() => void removeFromOngoing(t)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      {/* Add existing */}
      <AdminFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add existing trip to Ongoing"
        onCancel={() => setAddOpen(false)}
        onSave={addExisting}
        saving={save.isPending}
      >
        <FormField label="Select trip">
          <Select value={pickId} onValueChange={setPickId}>
            <SelectTrigger className={adminSelectTriggerClass}>
              <SelectValue placeholder="Choose a trip" />
            </SelectTrigger>
            <SelectContent>
              {availableToAdd.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </AdminFormDialog>

      {/* Create / edit */}
      <AdminFormDialog
        open={open}
        onOpenChange={setOpen}
        title={editingId ? "Edit ongoing trip" : "Create ongoing trip"}
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
        <FormField label="Location">
          <Input
            className={adminInputClass}
            value={form.location ?? ""}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </FormField>
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
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Price (₹)">
            <Input
              className={adminInputClass}
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
          </FormField>
          <FormField label="Discount price">
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
          label="Detailed itinerary PDF"
          hint="Uploaded PDF can be downloaded by signed-in users on the trip page"
        >
          <PdfUploader
            value={form.itinerary_pdf_url}
            onChange={(url) => setForm({ ...form, itinerary_pdf_url: url || null })}
          />
        </FormField>

        <ItineraryEditor
          days={form.itinerary ?? []}
          onChange={(itinerary) => setForm({ ...form, itinerary })}
        />

        <StringListEditor
          label="Inclusions"
          hint="What’s included in the package"
          items={form.inclusions ?? []}
          onChange={(inclusions) => setForm({ ...form, inclusions })}
          placeholder="e.g. Certified trek guide"
          addLabel="Add inclusion"
        />

        <StringListEditor
          label="Exclusions"
          hint="What’s not included"
          items={form.exclusions ?? []}
          onChange={(exclusions) => setForm({ ...form, exclusions })}
          placeholder="e.g. Travel insurance"
          addLabel="Add exclusion"
        />

        <VisibilityField
          label="Visible on website"
          description="Hide without removing from ongoing list"
          checked={form.is_visible ?? true}
          onCheckedChange={(v) => setForm({ ...form, is_visible: v })}
        />
      </AdminFormDialog>
    </AdminPageShell>
  );
}
