import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { Clock, Eye, ArrowLeft, MessageCircle, Send } from "lucide-react";
import { SEO } from "@/components/common/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlog } from "@/hooks/useCMS";
import toast from "react-hot-toast";

const MOCK_COMMENTS = [
  { id: "1", name: "Amit Kumar", date: "2026-06-15", content: "Great guide! Very helpful for planning my Har Ki Dun trek." },
  { id: "2", name: "Sneha Reddy", date: "2026-06-10", content: "Loved the packing tips section. Saved me a lot of hassle." },
];

const DEFAULT_CONTENT = `
<p>Planning a Himalayan trek requires careful preparation. From fitness training to gear selection, every detail matters when you're heading into the mountains.</p>
<p>In this comprehensive guide, we cover everything you need to know — best seasons, difficulty levels, what to pack, and insider tips from our experienced trek leaders who have guided hundreds of adventurers through these trails.</p>
<p>Whether you're a first-time trekker or a seasoned explorer, this guide will help you make the most of your journey.</p>
`;

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: blog, isLoading } = useBlog(slug ?? "");
  const [comment, setComment] = useState({ name: "", email: "", message: "" });

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Comment submitted for review!");
    setComment({ name: "", email: "", message: "" });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <Skeleton className="mb-8 h-80 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Article not found</h1>
        <Link to="/blog" className="mt-4 inline-block text-primary hover:underline">
          Back to blog
        </Link>
      </div>
    );
  }

  const content = blog.content ?? DEFAULT_CONTENT;

  return (
    <>
      <SEO
        title={blog.title}
        description={blog.excerpt ?? undefined}
        image={blog.featured_image ?? undefined}
        type="article"
      />

      <article className="container mx-auto max-w-3xl px-4 py-10">
        <Link
          to="/blog"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        <img
          src={blog.featured_image ?? ""}
          alt={blog.title}
          className="mb-8 aspect-[16/9] w-full rounded-2xl object-cover premium-shadow"
        />

        <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">{blog.title}</h1>

        <div className="mb-8 flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {blog.published_at
              ? format(new Date(blog.published_at), "MMMM d, yyyy")
              : "Recently"}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {blog.view_count} views
          </span>
        </div>

        <div
          className="prose prose-gray max-w-none leading-relaxed text-gray-600"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {blog.tags?.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {blog.tags.map((tag: string) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Comments */}
        <section className="mt-12 border-t border-gray-100 pt-12">
          <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
            <MessageCircle className="h-6 w-6 text-primary" />
            Comments ({MOCK_COMMENTS.length})
          </h2>

          <div className="mb-8 space-y-6">
            {MOCK_COMMENTS.map((c) => (
              <div key={c.id} className="rounded-xl bg-gray-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold text-gray-900">{c.name}</span>
                  <span className="text-xs text-gray-400">{c.date}</span>
                </div>
                <p className="text-sm text-gray-600">{c.content}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleComment} className="space-y-4 rounded-2xl bg-white p-6 premium-shadow">
            <h3 className="font-bold text-gray-900">Leave a Comment</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  required
                  value={comment.name}
                  onChange={(e) => setComment({ ...comment, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={comment.email}
                  onChange={(e) => setComment({ ...comment, email: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                required
                rows={4}
                value={comment.message}
                onChange={(e) => setComment({ ...comment, message: e.target.value })}
              />
            </div>
            <Button type="submit">
              <Send className="h-4 w-4" />
              Post Comment
            </Button>
          </form>
        </section>
      </article>
    </>
  );
}
