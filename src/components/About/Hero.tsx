import { motion, useReducedMotion } from "framer-motion";
import "./Hero.css";
import AboutHero from "../../assets/abouthero.jpg"
const HEADING_LINE_1 = "Powering Progress.";
const HEADING_LINE_2 = "One Home. One Business. One Community at a Time.";

const SUBTEXT =
  "At Progrid Energy, we believe reliable electricity is more than convenience—it's the foundation for growth. We provide innovative solar energy solutions that help homes, businesses, and industries achieve true energy independence.";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

interface HeroProps {
  /** Path or URL to the background photo. Defaults to /images/about-hero.jpg */
  backgroundImage?: string;
  /** Accessible alt text describing the photo, read by screen readers */
  backgroundAlt?: string;
}

export default function Hero({
  backgroundImage = AboutHero,
  backgroundAlt = "",
}: HeroProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="about-hero" aria-label="About Progrid Energy">
      <motion.div
        className="about-hero__bg"
        style={{ backgroundImage: `url(${backgroundImage})` }}
        role={backgroundAlt ? "img" : undefined}
        aria-label={backgroundAlt || undefined}
        initial={prefersReducedMotion ? false : { scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
      />
      <div className="about-hero__overlay" />

      <motion.div
        className="about-hero__content"
        variants={containerVariants}
        initial={prefersReducedMotion ? false : "hidden"}
        animate="visible"
      >
        <motion.h1 className="about-hero__heading" variants={itemVariants}>
          <span className="about-hero__heading-line">{HEADING_LINE_1}</span>
          <span className="about-hero__heading-line about-hero__heading-line--sub">
            {HEADING_LINE_2}
          </span>
        </motion.h1>

        <motion.p className="about-hero__subtext" variants={itemVariants}>
          {SUBTEXT}
        </motion.p>
      </motion.div>
    </section>
  );
}
