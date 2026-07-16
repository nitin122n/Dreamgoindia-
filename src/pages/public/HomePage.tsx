import { Helmet } from "react-helmet-async";
import { HeroSlider } from "@/components/home/HeroSlider";
import { HighlightList } from "@/components/highlights/HighlightList";
import { HomeMarquee } from "@/components/home/HomeMarquee";
import { HomeFeaturedTrips } from "@/components/home/HomeFeaturedTrips";
import { HomeOngoingTrips } from "@/components/home/HomeOngoingTrips";
import { InstagramSection } from "@/components/home/InstagramSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { HomeFAQSection } from "@/components/home/HomeFAQSection";
import { useSettings } from "@/contexts/SettingsContext";

export default function HomePage() {
  const { settings } = useSettings();

  return (
    <>
      <Helmet>
        <title>{settings.seo_default_title}</title>
        <meta name="description" content={settings.seo_default_description} />
        <meta property="og:title" content={settings.seo_default_title} />
        <meta property="og:description" content={settings.seo_default_description} />
      </Helmet>

      <HeroSlider />
      <HighlightList />
      <HomeMarquee />
      <HomeFeaturedTrips />
      <HomeOngoingTrips />
      <InstagramSection />
      <ReviewsSection />
      <HomeFAQSection />
    </>
  );
}
