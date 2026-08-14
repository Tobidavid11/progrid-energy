import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { fetchProductById } from "../Product/ProductApi";
import { useCart } from "../Cart/CartContext";
import { getEffectiveUnitPrice, type Product } from "../../types/ProductTypes";
import "./ProductDetail.css";
import Navbar from "../common/NavBar";

function formatNaira(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      const { data, error } = await fetchProductById(id);
      if (cancelled) return;

      if (error) {
        setErrorMessage(error);
      } else {
        setProduct(data);
        setActiveImage(0);
      }
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isLoading) {
    return <div className="product-detail__state">Loading product...</div>;
  }

  if (errorMessage || !product) {
    return (
      <>
      <Navbar/>
      <div className="product-detail__state product-detail__state--error">
        {errorMessage || "Product not found."}
        <Link to="/products" className="product-detail__back-link">
          <ChevronLeft size={14} /> Back to Products
        </Link>
      </div>
      </>
    );
  }

  const images = product.images.length > 0 ? product.images : [product.image];
  const specEntries = product.specifications
    ? Object.entries(product.specifications)
    : [];
  const unitPrice = getEffectiveUnitPrice(product, qty);
  const isBulkPrice = unitPrice < product.price;

  return (
    <>
    <Navbar/>
    <div className="product-detail">
      <div className="container">
        <Link to="/products" className="product-detail__back-link">
          <ChevronLeft size={14} /> Back to Products
        </Link>

        <motion.div
          className="product-detail__layout"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="product-detail__gallery">
            <div className="product-detail__main-image">
              <img src={images[activeImage]} alt={product.name} />
            </div>

            {images.length > 1 && (
              <div className="product-detail__thumbs">
                {images.map((img, i) => (
                  <button
                    key={img + i}
                    type="button"
                    className={`product-detail__thumb ${i === activeImage ? "is-active" : ""}`}
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-detail__info">
            <span className="product-detail__category">{product.category}</span>
            <h1 className="product-detail__name">{product.name}</h1>

            <span
              className={`product-detail__stock ${product.inStock ? "is-in" : "is-out"}`}
            >
              {product.inStock ? "In stock" : "Out of stock"}
            </span>

            <p className="product-detail__desc">{product.description}</p>

            <div className="product-detail__price">
              {isBulkPrice && (
                <span className="product-detail__price-original">
                  {formatNaira(product.price)}
                </span>
              )}
              {formatNaira(unitPrice)}
              {qty > 1 && <span className="product-detail__price-unit"> each</span>}
            </div>

            <div className="product-detail__buy-row">
              <div className="product-detail__stepper">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  <ChevronLeft size={14} />
                </button>
                <span>{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              <button
                type="button"
                className={`btn btn-primary product-detail__purchase ${justAdded ? "is-added" : ""}`}
                disabled={!product.inStock}
                onClick={() => {
                  addItem(product, qty);
                  setJustAdded(true);
                  setTimeout(() => setJustAdded(false), 1400);
                }}
              >
                {justAdded ? (
                  <>
                    <Check size={16} /> Added to Cart
                  </>
                ) : (
                  "Add to Cart"
                )}
              </button>
            </div>

            {product.bulkPricing.length > 0 && (
              <div className="product-detail__section">
                <h3>Bulk Pricing</h3>
                <table className="product-detail__spec-table">
                  <tbody>
                    <tr>
                      <td>1 – {product.bulkPricing[0].minQty - 1}</td>
                      <td>{formatNaira(product.price)} each</td>
                    </tr>
                    {product.bulkPricing.map((tier, i) => {
                      const next = product.bulkPricing[i + 1];
                      return (
                        <tr key={tier.minQty}>
                          <td>
                            {tier.minQty}
                            {next ? ` – ${next.minQty - 1}` : "+"}
                          </td>
                          <td>{formatNaira(tier.unitPrice)} each</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {product.longDescription && (
              <div className="product-detail__section">
                <h3>Description</h3>
                <p>{product.longDescription}</p>
              </div>
            )}

            {specEntries.length > 0 && (
              <div className="product-detail__section">
                <h3>Specifications</h3>
                <table className="product-detail__spec-table">
                  <tbody>
                    {specEntries.map(([key, value]) => (
                      <tr key={key}>
                        <td>{key}</td>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
}