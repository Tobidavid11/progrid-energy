import { useEffect, useState, useCallback, useMemo } from "react";
import { Search, Pencil, Trash2, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { DbProduct } from "../../types/ProductTypes";
import Pagination from "../common/Pagination";
import "./AdminProductList.css";

interface AdminProductListProps {
  onEdit?: (product: DbProduct) => void;
  /** Bump this to force a refetch after a product is added elsewhere (e.g. the form). */
  refreshKey?: number;
}

interface CategoryCount {
  category: string;
  count: number;
}

const PAGE_SIZE = 10;

function formatNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

export default function AdminProductList({
  onEdit,
  refreshKey = 0,
}: AdminProductListProps) {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const totalProductCount = useMemo(
    () => categoryCounts.reduce((sum, c) => sum + c.count, 0),
    [categoryCounts]
  );

  const fetchCategoryCounts = useCallback(async () => {
    setIsCategoriesLoading(true);

    const { data, error } = await supabase.from("products").select("category");

    if (!error && data) {
      const counts = new Map<string, number>();
      for (const row of data as { category: string }[]) {
        if (!row.category) continue;
        counts.set(row.category, (counts.get(row.category) ?? 0) + 1);
      }
      const sorted = Array.from(counts.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);
      setCategoryCounts(sorted);
    }
    setIsCategoriesLoading(false);
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (searchTerm.trim()) {
      query = query.ilike("name", `%${searchTerm.trim()}%`);
    }

    if (selectedCategory) {
      query = query.eq("category", selectedCategory);
    }

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      setErrorMessage(error.message);
    } else {
      setProducts((data as DbProduct[]) ?? []);
      setTotalPages(Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)));
    }
    setIsLoading(false);
  }, [searchTerm, page, selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, refreshKey]);

  useEffect(() => {
    fetchCategoryCounts();
  }, [fetchCategoryCounts, refreshKey]);

  // A new search or category filter invalidates whatever page you were on.
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategory]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory((prev) => (prev === category ? null : category));
  };

  const toggleStock = async (product: DbProduct) => {
    setPendingId(product.id);
    const { error } = await supabase
      .from("products")
      .update({ in_stock: !product.in_stock })
      .eq("id", product.id);

    if (!error) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, in_stock: !p.in_stock } : p
        )
      );
    }
    setPendingId(null);
  };

  const handleDelete = async (product: DbProduct) => {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This can't be undone.`
    );
    if (!confirmed) return;

    setPendingId(product.id);
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (!error) {
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      fetchProducts(); // re-check pagination bounds now that a row is gone
      fetchCategoryCounts(); // counts have shifted too
    }
    setPendingId(null);
  };

  return (
    <div className="admin-product-list">
      {!isCategoriesLoading && categoryCounts.length > 0 && (
        <div className="admin-product-list__categories">
          <button
            type="button"
            className={`admin-product-list__category-card ${
              selectedCategory === null ? "is-active" : ""
            }`}
            onClick={() => setSelectedCategory(null)}
          >
            <span className="admin-product-list__category-name">All</span>
            <span className="admin-product-list__category-count">
              {totalProductCount}
            </span>
          </button>

          {categoryCounts.map(({ category, count }) => (
            <button
              key={category}
              type="button"
              className={`admin-product-list__category-card ${
                selectedCategory === category ? "is-active" : ""
              }`}
              onClick={() => handleCategoryClick(category)}
            >
              <span className="admin-product-list__category-name">
                {category}
              </span>
              <span className="admin-product-list__category-count">
                {count}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="admin-product-list__search">
        <Search size={16} strokeWidth={2} />
        <input
          type="text"
          placeholder="Search products by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading && (
        <div className="admin-product-list__state">
          <Loader2 size={18} className="admin-product-list__spin" />
          Loading products...
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="admin-product-list__state admin-product-list__state--error">
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && products.length === 0 && (
        <div className="admin-product-list__state">
          No products found.
        </div>
      )}

      {!isLoading && products.length > 0 && (
        <>
          <table className="admin-product-list__table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="admin-product-list__product">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} />
                      ) : (
                        <div className="admin-product-list__thumb-placeholder" />
                      )}
                      <span>{product.name}</span>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>{formatNaira(product.price_kobo)}</td>
                  <td>
                    <button
                      type="button"
                      className={`admin-product-list__stock-toggle ${
                        product.in_stock ? "is-in" : "is-out"
                      }`}
                      onClick={() => toggleStock(product)}
                      disabled={pendingId === product.id}
                    >
                      {product.in_stock ? "In stock" : "Out of stock"}
                    </button>
                  </td>
                  <td>
                    <div className="admin-product-list__actions">
                      <button
                        type="button"
                        aria-label={`Edit ${product.name}`}
                        onClick={() => onEdit?.(product)}
                        disabled={pendingId === product.id}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${product.name}`}
                        className="admin-product-list__delete"
                        onClick={() => handleDelete(product)}
                        disabled={pendingId === product.id}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}