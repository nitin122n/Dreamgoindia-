import { MapPin, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationMapProps {
  label: string;
  lat?: number | null;
  lng?: number | null;
  className?: string;
  heightClassName?: string;
}

function buildEmbedSrc(label: string, lat?: number | null, lng?: number | null): string {
  if (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng)
  ) {
    const delta = 0.04;
    const bbox = `${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
  }

  // Query-based Google Maps embed — no API key required
  const q = encodeURIComponent(label);
  return `https://maps.google.com/maps?q=${q}&z=12&output=embed`;
}

function buildOpenUrl(label: string, lat?: number | null, lng?: number | null): string {
  if (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng)
  ) {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}`;
}

export function LocationMap({
  label,
  lat,
  lng,
  className,
  heightClassName = "h-64",
}: LocationMapProps) {
  const place = label.trim();
  if (!place && (lat == null || lng == null)) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-gray-100 text-gray-400",
          heightClassName,
          className
        )}
      >
        <div className="text-center">
          <MapPin className="mx-auto mb-2 h-8 w-8" />
          <p className="text-sm">Location not set</p>
        </div>
      </div>
    );
  }

  const displayLabel = place || `${lat}, ${lng}`;
  const embedSrc = buildEmbedSrc(displayLabel, lat, lng);
  const openUrl = buildOpenUrl(displayLabel, lat, lng);

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-gray-200 bg-gray-50", className)}>
      <div className={cn("relative w-full", heightClassName)}>
        <iframe
          title={`Map — ${displayLabel}`}
          src={embedSrc}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-2.5">
        <p className="flex min-w-0 items-center gap-1.5 text-sm text-gray-600">
          <MapPin className="h-4 w-4 shrink-0 text-primary" />
          <span className="truncate">{displayLabel}</span>
        </p>
        <a
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          Open in Maps <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
