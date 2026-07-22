import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Portfolio.css";
import project1a from "../../assets/project-1a.jpeg"
import project1b from "../../assets/project-1b.jpeg"
import project2a from "../../assets/project-2a.jpeg"
import project2b from "../../assets/project-2b.jpeg"
import project3a from "../../assets/project-3a.jpeg"
import project3b from "../../assets/project-3b.jpeg"
import project4a from "../../assets/project-4a.jpeg"
import project4b from "../../assets/project-4b.jpeg"

type Project = {
  title: string;
  handle: string;
  description: string;
  image: string[];
};

// TEMP: mock data until the projects/portfolio API is wired up.
const PROJECTS: Project[] = [
  {
    title: "4.2kVA Hybrid Solar Power Installation",
    handle: "Ago-Iwoye, Ogun State, Nigeria",
    description:
      "Designed and installed a high-performance 4.2kVA hybrid solar energy system featuring a 7.5kWh lithium battery, 3.6kWp bifacial mono solar array, and complete AC/DC protection. The system delivers reliable backup power for residential appliances, including air conditioning, water heating, refrigeration, laundry equipment, entertainment systems, and kitchen appliances, with an estimated 6-hour backup at a 1kW load.",
    image: [project1a, project1b],
  },
  {
    title: "5kVA Hybrid Solar Power Installation",
    handle: "@Lekki,Lagos State.",
    description:
"Designed and deployed a robust 5kVA hybrid solar power system featuring a 7.5kWh lithium battery, 3.6kWp bifacial mono solar array, and comprehensive AC/DC protection. Built to provide efficient, uninterrupted power for residential and light commercial applications, the system comfortably supports high-demand appliances such as air conditioners, water heaters, refrigerators, washing machines, entertainment systems, and kitchen equipment, delivering an estimated 6-hour backup at a 1kW load.",
  image: [project2a, project2b],
  },
  {
    title: "11kVA Hybrid Solar Power Installation",
    handle: "@Port Harcourt, Rivers State, Nigeria",
    description:
"Engineered and installed a high-capacity 11kVA hybrid solar energy system comprising a 30kWh lithium battery bank, 10.8kWp bifacial mono solar array, and complete AC/DC protection infrastructure. Designed for large residential and commercial energy demands, the system efficiently powers multiple air conditioning units (6–10HP), water heaters, refrigeration, laundry equipment, entertainment systems, and other high-load appliances while delivering an estimated 24-hour backup at a 1.2kW load.",
    image: [project3a, project3b],
  },
  {
    title: "8kVA Solar Power Installation with Tubular Battery Backup",
    handle: "Oyo State, Nigeria",
    description:
"Designed and commissioned a dependable 8kVA solar power system equipped with a 10.5kWh tubular battery bank, 5.4kWp mono solar array, and comprehensive AC/DC protection. Built to provide reliable energy for residential and small commercial environments, the system efficiently powers 2HP air conditioning units, refrigeration, water heating, laundry appliances, entertainment systems, and other essential electrical loads, delivering an estimated 5-hour backup at a 1kW load.",
    image: [project4a, project4b],
  },
];

const AUTOPLAY_MS = 4500;

function ImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = (dir: 1 | -1) => {
    setDirection(dir);
    setIndex((i) => (i + dir + images.length) % images.length);
  };

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => go(1), AUTOPLAY_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length]);

  return (
    <div className="portfolio__image">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.img
          key={index}
          src={images[index]}
          alt={alt}
          custom={direction}
          initial={{ opacity: 0, x: direction * 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -24 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        />
      </AnimatePresence>

      {images.length > 1 && (
        <>
          <button
            type="button"
            className="portfolio__carousel-btn portfolio__carousel-btn--prev"
            aria-label="Previous image"
            onClick={() => go(-1)}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="portfolio__carousel-btn portfolio__carousel-btn--next"
            aria-label="Next image"
            onClick={() => go(1)}
          >
            <ChevronRight size={16} />
          </button>

          <div className="portfolio__carousel-dots">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`portfolio__carousel-dot ${i === index ? "is-active" : ""}`}
                aria-label={`Go to image ${i + 1}`}
                onClick={() => {
                  setDirection(i > index ? 1 : -1);
                  setIndex(i);
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Portfolio() {
  return (
    <section className="portfolio" id="projects">
      <div className="container">
        <div className="portfolio__header">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="portfolio__title">Projects We've Delivered</h2>
            <p className="portfolio__subtitle">
              See how we've helped homes, businesses, schools, and
              organizations achieve reliable, uninterrupted power through
              professionally installed solar systems.
            </p>
          </motion.div>

          <motion.a
            href="/projects"
            className="portfolio__view-all"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -2 }}
          >
            View More Projects
          </motion.a>
        </div>

        <div className="portfolio__list">
          {PROJECTS.map((project, i) => (
            <motion.article
              key={`${project.title}-${i}`}
              className={`portfolio__card ${i % 2 === 1 ? "portfolio__card--reverse" : ""}`}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ borderColor: "rgba(252, 69, 2, 0.5)" }}
            >
              <ImageCarousel images={project.image} alt={project.title} />

              <div className="portfolio__content">
                <h3 className="portfolio__project-title">{project.title}</h3>
                <span className="portfolio__handle">{project.handle}</span>
                <p className="portfolio__desc">{project.description}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}