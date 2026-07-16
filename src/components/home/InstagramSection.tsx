import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useSettings } from "@/contexts/SettingsContext";
import {
  INSTAGRAM_POSTS,
  INSTAGRAM_USERNAME,
  type InstagramPost,
} from "@/data/instagram-posts";

function InstagramPostCard({
  post,
  profileUrl,
  username,
}: {
  post: InstagramPost;
  profileUrl: string;
  username: string;
}) {
  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm">
      <div className="flex h-[60px] shrink-0 items-center gap-3 border-b border-primary/10 px-3">
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-w-0 flex-1 items-center gap-2.5"
        >
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary p-[2px]">
            <span className="flex h-full w-full items-center justify-center rounded-full bg-white text-[10px] font-bold text-primary">
              DG
            </span>
          </span>
          <span className="min-w-0 text-left">
            <span className="block truncate text-sm font-semibold text-gray-900">
              {username}
            </span>
            <span className="block truncate text-xs text-gray-500">{post.subtitle}</span>
          </span>
        </a>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-dark"
        >
          View profile
        </a>
      </div>

      <a
        href={post.permalink}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block aspect-square w-full shrink-0 overflow-hidden bg-gray-100"
        aria-label={`Open Instagram post: ${post.caption}`}
      >
        <img
          src={post.image}
          alt={post.caption}
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-4 pb-4 pt-16">
          <p className="line-clamp-2 text-sm font-bold uppercase leading-snug tracking-wide text-white drop-shadow">
            {post.caption}
          </p>
        </div>
        <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-primary opacity-0 shadow transition group-hover:opacity-100">
          <ExternalLink className="h-3.5 w-3.5" />
        </span>
      </a>
    </article>
  );
}

export function InstagramSection() {
  const { settings } = useSettings();
  const profileUrl =
    settings.social_links?.instagram || `https://instagram.com/${INSTAGRAM_USERNAME}`;
  const username =
    profileUrl.replace(/\/$/, "").split("/").pop()?.replace("@", "") || INSTAGRAM_USERNAME;

  return (
    <section className="relative overflow-hidden bg-white py-14 lg:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(229,57,53,0.06),_transparent_55%)]"
      />
      <div className="container relative z-[1] mx-auto px-4 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-3 text-center text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl"
        >
          Instagram images
        </motion.h2>
        <div className="mx-auto mb-10 h-1 w-12 rounded-full bg-primary" />
        <div className="grid items-stretch gap-5 md:grid-cols-3">
          {INSTAGRAM_POSTS.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="h-full min-w-0"
            >
              <InstagramPostCard
                post={post}
                profileUrl={profileUrl}
                username={username}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
