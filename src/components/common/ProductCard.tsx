import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "../../types/ProductTypes";
import "./ProductCard.css";

function formatPrice(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

interface ProductCardProps {
  product: Product;
  index?: number;
  onPurchase?: (product: Product, qty: number) => void;
}

export default function ProductCard({
  product,
  index = 0,
  onPurchase,
}: ProductCardProps) {
  const [qty, setQty] = useState(0);

  return (
    <motion.div
      className="product-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
    >
      <div className="product-card__image">
        <motion.img
          src={product.image}
          alt={product.name}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="product-card__body">
        <div className="product-card__top">
          <h3 className="product-card__name">{product.name}</h3>
          <span className={`product-card__stock ${product.inStock ? "is-in" : "is-out"}`}>
            {product.inStock ? "In stock" : "Out of stock"}
          </span>
        </div>

        <p className="product-card__desc">{product.description}</p>

        <div className="product-card__stepper">
          <button
            type="button"
            className="product-card__step-btn"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(0, q - 1))}
          >
            <ChevronLeft size={14} />
          </button>
          <span className="product-card__qty">{qty}</span>
          <button
            type="button"
            className="product-card__step-btn"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => q + 1)}
          >
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="product-card__footer">
          <div className="product-card__price">
            <span className="product-card__price-label">Price</span>
            <span className="product-card__price-value">{formatPrice(product.price)}</span>
          </div>

          <motion.button
            type="button"
            className="btn btn-primary product-card__purchase"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={!product.inStock}
            onClick={() => onPurchase?.(product, Math.max(qty, 1))}
          >
            Purchase
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}