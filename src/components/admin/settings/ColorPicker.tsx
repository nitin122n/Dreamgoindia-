import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

function normalizeHex(value: string) {
  const v = value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(v)) return v;
  if (/^#[0-9A-Fa-f]{3}$/.test(v)) {
    const r = v[1];
    const g = v[2];
    const b = v[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  if (/^[0-9A-Fa-f]{6}$/.test(v)) return `#${v}`;
  return value;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const colorInputRef = useRef<HTMLInputElement>(null);
  const safeColor = /^#[0-9A-Fa-f]{3,6}$/.test(value) ? value : "#E53935";

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => colorInputRef.current?.click()}
          aria-label="Open color picker"
          className="h-11 w-11 shrink-0 rounded-lg border border-gray-200 shadow-sm transition-transform hover:scale-105"
          style={{ backgroundColor: safeColor }}
        />
        <input
          ref={colorInputRef}
          type="color"
          value={safeColor}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
          tabIndex={-1}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onChange(normalizeHex(e.target.value))}
          placeholder="#E53935"
          className="h-11 w-full max-w-[140px] rounded-lg font-mono text-sm sm:w-[140px]"
          spellCheck={false}
        />
        <div
          className="flex h-11 min-w-0 flex-1 items-center justify-center rounded-lg px-4 text-sm font-medium text-white shadow-sm"
          style={{ backgroundColor: safeColor }}
        >
          Live preview
        </div>
      </div>
    </div>
  );
}
