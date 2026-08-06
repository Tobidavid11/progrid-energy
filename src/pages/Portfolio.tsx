import Navbar from "../components/common/NavBar";
import Cta from "../components/common/Cta"
import Footer from "../components/common/Footer";
import PortfolioHeader from "../components/Portfolio/PortfolioHeader";
import PortfolioInfo from "../components/Portfolio/PortfolioInfo";

function Portfolio() {
  return (
    <div>
        <Navbar/>
        <PortfolioHeader />
        <PortfolioInfo />
        <Cta />
        <Footer />
    </div>
  )
}

export default Portfolio