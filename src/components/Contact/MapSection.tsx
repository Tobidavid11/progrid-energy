import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MapPin, ArrowUpRight } from "lucide-react";
import "./MapSection.css";

const OFFICE_NAME = "Progrid Energy";
const OFFICE_ADDRESS =
  "Victory House, Opposite Triple Value Pharmacy, Enugada, Lafenwa Rd, Abeokuta, Ogun State";

const HEADING = "Visit Our Office";
const DESCRIPTION =
  "Our office is conveniently located in Abeokuta, Ogun State. Stop by to discuss your energy needs, explore our products, or speak with our experts in person.";

const encodedAddress = encodeURIComponent(`${OFFICE_ADDRESS}, Nigeria`);
const MAP_EMBED_SRC = `https://www.google.com/maps?q=${encodedAddress}&output=embed`;
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const headerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

const mapVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT, delay: 0.15 },
  },
};

export default function MapSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  return (
    <section className="map-section" ref={sectionRef}>
      <div className="container">
        <motion.div
          className="map-header"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={headerVariants}
        >
          <h2 className="map-heading">{HEADING}</h2>
          <p className="map-desc">{DESCRIPTION}</p>
        </motion.div>
      </div>

      <motion.div
        className="map-frame-wrap"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={mapVariants}
      >
        <iframe
          className="map-iframe"
          src={MAP_EMBED_SRC}
          title={`Map showing the location of ${OFFICE_NAME}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />

        <div className="map-info-card">
          <div className="map-info-top">
            <span className="map-info-icon">
              <MapPin size={16} strokeWidth={2.2} />
            </span>
            <span className="map-info-name">{OFFICE_NAME}</span>
          </div>
          <p className="map-info-address">{OFFICE_ADDRESS}</p>
          <a
            href={DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="map-info-directions"
          >
            Get Directions
            <ArrowUpRight size={14} strokeWidth={2.2} />
          </a>
        </div>
      </motion.div>
    </section>
  );
}