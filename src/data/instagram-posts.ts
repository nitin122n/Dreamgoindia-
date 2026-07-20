import type { InstagramPost } from "@/types";

/**
 * Fallback posts from https://www.instagram.com/dreamgoindia/ — used when the
 * `instagram_posts` table is empty or unavailable. Cover images are stored
 * locally in /public/instagram (Instagram blocks hotlinking).
 * Live posts are managed in Admin → Instagram.
 */
export const INSTAGRAM_USERNAME = "dreamgoindia";

export const INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: "DaCUvPXD4zB",
    permalink: "https://www.instagram.com/p/DaCUvPXD4zB/",
    subtitle: "Hampta Pass · Balu Ka Ghera",
    caption: "Hampta Pass has a beautiful surprise before the pass",
    image_url: "/instagram/DaCUvPXD4zB.jpg",
    sort_order: 0,
    is_visible: true,
  },
  {
    id: "DX008xAjzdt",
    permalink: "https://www.instagram.com/p/DX008xAjzdt/",
    subtitle: "Hampta Pass Trek",
    caption: "Where green valleys meet snow deserts",
    image_url: "/instagram/DX008xAjzdt.jpg",
    sort_order: 1,
    is_visible: true,
  },
  {
    id: "DTKCNYqjzqs",
    permalink: "https://www.instagram.com/p/DTKCNYqjzqs/",
    subtitle: "Kedarkantha · Winter trek",
    caption: "Standing above the clouds at Kedarkantha",
    image_url: "/instagram/DTKCNYqjzqs.jpg",
    sort_order: 2,
    is_visible: true,
  },
];
