// Shape of a row in the `blog_posts` table exactly as Supabase returns it.
export interface DbBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  author: string;
  category: string | null;
  published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

// Shape the UI components actually consume — a guaranteed cover image
// string instead of a nullable one, same pattern as Product.image.
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  category: string | null;
  published: boolean;
  publishedAt: string;
}

const PLACEHOLDER_COVER = "/assets/blog/placeholder.jpg";

export function toDisplayPost(db: DbBlogPost): BlogPost {
  return {
    id: db.id,
    title: db.title,
    slug: db.slug,
    excerpt: db.excerpt,
    content: db.content,
    coverImage: db.cover_image_url ?? PLACEHOLDER_COVER,
    author: db.author,
    category: db.category,
    published: db.published,
    publishedAt: db.published_at,
  };
}

// Simple, predictable slug generation from a title — used by the admin
// form so the admin doesn't have to hand-type a URL-safe slug.
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}