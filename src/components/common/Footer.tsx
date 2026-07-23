import { useRef } from "react";
import { motion, useInView } from "framer-motion";

import { FaFacebook, FaInstagram, FaTiktok, FaTwitter } from "react-icons/fa";

import "./Footer.css";

/* ---------- Data ---------- */

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const columns: FooterColumn[] = [
  {
    title: "Links",
    links: [
      { label: "Home", href: "#" },
      { label: "About", href: "#" },
      { label: "Products", href: "#" },
      { label: "Services", href: "#" },
      { label: "FAQs", href: "#" },
    ],
  },
  {
    title: "Our Services",
    links: [
      { label: "Solar Installation", href: "#" },
      { label: "CCTV Installation", href: "#" },
      { label: "Energy Consultation", href: "#" },
      { label: "Electrical Services", href: "#" },
      { label: "Maintenance & Support", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact Us", href: "#" },
      { label: "Request a Quote", href: "#" },
      { label: "Warranty Information", href: "#" },
      { label: "Installation Guide", href: "#" },
      { label: "Privacy Policy", href: "#" },
    ],
  },
];

const socials = [
  { icon: FaFacebook, label: "Facebook", href: "#" },
  { icon: FaInstagram, label: "Instagram", href: "#" },
  { icon: FaTiktok, label: "TikTok", href: "#" },
  { icon: FaTwitter, label: "X", href: "#" },
];

/* ---------- Animation variants ---------- */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const isInView = useInView(footerRef, { once: true, amount: 0.15 });

  return (
    <footer className="footer" ref={footerRef}>
      <div className="footer__container">
        <motion.div
          className="footer__top"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.div className="footer__left" variants={itemVariants}>
            <p className="footer__tagline">
Reliable solar solutions for homes, businesses, and industries across Nigeria.
            </p>

            <div className="footer__socials">
              {socials.map(({ icon: Icon, label, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="footer__social-btn"
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 350, damping: 18 }}
                >
                  <Icon size={16} />
                </motion.a>
              ))}
            </div>

            <span className="footer__copyright">
          © 2024–2026 Progrid Energy &nbsp; •&nbsp;  All Rights Reserved.
            </span>
          </motion.div>

          <div className="footer__columns">
            {columns.map((col) => (
              <motion.div
                className="footer__column"
                key={col.title}
                variants={itemVariants}
              >
                <h4 className="footer__column-heading">{col.title}</h4>
                <div className="footer__column-links">
                  {col.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="footer__link"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="footer__wordmark-wrap">
          {/* <motion.h2
            className="footer__wordmark"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <span>PROGRID</span>
            <span>ENERGY</span>
          </motion.h2> */}
        </div>
      </div>
    </footer>
  );
}