import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Clock, Eye } from "lucide-react";
import { format } from "date-fns";
import { SEO } from "@/components/common/SEO";
import { PageHero } from "@/components/common/PageHero";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlogs } from "@/hooks/useCMS";
import { useDebounce } from "@/hooks/useDebounce";

const CATEGORIES = [
  { id: "all", name: "All" },
  { id: "1", name: "Trekking" },
  { id: "2", name: "Travel Guides" },
  { id: "3", name: "Tips & Tricks" },
];

export default function BlogPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const debouncedSearch = useDebounce(search, 300);
  const { data: blogs, isLoading } = useBlogs();

  const filtered = useMemo(() => {
    if (!blogs) return [];
    return blogs.filter((blog) => {
      const q = debouncedSearch.toLowerCase();
      const matchesSearch =
        !q ||
        blog.title.toLowerCase().includes(q) ||
        blog.excerpt?.toLowerCase().includes(q);
      const matchesCategory = category === "all" || blog.category_id === category;
      return matchesSearch && matchesCategory;
    });
  }, [blogs, debouncedSearch, category]);

  return (
    <>
      <SEO title="Blog" description="Travel tips, trek guides, and adventure stories from Dream Go India." />

      <PageHero
        title="Travel Blog"
        subtitle="Guides, packing tips, destination insights, and stories from the trail."
        breadcrumbs={[{ label: "Blog" }]}
      />

      <section className="container mx-auto px-4 py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                variant={category === cat.id ? "default" : "secondary"}
                size="sm"
                onClick={() => setCategory(cat.id)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-gray-500">No articles found.</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((blog, i) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/blog/${blog.slug}`} className="group block overflow-hidden rounded-2xl bg-white premium-shadow transition-all hover:-translate-y-1 hover:premium-shadow-lg">
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={blog.featured_image ?? ""}
                      alt={blog.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6">
                    {blog.is_featured && <Badge className="mb-2">Featured</Badge>}
                    <h3 className="mb-2 text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                      {blog.title}
                    </h3>
                    <p className="mb-4 text-sm text-gray-600 line-clamp-2">{blog.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {blog.published_at
                          ? format(new Date(blog.published_at), "MMM d, yyyy")
                          : "Recently"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {blog.view_count}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
