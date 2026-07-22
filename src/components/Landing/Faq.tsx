import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import "./Faq.css";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

type FaqItem = {
  question: string;
  answer: string;
};

const FAQS: FaqItem[] = [
  {
    question: "How much can I save by switching to solar?",
    answer:
"Your savings depend on your electricity usage and the size of your solar system. Most customers significantly reduce or even eliminate their monthly electricity bills while protecting themselves from rising energy costs." ,
 },
  {
    question: "How long do solar batteries last?",
    answer:
      "Our lithium batteries typically last 8–15 years, depending on usage and maintenance. They are designed to provide reliable backup power for thousands of charging cycles.",
  },
  {
    question: "What size solar system do I need?",
    answer:
      "The right system depends on the appliances you want to power and your daily energy consumption. Our team will assess your needs and recommend the most suitable package for your home or business.",
  },
  {
    question: "Can solar power my entire home?",
    answer:
      "Yes. With the right solar and battery capacity, your entire home can run on solar power. We offer systems ranging from small home setups to complete whole-house and commercial solutions.",
  },
];

function FaqRow({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`faq__row ${isOpen ? "is-open" : ""}`}>
      <button
        type="button"
        className="faq__row-header"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="faq__question">{item.question}</span>
        <motion.span
          className="faq__icon"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            className="faq__answer-wrap"
          >
            <p className="faq__answer">{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="faq" id="faq">
      <div className="container faq__grid">
        <div className="faq__left">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
          >
            <span className="eyebrow faq__eyebrow">Solar & energy answers</span>
            <h2 className="faq__title">
              Frequently asked
              <br />
              questions
            </h2>
          </motion.div>

          <motion.div
            className="faq__cta-card"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.5, delay: 0.15, ease: EASE_OUT }}
          >
            <h3 className="faq__cta-title">Still have a question?</h3>
            <p className="faq__cta-desc">
              Can't find the answer to your question? Send us an email and
              we'll get back to you as soon as possible!
            </p>
            <motion.a
              href="/#contact"
              className="btn btn-primary faq__cta-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Send email
            </motion.a>
          </motion.div>
        </div>

        <div className="faq__right">
          {FAQS.map((item, i) => (
            <motion.div
              key={item.question}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: EASE_OUT }}
            >
              <FaqRow
                item={item}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}