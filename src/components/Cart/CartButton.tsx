import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./CartContext";
import CartDrawer from "./CartDrawer";
import Modal from "../common/Modal";
import CheckoutFlow from "./CheckoutFlow";
import "./CartButton.css";

export default function CartButton() {
  const { itemCount } = useCart();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="cart-button"
        onClick={() => setIsDrawerOpen(true)}
        aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
      >
        <ShoppingCart size={20} strokeWidth={2} />
        {itemCount > 0 && <span className="cart-button__badge">{itemCount}</span>}
      </button>

      <CartDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onCheckout={() => {
          setIsDrawerOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <Modal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title="Checkout"
      >
        <CheckoutFlow onClose={() => setIsCheckoutOpen(false)} />
      </Modal>
    </>
  );
}