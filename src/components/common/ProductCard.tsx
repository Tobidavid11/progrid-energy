import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { getEffectiveUnitPrice, getNextBulkTier, type Product } from "../../types/ProductTypes";
import { useCart } from "../Cart/CartContext";
import "./ProductCard.css";

function formatPrice(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const effectiveQty = Math.max(qty, 1);
  const unitPrice = getEffectiveUnitPrice(product, effectiveQty);
  const isBulkPrice = unitPrice < product.price;
  const nextTier = getNextBulkTier(product, effectiveQty);

  const handleAddToCart = () => {
    addItem(product, effectiveQty);
    setJustAdded(true);
    setQty(0);
    setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <motion.div
      className="product-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
    >
      <Link to={`/products/${product.id}`} className="product-card__image">
        <motion.img
          src={product.image}
          alt={product.name}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </Link>

      <div className="product-card__body">
        <div className="product-card__top">
          <Link to={`/products/${product.id}`} className="product-card__name-link">
            <h3 className="product-card__name">{product.name}</h3>
          </Link>
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
            <span className="product-card__price-value">
              {isBulkPrice && (
                <span className="product-card__price-original">
                  {formatPrice(product.price)}
                </span>
              )}
              {formatPrice(unitPrice)}
              {qty > 1 && <span className="product-card__price-unit"> each</span>}
            </span>
            {nextTier && (
              <span className="product-card__bulk-hint">
                Buy {nextTier.minQty}+ for {formatPrice(nextTier.unitPrice)} each
              </span>
            )}
          </div>

          <motion.button
            type="button"
            className={`btn btn-primary product-card__purchase ${justAdded ? "is-added" : ""}`}
            whileHover={!justAdded ? { scale: 1.03 } : undefined}
            whileTap={!justAdded ? { scale: 0.97 } : undefined}
            disabled={!product.inStock}
            onClick={handleAddToCart}
          >
            {justAdded ? (
              <>
                <Check size={15} /> Added
              </>
            ) : (
              "Add to Cart"
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}