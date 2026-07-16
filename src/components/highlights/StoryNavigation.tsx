import { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface StoryNavigationProps {
  onPrev: () => void;
  onNext: () => void;
  show: boolean;
}

export const StoryNavigation = memo(function StoryNavigation({
  onPrev,
  onNext,
  show,
}: StoryNavigationProps) {
  if (!show) return null;

  return (
    <>
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous story"
        className="absolute -left-1 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white backdrop-blur-sm transition hover:bg-black/75 sm:-left-12"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Next story"
        className="absolute -right-1 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white backdrop-blur-sm transition hover:bg-black/75 sm:-right-12"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Tap zones (Instagram-style) */}
      <button
        type="button"
        aria-label="Previous story"
        onClick={onPrev}
        className="absolute inset-y-0 left-0 z-10 w-1/3 cursor-pointer bg-transparent"
      />
      <button
        type="button"
        aria-label="Next story"
        onClick={onNext}
        className="absolute inset-y-0 right-0 z-10 w-1/3 cursor-pointer bg-transparent"
      />
    </>
  );
});
