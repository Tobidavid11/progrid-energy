import { Routes, Route } from "react-router-dom";
import Layout from "../components/common/Layout";
import Landing from "../pages/Landing";
import About from "../pages/About";
import Products from "../pages/Products";
import NotFound from "../pages/NotFound";
import Contact from "../pages/ContactUs";
import ScrollToTop from "../components/ScrollToTop/ScrolltoTop";

export default function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}