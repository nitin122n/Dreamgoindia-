import { memo } from "react";
import { motion } from "framer-motion";
import type { TravelHighlight } from "@/types/highlight";
import { cn } from "@/lib/utils";

const IG_GRADIENT =
  "linear-gradient(45deg, #FEDA75, #FA7E1E, #D62976, #962FBF, #4F5BD5)";

interface HighlightItemProps {
  item: TravelHighlight;
  index: number;
  isActive?: boolean;
  onClick: (item: TravelHighlight) => void;
}

export const HighlightItem = memo(function HighlightItem({
  item,
  index,
  isActive = false,
  onClick,
}: HighlightItemProps) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(item)}
      aria-label={`Open ${item.title} highlight`}
      aria-pressed={isActive}
      className="flex w-[72px] shrink-0 cursor-pointer flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black"
    >
      <div
        className={cn(
          "h-[68px] w-[68px] rounded-full transition-[box-shadow,padding] duration-[250ms] ease-out",
          isActive ? "p-[3.5px] shadow-lg" : "p-[2.5px]"
        )}
        style={{ background: IG_GRADIENT }}
      >
        <div className="h-full w-full rounded-full bg-white p-[2px]">
          <img
            src={item.cover_image}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full rounded-full object-cover"
          />
        </div>
      </div>

      <span
        className="mt-2 w-[72px] truncate text-center text-[13px] font-medium leading-tight text-white"
        title={item.title}
      >
        {item.title}
      </span>
    </motion.button>
  );
});
