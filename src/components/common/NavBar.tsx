import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import logo from "../../assets/Logo.svg";
import "../../styles/navbar.css";
import CartButton from "../Cart/CartButton";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Products", to: "/products" },
];

// Services + Portfolio, merged into one dropdown. Rename the label here
// if "Solutions" isn't the word you want.
const DROPDOWN = {
  label: "Solutions",
  items: [
    { label: "Services", to: "/services" },
    { label: "Portfolio", to: "/portfolio" },
  ],
};

const BLOG_LINK = { label: "Blogs", to: "/blogs" };

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const dropdownIsActive = DROPDOWN.items.some(
    (item) => location.pathname === item.to
  );

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

  // Close the dropdown on route change, and when the mobile menu closes
  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) setDropdownOpen(false);
  }, [open]);

  // Close the desktop dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const closeAll = () => {
    setOpen(false);
    setDropdownOpen(false);
  };

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
            <Link to="/" className="navbar__logo" onClick={closeAll}>
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
                    onClick={closeAll}
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}

              {/* Services + Portfolio dropdown */}
              <motion.div
                ref={dropdownRef}
                className={`navbar__dropdown ${dropdownOpen ? "navbar__dropdown--open" : ""}`}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 + LINKS.length * 0.05, duration: 0.35 }}
                onMouseEnter={() => window.innerWidth > 860 && setDropdownOpen(true)}
                onMouseLeave={() => window.innerWidth > 860 && setDropdownOpen(false)}
              >
                <button
                  type="button"
                  className={`navbar__link navbar__dropdown-trigger ${dropdownIsActive ? "active" : ""}`}
                  aria-expanded={dropdownOpen}
                  onClick={() => setDropdownOpen((v) => !v)}
                >
                  {DROPDOWN.label}
                  <ChevronDown size={14} className="navbar__dropdown-chevron" />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      className="navbar__dropdown-menu"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {DROPDOWN.items.map((item) => (
                        <NavLink
                          key={item.label}
                          to={item.to}
                          className={({ isActive }) =>
                            `navbar__dropdown-item ${isActive ? "active" : ""}`
                          }
                          onClick={closeAll}
                        >
                          {item.label}
                        </NavLink>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 + (LINKS.length + 1) * 0.05, duration: 0.35 }}
              >
                <NavLink
                  to={BLOG_LINK.to}
                  className={({ isActive }) =>
                    `navbar__link ${isActive ? "active" : ""}`
                  }
                  onClick={closeAll}
                >
                  {BLOG_LINK.label}
                </NavLink>
              </motion.div>

              <motion.a
                href="/contact"
                className="navbar__link btn-mobile"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                Contact Us
              </motion.a>
            </nav>

            <div className="navbar__actions">
              <CartButton />
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
            onClick={closeAll}
          />
        )}
      </AnimatePresence>
    </>
  );
}