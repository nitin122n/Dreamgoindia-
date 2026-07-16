/**
 * Real posts from https://www.instagram.com/dreamgoindia/
 * Cover images are stored locally in /public/instagram (Instagram blocks hotlinking).
 */
export type InstagramPost = {
  id: string;
  permalink: string;
  subtitle: string;
  caption: string;
  image: string;
};

export const INSTAGRAM_USERNAME = "dreamgoindia";

export const INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: "DaCUvPXD4zB",
    permalink: "https://www.instagram.com/p/DaCUvPXD4zB/",
    subtitle: "Hampta Pass · Balu Ka Ghera",
    caption: "Hampta Pass has a beautiful surprise before the pass",
    image: "/instagram/DaCUvPXD4zB.jpg",
  },
  {
    id: "DX008xAjzdt",
    permalink: "https://www.instagram.com/p/DX008xAjzdt/",
    subtitle: "Hampta Pass Trek",
    caption: "Where green valleys meet snow deserts",
    image: "/instagram/DX008xAjzdt.jpg",
  },
  {
    id: "DTKCNYqjzqs",
    permalink: "https://www.instagram.com/p/DTKCNYqjzqs/",
    subtitle: "Kedarkantha · Winter trek",
    caption: "Standing above the clouds at Kedarkantha",
    image: "/instagram/DTKCNYqjzqs.jpg",
  },
];
