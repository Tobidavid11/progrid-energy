import { useRef } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";

import { FaFacebook, FaInstagram, FaTiktok, FaTwitter } from "react-icons/fa";

import "../../styles/Footer.css";

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
      { label: "Domains", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Guides", href: "#" },
      { label: "Status Page", href: "#" },
      { label: "DNS Lookup", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "About Us", href: "#" },
      { label: "Contact Us", href: "#" },
      { label: "Donate", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & Conditions", href: "#" },
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

  /* Scroll-linked wordmark wipe: reveal tracks scroll position rather
     than firing once, so it "unrolls" as the footer scrolls into view. */
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wordmarkRef,
    offset: ["start 0.9", "start 0.25"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 40,
    mass: 0.5,
  });

  const clipPath = useTransform(
    smoothProgress,
    (v) => `inset(0 ${(1 - v) * 100}% 0 0)`
  );
  const blur = useTransform(smoothProgress, [0, 1], [14, 0]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);
  const wordmarkOpacity = useTransform(smoothProgress, [0, 0.08], [0, 1]);

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
              Develop with your favorite tools. Launch globally, instantly.
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
              © Progrid Energy&nbsp; •&nbsp; MMXXIV — MMXXVI
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

        <div className="footer__wordmark-wrap" ref={wordmarkRef}>
          <motion.h2
            className="footer__wordmark"
            style={{ clipPath, filter, opacity: wordmarkOpacity }}
          >
            PROGRID ENERGY
          </motion.h2>
        </div>
      </div>
    </footer>
  );
}