// import ProductSearchBar from "../components/Product/ProductSearchBar";
import ProductBanner from "../components/Product/ProductBanner";
import ProductsGrid from "../components/Product/ProductsGrid";
import ProductsHero from "../components/Product/ProductsHero";
import Cta from "../components/common/Cta";
import Footer from "../components/common/Footer"
import Navbar from "../components/common/NavBar";

 export default function Product() {
     return <div className="container">
          <Navbar/>
<ProductsHero />
         <ProductBanner/>
<ProductsGrid/>
 <Cta />
      <Footer />
     </div>;
   }