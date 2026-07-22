import { motion } from "framer-motion";
// import type {Variants} from "framer-motion"
import solarInstall from "../../assets/ServiceIcon1.svg";
import energyConsult from "../../assets/ServiceIcon2.svg";
import cctv from "../../assets/ServiceIcon3.svg";
import maintenance from "../../assets/ServiceIcon4.svg";
import electrical from "../../assets/ServiceIcon5.svg";
import "./Services.css";

type Service = {
  title: string;
  description: string;
  img: string;
  size: "lg" | "sm";
};

const SERVICES: Service[] = [
  {
    title: "Solar Installation",
    description: "Residential and commercial solar systems designed for maximum efficiency.",
    img: solarInstall,
    size: "lg",
  },
  {
    title: "Energy Consultation",
    description: "Professional energy assessment and system sizing for every project.",
    img: energyConsult,
    size: "lg",
  },
  {
    title: "CCTV & Security",
    description: "Solar-powered surveillance systems for homes, businesses, and remote locations.",
    img: cctv,
    size: "sm",
  },
  {
    title: "Maintenance & Support",
    description: "Routine servicing, troubleshooting, and technical support for installed systems.",
    img: maintenance,
    size: "sm",
  },
  {
    title: "Electrical Services",
    description: "Professional wiring, panel installation, and electrical upgrades.",
    img: electrical,
    size: "sm",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Services() {
  return (
    <section className="services" id="services">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="services__header"
        >
          <h2 className="services__title">Everything You Need for Reliable Energy</h2>
          <p className="services__subtitle">
            From consultation to installation and maintenance, we provide
            complete energy solutions for homes, offices, and industries.
          </p>
        </motion.div>

        <div className="services__bento">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.title}
              className={`services__card services__card--${service.size}`}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-10% 0px" }}
              whileHover="hover"
            >
              <motion.div
                className="services__card-art"
                variants={{ hover: { y: -6, scale: 1.03 } }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <img src={service.img} alt="" aria-hidden="true" />
              </motion.div>

              <div className="services__card-body">
                <h3 className="services__card-title">{service.title}</h3>
                <p className="services__card-desc">{service.description}</p>
              </div>

              <motion.span
                className="services__card-glow"
                variants={{ hover: { opacity: 1 } }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
