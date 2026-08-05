import { useState } from "react";
import type {FormEvent} from "react"
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { validateCoupon } from "../../types/CouponApi";
import { loadPaystackScript, type PaystackTransaction } from "../Product/Paystack";
import { getEffectiveUnitPrice, type Product } from "../../types/ProductTypes";
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

  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState<CouponStatus>("idle");
  const [discountPercent, setDiscountPercent] = useState<number | null>(null);

  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderTotalKobo, setOrderTotalKobo] = useState<number>(0);
  const [paymentState, setPaymentState] = useState<PaymentState>(null);
  const [paymentError, setPaymentError] = useState("");

  const unitPrice = getEffectiveUnitPrice(item.product, item.qty);
  const isBulkPrice = unitPrice < item.product.price;
  const subtotal = unitPrice * item.qty;
  const discountAmount = discountPercent
    ? Math.round(subtotal * (discountPercent / 100))
    : 0;
  const total = subtotal - discountAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponStatus("checking");

    const { percentOff } = await validateCoupon(
      couponCode,
      item.product.id,
      item.product.category
    );

    if (percentOff === null) {
      setCouponStatus("invalid");
      setDiscountPercent(null);
    } else {
      setCouponStatus("valid");
      setDiscountPercent(percentOff);
    }
  };

  const handleDetailsSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStep("summary");
  };

  // Verification always happens server-side, never trusting Paystack's
  // client-side callback alone — see verify-payment Edge Function.
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

    const priceKobo = Math.round(unitPrice * 100);
    const subtotalKobo = priceKobo * item.qty;
    const discountKobo =
      couponStatus === "valid" && discountPercent
        ? Math.round(subtotalKobo * (discountPercent / 100))
        : 0;
    const finalTotalKobo = subtotalKobo - discountKobo;

    const { data, error } = await supabase
      .from("orders")
      .insert({
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
        total_kobo: finalTotalKobo,
        coupon_code:
          couponStatus === "valid" ? couponCode.trim().toUpperCase() : null,
        discount_kobo: discountKobo,
        // Order is created as pending BEFORE payment, not after — so if
        // the customer abandons the Paystack popup, the order still
        // exists and shows up in the admin Orders tab for phone
        // follow-up, matching how the business already operates.
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
              <strong>{formatNaira(subtotal)}</strong>
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

            <div className="purchase-flow__field">
              <label htmlFor="pf-coupon">Coupon Code (optional)</label>
              <div className="purchase-flow__coupon-row">
                <input
                  id="pf-coupon"
                  type="text"
                  placeholder="e.g. PROGRID2444"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponStatus("idle");
                    setDiscountPercent(null);
                  }}
                />
                <button
                  type="button"
                  className="purchase-flow__coupon-apply"
                  onClick={handleApplyCoupon}
                  disabled={
                    !couponCode.trim() || couponStatus === "checking"
                  }
                >
                  {couponStatus === "checking" ? (
                    <Loader2 size={14} className="purchase-flow__spin" />
                  ) : (
                    "Apply"
                  )}
                </button>
              </div>
              {couponStatus === "valid" && discountPercent && (
                <span className="purchase-flow__coupon-feedback purchase-flow__coupon-feedback--valid">
                  <CheckCircle2 size={13} /> {discountPercent}% off applied
                </span>
              )}
              {couponStatus === "invalid" && (
                <span className="purchase-flow__coupon-feedback purchase-flow__coupon-feedback--invalid">
                  <XCircle size={13} /> Invalid or expired code
                </span>
              )}
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
                <span>{formatNaira(unitPrice)} × {item.qty}</span>
              </div>

              {isBulkPrice && (
                <div className="purchase-flow__summary-row purchase-flow__summary-row--discount">
                  <span>Bulk pricing applied</span>
                  <span>
                    was {formatNaira(item.product.price)} each
                  </span>
                </div>
              )}

              {discountAmount > 0 && (
                <div className="purchase-flow__summary-row purchase-flow__summary-row--discount">
                  <span>Coupon ({couponCode}, {discountPercent}% off)</span>
                  <span>−{formatNaira(discountAmount)}</span>
                </div>
              )}

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
                "Proceed to Payment"
              )}
            </button>
          </motion.div>
        )}

        {step === "payment" && (
          <motion.div
            key="payment"
            className="purchase-flow__step purchase-flow__success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
          >
            {(paymentState === "launching" || paymentState === "verifying") && (
              <>
                <Loader2 size={32} className="purchase-flow__spin" />
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
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleRetryPayment}
                >
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
                <p className="purchase-flow__error">{paymentError}</p>
                <p>
                  Your order is saved as pending — our team will follow up,
                  or you can retry payment.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleRetryPayment}
                >
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
            className="purchase-flow__step purchase-flow__success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
          >
            <CheckCircle2 size={40} className="purchase-flow__success-icon" />
            <h3>Payment Successful</h3>
            <p>
              Thanks, {details.fullName.split(" ")[0]}. Your order for{" "}
              {item.product.name} is confirmed. Our team will call you at{" "}
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