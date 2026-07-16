import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { SEO } from "@/components/common/SEO";
import { PageHero } from "@/components/common/PageHero";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGallery } from "@/hooks/useCMS";
import { cn } from "@/lib/utils";

const CATEGORIES = ["all", "trekking", "camping", "adventure", "biking", "winter"];
const PAGE_SIZE = 6;

export default function GalleryPage() {
  const [category, setCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { data: gallery, isLoading } = useGallery(category === "all" ? undefined : category);
  const loaderRef = useRef<HTMLDivElement>(null);

  const allItems = useMemo(() => {
    if (category === "all") return gallery ?? [];
    return gallery ?? [];
  }, [gallery, category]);

  const visibleItems = allItems.slice(0, visibleCount);
  const hasMore = visibleCount < allItems.length;

  const loadMore = useCallback(() => {
    if (hasMore) setVisibleCount((c) => c + PAGE_SIZE);
  }, [hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );
    const el = loaderRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [loadMore]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [category]);

  return (
    <>
      <SEO title="Gallery" description="Explore stunning moments from our adventures across India." />

      <PageHero
        title="Photo Gallery"
        subtitle="Captured moments from our treks, camps, and adventures across India."
        breadcrumbs={[{ label: "Gallery" }]}
      />

      <section className="container mx-auto px-4 py-10">
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? "default" : "secondary"}
              size="sm"
              onClick={() => setCategory(cat)}
              className="capitalize"
            >
              {cat === "all" ? "All" : cat}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="mb-4 h-64 break-inside-avoid rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {visibleItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (i % PAGE_SIZE) * 0.05 }}
                className="group relative mb-4 break-inside-avoid overflow-hidden rounded-2xl premium-shadow"
              >
                <img
                  src={item.image_url ?? ""}
                  alt={item.title ?? "Gallery"}
                  className={cn(
                    "w-full object-cover transition-transform duration-500 group-hover:scale-105",
                    i % 3 === 0 ? "h-80" : i % 3 === 1 ? "h-64" : "h-72"
                  )}
                  loading="lazy"
                />
                {item.title && (
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {hasMore && (
          <div ref={loaderRef} className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}
      </section>
    </>
  );
}
