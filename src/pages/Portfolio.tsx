import Projects from "../components/Landing/Portfolio";
import Navbar from "../components/common/NavBar";
import Cta from "../components/common/Cta"
import Footer from "../components/common/Footer";
function Portfolio() {
  return (
    <div>
        <Navbar/>
        <Projects />
        <Cta />
        <Footer />
    </div>
  )
}

export default Portfolio