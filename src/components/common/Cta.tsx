import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import "./CTA.css";

interface CTAProps {
  /** Path or imported URL of the background image. Pass this in from the parent. */
  backgroundImage: string;
  heading?: string;
  subheading?: string;
  listItems?: string[];
  bannerText?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
}

const defaultListItems = [
  "Home Cleaning",
  "Store Cleaning",
  "Workspace Cleaning",
  "Move In / Out Cleaning",
];

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

const bannerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT, delay: 0.25 },
  },
};

export default function CTA({
  backgroundImage,
  heading = "Cleaning That Works Around You",
  subheading = "Our expert cleaners handle the mess so you can focus on what matters.",
  listItems = defaultListItems,
  bannerText = "Got a space in need of a refresh?",
  ctaLabel = "Schedule a Call",
  onCtaClick,
}: CTAProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.25 });

  return (
    <div className="cta-card" ref={sectionRef}>
      <div
        className="cta-bg"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="cta-overlay" />

      <motion.div
        className="cta-content"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <div className="cta-main">
          <motion.h1 className="cta-heading" variants={itemVariants}>
            {heading}
          </motion.h1>
          <motion.p className="cta-subheading" variants={itemVariants}>
            {subheading}
          </motion.p>
        </div>

        <motion.ul className="cta-list" variants={itemVariants}>
          {listItems.map((item) => (
            <li key={item} className="cta-list-item">
              {item}
            </li>
          ))}
        </motion.ul>
      </motion.div>

      <motion.div
        className="cta-banner"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={bannerVariants}
      >
        <p className="cta-banner-text">{bannerText}</p>
        <motion.button
          type="button"
          className="cta-banner-btn"
          onClick={onCtaClick}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          {ctaLabel}
        </motion.button>
      </motion.div>
    </div>
  );
}