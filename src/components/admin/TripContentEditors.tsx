import { Plus, Trash2 } from "lucide-react";
import { FormField } from "@/components/admin/FormField";
import { adminInputClass, adminTextareaClass } from "@/components/admin/admin-styles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ItineraryDay } from "@/types";

function renumberDays(days: ItineraryDay[]): ItineraryDay[] {
  return days.map((d, i) => ({ ...d, day: i + 1 }));
}

interface StringListEditorProps {
  label: string;
  hint?: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addLabel?: string;
}

export function StringListEditor({
  label,
  hint,
  items,
  onChange,
  placeholder = "Add an item…",
  addLabel = "Add item",
}: StringListEditorProps) {
  const update = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const add = () => {
    onChange([...items, ""]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-gray-200">{label}</p>
          {hint && <p className="text-xs text-gray-400">{hint}</p>}
        </div>
        <Button type="button" size="sm" variant="secondary" onClick={add}>
          <Plus className="h-4 w-4" />
          {addLabel}
        </Button>
      </div>

      {items.length === 0 && (
        <p className="rounded-lg border border-dashed border-white/10 px-3 py-4 text-center text-xs text-gray-500">
          No items yet. Click “{addLabel}” to add one.
        </p>
      )}

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              className={adminInputClass}
              value={item}
              onChange={(e) => update(index, e.target.value)}
              placeholder={placeholder}
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="shrink-0 text-red-500 hover:text-red-400"
              onClick={() => remove(index)}
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ItineraryEditorProps {
  days: ItineraryDay[];
  onChange: (days: ItineraryDay[]) => void;
}

export function ItineraryEditor({ days, onChange }: ItineraryEditorProps) {
  const update = (index: number, patch: Partial<ItineraryDay>) => {
    const next = [...days];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(renumberDays(days.filter((_, i) => i !== index)));
  };

  const add = () => {
    onChange([
      ...days,
      {
        day: days.length + 1,
        title: "",
        description: "",
      },
    ]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-gray-200">Itinerary</p>
          <p className="text-xs text-gray-400">Day-by-day plan shown on the trip page</p>
        </div>
        <Button type="button" size="sm" variant="secondary" onClick={add}>
          <Plus className="h-4 w-4" />
          Add day
        </Button>
      </div>

      {days.length === 0 && (
        <p className="rounded-lg border border-dashed border-white/10 px-3 py-4 text-center text-xs text-gray-500">
          No days yet. Click “Add day” to build the itinerary.
        </p>
      )}

      <div className="space-y-3">
        {days.map((day, index) => (
          <div
            key={index}
            className="space-y-3 rounded-lg border border-dashed border-white/10 p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-primary">Day {day.day}</span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-red-500 hover:text-red-400"
                onClick={() => remove(index)}
                aria-label="Remove day"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <FormField label="Title">
              <Input
                className={adminInputClass}
                value={day.title}
                onChange={(e) => update(index, { title: e.target.value })}
                placeholder="Arrival & Briefing"
              />
            </FormField>

            <FormField label="Description">
              <Textarea
                className={adminTextareaClass}
                rows={2}
                value={day.description}
                onChange={(e) => update(index, { description: e.target.value })}
                placeholder="Meet at base camp, gear check, and orientation…"
              />
            </FormField>
          </div>
        ))}
      </div>
    </div>
  );
}
