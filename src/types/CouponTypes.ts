export type CouponScope = "all" | "category" | "product";

// Shape of a row in the `coupons` table exactly as Supabase returns it.
export interface Coupon {
  id: string;
  code: string;
  percent_off: number;
  scope: CouponScope;
  category: string | null;
  product_id: string | null;
  starts_at: string;
  expires_at: string;
  active: boolean;
  created_at: string;
}

export function couponStatus(
  coupon: Coupon
): "active" | "scheduled" | "expired" | "inactive" {
  if (!coupon.active) return "inactive";

  const now = new Date();
  const starts = new Date(coupon.starts_at);
  const expires = new Date(coupon.expires_at);

  if (now < starts) return "scheduled";
  if (now > expires) return "expired";
  return "active";
}