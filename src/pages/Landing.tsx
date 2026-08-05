import Hero from "../components/Landing/Hero";
import TrustedBy from "../components/Landing/TrustedBy";
import About from "../components/Landing/About";
import Services from "../components/Landing/Services";
import ProductPreview from "../components/Landing/ProductPreview";
import HowItWorks from "../components/Landing/HowItWorks";
import Portfolio from "../components/Landing/Portfolio";
import Difference from "../components/Landing/Whychoosus";
import Testimonial from "../components/Landing/Testimonial";
import Faq from "../components/Landing/Faq";
import Cta from "../components/common/Cta";
import Footer from "../components/common/Footer"
import Navbar from "../components/common/NavBar";
  import ChatWidget from "../components/common/ChatWidget";
// import Footer from "../components/common/Footer";

export default function Landing() {
  return (
    <>
    <Navbar/>
      <Hero />
      <TrustedBy />
      <About />
      <Services />
      <ProductPreview />
      <HowItWorks />
      <Portfolio />
      <Difference />
      <Testimonial />
    <ChatWidget />
      <Faq/>
       <Cta />
      <Footer />
    </>
  );
}