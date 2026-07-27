import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import ProductCard from "../common/ProductCard";
import { fetchProducts } from "../Product/ProductApi";
import { usePurchaseModal } from "../Product/UsePurchaseModal";
import type { Product } from "../../types/ProductTypes";
import "./ProductPreview.css";

export default function ProductPreview() {
  const { openPurchase, purchaseModal } = usePurchaseModal();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      const { data, error } = await fetchProducts({ limit: 3 });
      if (cancelled) return;

      if (error) {
        setErrorMessage(error);
      } else {
        setProducts(data);
      }
      setIsLoading(false);
    })();

    // Avoids setting state on an unmounted component if the user
    // navigates away before the fetch resolves.
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="product-preview">
      <div className="container">
        <div className="product-preview__header">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="product-preview__title">Featured Products</h2>
            <p className="product-preview__subtitle">
              Explore some of our most popular solar products and energy solutions.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link to="/products" className="product-preview__view-all">
              View All Products
            </Link>
          </motion.div>
        </div>

        {isLoading && (
          <div className="product-preview__state">
            <Loader2 size={20} className="product-preview__spin" />
            Loading products...
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="product-preview__state product-preview__state--error">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && products.length === 0 && (
          <div className="product-preview__state">
            No products added yet.
          </div>
        )}

        {!isLoading && products.length > 0 && (
          <div className="product-preview__grid">
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
    </section>
  );
}