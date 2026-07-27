import { useState } from "react";
import type {FormEvent} from "react"
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { Product } from "../../types/ProductTypes";
import "./PurchaseFlow.css";

export interface PurchaseItem {
  product: Product;
  qty: number;
}

interface PurchaseFlowProps {
  item: PurchaseItem;
  onClose: () => void;
}

interface DeliveryDetails {
  fullName: string;
  email: string;
  phone: string;
  deliveryAddress: string;
}

type Step = "details" | "summary" | "success";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

function formatNaira(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

export default function PurchaseFlow({ item, onClose }: PurchaseFlowProps) {
  const [step, setStep] = useState<Step>("details");
  const [details, setDetails] = useState<DeliveryDetails>({
    fullName: "",
    email: "",
    phone: "",
    deliveryAddress: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const total = item.product.price * item.qty;

  const handleDetailsSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStep("summary");
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setErrorMessage("");

    const priceKobo = Math.round(item.product.price * 100);

    const { error } = await supabase.from("orders").insert({
      customer_name: details.fullName,
      customer_email: details.email,
      customer_phone: details.phone,
      delivery_address: details.deliveryAddress,
      items: [
        {
          product_id: item.product.id,
          name: item.product.name,
          price_kobo: priceKobo,
          qty: item.qty,
        },
      ],
      total_kobo: priceKobo * item.qty,
      // Payment integration (Paystack) isn't wired up yet — orders are
      // created as pending, and the admin follows up by phone in the
      // meantime. This is the exact seam where a payment step gets
      // inserted later, between "summary" and "success".
      payment_status: "pending",
      admin_status: "new",
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    setStep("success");
  };

  return (
    <div className="purchase-flow">
      <AnimatePresence mode="wait">
        {step === "details" && (
          <motion.form
            key="details"
            className="purchase-flow__step"
            onSubmit={handleDetailsSubmit}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
          >
            <p className="purchase-flow__item-summary">
              {item.product.name} × {item.qty} —{" "}
              <strong>{formatNaira(total)}</strong>
            </p>

            <div className="purchase-flow__field">
              <label htmlFor="pf-name">Full Name</label>
              <input
                id="pf-name"
                type="text"
                required
                value={details.fullName}
                onChange={(e) =>
                  setDetails((d) => ({ ...d, fullName: e.target.value }))
                }
              />
            </div>

            <div className="purchase-flow__field">
              <label htmlFor="pf-email">Email Address</label>
              <input
                id="pf-email"
                type="email"
                required
                value={details.email}
                onChange={(e) =>
                  setDetails((d) => ({ ...d, email: e.target.value }))
                }
              />
            </div>

            <div className="purchase-flow__field">
              <label htmlFor="pf-phone">Phone Number</label>
              <input
                id="pf-phone"
                type="tel"
                required
                value={details.phone}
                onChange={(e) =>
                  setDetails((d) => ({ ...d, phone: e.target.value }))
                }
              />
            </div>

            <div className="purchase-flow__field">
              <label htmlFor="pf-address">Delivery Address</label>
              <textarea
                id="pf-address"
                rows={3}
                required
                value={details.deliveryAddress}
                onChange={(e) =>
                  setDetails((d) => ({
                    ...d,
                    deliveryAddress: e.target.value,
                  }))
                }
              />
            </div>

            <button type="submit" className="btn btn-primary purchase-flow__submit">
              Continue to Summary
            </button>
          </motion.form>
        )}

        {step === "summary" && (
          <motion.div
            key="summary"
            className="purchase-flow__step"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
          >
            <button
              type="button"
              className="purchase-flow__back"
              onClick={() => setStep("details")}
            >
              <ArrowLeft size={14} /> Back
            </button>

            <div className="purchase-flow__summary-card">
              <div className="purchase-flow__summary-row">
                <span>{item.product.name}</span>
                <span>{formatNaira(item.product.price)} × {item.qty}</span>
              </div>
              <div className="purchase-flow__summary-total">
                <span>Total</span>
                <span>{formatNaira(total)}</span>
              </div>
            </div>

            <div className="purchase-flow__summary-card">
              <h4>Delivery to</h4>
              <p>{details.fullName}</p>
              <p>{details.deliveryAddress}</p>
              <p>
                {details.phone} · {details.email}
              </p>
            </div>

            {errorMessage && (
              <p className="purchase-flow__error">{errorMessage}</p>
            )}

            <button
              type="button"
              className="btn btn-primary purchase-flow__submit"
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="purchase-flow__spin" />
                  Placing Order...
                </>
              ) : (
                "Place Order"
              )}
            </button>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            key="success"
            className="purchase-flow__step purchase-flow__success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
          >
            <CheckCircle2 size={40} className="purchase-flow__success-icon" />
            <h3>Order Received</h3>
            <p>
              Thanks, {details.fullName.split(" ")[0]}. We've received your
              order for {item.product.name}. Our team will call you at{" "}
              {details.phone} shortly to confirm delivery.
            </p>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}