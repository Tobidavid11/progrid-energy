import { motion } from "framer-motion";
import "./ProductsHero.css";

interface ProductsHeroProps {
  eyebrow?: string;
  heading?: string;
  description?: string;
}

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

export default function ProductsHero({
  heading = "Powering Every Space, One Product at a Time",
  description = "From solar panels to inverters and batteries, explore reliable, high-performance energy solutions built for homes, businesses, and industries.",
}: ProductsHeroProps) {
  return (
    <section className="products-hero" aria-label="Progrid Energy Products">
      <div className="products-hero__glow" aria-hidden="true" />

      <div className="container">
        <motion.div
          className="products-hero__content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >

          <motion.h1 className="products-hero__heading" variants={itemVariants}>
            {heading}
          </motion.h1>

          <motion.p className="products-hero__desc" variants={itemVariants}>
            {description}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}