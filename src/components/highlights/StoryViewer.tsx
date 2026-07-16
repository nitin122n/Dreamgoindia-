import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { X } from "lucide-react";
import type { TravelHighlight } from "@/types/highlight";
import { useStories } from "@/hooks/useStories";
import { StoryProgress } from "./StoryProgress";
import { StoryNavigation } from "./StoryNavigation";
import { StoryImage } from "./StoryImage";

const STORY_DURATION_MS = 5_000;

interface StoryViewerProps {
  highlights: TravelHighlight[];
  activeIndex: number | null;
  onActiveIndexChange: (index: number) => void;
  onClose: () => void;
}

export function StoryViewer({
  highlights,
  activeIndex,
  onActiveIndexChange,
  onClose,
}: StoryViewerProps) {
  const highlight =
    activeIndex != null && activeIndex >= 0 && activeIndex < highlights.length
      ? highlights[activeIndex]
      : null;
  const highlightId = highlight?.id ?? null;
  const { data: stories = [], isLoading } = useStories(highlightId);

  const [storyIndex, setStoryIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const startRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  /** When true, open the previous highlight on its last story */
  const openAtEndRef = useRef(false);

  const resetTimer = useCallback(() => {
    setProgress(0);
    elapsedRef.current = 0;
    startRef.current = null;
  }, []);

  useEffect(() => {
    if (activeIndex == null) {
      openAtEndRef.current = false;
      return;
    }
    if (!highlightId) return;

    // Waiting for stories of the previous highlight
    if (openAtEndRef.current && stories.length === 0) return;

    if (openAtEndRef.current && stories.length > 0) {
      setStoryIndex(stories.length - 1);
      openAtEndRef.current = false;
    } else {
      setStoryIndex(0);
    }
    setDirection(0);
    resetTimer();
  }, [activeIndex, highlightId, stories.length, resetTimer]);

  const goToNextHighlight = useCallback(() => {
    if (activeIndex == null) return;
    if (activeIndex < highlights.length - 1) {
      openAtEndRef.current = false;
      setDirection(1);
      resetTimer();
      onActiveIndexChange(activeIndex + 1);
      return;
    }
    onClose();
  }, [activeIndex, highlights.length, onActiveIndexChange, onClose, resetTimer]);

  const goToPrevHighlight = useCallback(() => {
    if (activeIndex == null || activeIndex <= 0) return;
    openAtEndRef.current = true;
    setDirection(-1);
    resetTimer();
    onActiveIndexChange(activeIndex - 1);
  }, [activeIndex, onActiveIndexChange, resetTimer]);

  const goNext = useCallback(() => {
    if (stories.length === 0) {
      goToNextHighlight();
      return;
    }
    setStoryIndex((i) => {
      if (i >= stories.length - 1) {
        queueMicrotask(goToNextHighlight);
        return i;
      }
      setDirection(1);
      resetTimer();
      return i + 1;
    });
  }, [stories.length, goToNextHighlight, resetTimer]);

  const goPrev = useCallback(() => {
    if (stories.length === 0) {
      goToPrevHighlight();
      return;
    }
    setStoryIndex((i) => {
      if (i <= 0) {
        queueMicrotask(goToPrevHighlight);
        return i;
      }
      setDirection(-1);
      resetTimer();
      return i - 1;
    });
  }, [stories.length, goToPrevHighlight, resetTimer]);

  // Skip empty highlights automatically (keep advancing until one with stories, or end)
  useEffect(() => {
    if (activeIndex == null || !highlight || isLoading) return;
    if (stories.length > 0) return;
    goToNextHighlight();
  }, [activeIndex, highlight, isLoading, stories.length, goToNextHighlight]);

  // Auto-play with pause-on-hover
  useEffect(() => {
    if (!highlight || stories.length === 0 || paused) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startRef.current = null;
      return;
    }

    const tick = (now: number) => {
      if (startRef.current == null) startRef.current = now;
      const elapsed = elapsedRef.current + (now - startRef.current);
      const ratio = Math.min(1, elapsed / STORY_DURATION_MS);
      setProgress(ratio);

      if (ratio >= 1) {
        elapsedRef.current = 0;
        startRef.current = null;
        goNext();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (startRef.current != null) {
        elapsedRef.current += performance.now() - startRef.current;
        startRef.current = null;
      }
    };
  }, [highlight, storyIndex, stories.length, paused, goNext]);

  // Keyboard + body scroll lock + focus trap
  useEffect(() => {
    if (!highlight) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    closeBtnRef.current?.focus();

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [highlight, onClose, goNext, goPrev]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60) goNext();
    else if (info.offset.x > 60) goPrev();
  };

  const current = stories[storyIndex];
  const canGoPrev = storyIndex > 0 || (activeIndex != null && activeIndex > 0);
  const canGoNext =
    storyIndex < stories.length - 1 ||
    (activeIndex != null && activeIndex < highlights.length - 1);

  return (
    <AnimatePresence>
      {highlight && (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${highlight.title} stories`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md"
          onClick={onClose}
        >
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close story viewer"
            className="absolute right-4 top-4 z-30 rounded-full p-2 text-white transition-colors hover:bg-white/10 sm:right-6 sm:top-6"
          >
            <X className="h-7 w-7" />
          </button>

          <div
            className="relative flex h-full w-full max-w-lg flex-col items-center justify-center px-4 py-14 sm:max-w-xl md:max-w-2xl"
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setPaused(false)}
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">
              {highlight.title}
            </p>

            <div className="relative w-full">
              <StoryProgress
                count={stories.length}
                currentIndex={storyIndex}
                progress={progress}
                paused={paused}
              />

              <StoryNavigation
                show={canGoPrev || canGoNext}
                onPrev={goPrev}
                onNext={goNext}
              />

              {isLoading && (
                <div className="flex aspect-[9/16] max-h-[72vh] w-full items-center justify-center rounded-2xl bg-[#111]">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                </div>
              )}

              {!isLoading && stories.length === 0 && (
                <div className="flex aspect-[9/16] max-h-[72vh] w-full items-center justify-center rounded-2xl bg-[#111] px-6 text-center text-sm text-white/70">
                  No stories available
                </div>
              )}

              <AnimatePresence mode="wait" custom={direction}>
                {current && (
                  <motion.div
                    key={`${highlight.id}-${current.id}`}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.15}
                    onDragEnd={handleDragEnd}
                  >
                    <StoryImage
                      story={current}
                      title={highlight.title}
                      direction={direction}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
