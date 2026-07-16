export interface TravelHighlight {
  id: string;
  title: string;
  cover_image: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface TravelStory {
  id: string;
  highlight_id: string;
  image_url: string;
  caption: string | null;
  display_order: number;
  created_at?: string;
}

/** @deprecated Use TravelStory — kept for admin mock compatibility during migration */
export interface Story {
  id: string;
  image: string;
  caption?: string;
  date?: string;
}

/** @deprecated Use TravelHighlight — kept for admin mock compatibility during migration */
export interface Highlight {
  id: string;
  title: string;
  cover: string;
  stories: Story[];
  sort_order?: number;
  is_visible?: boolean;
}
