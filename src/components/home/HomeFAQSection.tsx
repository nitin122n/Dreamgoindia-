import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useFAQs } from "@/hooks/useCMS";
import { mockFaqs } from "@/data/mock-data";

const FALLBACK = [
  {
    id: "home-1",
    question: "What is included in the trip price?",
    answer:
      "Accommodation, meals, guide fees, permits, and transportation as per the itinerary. Personal expenses and travel insurance are usually extra.",
  },
  {
    id: "home-2",
    question: "How do I reach the starting point?",
    answer:
      "We arrange pickup from the nearest railway station or bus stand. Exact details are shared after booking confirmation.",
  },
  {
    id: "home-3",
    question: "What is the best time to trek in Uttarakhand?",
    answer:
      "Winter treks like Kedarkantha run Dec–March. Summer valleys and Char Dham yatras are best from May to June and Sep–Oct.",
  },
  {
    id: "home-4",
    question: "Do I need prior trekking experience?",
    answer:
      "Easy treks need no experience. Moderate treks need basic fitness. We share a training checklist after you book.",
  },
  {
    id: "home-5",
    question: "What is the cancellation policy?",
    answer:
      "Full refund if cancelled 30+ days before departure. 50% refund for 15–30 days. Closer cancellations follow the booking terms.",
  },
];

export function HomeFAQSection() {
  const { data: faqs } = useFAQs();
  const items =
    faqs && faqs.length > 0
      ? faqs.slice(0, 6).map((f) => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
        }))
      : mockFaqs.length
        ? mockFaqs.slice(0, 6).map((f) => ({
            id: f.id,
            question: f.question,
            answer: f.answer,
          }))
        : FALLBACK;

  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="container mx-auto max-w-3xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.35em] text-gray-400">
            F A Q
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Have Any Doubts
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-gray-200 bg-white px-4 sm:px-6"
        >
          <Accordion type="single" collapsible className="w-full">
            {items.map((item) => (
              <AccordionItem key={item.id} value={item.id} className="border-gray-200">
                <AccordionTrigger className="py-5 text-base font-medium text-gray-900 hover:text-primary hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-[15px] leading-relaxed text-gray-600">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Still have questions?{" "}
          <Link to="/faq" className="font-semibold text-primary hover:underline">
            View all FAQs
          </Link>{" "}
          or{" "}
          <Link to="/contact" className="font-semibold text-primary hover:underline">
            contact us
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
