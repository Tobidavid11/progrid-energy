import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import AdminProductForm from "./AdminProductForm";
import AdminProductList from "./AdminProductList";
import AdminOrdersTab from "../Admin/AdminOrderTab";
import AdminCouponForm from "./AdminCouponForm";
import AdminCouponList from "./AdminCouponList";
import Modal from "../common/Modal";
import { supabase } from "../../lib/supabase";
import { fetchActiveOrderCount } from "../../types/OrderApi";
import type { DbProduct } from "../../types/ProductTypes";
import "./AdminProductPage.css";

type Tab = "products" | "orders" | "coupons";

export default function AdminProductsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(
    null
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [couponRefreshKey, setCouponRefreshKey] = useState(0);
  const [activeOrderCount, setActiveOrderCount] = useState(0);

  const refreshOrderCount = useCallback(async () => {
    const { count } = await fetchActiveOrderCount();
    setActiveOrderCount(count);
  }, []);

  useEffect(() => {
    refreshOrderCount();
    // Orders can arrive from a customer checking out at any time, not
    // just while this page happens to be open — poll periodically so
    // the badge doesn't go stale during a long admin session. 60s is a
    // reasonable balance; this isn't meant to feel real-time, the admin
    // gets the actual email notification for that (once wired up).
    const interval = setInterval(refreshOrderCount, 60_000);
    return () => clearInterval(interval);
  }, [refreshOrderCount]);

  const openAddModal = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const openEditModal = (product: DbProduct) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleSaved = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-page__header">
          <h1>Admin Dashboard</h1>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => supabase.auth.signOut()}
          >
            Sign Out
          </button>
        </div>

        <div className="admin-page__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "products"}
            className={`admin-page__tab ${activeTab === "products" ? "is-active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            Products
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "orders"}
            className={`admin-page__tab ${activeTab === "orders" ? "is-active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            Orders
            {activeOrderCount > 0 && (
              <span className="admin-page__tab-badge">{activeOrderCount}</span>
            )}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "coupons"}
            className={`admin-page__tab ${activeTab === "coupons" ? "is-active" : ""}`}
            onClick={() => setActiveTab("coupons")}
          >
            Coupons
          </button>
        </div>

        {activeTab === "products" && (
          <div className="admin-page__panel">
            <div className="admin-page__panel-header">
              <h2>Products</h2>
              <button
                type="button"
                className="btn btn-primary admin-page__add-btn"
                onClick={openAddModal}
              >
                <Plus size={16} />
                Add Product
              </button>
            </div>

            <AdminProductList onEdit={openEditModal} refreshKey={refreshKey} />
          </div>
        )}

        {activeTab === "orders" && (
          <div className="admin-page__panel">
            <div className="admin-page__panel-header">
              <h2>Recent Orders</h2>
            </div>
            <AdminOrdersTab onOrdersChanged={refreshOrderCount} />
          </div>
        )}

        {activeTab === "coupons" && (
          <div className="admin-page__panel admin-page__panel--split">
            <div>
              <div className="admin-page__panel-header">
                <h2>New Coupon</h2>
              </div>
              <AdminCouponForm
                onSaved={() => setCouponRefreshKey((k) => k + 1)}
              />
            </div>

            <div>
              <div className="admin-page__panel-header">
                <h2>Existing Coupons</h2>
              </div>
              <AdminCouponList refreshKey={couponRefreshKey} />
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingProduct ? "Edit Product" : "Add New Product"}
      >
        <AdminProductForm
          key={editingProduct?.id ?? "new"}
          product={editingProduct ?? undefined}
          onSaved={handleSaved}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>
    </div>
  );
}