import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface VisibilityFieldProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function VisibilityField({
  label,
  description,
  checked,
  onCheckedChange,
  className,
}: VisibilityFieldProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3",
        className
      )}
    >
      <div className="min-w-0">
        <Label className="text-sm font-medium text-gray-200">{label}</Label>
        {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={label} />
    </div>
  );
}
