import { useState } from "react";
import { SEO } from "@/components/common/SEO";
import { PageHero } from "@/components/common/PageHero";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { useFAQs } from "@/hooks/useCMS";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "booking", label: "Booking" },
  { id: "trekking", label: "Trekking" },
  { id: "travel", label: "Travel" },
];

export default function FAQPage() {
  const [category, setCategory] = useState("all");
  const { data: faqs, isLoading } = useFAQs(category === "all" ? undefined : category);

  return (
    <>
      <SEO title="FAQs" description="Find answers to common questions about booking, trekking, and travel with Dream Go India." />

      <PageHero
        title="Frequently Asked Questions"
        subtitle="Everything you need to know before your adventure with Dream Go India."
        breadcrumbs={[{ label: "FAQ" }]}
      />

      <section className="container mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={category === cat.id ? "default" : "secondary"}
              size="sm"
              onClick={() => setCategory(cat.id)}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : (
          <Accordion
            type="single"
            collapsible
            className="rounded-2xl border border-gray-200 bg-white px-6 text-gray-900 premium-shadow dark:border-gray-200 dark:bg-white dark:text-gray-900"
          >
            {faqs?.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id} className="border-gray-200">
                <AccordionTrigger className="text-primary hover:text-primary-dark dark:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 dark:text-gray-700">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </section>
    </>
  );
}
