import { supabase } from "../lib/supabase";
import type { AdminOrderStatus, DbOrder } from "./OrderTypes";

export interface OrderQueryResult {
  data: DbOrder[];
  error: string | null;
}

export type OrderStatusFilter = "active" | "fulfilled" | "all";

export async function fetchOrders(
  searchTerm?: string,
  statusFilter: OrderStatusFilter = "active"
): Promise<OrderQueryResult> {
  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (statusFilter === "active") {
    query = query.neq("admin_status", "fulfilled");
  } else if (statusFilter === "fulfilled") {
    query = query.eq("admin_status", "fulfilled");
  }
  // "all" applies no admin_status filter at all.

  if (searchTerm?.trim()) {
    const term = searchTerm.trim();
    query = query.or(
      `customer_name.ilike.%${term}%,customer_email.ilike.%${term}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data as DbOrder[]) ?? [], error: null };
}

// Lightweight count for the Orders tab notification badge — deliberately
// a separate `head: true, count: "exact"` query rather than reusing
// fetchOrders(), so the badge can update without pulling full order rows
// and works even while the admin is looking at the Products tab.
export async function fetchActiveOrderCount(): Promise<{
  count: number;
  error: string | null;
}> {
  const { count, error } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .neq("admin_status", "fulfilled");

  if (error) {
    return { count: 0, error: error.message };
  }

  return { count: count ?? 0, error: null };
}

export async function updateOrderAdminStatus(
  orderId: string,
  status: AdminOrderStatus
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("orders")
    .update({ admin_status: status })
    .eq("id", orderId);

  return { error: error?.message ?? null };
}