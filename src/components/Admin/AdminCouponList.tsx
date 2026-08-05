import { useEffect, useState } from "react";
import { Loader2, Trash2, Copy, Check } from "lucide-react";
import { fetchCoupons, setCouponActive, deleteCoupon } from "../../types/CouponApi";
import { couponStatus, type Coupon } from "../../types/CouponTypes";
import "./AdminCouponList.css";

interface AdminCouponListProps {
  refreshKey?: number;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { dateStyle: "medium" });
}

function scopeLabel(coupon: Coupon) {
  if (coupon.scope === "all") return "All products";
  if (coupon.scope === "category") return coupon.category ?? "—";
  return "Specific product";
}

export default function AdminCouponList({
  refreshKey = 0,
}: AdminCouponListProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadCoupons = async () => {
    setIsLoading(true);
    const { data, error } = await fetchCoupons();
    if (error) {
      setErrorMessage(error);
    } else {
      setErrorMessage("");
      setCoupons(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const handleToggleActive = async (coupon: Coupon) => {
    setPendingId(coupon.id);
    const { error } = await setCouponActive(coupon.id, !coupon.active);
    if (!error) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === coupon.id ? { ...c, active: !c.active } : c
        )
      );
    }
    setPendingId(null);
  };

  const handleDelete = async (coupon: Coupon) => {
    const confirmed = window.confirm(`Delete coupon "${coupon.code}"?`);
    if (!confirmed) return;

    setPendingId(coupon.id);
    const { error } = await deleteCoupon(coupon.id);
    if (!error) {
      setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
    }
    setPendingId(null);
  };

  const handleCopy = (coupon: Coupon) => {
    navigator.clipboard.writeText(coupon.code);
    setCopiedId(coupon.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (isLoading) {
    return (
      <div className="admin-coupon-list__state">
        <Loader2 size={18} className="admin-coupon-list__spin" />
        Loading coupons...
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="admin-coupon-list__state admin-coupon-list__state--error">
        {errorMessage}
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <div className="admin-coupon-list__state">No coupons created yet.</div>
    );
  }

  return (
    <div className="admin-coupon-list">
      {coupons.map((coupon) => {
        const status = couponStatus(coupon);
        return (
          <div className="admin-coupon-list__card" key={coupon.id}>
            <div className="admin-coupon-list__top">
              <div className="admin-coupon-list__code-row">
                <span className="admin-coupon-list__code">{coupon.code}</span>
                <button
                  type="button"
                  className="admin-coupon-list__copy"
                  onClick={() => handleCopy(coupon)}
                  aria-label="Copy code"
                >
                  {copiedId === coupon.id ? (
                    <Check size={13} />
                  ) : (
                    <Copy size={13} />
                  )}
                </button>
              </div>
              <span className={`admin-coupon-list__status is-${status}`}>
                {status}
              </span>
            </div>

            <div className="admin-coupon-list__details">
              <span>{coupon.percent_off}% off</span>
              <span>·</span>
              <span>{scopeLabel(coupon)}</span>
              <span>·</span>
              <span>
                {formatDate(coupon.starts_at)} – {formatDate(coupon.expires_at)}
              </span>
            </div>

            <div className="admin-coupon-list__actions">
              <button
                type="button"
                className="admin-coupon-list__toggle"
                onClick={() => handleToggleActive(coupon)}
                disabled={pendingId === coupon.id}
              >
                {coupon.active ? "Deactivate" : "Activate"}
              </button>
              <button
                type="button"
                className="admin-coupon-list__delete"
                onClick={() => handleDelete(coupon)}
                disabled={pendingId === coupon.id}
                aria-label={`Delete ${coupon.code}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}