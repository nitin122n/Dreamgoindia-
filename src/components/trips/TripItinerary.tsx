import { motion } from "framer-motion";
import type { ItineraryDay } from "@/types";
import { cn } from "@/lib/utils";

interface TripItineraryProps {
  days: ItineraryDay[];
}

export function TripItinerary({ days }: TripItineraryProps) {
  if (!days.length) return null;

  return (
    <section>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Itinerary</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your day-by-day journey plan
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {days.length} {days.length === 1 ? "day" : "days"}
        </span>
      </div>

      <ol className="relative space-y-0">
        {/* Timeline rail */}
        <div
          aria-hidden
          className="absolute bottom-6 left-[1.35rem] top-6 w-px bg-gradient-to-b from-primary via-primary/35 to-transparent"
        />

        {days.map((day, index) => {
          const isLast = index === days.length - 1;
          return (
            <motion.li
              key={`${day.day}-${index}`}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: Math.min(index * 0.06, 0.36) }}
              className={cn("relative flex gap-4 pb-8", isLast && "pb-0")}
            >
              {/* Day marker */}
              <div className="relative z-10 flex shrink-0 flex-col items-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-[0_0_0_4px] shadow-white dark:shadow-gray-950">
                  {day.day}
                </div>
              </div>

              {/* Content */}
              <div
                className={cn(
                  "group min-w-0 flex-1 overflow-hidden rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white to-gray-50 p-4 transition-all duration-300",
                  "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
                  "dark:border-white/10 dark:from-white/[0.07] dark:to-white/[0.02] dark:hover:border-primary/40"
                )}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                    Day {String(day.day).padStart(2, "0")}
                  </span>
                  <span
                    aria-hidden
                    className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent"
                  />
                </div>
                <h3 className="text-lg font-bold capitalize leading-snug text-gray-900 dark:text-white">
                  {day.title}
                </h3>
                {day.description?.trim() && (
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {day.description}
                  </p>
                )}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
