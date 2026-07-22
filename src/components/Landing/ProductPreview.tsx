import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./ProductPreview.css";

// TEMP: mock data until the admin/products API is wired up.
// Shape mirrors what /api/products?limit=3&sort=recent should return.
type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  inStock: boolean;
  image: string;
};

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Rustic Retreat Cottage",
    description: "An elegant 3-bedroom, 2.5-bathroom",
    price: 500000,
    inStock: true,
    image: "/assets/products/luminous-battery-1.jpg",
  },
  {
    id: "2",
    name: "Rustic Retreat Cottage",
    description: "An elegant 3-bedroom, 2.5-bathroom",
    price: 500000,
    inStock: true,
    image: "/assets/products/luminous-battery-2.jpg",
  },
  {
    id: "3",
    name: "Solar Panel + Inverter",
    description: "An elegant 3-bedroom, 2.5-bathroom",
    price: 500000,
    inStock: true,
    image: "/assets/products/solar-panel-inverter.jpg",
  },
];

function formatPrice(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

function ProductCard({ product, index }: { product: Product; index: number }) {
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
          >
            Purchase
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProductPreview() {
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

        <div className="product-preview__grid">
          {MOCK_PRODUCTS.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}