import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { Star, Quote } from "lucide-react";
import { useTestimonials } from "@/hooks/useCMS";

export function ReviewsSection() {
  const { data: testimonials = [] } = useTestimonials();

  return (
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-primary lg:text-3xl">What Our Travelers Say</h2>
        </div>
        <Swiper
          modules={[Autoplay, Navigation]}
          autoplay={{ delay: 4000 }}
          navigation
          spaceBetween={24}
          breakpoints={{ 640: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
        >
          {testimonials.map((t) => (
            <SwiperSlide key={t.id}>
              <div className="rounded-2xl bg-white p-6 premium-shadow h-full">
                <Quote className="mb-4 h-8 w-8 text-primary/30" />
                <p className="mb-4 text-gray-600 line-clamp-4">{t.content}</p>
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  {t.image_url && (
                    <img src={t.image_url} alt={t.name} className="h-12 w-12 rounded-full object-cover" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.location} {t.trip_name && `• ${t.trip_name}`}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
