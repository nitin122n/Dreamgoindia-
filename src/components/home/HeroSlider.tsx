import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { AnimatePresence, motion } from "framer-motion";
import { useHeroSlides } from "@/hooks/useCMS";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const AUTO_DELAY_MS = 5_000;

export function HeroSlider() {
  const { data: slides = [] } = useHeroSlides();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/trips?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const onSwiper = useCallback((swiper: SwiperType) => {
    swiperRef.current = swiper;
    if (slides.length > 1) {
      swiper.autoplay?.start();
    }
  }, [slides.length]);

  // Keep autoplay running at 5s whenever slides are available
  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper || slides.length <= 1) return;
    swiper.params.autoplay = {
      delay: AUTO_DELAY_MS,
      disableOnInteraction: false,
      pauseOnMouseEnter: false,
    };
    swiper.autoplay?.start();
  }, [slides.length]);

  if (slides.length === 0) return null;

  const activeSlide = slides[activeIndex] ?? slides[0];

  return (
    <section className="relative h-[55vh] min-h-[420px] w-full overflow-hidden sm:h-[70vh] sm:min-h-[500px] lg:h-[85vh] lg:min-h-[600px]">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={900}
        autoplay={{
          delay: AUTO_DELAY_MS,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
          waitForTransition: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        loop={slides.length > 1}
        allowTouchMove
        onSwiper={onSwiper}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="hero-swiper h-full w-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-full w-full overflow-hidden">
              <img
                src={slide.image_url}
                alt={slide.title}
                className="hero-ken-burns h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/25" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="pointer-events-auto max-w-2xl"
            >
              <h1 className="mb-3 text-3xl font-bold text-white sm:mb-4 sm:text-4xl md:text-5xl lg:text-6xl">
                {activeSlide.title}
              </h1>
              {activeSlide.subtitle && (
                <p className="mb-6 text-base text-white/90 sm:mb-8 sm:text-lg md:text-xl">
                  {activeSlide.subtitle}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-full px-8">
                  <Link to={activeSlide.cta_link}>{activeSlide.cta_text}</Link>
                </Button>
                {activeSlide.secondary_cta_text && activeSlide.secondary_cta_link && (
                  <Button
                    asChild
                    variant="secondary"
                    size="lg"
                    className="hidden rounded-full sm:inline-flex"
                  >
                    <Link to={activeSlide.secondary_cta_link}>
                      {activeSlide.secondary_cta_text}
                    </Link>
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute bottom-16 left-0 right-0 z-10 hidden md:block">
        <form
          onSubmit={handleSearch}
          className="container mx-auto flex max-w-xl items-center gap-2 rounded-full bg-white/95 p-2 premium-shadow-lg backdrop-blur-sm"
        >
          <Search className="ml-4 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search trips, destinations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent px-2 py-2 text-sm text-gray-900 caret-gray-900 outline-none placeholder:text-gray-400"
          />
          <Button type="submit" className="rounded-full">
            Search
          </Button>
        </form>
      </div>
    </section>
  );
}
