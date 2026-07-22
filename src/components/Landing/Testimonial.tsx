import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import type {Variants} from "framer-motion"
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import "./Testimonial.css";

interface TestimonialData {
  id: number;
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

const testimonials: TestimonialData[] = [
  {
    id: 1,
    quote:
      "Since installing my solar system with Progrid Energy, power outages are no longer a concern. The installation was neat, the team was professional, and the system has been working perfectly.",
    name: "Adebayo O.",
    role: "Homeowner, Abeokuta",
    avatar: "https://images.unsplash.com/photo-1616805765352-beedbad46b2a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 2,
    quote:
      "My shop now operates without interruptions, even during long blackouts. Choosing Progrid Energy has reduced my fuel expenses and improved my daily productivity.",
    name: "Mrs. Esther Adeolu",
    role: "Business Owner",
    avatar: "https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 3,
    quote:
      "I was impressed by their attention to detail and quality of installation. They delivered exactly what they promised, and the after-sales support has been excellent.",
    name: "Engr. Michael T.",
    role: "Property Developer",
    avatar: "https://plus.unsplash.com/premium_photo-1683134366494-bb44ea2cc847?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 4,
    quote:
      "We switched to solar to cut generator costs, and it has been one of our best business decisions. Reliable power means better service for our customers every day.",
    name: "Samuel Kayode",
    role: "Restaurant Owner",
    avatar: "https://plus.unsplash.com/premium_photo-1708275672423-837db6d3d700?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 5,
    quote:
      "Progrid Energy helped us install a complete solar solution for our office. Our operations now continue seamlessly during power outages, and electricity costs have dropped significantly.",
    name: "Daniel Onana",
    role: "Office Administrator",
    avatar: "https://images.unsplash.com/photo-1533108344127-a586d2b02479?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

function useItemsPerView() {
  const [itemsPerView, setItemsPerView] = useState(3);

  useEffect(() => {
    const compute = () => {
      if (window.innerWidth < 720) setItemsPerView(1);
      else if (window.innerWidth < 1080) setItemsPerView(2);
      else setItemsPerView(3);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  return itemsPerView;
}

const headingVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const trackVariants: Variants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 40 : -40,
  }),
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -40 : 40,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  }),
};

const cardContainerVariants: Variants = {
  center: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants: Variants = {
  enter: { opacity: 0, y: 16 },
  center: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Testimonial() {
  const itemsPerView = useItemsPerView();
  const maxIndex = Math.max(0, testimonials.length - itemsPerView);

  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    setPage((p) => Math.min(p, maxIndex));
  }, [maxIndex]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setPage((p) => Math.max(0, p - 1));
  }, []);

  const goNext = useCallback(() => {
    setDirection(1);
    setPage((p) => Math.min(maxIndex, p + 1));
  }, [maxIndex]);

  const visible = testimonials.slice(page, page + itemsPerView);

  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const atStart = page === 0;
  const atEnd = page === maxIndex;

  return (
    <section className="tst-section" ref={sectionRef}>
      <div className="tst-container">
        <div className="tst-header">
          <motion.div
            className="tst-heading-block"
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={headingVariants}
          >
            <h2 className="tst-heading">What Our Customers Say</h2>
            <p className="tst-subheading">
              Real experiences from homeowners and businesses we've helped
              power with reliable energy solutions.
            </p>
          </motion.div>

          <div className="tst-nav">
            <motion.button
              type="button"
              className="tst-nav-btn tst-nav-btn--prev"
              onClick={goPrev}
              disabled={atStart}
              aria-label="Previous testimonials"
              whileHover={!atStart ? { scale: 1.06 } : undefined}
              whileTap={!atStart ? { scale: 0.94 } : undefined}
            >
              <ArrowLeft size={18} strokeWidth={2} />
            </motion.button>
            <motion.button
              type="button"
              className="tst-nav-btn tst-nav-btn--next"
              onClick={goNext}
              disabled={atEnd}
              aria-label="Next testimonials"
              whileHover={!atEnd ? { scale: 1.06 } : undefined}
              whileTap={!atEnd ? { scale: 0.94 } : undefined}
            >
              <ArrowRight size={18} strokeWidth={2} />
            </motion.button>
          </div>
        </div>

        <div className="tst-track-wrap">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={page}
              className="tst-track"
              style={{
                gridTemplateColumns: `repeat(${itemsPerView}, 1fr)`,
              }}
              custom={direction}
              variants={trackVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <motion.div
                className="tst-cards"
                style={{
                  gridTemplateColumns: `repeat(${itemsPerView}, 1fr)`,
                }}
                variants={cardContainerVariants}
                initial="enter"
                animate="center"
              >
                {visible.map((item) => (
                  <motion.article
                    className="tst-card"
                    key={item.id}
                    variants={cardVariants}
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Quote className="tst-quote-icon" fill="currentColor" />
                    <p className="tst-quote-text">{item.quote}</p>
                    <div className="tst-person">
                      <div className="tst-person-info">
                        <span className="tst-person-name">{item.name}</span>
                        <span className="tst-person-role">
                          {item.role}
                          {/* <br /> */}
                        </span>
                      </div>
                      <img
                        className="tst-avatar"
                        src={item.avatar}
                        alt={item.name}
                        loading="lazy"
                      />
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="tst-dots">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              className={`tst-dot ${i === page ? "tst-dot--active" : ""}`}
              onClick={() => {
                setDirection(i > page ? 1 : -1);
                setPage(i);
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}