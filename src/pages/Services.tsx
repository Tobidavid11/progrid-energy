import Footer from "../components/common/Footer";
import Navbar from "../components/common/NavBar";
import Cta from "../components/common/Cta";
import ServicesGrid from "../components/Landing/ServicesGrid";
import ServicesHero from "../components/services/Serviceshero ";
import ServiceContent from "../components/services/Servicecontent";
 
function Services() {
  return (
    <div>
        <Navbar/>
        <ServicesHero/>
        <ServicesGrid/>
        <ServiceContent />
        <Cta />
        <Footer/>
    </div>
  )
}

export default Services