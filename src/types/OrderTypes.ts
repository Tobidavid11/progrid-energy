export type PaymentStatus = "pending" | "paid" | "failed";
export type AdminOrderStatus = "new" | "contacted" | "fulfilled";

export interface OrderItem {
  product_id: string;
  name: string;
  price_kobo: number;
  qty: number;
}

// Shape of a row in the `orders` table exactly as Supabase returns it.
export interface DbOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  items: OrderItem[];
  total_kobo: number;
  payment_status: PaymentStatus;
  paystack_reference: string | null;
  admin_status: AdminOrderStatus;
  created_at: string;
}