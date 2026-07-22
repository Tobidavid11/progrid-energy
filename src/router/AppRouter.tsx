import { Routes, Route } from "react-router-dom";
import Layout from "../components/common/Layout";
import Landing from "../pages/Landing";
import About from "../pages/About";
import Products from "../pages/Products";
import NotFound from "../pages/NotFound";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<Products />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}