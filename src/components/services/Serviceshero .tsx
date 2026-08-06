import { motion, useReducedMotion } from "framer-motion";

import "./Serviceshero.css";

// Swap this for the real portrait/installation photo — a technician or
// completed installation shot works best, similar crop to the reference.


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

export default function ServicesHero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="sh3-section">
      <motion.div
        className="sh3-intro container"
        variants={containerVariants}
        initial={prefersReducedMotion ? false : "hidden"}
        animate="visible"
      >
        

        <motion.h1 className="sh3-heading" variants={itemVariants}>
          Solutions Engineered 
          
         Around Your Needs
        </motion.h1>

        <motion.p className="sh3-subtext" variants={itemVariants}>
 Explore our comprehensive range of energy and engineering services, designed to improve efficiency, security, and uninterrupted power for every space.
        </motion.p>
      </motion.div>

     
    </section>
  );
}