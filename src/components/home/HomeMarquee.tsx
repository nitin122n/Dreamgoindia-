import { useSettings } from "@/contexts/SettingsContext";

const DEFAULT_TEXT =
  "Welcome to Dream Go India — we welcome you to start a mesmerizing journey";

export function HomeMarquee() {
  const { settings } = useSettings();
  const text = (settings.home_marquee_text || DEFAULT_TEXT).trim();
  if (!text) return null;

  return (
    <section className="overflow-hidden bg-black/40 py-3" aria-label="Announcement">
      <div className="home-marquee flex w-max whitespace-nowrap">
        <p className="px-4 text-sm font-semibold uppercase tracking-[0.18em] text-white sm:text-base">
          {text}
        </p>
      </div>
    </section>
  );
}
