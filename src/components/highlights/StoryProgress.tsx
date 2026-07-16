import { memo } from "react";
import { motion } from "framer-motion";

interface StoryProgressProps {
  count: number;
  currentIndex: number;
  /** 0–1 progress of the active segment */
  progress: number;
  paused?: boolean;
}

export const StoryProgress = memo(function StoryProgress({
  count,
  currentIndex,
  progress,
}: StoryProgressProps) {
  if (count <= 0) return null;

  return (
    <div
      className="absolute left-0 right-0 top-0 z-20 flex gap-1 px-3 pt-3"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={count}
      aria-valuenow={currentIndex + 1}
      aria-label="Story progress"
    >
      {Array.from({ length: count }, (_, i) => {
        let fill = 0;
        if (i < currentIndex) fill = 1;
        else if (i === currentIndex) fill = progress;
        else fill = 0;

        return (
          <div key={i} className="h-[2.5px] flex-1 overflow-hidden rounded-full bg-white/30">
            <motion.div
              className="h-full rounded-full bg-white"
              initial={false}
              animate={{ width: `${fill * 100}%` }}
              transition={{ duration: 0.05, ease: "linear" }}
            />
          </div>
        );
      })}
    </div>
  );
});
