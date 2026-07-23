import { useState } from "react";
import type { FormEvent } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import "./ContactForm.css";

export interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface ContactFormProps {
  heading?: string;
  description?: string;
  /** Called when the form is submitted. If omitted, submission is simulated locally. */
  onSubmit?: (data: ContactFormData) => Promise<void> | void;
}

type Status = "idle" | "submitting" | "success" | "error";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};

const emptyForm: ContactFormData = {
  fullName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export default function ContactForm({
  heading = "Send Us a Message",
  description = "Have questions about our products or services? Fill out the form below and a member of our team will get back to you as soon as possible.",
  onSubmit,
}: ContactFormProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const [form, setForm] = useState<ContactFormData>(emptyForm);
  const [status, setStatus] = useState<Status>("idle");

  const handleChange =
    (field: keyof ContactFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      if (onSubmit) {
        await onSubmit(form);
      } else {
        // No handler wired up yet — simulate the round trip so the UI
        // states (submitting/success) are visible during development.
        await new Promise((resolve) => setTimeout(resolve, 900));
      }
      setStatus("success");
      setForm(emptyForm);
    } catch {
      setStatus("error");
    }
  };

  const isSubmitting = status === "submitting";

  return (
    <div className="contact-form-card" ref={sectionRef}>
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <motion.h2 className="contact-form-heading" variants={itemVariants}>
          {heading}
        </motion.h2>
        <motion.p className="contact-form-desc" variants={itemVariants}>
          {description}
        </motion.p>

        <motion.form
          className="contact-form"
          variants={itemVariants}
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="contact-form-row">
            <div className="contact-form-field">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                value={form.fullName}
                onChange={handleChange("fullName")}
                disabled={isSubmitting}
              />
            </div>

            <div className="contact-form-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange("email")}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="contact-form-row">
            <div className="contact-form-field">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={handleChange("phone")}
                disabled={isSubmitting}
              />
            </div>

            <div className="contact-form-field">
              <label htmlFor="subject">Subject</label>
              <input
                id="subject"
                name="subject"
                type="text"
                required
                value={form.subject}
                onChange={handleChange("subject")}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="contact-form-field">
            <label htmlFor="message">How can we help you?</label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              value={form.message}
              onChange={handleChange("message")}
              disabled={isSubmitting}
            />
          </div>

          <div className="contact-form-footer">
            <motion.button
              type="submit"
              className="contact-form-submit"
              disabled={isSubmitting}
              whileHover={!isSubmitting ? { scale: 1.03 } : undefined}
              whileTap={!isSubmitting ? { scale: 0.97 } : undefined}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="contact-form-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send Message
                  <Send size={16} strokeWidth={2.2} />
                </>
              )}
            </motion.button>

            {status === "success" && (
              <motion.span
                className="contact-form-status contact-form-status--success"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CheckCircle2 size={16} />
                Message sent — we'll be in touch soon.
              </motion.span>
            )}

            {status === "error" && (
              <motion.span
                className="contact-form-status contact-form-status--error"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Something went wrong. Please try again.
              </motion.span>
            )}
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
}