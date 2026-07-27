import { useState } from "react";
import { Plus } from "lucide-react";
import AdminProductForm from "./AdminProductForm";
import AdminProductList from "./AdminProductList";
import AdminOrdersTab from "./AdminOrderTab";
import Modal from "../common/Modal";
import { supabase } from "../../lib/supabase";
import type { DbProduct } from "../../types/ProductTypes";
import "./AdminProductPage.css";

type Tab = "products" | "orders";

export default function AdminProductsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(
    null
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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
            <AdminOrdersTab />
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