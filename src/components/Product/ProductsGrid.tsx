import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import ProductCard from "../common/ProductCard";
import ProductSearchBar, { type ProductFilters } from "./ProductSearchBar";
import { fetchProducts } from "../Product/ProductApi";
import { usePurchaseModal } from "../Product/UsePurchaseModal";
import type { Product } from "../../types/ProductTypes";
import "./ProductsGrid.css";

const DEBOUNCE_MS = 300;

export default function ProductsGrid() {
  const { openPurchase, purchaseModal } = usePurchaseModal();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFilterChange = (filters: ProductFilters) => {
    // Debounced rather than firing a query on every keystroke — without
    // this, typing "solar panel" fires 11 separate database queries
    // instead of one, once typing pauses.
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      const { data, error } = await fetchProducts({
        searchTerm: filters.searchTerm,
        category: filters.category,
      });

      if (error) {
        setErrorMessage(error);
      } else {
        setErrorMessage("");
        setProducts(data);
      }
      setIsLoading(false);
    }, DEBOUNCE_MS);
  };

  // Initial load, before the user has touched the search bar.
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const { data, error } = await fetchProducts({});
      if (error) {
        setErrorMessage(error);
      } else {
        setProducts(data);
      }
      setIsLoading(false);
    })();

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
                onPurchase={openPurchase}
              />
            ))}
          </div>
        )}
      </div>

      {purchaseModal}
    </div>
  );
}