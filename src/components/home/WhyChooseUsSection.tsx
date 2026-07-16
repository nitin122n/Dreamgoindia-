import { motion } from "framer-motion";
import { Star, Compass, Shield, BadgeIndianRupee, Headphones, Leaf, type LucideIcon } from "lucide-react";
import { useWhyChooseUs } from "@/hooks/useCMS";

const iconMap: Record<string, LucideIcon> = {
  compass: Compass,
  shield: Shield,
  "badge-indian-rupee": BadgeIndianRupee,
  headphones: Headphones,
  leaf: Leaf,
  star: Star,
};

export function WhyChooseUsSection() {
  const { data: items = [] } = useWhyChooseUs();

  const getIcon = (iconName: string | null): LucideIcon => {
    if (!iconName) return Star;
    return iconMap[iconName.toLowerCase()] ?? Star;
  };

  return (
    <section className="bg-gray-50 py-12 lg:py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 lg:text-3xl">Why Choose Us</h2>
          <p className="mt-2 text-gray-500">Your trusted partner for unforgettable adventures</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => {
            const Icon = getIcon(item.icon);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="rounded-2xl bg-white p-6 text-center premium-shadow"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 font-bold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
