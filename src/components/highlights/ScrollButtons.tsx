import { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrollButtonsProps {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  onScrollLeft: () => void;
  onScrollRight: () => void;
}

export const ScrollButtons = memo(function ScrollButtons({
  canScrollLeft,
  canScrollRight,
  onScrollLeft,
  onScrollRight,
}: ScrollButtonsProps) {
  if (!canScrollLeft && !canScrollRight) return null;

  return (
    <>
      {canScrollLeft && (
        <button
          type="button"
          onClick={onScrollLeft}
          aria-label="Scroll highlights left"
          className={cn(
            "absolute left-0 top-[29px] z-10 hidden h-9 w-9 -translate-x-1/2 items-center justify-center",
            "rounded-full border border-[#2f2f2f] bg-black/90 text-white shadow-lg",
            "transition-opacity hover:bg-[#1a1a1a] md:flex lg:top-[32px]"
          )}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      {canScrollRight && (
        <button
          type="button"
          onClick={onScrollRight}
          aria-label="Scroll highlights right"
          className={cn(
            "absolute right-0 top-[29px] z-10 hidden h-9 w-9 translate-x-1/2 items-center justify-center",
            "rounded-full border border-[#2f2f2f] bg-black/90 text-white shadow-lg",
            "transition-opacity hover:bg-[#1a1a1a] md:flex lg:top-[32px]"
          )}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </>
  );
});
