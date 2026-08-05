import { useState } from "react";
import type {FormEvent} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { validateCoupon } from "../../types/CouponApi";
import { loadPaystackScript, type PaystackTransaction } from "../Product/Paystack";
import { getEffectiveUnitPrice } from "../../types/ProductTypes";
import { useCart, type CartItem } from "./CartContext";
import "./CheckoutFlow.css";

interface CheckoutFlowProps {
  onClose: () => void;
}

interface DeliveryDetails {
  fullName: string;
  email: string;
  phone: string;
  deliveryAddress: string;
}

type Step = "details" | "summary" | "payment" | "success";
type CouponStatus = "idle" | "checking" | "valid" | "invalid";
type PaymentState = "launching" | "cancelled" | "verifying" | "failed" | null;

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as
  | string
  | undefined;

function formatNaira(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

function lineTotal(item: CartItem): number {
  return getEffectiveUnitPrice(item.product, item.qty) * item.qty;
}

// A coupon's scope (all / one category / one product) means it may only
// apply to some lines in a multi-item cart, not all of them — so it has
// to be checked against every line individually, not just once.
async function checkCouponAgainstCart(
  code: string,
  items: CartItem[]
): Promise<{ percentOff: number; applicableIds: Set<string> } | null> {
  let percentOff: number | null = null;
  const applicableIds = new Set<string>();

  for (const item of items) {
    const result = await validateCoupon(
      code,
      item.product.id,
      item.product.category
    );
    if (result.percentOff !== null) {
      percentOff = result.percentOff;
      applicableIds.add(item.product.id);
    }
  }

  if (percentOff === null || applicableIds.size === 0) return null;
  return { percentOff, applicableIds };
}

export default function CheckoutFlow({ onClose }: CheckoutFlowProps) {
  const { items, subtotal, clearCart } = useCart();

  const [step, setStep] = useState<Step>("details");
  const [details, setDetails] = useState<DeliveryDetails>({
    fullName: "",
    email: "",
    phone: "",
    deliveryAddress: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState<CouponStatus>("idle");
  const [couponResult, setCouponResult] = useState<{
    percentOff: number;
    applicableIds: Set<string>;
  } | null>(null);

  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderTotalKobo, setOrderTotalKobo] = useState<number>(0);
  const [paymentState, setPaymentState] = useState<PaymentState>(null);
  const [paymentError, setPaymentError] = useState("");

  const discountAmount = couponResult
    ? Math.round(
        items
          .filter((i) => couponResult.applicableIds.has(i.product.id))
          .reduce((sum, i) => sum + lineTotal(i), 0) *
          (couponResult.percentOff / 100)
      )
    : 0;
  const total = subtotal - discountAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponStatus("checking");

    const result = await checkCouponAgainstCart(couponCode, items);

    if (!result) {
      setCouponStatus("invalid");
      setCouponResult(null);
    } else {
      setCouponStatus("valid");
      setCouponResult(result);
    }
  };

  const handleDetailsSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStep("summary");
  };

  const verifyAndFinish = async (reference: string) => {
    setPaymentState("verifying");

    const { data, error } = await supabase.functions.invoke("verify-payment", {
      body: { reference },
    });

    if (error || !data?.verified) {
      setPaymentState("failed");
      setPaymentError(
        data?.reason ?? error?.message ?? "Payment could not be verified."
      );
      return;
    }

    clearCart();
    setStep("success");
  };

  const launchPaystack = async (reference: string, amountKobo: number) => {
    if (!PAYSTACK_PUBLIC_KEY) {
      setPaymentState("failed");
      setPaymentError("Payment is temporarily unavailable. Please try again shortly.");
      return;
    }

    setPaymentState("launching");

    try {
      await loadPaystackScript();
    } catch {
      setPaymentState("failed");
      setPaymentError("Could not load the payment provider. Check your connection and retry.");
      return;
    }

    if (!window.PaystackPop) {
      setPaymentState("failed");
      setPaymentError("Payment provider failed to initialize.");
      return;
    }

    window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: details.email,
      amount: amountKobo,
      currency: "NGN",
      ref: reference,
      onClose: () => setPaymentState("cancelled"),
      callback: (response: PaystackTransaction) => {
        verifyAndFinish(response.reference);
      },
    }).openIframe();
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setErrorMessage("");

    const orderItems = items.map((item) => {
      const unitPrice = getEffectiveUnitPrice(item.product, item.qty);
      return {
        product_id: item.product.id,
        name: item.product.name,
        price_kobo: Math.round(unitPrice * 100),
        qty: item.qty,
      };
    });

    const subtotalKobo = orderItems.reduce(
      (sum, i) => sum + i.price_kobo * i.qty,
      0
    );
    const discountKobo = Math.round(discountAmount * 100);
    const finalTotalKobo = subtotalKobo - discountKobo;

    const { data, error } = await supabase
      .from("orders")
      .insert({
        customer_name: details.fullName,
        customer_email: details.email,
        customer_phone: details.phone,
        delivery_address: details.deliveryAddress,
        items: orderItems,
        total_kobo: finalTotalKobo,
        coupon_code: couponStatus === "valid" ? couponCode.trim().toUpperCase() : null,
        discount_kobo: discountKobo,
        payment_status: "pending",
        admin_status: "new",
      })
      .select("id, total_kobo")
      .single();

    if (error || !data) {
      setErrorMessage(error?.message ?? "Could not create the order.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    setOrderId(data.id);
    setOrderTotalKobo(data.total_kobo);
    setStep("payment");
    launchPaystack(data.id, data.total_kobo);
  };

  const handleRetryPayment = () => {
    if (!orderId) return;
    launchPaystack(orderId, orderTotalKobo);
  };

  if (items.length === 0 && step !== "success") {
    return (
      <div className="checkout-flow__empty">
        <p>Your cart is empty.</p>
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-flow">
      <AnimatePresence mode="wait">
        {step === "details" && (
          <motion.form
            key="details"
            className="checkout-flow__step"
            onSubmit={handleDetailsSubmit}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
          >
            <div className="checkout-flow__cart-summary">
              {items.map((item) => (
                <div className="checkout-flow__cart-line" key={item.product.id}>
                  <span>{item.product.name} × {item.qty}</span>
                  <span>{formatNaira(lineTotal(item))}</span>
                </div>
              ))}
              <div className="checkout-flow__cart-line checkout-flow__cart-line--total">
                <span>Subtotal</span>
                <span>{formatNaira(subtotal)}</span>
              </div>
            </div>

            <div className="checkout-flow__field">
              <label htmlFor="cf-name">Full Name</label>
              <input
                id="cf-name"
                type="text"
                required
                value={details.fullName}
                onChange={(e) =>
                  setDetails((d) => ({ ...d, fullName: e.target.value }))
                }
              />
            </div>

            <div className="checkout-flow__field">
              <label htmlFor="cf-email">Email Address</label>
              <input
                id="cf-email"
                type="email"
                required
                value={details.email}
                onChange={(e) =>
                  setDetails((d) => ({ ...d, email: e.target.value }))
                }
              />
            </div>

            <div className="checkout-flow__field">
              <label htmlFor="cf-phone">Phone Number</label>
              <input
                id="cf-phone"
                type="tel"
                required
                value={details.phone}
                onChange={(e) =>
                  setDetails((d) => ({ ...d, phone: e.target.value }))
                }
              />
            </div>

            <div className="checkout-flow__field">
              <label htmlFor="cf-address">Delivery Address</label>
              <textarea
                id="cf-address"
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

            <div className="checkout-flow__field">
              <label htmlFor="cf-coupon">Coupon Code (optional)</label>
              <div className="checkout-flow__coupon-row">
                <input
                  id="cf-coupon"
                  type="text"
                  placeholder="e.g. PROGRID2444"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponStatus("idle");
                    setCouponResult(null);
                  }}
                />
                <button
                  type="button"
                  className="checkout-flow__coupon-apply"
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim() || couponStatus === "checking"}
                >
                  {couponStatus === "checking" ? (
                    <Loader2 size={14} className="checkout-flow__spin" />
                  ) : (
                    "Apply"
                  )}
                </button>
              </div>
              {couponStatus === "valid" && couponResult && (
                <span className="checkout-flow__coupon-feedback checkout-flow__coupon-feedback--valid">
                  <CheckCircle2 size={13} /> {couponResult.percentOff}% off
                  applied to {couponResult.applicableIds.size} of {items.length}{" "}
                  item{items.length > 1 ? "s" : ""}
                </span>
              )}
              {couponStatus === "invalid" && (
                <span className="checkout-flow__coupon-feedback checkout-flow__coupon-feedback--invalid">
                  <XCircle size={13} /> Code doesn't apply to anything in your cart
                </span>
              )}
            </div>

            <button type="submit" className="btn btn-primary checkout-flow__submit">
              Continue to Summary
            </button>
          </motion.form>
        )}

        {step === "summary" && (
          <motion.div
            key="summary"
            className="checkout-flow__step"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
          >
            <button
              type="button"
              className="checkout-flow__back"
              onClick={() => setStep("details")}
            >
              <ArrowLeft size={14} /> Back
            </button>

            <div className="checkout-flow__summary-card">
              {items.map((item) => (
                <div className="checkout-flow__cart-line" key={item.product.id}>
                  <span>{item.product.name} × {item.qty}</span>
                  <span>{formatNaira(lineTotal(item))}</span>
                </div>
              ))}

              {discountAmount > 0 && (
                <div className="checkout-flow__cart-line checkout-flow__cart-line--discount">
                  <span>Coupon ({couponCode})</span>
                  <span>−{formatNaira(discountAmount)}</span>
                </div>
              )}

              <div className="checkout-flow__cart-line checkout-flow__cart-line--total">
                <span>Total</span>
                <span>{formatNaira(total)}</span>
              </div>
            </div>

            <div className="checkout-flow__summary-card">
              <h4>Delivery to</h4>
              <p>{details.fullName}</p>
              <p>{details.deliveryAddress}</p>
              <p>
                {details.phone} · {details.email}
              </p>
            </div>

            {errorMessage && (
              <p className="checkout-flow__error">{errorMessage}</p>
            )}

            <button
              type="button"
              className="btn btn-primary checkout-flow__submit"
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="checkout-flow__spin" />
                  Placing Order...
                </>
              ) : (
                "Proceed to Payment"
              )}
            </button>
          </motion.div>
        )}

        {step === "payment" && (
          <motion.div
            key="payment"
            className="checkout-flow__step checkout-flow__success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
          >
            {(paymentState === "launching" || paymentState === "verifying") && (
              <>
                <Loader2 size={32} className="checkout-flow__spin" />
                <h3>
                  {paymentState === "launching"
                    ? "Opening secure payment..."
                    : "Confirming your payment..."}
                </h3>
                <p>Please don't close this window.</p>
              </>
            )}

            {paymentState === "cancelled" && (
              <>
                <h3>Payment Not Completed</h3>
                <p>
                  Your order is saved — you can retry payment now, or our
                  team will follow up by phone at {details.phone}.
                </p>
                <button type="button" className="btn btn-primary" onClick={handleRetryPayment}>
                  Retry Payment
                </button>
                <button type="button" className="btn btn-ghost" onClick={onClose}>
                  Close
                </button>
              </>
            )}

            {paymentState === "failed" && (
              <>
                <h3>Payment Couldn't Be Verified</h3>
                <p className="checkout-flow__error">{paymentError}</p>
                <p>
                  Your order is saved as pending — our team will follow up,
                  or you can retry payment.
                </p>
                <button type="button" className="btn btn-primary" onClick={handleRetryPayment}>
                  Retry Payment
                </button>
                <button type="button" className="btn btn-ghost" onClick={onClose}>
                  Close
                </button>
              </>
            )}
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            key="success"
            className="checkout-flow__step checkout-flow__success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
          >
            <CheckCircle2 size={40} className="checkout-flow__success-icon" />
            <h3>Payment Successful</h3>
            <p>
              Thanks, {details.fullName.split(" ")[0]}. Your order is
              confirmed. Our team will call you at {details.phone} shortly
              to confirm delivery.
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