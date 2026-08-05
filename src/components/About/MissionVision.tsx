import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Eye, Target } from "lucide-react";
import "./MissionVision.css";

interface CoreValue {
  letter: string;
  label: string;
}

const CORE_VALUES: CoreValue[] = [
  { letter: "P", label: "Professionalism" },
  { letter: "R", label: "Reliability" },
  { letter: "O", label: "Optimization" },
  { letter: "G", label: "Growth" },
  { letter: "R", label: "Resilience" },
  { letter: "I", label: "Innovation" },
  { letter: "D", label: "Durability" },
];

const INTRO =
  "Progrid is a strategic renewable energy solutions provider, committed to delivering clean, sustainable, affordable, and reliable energy — helping homes, businesses, and communities achieve true energy independence, in step with UN Sustainable Development Goal 7 (Affordable and Clean Energy).";

const VISION_TEXT =
  "To be a leading force in the \u201Cnature-to-nurture\u201D renewable energy revolution.";

const MISSION_TEXT =
  "To deliver high-quality, customer-oriented, and eco-friendly energy solutions that reduce dependence on fossil fuels while enhancing energy security and productivity.";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const headerVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

const cardGridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.14, delayChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

const valuesVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.45 },
  },
};

const valueItemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_OUT },
  },
};

export default function MissionVision() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  return (
    <section className="mv-section" ref={sectionRef}>
      <div className="container">
        <motion.div
          className="mv-header"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={headerVariants}
        >
          <h2 className="mv-heading">Vision, Mission &amp; Values</h2>
          <p className="mv-intro">{INTRO}</p>
        </motion.div>

        <motion.div
          className="mv-cards"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={cardGridVariants}
        >
          <motion.div className="mv-card" variants={cardVariants}>
            <div className="mv-card-icon">
              <Eye size={20} strokeWidth={2} />
            </div>
            <span className="mv-card-label">Vision</span>
            <p className="mv-card-text">{VISION_TEXT}</p>
          </motion.div>

          <motion.div className="mv-card" variants={cardVariants}>
            <div className="mv-card-icon">
              <Target size={20} strokeWidth={2} />
            </div>
            <span className="mv-card-label">Mission</span>
            <p className="mv-card-text">{MISSION_TEXT}</p>
          </motion.div>
        </motion.div>

        <div className="mv-values">
          <span className="mv-values-label">Our Core Values</span>

          <motion.div
            className="mv-values-row"
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={valuesVariants}
          >
            {CORE_VALUES.map((v, i) => (
              <motion.div className="mv-value-col" key={i} variants={valueItemVariants}>
                <span className="mv-value-letter">{v.letter}</span>
                <span className="mv-value-tick" aria-hidden="true" />
                <span className="mv-value-label">{v.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}