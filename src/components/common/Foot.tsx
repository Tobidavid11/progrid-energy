import { motion } from "framer-motion";
// import { Facebook, Instagram, Twitter } from "lucide-react";
import { FaFacebook, FaInstagram, FaTiktok} from 'react-icons/fa';
import "./Footer.css";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const LINK_COLUMNS = [
  {
    heading: "Links",
    links: [
      { label: "Products", to: "/products" },
      { label: "Services", to: "/#services" },
      { label: "Projects", to: "/#projects" },
      { label: "How It Works", to: "/#how-it-works" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Contact Us", to: "/#contact" },
      { label: "FAQ", to: "/#faq" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms & Conditions", to: "/terms" },
      { label: "Privacy Policy", to: "/privacy" },
    ],
  },
];

const SOCIALS = [
  { icon: FaFacebook, href: "https://www.facebook.com/share/1Hesq1X87U/", label: "Facebook" },
  { icon: FaInstagram, href: "https://www.instagram.com/progrid_energy/", label: "Instagram" },
  // { icon: FaTwitter, href: "https://x.com", label: "X" },
  { icon: FaTiktok, href: "https://www.tiktok.com/@progridenergy", label: "tiktok" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__top">
        <motion.div
          className="footer__intro"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
        >
          <p className="footer__tagline">
            Reliable solar power for homes and businesses, delivered end to end.
          </p>

          <div className="footer__socials">
            {SOCIALS.map(({ icon: Icon, href, label }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="footer__social-btn"
                aria-label={label}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.94 }}
              >
                <Icon size={16} />
              </motion.a>
            ))}
          </div>

          <span className="footer__copyright">
            © Progrid Energy &nbsp;•&nbsp; {year}
          </span>
        </motion.div>

        <div className="footer__columns">
          {LINK_COLUMNS.map((col, colIndex) => (
            <motion.div
              key={col.heading}
              className="footer__column"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.5, delay: colIndex * 0.08, ease: EASE_OUT }}
            >
              <h4 className="footer__column-heading">{col.heading}</h4>
              <ul className="footer__column-links">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.to} className="footer__link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="footer__wordmark-wrap">
        <motion.h2
          className="footer__wordmark"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
        >
          PROGRID ENERGY
        </motion.h2>
      </div>
    </footer>
  );
}