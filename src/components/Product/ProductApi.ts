import { supabase } from "../../lib/supabase";
import { toDisplayProduct, type DbProduct, type Product } from "../../types/ProductTypes";

export interface ProductQueryFilters {
  searchTerm?: string;
  /** "All Categories" (or omitted) means no category filter. */
  category?: string;
  /** Used by ProductPreview for a fixed-count "featured" list — bypasses pagination. */
  limit?: number;
  /** 1-indexed page number. Ignored when `limit` is set. */
  page?: number;
  pageSize?: number;
}

export interface ProductQueryResult {
  data: Product[];
  error: string | null;
  totalCount: number;
}

export async function fetchProducts(
  filters: ProductQueryFilters = {}
): Promise<ProductQueryResult> {
  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters.category && filters.category !== "All Categories") {
    query = query.eq("category", filters.category);
  }

  if (filters.searchTerm?.trim()) {
    // Matches against name OR description so a search for "battery"
    // still surfaces a product whose name doesn't literally contain
    // that word but whose description does.
    const term = filters.searchTerm.trim();
    query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  } else if (filters.page && filters.pageSize) {
    // Server-side pagination via range(), not fetch-everything-then-
    // slice — the whole point is to avoid pulling hundreds of rows just
    // to show 9 of them.
    const from = (filters.page - 1) * filters.pageSize;
    const to = from + filters.pageSize - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    return { data: [], error: error.message, totalCount: 0 };
  }

  return {
    data: ((data as DbProduct[]) ?? []).map(toDisplayProduct),
    error: null,
    totalCount: count ?? 0,
  };
}

export async function fetchProductById(
  id: string
): Promise<{ data: Product | null; error: string | null }> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: toDisplayProduct(data as DbProduct), error: null };
}