import { useEffect, useState } from "react";
import { Loader2, Phone, MapPin } from "lucide-react";
import {
  fetchOrders,
  updateOrderAdminStatus,
  type OrderStatusFilter,
} from "../../types/OrderApi";
import type { AdminOrderStatus, DbOrder } from "../../types/OrderTypes";
import "./AdminOrderTab.css";

function formatNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const ADMIN_STATUS_OPTIONS: AdminOrderStatus[] = [
  "new",
  "contacted",
  "fulfilled",
];

const FILTER_OPTIONS: { value: OrderStatusFilter; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "fulfilled", label: "Fulfilled" },
  { value: "all", label: "All" },
];

interface AdminOrdersTabProps {
  /** Called after an order's status changes, so the parent can refresh its notification badge count. */
  onOrdersChanged?: () => void;
}

export default function AdminOrdersTab({
  onOrdersChanged,
}: AdminOrdersTabProps) {
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("active");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const loadOrders = async (term: string, filter: OrderStatusFilter) => {
    setIsLoading(true);
    const { data, error } = await fetchOrders(term, filter);
    if (error) {
      setErrorMessage(error);
    } else {
      setErrorMessage("");
      setOrders(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const timeout = setTimeout(
      () => loadOrders(searchTerm, statusFilter),
      300
    );
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter]);

  const handleStatusChange = async (
    order: DbOrder,
    status: AdminOrderStatus
  ) => {
    setPendingId(order.id);
    const { error } = await updateOrderAdminStatus(order.id, status);
    if (!error) {
      if (statusFilter === "active" && status === "fulfilled") {
        // Marking an order fulfilled while viewing the "Active" filter
        // should make it disappear from this list immediately, not
        // just update in place and linger until the next refetch.
        setOrders((prev) => prev.filter((o) => o.id !== order.id));
      } else {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id ? { ...o, admin_status: status } : o
          )
        );
      }
      onOrdersChanged?.();
    }
    setPendingId(null);
  };

  return (
    <div className="admin-orders">
      <div className="admin-orders__controls">
        <input
          type="text"
          className="admin-orders__search"
          placeholder="Search by customer name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="admin-orders__filter" role="tablist">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="tab"
              aria-selected={statusFilter === opt.value}
              className={`admin-orders__filter-btn ${
                statusFilter === opt.value ? "is-active" : ""
              }`}
              onClick={() => setStatusFilter(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="admin-orders__state">
          <Loader2 size={18} className="admin-orders__spin" />
          Loading orders...
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="admin-orders__state admin-orders__state--error">
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && orders.length === 0 && (
        <div className="admin-orders__state">
          {statusFilter === "active"
            ? "No active orders — they'll show up here once customers start checking out."
            : "No orders match this filter."}
        </div>
      )}

      {!isLoading && orders.length > 0 && (
        <div className="admin-orders__list">
          {orders.map((order) => (
            <div className="admin-orders__card" key={order.id}>
              <div className="admin-orders__card-top">
                <div>
                  <h3>{order.customer_name}</h3>
                  <span className="admin-orders__date">
                    {formatDate(order.created_at)}
                  </span>
                </div>
                <span
                  className={`admin-orders__payment-badge is-${order.payment_status}`}
                >
                  {order.payment_status}
                </span>
              </div>

              <div className="admin-orders__contact">
                <a href={`tel:${order.customer_phone}`}>
                  <Phone size={13} /> {order.customer_phone}
                </a>
                <a href={`mailto:${order.customer_email}`}>
                  {order.customer_email}
                </a>
                <span className="admin-orders__address">
                  <MapPin size={13} /> {order.delivery_address}
                </span>
              </div>

              <div className="admin-orders__items">
                {order.items.map((item) => `${item.name} ×${item.qty}`).join(", ")}
              </div>

              <div className="admin-orders__card-footer">
                <span className="admin-orders__total">
                  {formatNaira(order.total_kobo)}
                </span>

                <select
                  value={order.admin_status}
                  onChange={(e) =>
                    handleStatusChange(
                      order,
                      e.target.value as AdminOrderStatus
                    )
                  }
                  disabled={pendingId === order.id}
                  className={`admin-orders__status-select is-${order.admin_status}`}
                >
                  {ADMIN_STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}