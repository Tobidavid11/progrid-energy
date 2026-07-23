import { motion, useReducedMotion } from "framer-motion";
import "./OurStory.css";

import storyImage1 from "../../assets/aboutcard1.jpg";
import storyImage2 from "../../assets/aboutcard2.jpg";
import storyImage3 from "../../assets/aboutcard3.jpg";

const PARAGRAPHS = [
  "Progrid Energy was founded with one mission—to make clean, reliable, and affordable energy accessible to everyone.",
  "As electricity costs continue to rise and power supply remains unpredictable, we saw the need for dependable alternatives. Since then, we've been helping families, businesses, schools, churches, and organizations transition to solar energy with systems designed for long-term performance.",
  "Every installation reflects our commitment to quality, innovation, and customer satisfaction.",
];

const textContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.1,
    },
  },
};

const textItem = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};



export default function OurStory() {
  const prefersReducedMotion = useReducedMotion();
  const initial = prefersReducedMotion ? undefined : "hidden";

  return (
    <section className="our-story" aria-labelledby="our-story-heading">
      <div className="our-story__inner">
        <motion.div
          className="our-story__text"
          variants={textContainer}
          initial={initial}
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
        >
         

          <motion.h2
            id="our-story-heading"
            className="our-story__heading"
            variants={textItem}
          >
            Our Story
          </motion.h2>

          {PARAGRAPHS.map((paragraph, index) => (
            <motion.p
              key={index}
              className="our-story__paragraph"
              variants={textItem}
            >
              {paragraph}
            </motion.p>
          ))}

          <motion.a
            href="#solutions"
            className="our-story__cta"
            variants={textItem}
            whileHover={prefersReducedMotion ? undefined : { x: 4 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <span>Discover Our Solutions</span>
            <svg
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
              className="our-story__cta-arrow"
            >
              <path
                d="M4 10h12M11 5l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.a>
        </motion.div>

        <motion.div className="our-story__gallery">
          <motion.div className="our-story__photo our-story__photo--main">
            <img src={storyImage1} alt="" />
          </motion.div>

          <motion.div className="our-story__photo our-story__photo--top">
            <img src={storyImage2} alt="" />
          </motion.div>

          <motion.div className="our-story__photo our-story__photo--bottom">
            <img src={storyImage3} alt="" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
