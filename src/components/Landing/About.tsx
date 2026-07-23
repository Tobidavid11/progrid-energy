import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
// import type {Variants} from "framer-motion"
import roofImg from "../../assets/about-img.svg";
import "./About.css";

type Stat = {
  value: number;
  suffix: string;
  label: string;
  variant: "yellow" | "gray" | "orange";
};

const STATS: Stat[] = [
  { value: 98, suffix: "%", label: "Customer Satisfaction", variant: "yellow" },
  { value: 500, suffix: "+", label: "Solar Installations", variant: "gray" },
  { value: 24, suffix: "/7", label: "Technical Support", variant: "gray" },
  { value: 10, suffix: "+ Years", label: "Industry Experience", variant: "orange" },
];

function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <span ref={ref} className="about__stat-value">
      {display}
      {suffix}
    </span>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1]as const },
  }),
};

export default function About() {
  return (
    <section className="about" id="about">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="about__header"
        >
          <h2 className="about__title">Why Choose Progrid Energy?</h2>
          <p className="about__subtitle">
            More than just supplying solar products — we design reliable
            energy systems tailored to your needs.
          </p>
        </motion.div>

        <div className="about__grid">
          <div className="about__stats">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                className={`about__card about__card--${stat.variant}`}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-10% 0px" }}
                whileHover={{ y: -4 }}
              >
                <CountUp value={stat.value} suffix={stat.suffix} />
                <div className="about__card-footer">
                  <span className="about__card-label">{stat.label}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="about__image"
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <img src={roofImg} alt="Technicians installing solar panels on a roof" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}