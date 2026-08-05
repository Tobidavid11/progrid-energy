import Footer from "../components/common/Footer";
import Navbar from "../components/common/NavBar";
import Cta from "../components/common/Cta";
import ServicesGrid from "../components/Landing/ServicesGrid";
 
function Services() {
  return (
    <div>
        <Navbar/>
<ServicesGrid/>
        <Cta />
        <Footer/>
    </div>
  )
}

export default Services