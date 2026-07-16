import { useSettings } from "@/contexts/SettingsContext";

const DEFAULT_TEXT =
  "Welcome to Dream Go India — we welcome you to start a mesmerizing journey";

export function HomeMarquee() {
  const { settings } = useSettings();
  const text = (settings.home_marquee_text || DEFAULT_TEXT).trim();
  if (!text) return null;

  // Duplicate so the loop has no visible gap
  const loop = `${text}   ✦   ${text}   ✦   `;

  return (
    <section
      className="overflow-hidden border-y border-primary/20 bg-black/40 py-3"
      aria-label="Announcement"
    >
      <div className="home-marquee flex w-max whitespace-nowrap">
        <p className="px-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary sm:text-base">
          {loop}
        </p>
        <p
          className="px-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary sm:text-base"
          aria-hidden
        >
          {loop}
        </p>
      </div>
    </section>
  );
}
