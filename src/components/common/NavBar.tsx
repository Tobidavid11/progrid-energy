import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import logo from "../../assets/Logo.svg";
import "../../styles/navbar.css";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Products", to: "/products" },

  // { label: "FAQ", to: "/#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`navbar ${scrolled ? "navbar--scrolled" : ""} ${open ? "navbar--open" : ""}`}
      >
        <div className="container navbar__outer">
          <div className="navbar__inner">
            <Link to="/" className="navbar__logo" onClick={() => setOpen(false)}>
              <img src={logo} alt="Progrid Energy" className="navbar__logo-img" />
            </Link>

            <nav className={`navbar__links ${open ? "navbar__links--open" : ""}`}>
              {LINKS.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.05, duration: 0.35 }}
                >
                  <NavLink
                    to={link.to}
                    end={link.to === "/"}
                    className={({ isActive }) =>
                      `navbar__link ${isActive ? "active" : ""}`
                    }
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}
               <motion.a
                href="/contact"
                className="btn btn-primary navbar__cta btn-mobile"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                Contact Us
              </motion.a>
            </nav>

            <div className="navbar__actions">
              <motion.a
                href="/contact"
                className="btn btn-primary navbar__cta btn-desk"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                Contact Us
              </motion.a>

              <button
                className={`navbar__toggle ${open ? "navbar__toggle--open" : ""}`}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
              >
                <motion.span
                  animate={
                    open
                      ? { rotate: 45, y: 0 }
                      : { rotate: 0, y: -4 }
                  }
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                />
                <motion.span
                  animate={
                    open
                      ? { rotate: -45, y: 0 }
                      : { rotate: 0, y: 4 }
                  }
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Blurred backdrop behind the open mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="navbar__backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}