import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";
import { createCoupon, fetchProductOptions } from "../../types/CouponApi";
import { PRODUCT_CATEGORIES } from "../../types/ProductTypes";
import type { CouponScope } from "../../types/CouponTypes";
import "./AdminCouponForm.css";

interface AdminCouponFormProps {
  onSaved?: () => void;
}

type Status = "idle" | "saving" | "success" | "error";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function daysFromNowISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function AdminCouponForm({ onSaved }: AdminCouponFormProps) {
  const [code, setCode] = useState("");
  const [percentOff, setPercentOff] = useState("10");
  const [scope, setScope] = useState<CouponScope>("all");
  const [category, setCategory] = useState<string>(PRODUCT_CATEGORIES[0]);
  const [productId, setProductId] = useState("");
  const [startsAt, setStartsAt] = useState(todayISO());
  const [expiresAt, setExpiresAt] = useState(daysFromNowISO(30));

  const [productOptions, setProductOptions] = useState<
    { id: string; name: string }[]
  >([]);

  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (scope !== "product") return;
    fetchProductOptions().then(({ data }) => {
      setProductOptions(data);
      if (data.length && !productId) setProductId(data[0].id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("saving");
    setErrorMessage("");

    const percent = parseInt(percentOff, 10);
    if (Number.isNaN(percent) || percent <= 0 || percent > 100) {
      setErrorMessage("Enter a discount percentage between 1 and 100.");
      setStatus("error");
      return;
    }

    if (new Date(expiresAt) <= new Date(startsAt)) {
      setErrorMessage("Expiry date must be after the start date.");
      setStatus("error");
      return;
    }

    const { error } = await createCoupon({
      code,
      percentOff: percent,
      scope,
      category: scope === "category" ? category : undefined,
      productId: scope === "product" ? productId : undefined,
      startsAt: new Date(startsAt).toISOString(),
      expiresAt: new Date(expiresAt).toISOString(),
    });

    if (error) {
      setErrorMessage(error);
      setStatus("error");
      return;
    }

    setStatus("success");
    setCode("");
    setPercentOff("10");
    setScope("all");
    setStartsAt(todayISO());
    setExpiresAt(daysFromNowISO(30));
    onSaved?.();
  };

  const isSaving = status === "saving";

  return (
    <form className="admin-coupon-form" onSubmit={handleSubmit}>
      <div className="admin-coupon-form__row">
        <div className="admin-coupon-form__field">
          <label htmlFor="coupon-code">Coupon Code</label>
          <input
            id="coupon-code"
            type="text"
            placeholder="PROGRID2444"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            disabled={isSaving}
          />
        </div>

        <div className="admin-coupon-form__field">
          <label htmlFor="coupon-percent">Discount (%)</label>
          <input
            id="coupon-percent"
            type="number"
            min="1"
            max="100"
            required
            value={percentOff}
            onChange={(e) => setPercentOff(e.target.value)}
            disabled={isSaving}
          />
        </div>
      </div>

      <div className="admin-coupon-form__field">
        <label htmlFor="coupon-scope">Applies To</label>
        <select
          id="coupon-scope"
          value={scope}
          onChange={(e) => setScope(e.target.value as CouponScope)}
          disabled={isSaving}
        >
          <option value="all">All Products</option>
          <option value="category">A Specific Category</option>
          <option value="product">A Specific Product</option>
        </select>
      </div>

      {scope === "category" && (
        <div className="admin-coupon-form__field">
          <label htmlFor="coupon-category">Category</label>
          <select
            id="coupon-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isSaving}
          >
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      )}

      {scope === "product" && (
        <div className="admin-coupon-form__field">
          <label htmlFor="coupon-product">Product</label>
          <select
            id="coupon-product"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            disabled={isSaving || productOptions.length === 0}
          >
            {productOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="admin-coupon-form__row">
        <div className="admin-coupon-form__field">
          <label htmlFor="coupon-starts">Starts</label>
          <input
            id="coupon-starts"
            type="date"
            required
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            disabled={isSaving}
          />
        </div>

        <div className="admin-coupon-form__field">
          <label htmlFor="coupon-expires">Expires</label>
          <input
            id="coupon-expires"
            type="date"
            required
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            disabled={isSaving}
          />
        </div>
      </div>

      <div className="admin-coupon-form__footer">
        <motion.button
          type="submit"
          className="btn btn-primary"
          disabled={isSaving}
          whileHover={!isSaving ? { scale: 1.03 } : undefined}
          whileTap={!isSaving ? { scale: 0.97 } : undefined}
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className="admin-coupon-form__spin" />
              Creating...
            </>
          ) : (
            "Create Coupon"
          )}
        </motion.button>

        {status === "success" && (
          <motion.span
            className="admin-coupon-form__status admin-coupon-form__status--success"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CheckCircle2 size={16} />
            Coupon created.
          </motion.span>
        )}

        {status === "error" && errorMessage && (
          <motion.span
            className="admin-coupon-form__status admin-coupon-form__status--error"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errorMessage}
          </motion.span>
        )}
      </div>
    </form>
  );
}