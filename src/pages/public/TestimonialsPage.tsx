import { SEO } from "@/components/common/SEO";
import { PageHero } from "@/components/common/PageHero";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { InstagramSection } from "@/components/home/InstagramSection";

export default function TestimonialsPage() {
  return (
    <>
      <SEO
        title="Testimonials"
        description="Read what travelers say about their experiences with Dream Go India — treks, tours, and pilgrimage trips."
      />
      <PageHero
        title="Traveler Testimonials"
        subtitle="Real stories from real adventurers who explored India with Dream Go India."
        breadcrumbs={[{ label: "Testimonials" }]}
      />
      <ReviewsSection />
      <InstagramSection />
    </>
  );
}
