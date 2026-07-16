import { SEO } from "@/components/common/SEO";
import { PageHero } from "@/components/common/PageHero";
import { FeaturedTrips } from "@/components/home/FeaturedTrips";

export default function TripPackagesPage() {
  return (
    <>
      <SEO
        title="Trip Packages by Category"
        description="Browse winter, summer, family, adventure, and international trip packages from Dream Go India."
      />
      <PageHero
        title="Trip Packages"
        subtitle="Filter trips by season and category — winter treks, summer adventures, family tours, and more."
        breadcrumbs={[{ label: "Trips", href: "/trips" }, { label: "Packages" }]}
      />
      <FeaturedTrips />
    </>
  );
}
