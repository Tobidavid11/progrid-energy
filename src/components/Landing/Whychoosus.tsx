import { useRef } from "react";
import { motion, useInView, } from "framer-motion";
import type {Variants} from "framer-motion"
import { Gem, Award, Component, Headphones, ArrowRight } from "lucide-react";
import "./Whychoosus .css";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

const leftFeatures: Feature[] = [
  {
    icon: Gem,
    title: "Premium Products",
    description:
      "We supply only tested, high-quality energy products from trusted manufacturers.",
  },
  {
    icon: Award,
    title: "Expert Installation",
    description:
      "Every installation is handled by experienced professionals following industry standards.",
  },
];

const rightFeatures: Feature[] = [
  {
    icon: Component,
    title: "Tailored Solutions",
    description:
      "Every customer receives a system designed around their energy needs and budget.",
  },
  {
    icon: Headphones,
    title: "Reliable Support",
    description:
      "We're here before, during, and after installation to ensure lasting performance.",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const headingVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

function FeatureItem({ icon: Icon, title, description }: Feature) {
  return (
    <motion.div className="wcu-feature" variants={itemVariants}>
      <motion.div
        className="wcu-icon-wrap"
        whileHover={{ scale: 1.08, rotate: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <Icon className="wcu-icon" strokeWidth={1.75} />
      </motion.div>
      <div className="wcu-feature-text">
        <h3 className="wcu-feature-title">{title}</h3>
        <p className="wcu-feature-desc">{description}</p>
      </div>
    </motion.div>
  );
}

export default function WhyChoosUs() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section className="wcu-section" ref={sectionRef}>
      <div className="wcu-container">
        {/* Left column */}
        <motion.div
          className="wcu-left"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={headingVariants}
        >
          <h2 className="wcu-heading">
            The Progrid Energy
            <br />
            Difference
          </h2>
          <p className="wcu-subheading">Why Customers Trust Progrid</p>

          <div className="wcu-cta-row">
            <motion.a
              href="#contact"
              className="wcu-cta"
              whileHover="hover"
              initial="rest"
              animate="rest"
            >
              Contact Us
              <motion.span
                className="wcu-cta-arrow"
                variants={{
                  rest: { x: 0 },
                  hover: { x: 4 },
                }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <ArrowRight size={16} strokeWidth={2} />
              </motion.span>
            </motion.a>

            <motion.a
              href="#quote"
              className="wcu-cta"
              whileHover="hover"
              initial="rest"
              animate="rest"
            >
              Book a quote
              <motion.span
                className="wcu-cta-arrow"
                variants={{
                  rest: { x: 0 },
                  hover: { x: 4 },
                }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <ArrowRight size={16} strokeWidth={2} />
              </motion.span>
            </motion.a>
          </div>
        </motion.div>

        {/* Middle column */}
        <motion.div
          className="wcu-col wcu-col-middle"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {leftFeatures.map((feature) => (
            <FeatureItem key={feature.title} {...feature} />
          ))}
        </motion.div>

        {/* Divider */}
        <div className="wcu-divider" aria-hidden="true" />

        {/* Right column */}
        <motion.div
          className="wcu-col wcu-col-right"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {rightFeatures.map((feature) => (
            <FeatureItem key={feature.title} {...feature} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}