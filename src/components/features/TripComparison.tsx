import { useState } from "react";
import { X, Plus, Mountain } from "lucide-react";
import type { Trip } from "@/types";
import { formatPrice, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTrips } from "@/hooks/useCMS";

interface TripComparisonProps {
  trips?: Trip[];
}

const MAX_COMPARE = 3;

export function TripComparison({ trips: initialTrips }: TripComparisonProps) {
  const { data: allTrips } = useTrips();
  const availableTrips = allTrips ?? initialTrips ?? [];
  const [selected, setSelected] = useState<Trip[]>(initialTrips?.slice(0, MAX_COMPARE) ?? []);

  const addTrip = (tripId: string) => {
    if (selected.length >= MAX_COMPARE) return;
    const trip = availableTrips.find((t) => t.id === tripId);
    if (trip && !selected.find((s) => s.id === trip.id)) {
      setSelected([...selected, trip]);
    }
  };

  const removeTrip = (tripId: string) => {
    setSelected(selected.filter((t) => t.id !== tripId));
  };

  const unselectedTrips = availableTrips.filter(
    (t) => !selected.find((s) => s.id === t.id),
  );

  const rows = [
    { label: "Location", render: (t: Trip) => t.location },
    { label: "Duration", render: (t: Trip) => `${t.duration_days}D / ${t.duration_nights}N` },
    { label: "Price", render: (t: Trip) => formatPrice(t.discount_price ?? t.price) },
    { label: "Difficulty", render: (t: Trip) => t.difficulty },
    { label: "Rating", render: (t: Trip) => `${t.rating} (${t.review_count})` },
    { label: "Season", render: (t: Trip) => t.season },
    { label: "Altitude", render: (t: Trip) => t.altitude ?? "—" },
    { label: "Seats Left", render: (t: Trip) => String(t.seats_left) },
  ];

  return (
    <Card className="dark:border-gray-800 dark:bg-gray-900">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Mountain className="h-5 w-5 text-primary" />
          Compare Trips
        </CardTitle>
        {selected.length < MAX_COMPARE && unselectedTrips.length > 0 && (
          <Select onValueChange={addTrip}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Add trip" />
            </SelectTrigger>
            <SelectContent>
              {unselectedTrips.map((trip) => (
                <SelectItem key={trip.id} value={trip.id}>
                  {trip.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent>
        {selected.length === 0 ? (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            <p>Select up to {MAX_COMPARE} trips to compare side by side.</p>
            {unselectedTrips.length > 0 && (
              <Select onValueChange={addTrip}>
                <SelectTrigger className="mx-auto mt-4 w-64">
                  <SelectValue placeholder="Choose a trip" />
                </SelectTrigger>
                <SelectContent>
                  {unselectedTrips.map((trip) => (
                    <SelectItem key={trip.id} value={trip.id}>
                      {trip.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr>
                  <th className="p-3 text-left font-medium text-gray-500">Feature</th>
                  {selected.map((trip) => {
                    const cover =
                      trip.trip_images?.find((i) => i.is_cover)?.image_url ||
                      trip.trip_images?.[0]?.image_url;
                    return (
                      <th key={trip.id} className="p-3 text-left">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => removeTrip(trip.id)}
                            className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          {cover && (
                            <img
                              src={cover}
                              alt={trip.title}
                              className="mb-2 h-24 w-full rounded-lg object-cover"
                            />
                          )}
                          <p className="font-bold text-gray-900 dark:text-white">{trip.title}</p>
                        </div>
                      </th>
                    );
                  })}
                  {selected.length < MAX_COMPARE && (
                    <th className="p-3">
                      <Select onValueChange={addTrip}>
                        <SelectTrigger className="h-24 w-full border-dashed">
                          <Plus className="mx-auto h-5 w-5 text-gray-400" />
                        </SelectTrigger>
                        <SelectContent>
                          {unselectedTrips.map((trip) => (
                            <SelectItem key={trip.id} value={trip.id}>
                              {trip.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="p-3 font-medium text-gray-500">{row.label}</td>
                    {selected.map((trip) => (
                      <td
                        key={trip.id}
                        className={cn(
                          "p-3 capitalize text-gray-900 dark:text-white",
                          row.label === "Price" && "font-bold text-primary",
                        )}
                      >
                        {row.render(trip)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
