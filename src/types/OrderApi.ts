import { supabase } from "../lib/supabase";
import type { AdminOrderStatus, DbOrder } from "../types/OrderTypes";

export interface OrderQueryResult {
  data: DbOrder[];
  error: string | null;
}

export async function fetchOrders(
  searchTerm?: string
): Promise<OrderQueryResult> {
  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

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