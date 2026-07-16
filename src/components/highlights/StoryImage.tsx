import { memo } from "react";
import { motion } from "framer-motion";
import type { TravelStory } from "@/types/highlight";

interface StoryImageProps {
  story: TravelStory;
  title: string;
  direction: number;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 280 : -280,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -280 : 280,
    opacity: 0,
  }),
};

export const StoryImage = memo(function StoryImage({
  story,
  title,
  direction,
}: StoryImageProps) {
  return (
    <motion.div
      key={story.id}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.28, ease: "easeInOut" }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-[#111]"
    >
      <img
        src={story.image_url}
        alt={story.caption ?? title}
        loading="lazy"
        decoding="async"
        className="aspect-[9/16] max-h-[72vh] w-full object-cover"
      />
      {story.caption && (
        <div className="border-t border-white/10 px-4 py-3">
          <p className="text-sm text-white">{story.caption}</p>
        </div>
      )}
    </motion.div>
  );
});
