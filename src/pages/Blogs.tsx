import Navbar from "../components/common/NavBar"
import BlogsHero from "../components/Blogs/BlogsHero"
import BlogsGrid from "../components/Blogs/BlogsGrid"
import Footer from "../components/common/Footer"

function Blogs() {
  return (
    <div>
      <Navbar />
      <BlogsHero />
      <BlogsGrid />
      <Footer />
    </div>
  )
}

export default Blogs