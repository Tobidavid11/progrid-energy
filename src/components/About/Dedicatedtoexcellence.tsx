import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Sparkles } from "lucide-react";
import "./Dedicatedtoexcellence.css";

interface Step {
  number: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: "Step 01",
    title: "Consultation & Energy Assessment",
    description:
      "We begin by understanding your energy needs, current power challenges, and budget to recommend the most suitable solution.",
  },
  {
    number: "Step 02",
    title: "Site Inspection",
    description:
      "Our team visits your location to evaluate the installation environment, assess energy requirements, and determine the best system configuration.",
  },
  {
    number: "Step 03",
    title: "System Design",
    description:
      "Based on our assessment, we design a customized solar solution with the right inverter, battery, solar panels, and protection devices.",
  },
  {
    number: "Step 04",
    title: "Professional Installation",
    description:
      "Our certified technicians handle the complete installation safely and efficiently while ensuring every component performs at its best.",
  },
  {
    number: "Step 05",
    title: "Testing & Commissioning",
    description:
      "Before handover, we thoroughly test the system, verify performance, and guide you on how to monitor and operate it effectively.",
  },
  {
    number: "Step 06",
    title: "After-Sales Support",
    description:
      "Our relationship doesn't end after installation. We provide maintenance, technical support, and expert assistance whenever you need it.",
  },
];

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const headerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE_OUT },
  },
};

export default function DedicatedToExcellence() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  return (
    <section className="dte-section" ref={sectionRef}>
      <div className="dte-container">
        <motion.div
          className="dte-header"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={headerVariants}
        >
          <div className="dte-marker">
            <Sparkles className="dte-marker-icon" size={18} strokeWidth={2} />
            <span className="dte-dot dte-dot--mid" />
            <span className="dte-dot dte-dot--faint" />
          </div>

          <h2 className="dte-heading">Powering You Every Step of the Way</h2>
          <p className="dte-subheading">
            From consultation to installation and long-term support, we make
            switching to reliable solar energy simple, seamless, and
            stress-free.
          </p>
        </motion.div>

        <motion.div
          className="dte-grid"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={gridVariants}
        >
          {steps.map((step) => (
            <motion.article
              className="dte-card"
              key={step.number}
              variants={cardVariants}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
            >
              <span className="dte-card-number">{step.number}</span>
              <h3 className="dte-card-title">{step.title}</h3>
              <p className="dte-card-desc">{step.description}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}