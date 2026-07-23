import { motion } from "framer-motion";
// import type {varients} from "framer-motion"
import "./HowItWorks.css";

type Step = {
  number: string;
  title: string;
  description: string;
  cx: number;
  cy: number;
  labelSide: "top" | "bottom";
};

const STEPS: Step[] = [
  {
    number: "01",
    title: "Consultation",
    description: "We understand your energy needs and recommend the right solution.",
    cx: 150,
    cy: 400,
    labelSide: "bottom",
  },
  {
    number: "02",
    title: "System Design",
    description: "Our engineers design a system tailored to your home or business.",
    cx: 430,
    cy: 300,
    labelSide: "bottom",
  },
  {
    number: "03",
    title: "Installation",
    description: "Professional installation carried out by experienced technicians.",
    cx: 710,
    cy: 150,
    labelSide: "bottom",
  },
  {
    number: "04",
    title: "After-Sales Support",
    description: "Ongoing maintenance and technical support whenever you need us.",
    cx: 970,
    cy: 70,
    labelSide: "bottom",
  },
];

// Wavy ascending path threading through each step's (cx, cy),
// with short tails extending before the first and after the last point.
const PATH_D = `
  M -20 340
  C 40 380, 90 420, 150 400
  C 220 375, 260 300, 430 300
  C 560 300, 610 150, 710 150
  C 800 150, 870 70, 970 70
  C 1040 70, 1080 55, 1160 45
`;

const pathVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  show: {
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: 1.6, ease: [0.16, 1, 0.3, 1]as const }, opacity: { duration: 0.3 } },
  },
};

const dotVariants = {
  hidden: { scale: 0, opacity: 0 },
  show: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: { delay: 0.3 + i * 0.35, duration: 0.4, ease: [0.16, 1, 0.3, 1]as const },
  }),
};

const labelVariants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.45 + i * 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1]as const },
  }),
};

export default function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="how-it-works__header"
        >
          <h2 className="how-it-works__title">From Consultation to Installation</h2>
          <p className="how-it-works__subtitle">
            We make switching to solar simple with a straightforward process
            focused on quality and long-term performance.
          </p>
        </motion.div>

        <div className="how-it-works__chart">
          <motion.svg
            className="how-it-works__svg"
            viewBox="0 0 1160 500"
            fill="none"
            preserveAspectRatio="xMidYMid meet"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-15% 0px" }}
          >
            <motion.path
              d={PATH_D}
              stroke="var(--accent-current)"
              strokeWidth="4"
              strokeLinecap="round"
              variants={pathVariants}
            />

            {STEPS.map((step, i) => (
              <motion.circle
                key={step.number}
                cx={step.cx}
                cy={step.cy}
                r="12"
                className="how-it-works__dot"
                custom={i}
                variants={dotVariants}
              />
            ))}
          </motion.svg>

          <div className="how-it-works__labels">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                className="how-it-works__label"
                style={{
                  left: `${(step.cx / 1160) * 100}%`,
                  top: `${(step.cy / 500) * 100}%`,
                }}
                custom={i}
                variants={labelVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-15% 0px" }}
              >
                <span className="how-it-works__label-number">{step.number}</span>
                <h3 className="how-it-works__label-title">{step.title}</h3>
                <p className="how-it-works__label-desc">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}