import { motion, useReducedMotion } from "framer-motion";
import "./PortfolioHeader.css";



const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function PortfolioHeader({
  title = "Our Work Speaks for Itself",
  subtitle = "Explore our portfolio of completed solar and engineering projects, showcasing innovative solutions, quality craftsmanship, and reliable energy systems delivered across homes, businesses, and industries.",
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="ph-section">
      <div className="ph-glow" aria-hidden="true" />

      <motion.div
        className="ph-content container"
        variants={containerVariants}
        initial={prefersReducedMotion ? false : "hidden"}
        animate="visible"
      >
       

        <motion.h1 className="ph-title" variants={itemVariants}>
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p className="ph-subtitle" variants={itemVariants}>
            {subtitle}
          </motion.p>
        )}
      </motion.div>
    </section>
  );
}