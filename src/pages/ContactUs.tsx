import ContactForm from "../components/Contact/ContactForm"
import ContactHero from "../components/Contact/ContactHero"
import MapSection from "../components/Contact/MapSection"
import Cta from "../components/common/Cta";
import Footer from "../components/common/Footer"
import Navbar from "../components/common/NavBar";

function ContactUs() {
  return (
    <div>
      <Navbar/>
      <ContactHero/>
      <ContactForm/>
      <MapSection/>
       <Cta />
      <Footer />
    </div>
  )
}

export default ContactUs