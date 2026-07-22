import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import heroImg from "../../assets/hero-image.svg";
// import avatar1 from "../../assets/avatars/avatar-1.jpg";
// import avatar2 from "../../assets/avatars/avatar-2.jpg";
// import avatar3 from "../../assets/avatars/avatar-3.jpg";
import "./Hero.css";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero__grid">
        <motion.div
          className="hero__content"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
        >
          <h1 className="hero__title">
            Power With
            <br />
            Confidence.
          </h1>

          <p className="hero__subtitle">
            Reliable solar energy solutions designed to reduce electricity
            costs, eliminate power interruptions, and keep your home or
            business running every day.
          </p>

          <div className="hero__actions">
            <motion.a
              href="/products"
              className="btn btn-primary"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Explore Products
            </motion.a>
            <motion.a
              href="/#contact"
              className="btn btn-ghost"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Request a Quote
            </motion.a>
          </div>
        </motion.div>

        <motion.div
          className="hero__visual"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.15 }}
        >
          <div className="hero__blob">
            <img src={heroImg} alt="Solar panels installed on a residential roof" />
          </div>

          
        </motion.div>
      </div>
    </section>
  );
}