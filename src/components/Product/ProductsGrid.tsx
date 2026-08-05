import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import ProductCard from "../common/ProductCard";
import ProductSearchBar, { type ProductFilters } from "./ProductSearchBar";
import Pagination from "../common/Pagination";
import { fetchProducts } from "../Product/ProductApi";
import type { Product } from "../../types/ProductTypes";
import "./ProductsGrid.css";

const DEBOUNCE_MS = 300;
const PAGE_SIZE = 9; // 3 columns × 3 rows

export default function ProductsGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [filters, setFilters] = useState<ProductFilters>({
    searchTerm: "",
    category: "All Categories",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced: only updates `filters` state, doesn't fetch directly.
  // The effect below (watching filters + page) does the actual fetch,
  // so page changes (Prev/Next) can skip the debounce entirely and
  // respond instantly.
  const handleFilterChange = (next: ProductFilters) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters(next);
      setPage(1); // A new search/category invalidates whatever page you were on.
    }, DEBOUNCE_MS);
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      const { data, error, totalCount } = await fetchProducts({
        searchTerm: filters.searchTerm,
        category: filters.category,
        page,
        pageSize: PAGE_SIZE,
      });
      if (cancelled) return;

      if (error) {
        setErrorMessage(error);
      } else {
        setErrorMessage("");
        setProducts(data);
        setTotalPages(Math.max(1, Math.ceil(totalCount / PAGE_SIZE)));
      }
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [filters, page]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="products-grid-section">
      <div className="container">
        <div className="products-grid-section__search">
          <ProductSearchBar onFilterChange={handleFilterChange} />
        </div>

        {isLoading && (
          <div className="products-grid-section__state">
            <Loader2 size={20} className="products-grid-section__spin" />
            Loading products...
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="products-grid-section__state products-grid-section__state--error">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && products.length === 0 && (
          <div className="products-grid-section__state">
            No products match your search.
          </div>
        )}

        {!isLoading && products.length > 0 && (
          <div className="products-grid-section__grid">
            {products.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
              />
            ))}
          </div>
        )}

        {!isLoading && products.length > 0 && (
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>

    </div>
  );
}