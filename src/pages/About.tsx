import DedicatedToChange from "../components/About/Dedicatedtochange";
import DedicatedToExcellence from "../components/About/Dedicatedtoexcellence";
import Hero from "../components/About/Hero";
import OurStory from "../components/About/OurStory";
import Cta from "../components/common/Cta";
import Footer from "../components/common/Footer"
import Navbar from "../components/common/NavBar";
 export default function About() {
     return <div >
      <Navbar/>
      <Hero/>
      <OurStory/>
      <DedicatedToExcellence/>
      <DedicatedToChange/>
       <Cta />
      <Footer />
     </div>;
   }