import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import "./DedicatedToChange.css";
import image from "../../assets/solar-farm.jpg"

interface Stat {
  value: string;
  label: string;
}

interface MissionItem {
  title: string;
  description: string;
}

interface DedicatedToChangeProps {
  /** Path or imported URL of the photo used in the left card. Pass this in from the parent. */
  backgroundImage?: string;
  eyebrow?: string;
  heading?: string;
  photoHeading?: string;
  photochild?: string;
  photoCtaLabel?: string;
  statsLabel?: string;
  stats?: Stat[];
  missionItems?: MissionItem[];
}

const defaultStats: Stat[] = [
  { value: "500+", label: "Solar Installations" },
  { value: "1000+", label: "Customers Served" },
  { value: "5MW+", label: "Solar Capacity Installed" },
  


];

const defaultMissionItems: MissionItem[] = [
  {
    title: "Our Mission",
    description: "To provide sustainable energy solutions that improve lives through reliable technology and exceptional service.",
  },
  {
    title: "Our Vision",
    description: "To become one of Nigeria's most trusted providers of clean energy and smart power solutions.",
  },
  {
    title: "Our Values",
    description: "Quality. Integrity. Innovation. Reliability. Customer Satisfaction.",
  },
  {
    title: "A Brighter Tomorrow",
    description:
      "Spreading kindness, fueling dreams, shaping a better world.",
  },
];

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const headerVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

const missionRowVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.35 },
  },
};

const missionItemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};

export default function DedicatedToChange({
  backgroundImage = image ,
  eyebrow = "About",
  heading = "Dedicated to Change",
  photoHeading = "Reliable Energy Solutions",
  photochild = "We design and install solar systems that deliver dependable power every day, helping homes and businesses stay productive without interruption.",
  photoCtaLabel = "Contact Us",
  statsLabel = "Actions Template Results",
  stats = defaultStats,
  missionItems = defaultMissionItems,
}: DedicatedToChangeProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  return (
    <section className="dtc-section" ref={sectionRef}>
      <div className="container">
        <motion.div
          className="dtc-header"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={headerVariants}
        >
          <span className="dtc-eyebrow">{eyebrow}</span>
          <h2 className="dtc-heading">{heading}</h2>
        </motion.div>

        <motion.div
          className="dtc-grid"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={gridVariants}
        >
          <motion.div
            className="dtc-photo-card"
            variants={cardVariants}
            style={{ backgroundImage: `url(${backgroundImage})` }}
          >
            <div className="dtc-photo-overlay" />
            <div className="dtc-photo-content">
              <h3 className="dtc-photo-heading h">{photoHeading}</h3>
              <h3 className="dtc-photo-heading p">{photochild}</h3>
              <a href="/contact-us" className="dtc-photo-cta">
                {photoCtaLabel}
                <ArrowUpRight size={16} strokeWidth={2.2} />
              </a>
            </div>
          </motion.div>

          <motion.div className="dtc-stats-card" variants={cardVariants}>
            <span className="dtc-stats-label">{statsLabel}</span>
            <div className="dtc-stats-list">
              {stats.map((stat) => (
                <div className="dtc-stat" key={stat.label}>
                  <span className="dtc-stat-value">{stat.value}</span>
                  <span className="dtc-stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="dtc-mission-row"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={missionRowVariants}
        >
          {missionItems.map((item) => (
            <motion.div
              className="dtc-mission-item"
              key={item.title}
              variants={missionItemVariants}
            >
              <h4 className="dtc-mission-title">{item.title}</h4>
              <p className="dtc-mission-desc">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}