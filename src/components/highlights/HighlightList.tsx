import { memo, useCallback, useState } from "react";
import { motion } from "framer-motion";
import type { TravelHighlight } from "@/types/highlight";
import { useHighlights } from "@/hooks/useHighlights";
import { HighlightItem } from "./HighlightItem";
import { StoryViewer } from "./StoryViewer";

function HighlightSkeleton() {
  return (
    <div className="flex gap-4 px-2" aria-hidden>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex w-[72px] shrink-0 flex-col items-center">
          <div className="h-[68px] w-[68px] animate-pulse rounded-full bg-white/15" />
          <div className="mt-2 h-3 w-14 animate-pulse rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}

export const HighlightList = memo(function HighlightList() {
  const { data: highlights = [], isLoading, isFetching } = useHighlights();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleOpen = useCallback(
    (item: TravelHighlight) => {
      const index = highlights.findIndex((h) => h.id === item.id);
      setActiveIndex(index >= 0 ? index : 0);
    },
    [highlights]
  );

  const handleClose = useCallback(() => {
    setActiveIndex(null);
  }, []);

  const showSkeleton = isLoading || (isFetching && highlights.length === 0);
  const activeId = activeIndex != null ? highlights[activeIndex]?.id : null;

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.4 }}
        aria-label="Travel highlights"
        className="border-b border-white/5 bg-black py-5 sm:py-6"
      >
        <div className="container mx-auto px-4 lg:px-8">
          {showSkeleton ? (
            <HighlightSkeleton />
          ) : highlights.length === 0 ? (
            <p className="px-2 text-center text-sm text-white/60">
              No highlights available
            </p>
          ) : (
            <div
              className="highlights-scroll flex gap-4 overflow-x-auto scroll-smooth px-2"
              role="list"
            >
              {highlights.map((item, index) => (
                <div key={item.id} role="listitem">
                  <HighlightItem
                    item={item}
                    index={index}
                    isActive={activeId === item.id}
                    onClick={handleOpen}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      <StoryViewer
        highlights={highlights}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
        onClose={handleClose}
      />
    </>
  );
});

/** @deprecated Prefer HighlightList */
export const Highlights = HighlightList;
