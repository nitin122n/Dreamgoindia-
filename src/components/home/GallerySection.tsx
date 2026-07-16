import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useGallery } from "@/hooks/useCMS";

export function GallerySection() {
  const { data: items = [] } = useGallery();

  return (
    <section className="bg-gray-50 py-12 lg:py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 lg:text-3xl">Photo Gallery</h2>
          <Link to="/gallery" className="text-sm font-semibold text-primary hover:underline">View all</Link>
        </div>
        <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
          {items.slice(0, 8).map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="mb-4 break-inside-avoid overflow-hidden rounded-xl"
            >
              <img
                src={item.image_url || ""}
                alt={item.title || ""}
                className="w-full object-cover transition-transform duration-300 hover:scale-105"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
