import { supabase } from "../../lib/supabase";
import { toDisplayPost, type BlogPost, type DbBlogPost } from "../../types/blogTypes";

export interface BlogQueryFilters {
  page?: number;
  pageSize?: number;
}

export interface BlogQueryResult {
  data: BlogPost[];
  error: string | null;
  totalCount: number;
}

export async function fetchBlogPosts(
  filters: BlogQueryFilters = {}
): Promise<BlogQueryResult> {
  let query = supabase
    .from("blog_posts")
    .select("*", { count: "exact" })
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (filters.page && filters.pageSize) {
    const from = (filters.page - 1) * filters.pageSize;
    const to = from + filters.pageSize - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    return { data: [], error: error.message, totalCount: 0 };
  }

  return {
    data: ((data as DbBlogPost[]) ?? []).map(toDisplayPost),
    error: null,
    totalCount: count ?? 0,
  };
}

export async function fetchBlogPostBySlug(
  slug: string
): Promise<{ data: BlogPost | null; error: string | null }> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: toDisplayPost(data as DbBlogPost), error: null };
}