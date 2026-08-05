import { AnimatePresence, motion } from "framer-motion";
import { X, Trash2, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { useCart } from "./CartContext";
import { getEffectiveUnitPrice } from "../../types/ProductTypes";
import "./CartDrawer.css";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

function formatNaira(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

export default function CartDrawer({
  isOpen,
  onClose,
  onCheckout,
}: CartDrawerProps) {
  const { items, removeItem, updateQty, subtotal } = useCart();

  return (
    <AnimatePresence >
      {isOpen && (
        <>
          <motion.div
            className="cart-drawer__backdrop background_check"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.div
            className="cart-drawer"
            role="dialog"
            aria-label="Shopping cart"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
          >
            <div className="cart-drawer__header">
              <h2>Your Cart</h2>
              <button
                type="button"
                className="cart-drawer__close"
                onClick={onClose}
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="cart-drawer__empty">
                <ShoppingBag size={32} strokeWidth={1.5} />
                <p>Your cart is empty.</p>
              </div>
            ) : (
              <>
                <div className="cart-drawer__items">
                  {items.map((item) => {
                    const unitPrice = getEffectiveUnitPrice(
                      item.product,
                      item.qty
                    );
                    return (
                      <div className="cart-drawer__item" key={item.product.id}>
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="cart-drawer__item-image"
                        />
                        <div className="cart-drawer__item-info">
                          <span className="cart-drawer__item-name">
                            {item.product.name}
                          </span>
                          <span className="cart-drawer__item-price">
                            {formatNaira(unitPrice)} each
                          </span>

                          <div className="cart-drawer__item-controls">
                            <div className="cart-drawer__stepper">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQty(item.product.id, item.qty - 1)
                                }
                                disabled={item.qty <= 1}
                                aria-label="Decrease quantity"
                              >
                                <ChevronLeft size={13} />
                              </button>
                              <span>{item.qty}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQty(item.product.id, item.qty + 1)
                                }
                                aria-label="Increase quantity"
                              >
                                <ChevronRight size={13} />
                              </button>
                            </div>

                            <button
                              type="button"
                              className="cart-drawer__remove"
                              onClick={() => removeItem(item.product.id)}
                              aria-label={`Remove ${item.product.name}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="cart-drawer__footer">
                  <div className="cart-drawer__subtotal">
                    <span>Subtotal</span>
                    <span>{formatNaira(subtotal)}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary cart-drawer__checkout"
                    onClick={onCheckout}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}