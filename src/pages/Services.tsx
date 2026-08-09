import Footer from "../components/common/Footer";
import Navbar from "../components/common/NavBar";
import Cta from "../components/common/Cta";
import ServicesGrid from "../components/Landing/ServicesGrid";
import ServicesHero from "../components/services/Serviceshero ";
import ServiceContent from "../components/services/Servicecontent";
import SEO from "../components/SEO";
import { localBusinessSchema } from "../data/structuredData";

function Services() {
  return (
    <div>
        <SEO
          title="Solar Installation & Energy Services in Nigeria"
          description="Solar installation, inverter systems, CCTV surveillance, energy consulting, and training in Abeokuta and across Nigeria. Affordable, warranty-backed solutions."
          path="/services"
          structuredData={localBusinessSchema}
        />
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