export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image: string | null;
  is_published: boolean;
  created_at: string;
}