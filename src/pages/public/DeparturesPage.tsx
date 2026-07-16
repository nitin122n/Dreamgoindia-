import { SEO } from "@/components/common/SEO";
import { PageHero } from "@/components/common/PageHero";
import { UpcomingDepartures } from "@/components/home/UpcomingDepartures";

export default function DeparturesPage() {
  return (
    <>
      <SEO
        title="Upcoming Departures"
        description="Book your seat on scheduled treks and tours with Dream Go India. View upcoming departure dates and availability."
      />
      <PageHero
        title="Upcoming Departures"
        subtitle="Don't miss these scheduled adventures — limited seats available on each departure."
        breadcrumbs={[{ label: "Departures" }]}
      />
      <UpcomingDepartures />
    </>
  );
}
