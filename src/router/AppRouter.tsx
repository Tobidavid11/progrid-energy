import { Routes, Route } from "react-router-dom";
import Layout from "../components/common/Layout";
import Landing from "../pages/Landing";
import About from "../pages/About";
import Products from "../pages/Products";
import NotFound from "../pages/NotFound";
import Contact from "../pages/ContactUs";
import ScrollToTop from "../components/ScrollToTop/ScrolltoTop";
import RequireAdmin from "../components/Admin/RequireAdmin";
import AdminProductsPage from "../components/Admin/AdminProductPage";
import ProductDetail from "../components/Product/ProductDetail";
import { CartProvider } from "../components/Cart/CartContext";
import Services from "../pages/Services";
import Portfolio from "../pages/Portfolio";

export default function AppRouter() {
  return (
    <>
<CartProvider>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/services" element={<Services />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="*" element={<NotFound />} />
          <Route
  path="/admin/products"
  element={
    <RequireAdmin>
      <AdminProductsPage />
    </RequireAdmin>
  }
/>
        </Route>
      </Routes>
      </CartProvider>
    </>
  );
}