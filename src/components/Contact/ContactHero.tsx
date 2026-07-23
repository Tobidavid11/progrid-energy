import { motion, useReducedMotion } from "framer-motion";
import "./ContactHero.css";
import ContactHeroImage from "../../assets/contact-hero.png"

const HEADING = "Let's Power Your Next Project";
const DESCRIPTION =
  "Whether you're planning a solar installation, looking for energy solutions, or need expert advice, our team is here to help. Reach out today and let's build a more reliable energy future together.";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE_OUT },
  },
};

interface ContactHeroProps {
  /** Path or imported URL of the background photo. Pass this in from the parent. */
backgroundImage?: string;
  /** Accessible alt text describing the photo, read by screen readers */
  backgroundAlt?: string;
}

export default function ContactHero({
 backgroundImage = ContactHeroImage,
  backgroundAlt = "",
}: ContactHeroProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="contact-hero" aria-label="Contact Progrid Energy">
      <motion.div
        className="contact-hero__bg"
        style={{ backgroundImage: `url(${backgroundImage})` }}
        role={backgroundAlt ? "img" : undefined}
        aria-label={backgroundAlt || undefined}
        initial={prefersReducedMotion ? false : { scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.6, ease: EASE_OUT }}
      />
      <div className="contact-hero__overlay" />

      <div className="container">
        <motion.div
          className="contact-hero__content"
          variants={containerVariants}
          initial={prefersReducedMotion ? false : "hidden"}
          animate="visible"
        >


          <motion.h1 className="contact-hero__heading" variants={itemVariants}>
            {HEADING}
          </motion.h1>

          <motion.p className="contact-hero__desc" variants={itemVariants}>
            {DESCRIPTION}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}