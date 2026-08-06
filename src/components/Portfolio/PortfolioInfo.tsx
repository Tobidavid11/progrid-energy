import { useEffect, useState } from "react";
import { PROJECTS } from "../../data/Projects";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "../Landing/Portfolio.css";






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