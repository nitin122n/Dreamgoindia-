import { Link } from "react-router-dom";
import { Mountain } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: "default" | "white";
  to?: string;
}

function FallbackMark({ isWhite }: { isWhite: boolean }) {
  return (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
      <Mountain className={cn("h-8 w-8", isWhite ? "text-white" : "text-primary")} strokeWidth={2.5} />
      <Mountain
        className={cn("absolute h-6 w-6 translate-x-1", isWhite ? "text-white/70" : "text-gray-900")}
        strokeWidth={2}
      />
    </div>
  );
}

export function Logo({ className, showText = true, variant = "default", to = "/" }: LogoProps) {
  const { settings } = useSettings();
  const isWhite = variant === "white";
  const logoUrl = settings.logo_url?.trim() || "";
  const hasCustomLogo = Boolean(logoUrl && logoUrl !== "/logo.svg");

  const name = settings.site_name.trim() || "Dream Go India";
  const parts = name.split(/\s+/);
  const brandStart = parts.slice(0, Math.max(parts.length - 1, 1)).join(" ");
  const brandAccent = parts.length > 1 ? parts[parts.length - 1] : "";
  const tagline = "Experience the difference";

  return (
    <Link to={to} className={cn("inline-flex items-center gap-2.5", className)} aria-label={settings.site_name}>
      {hasCustomLogo ? (
        <img
          src={logoUrl}
          alt=""
          className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-black/10"
          loading="eager"
          decoding="async"
        />
      ) : (
        <FallbackMark isWhite={isWhite} />
      )}
      {showText && (
        <div className="flex flex-col items-start justify-center leading-none">
          <span className={cn("whitespace-nowrap text-sm font-bold", isWhite ? "text-white" : "text-gray-900")}>
            {brandStart}
            {brandAccent && <span className="text-primary"> {brandAccent}</span>}
          </span>
          <span
            className={cn(
              "mt-0.5 whitespace-nowrap text-[11px] font-semibold",
              isWhite ? "text-white/85" : "text-gray-900"
            )}
          >
            {tagline}
          </span>
        </div>
      )}
    </Link>
  );
}
