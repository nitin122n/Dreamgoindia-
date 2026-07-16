import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { useBlogs } from "@/hooks/useCMS";

export function BlogSection() {
  const { data: blogs = [] } = useBlogs(true);

  return (
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 lg:text-3xl">Travel Stories</h2>
          <Link to="/blog" className="text-sm font-semibold text-primary hover:underline">View all</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <Link key={blog.id} to={`/blog/${blog.slug}`} className="group overflow-hidden rounded-2xl bg-white premium-shadow">
              <div className="aspect-video overflow-hidden">
                <img
                  src={blog.featured_image || ""}
                  alt={blog.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3.5 w-3.5" />
                  {blog.published_at && format(new Date(blog.published_at), "MMM dd, yyyy")}
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                  {blog.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">{blog.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
