import { supabase } from "../../lib/supabase";
import { toDisplayProduct, type DbProduct, type Product } from "../../types/ProductTypes";

export interface ProductQueryFilters {
  searchTerm?: string;
  /** "All Categories" (or omitted) means no category filter. */
  category?: string;
  limit?: number;
}

export interface ProductQueryResult {
  data: Product[];
  error: string | null;
}

export async function fetchProducts(
  filters: ProductQueryFilters = {}
): Promise<ProductQueryResult> {
  let query = supabase
    .from("products")
    .select("*")
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
  }

  const { data, error } = await query;

  if (error) {
    return { data: [], error: error.message };
  }

  return {
    data: ((data as DbProduct[]) ?? []).map(toDisplayProduct),
    error: null,
  };
}