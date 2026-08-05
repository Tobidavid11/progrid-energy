import { supabase } from "../lib/supabase";
import type { Coupon, CouponScope } from "./CouponTypes";

export interface CouponQueryResult {
  data: Coupon[];
  error: string | null;
}

export async function fetchCoupons(): Promise<CouponQueryResult> {
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }
  return { data: (data as Coupon[]) ?? [], error: null };
}

export interface CreateCouponInput {
  code: string;
  percentOff: number;
  scope: CouponScope;
  category?: string | null;
  productId?: string | null;
  startsAt: string; // ISO date
  expiresAt: string; // ISO date
}

export async function createCoupon(
  input: CreateCouponInput
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("coupons").insert({
    code: input.code.trim().toUpperCase(),
    percent_off: input.percentOff,
    scope: input.scope,
    category: input.scope === "category" ? input.category : null,
    product_id: input.scope === "product" ? input.productId : null,
    starts_at: input.startsAt,
    expires_at: input.expiresAt,
    active: true,
  });

  return { error: error?.message ?? null };
}

export async function setCouponActive(
  id: string,
  active: boolean
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("coupons")
    .update({ active })
    .eq("id", id);

  return { error: error?.message ?? null };
}

export async function deleteCoupon(
  id: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  return { error: error?.message ?? null };
}

// Lightweight product list (id + name only) for the "specific product"
// coupon-scope picker — doesn't need full DbProduct rows.
export async function fetchProductOptions(): Promise<{
  data: { id: string; name: string }[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("products")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    return { data: [], error: error.message };
  }
  return { data: data ?? [], error: null };
}

// Customer-facing: validates a code against a specific product without
// exposing the coupons table itself — see validate_coupon() in
// schema_v2.sql for why this goes through an RPC instead of a SELECT.
export async function validateCoupon(
  code: string,
  productId: string,
  category: string
): Promise<{ percentOff: number | null; error: string | null }> {
  const { data, error } = await supabase.rpc("validate_coupon", {
    coupon_code: code.trim().toUpperCase(),
    target_product_id: productId,
    target_category: category,
  });

  if (error) {
    return { percentOff: null, error: error.message };
  }

  return { percentOff: (data as number | null) ?? null, error: null };
}