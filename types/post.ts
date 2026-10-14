export type PostType = 'article' | 'vlog';

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  type: PostType;
  date: string;
  readOrWatchTime: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  thumbnail: string;
  // Vlog specific
  videoUrl?: string; // YouTube embed or direct URL
  // Article specific
  content?: string;
  tags: string[];
}
