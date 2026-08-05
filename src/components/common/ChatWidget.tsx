import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send, Mail } from "lucide-react";
import "./ChatWidget.css";

/**
 * === CONFIG — edit these ===
 * WhatsApp number in international format, digits only, no + or spaces.
 * e.g. Nigerian number 080X XXX XXXX -> "234" + the number without the leading 0.
 */
const WHATSAPP_NUMBER = "2347061103583"; // TODO: replace with Progrid's real WhatsApp number
const CONTACT_EMAIL = "info@progridenergy.net";

interface ChatMessage {
  id: number;
  sender: "bot" | "user";
  text: string;
}

/**
 * Lightweight keyword-scored FAQ matcher. Not a real LLM — each entry
 * lists keywords; the entry with the most keyword hits in the user's
 * message wins. Good enough for a focused set of business questions
 * without wiring up an actual AI API. To upgrade later, replace the
 * body of getBotResponse() with a fetch() call to your LLM of choice
 * and keep the same function signature.
 */
const KNOWLEDGE_BASE: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["who", "what is progrid", "about", "company"],
    answer:
      "Progrid Energy is a strategic renewable energy solutions provider committed to delivering clean, sustainable, affordable, and reliable energy — helping homes, businesses, and communities achieve true energy independence, in line with UN Sustainable Development Goal 7.",
  },
  {
    keywords: ["vision"],
    answer:
      "Our vision is to be a leading force in the \u201Cnature-to-nurture\u201D renewable energy revolution.",
  },
  {
    keywords: ["mission"],
    answer:
      "Our mission is to deliver high-quality, customer-oriented, and eco-friendly energy solutions that reduce dependence on fossil fuels while enhancing energy security and productivity.",
  },
  {
    keywords: ["value", "values", "core value", "progrid stand"],
    answer:
      "Our core values spell out our name — PROGRID: Professionalism, Reliability, Optimization, Growth, Resilience, Innovation, and Durability.",
  },
  {
    keywords: ["service", "offer", "provide", "do you do"],
    answer:
      "We offer four core services: Solar & Inverter Solutions (residential, commercial & industrial), Supply & Sales of solar/electrical products and accessories, Consulting & Training (energy audits, system design, workshops), and Intelligent CCTV & Surveillance (4G/WiFi smart cameras, dashcams, spycams).",
  },
  {
    keywords: ["why", "choose", "different", "better", "trust"],
    answer:
      "Five reasons clients choose us: tailored solutions built around your budget and needs, quality-assured warranty-backed products, a team of certified solar engineers and project managers, strong after-sales support, and a proven track record of successful installations.",
  },
  {
    keywords: [
      "install",
      "installation",
      "process",
      "how does it work",
      "steps",
      "how long",
    ],
    answer:
      "Our installation process has 6 steps: (1) Consultation & Energy Assessment, (2) Site Inspection, (3) System Design, (4) Professional Installation, (5) Testing & Commissioning, and (6) After-Sales Support. We guide you through every stage.",
  },
  {
    keywords: ["residential", "home", "house"],
    answer:
      "Yes — we design and install solar & inverter systems for homes, sized to your household's actual energy needs and budget.",
  },
  {
    keywords: ["commercial", "business", "office", "sme"],
    answer:
      "We handle commercial installations for offices, SMEs, and corporate spaces — including energy audits to right-size the system for your operations.",
  },
  {
    keywords: ["industrial", "factory", "farm", "agriculture"],
    answer:
      "We work with industrial and agricultural clients too — including agro-processing farms — on larger-scale solar and power solutions.",
  },
  {
    keywords: ["cctv", "camera", "surveillance", "security"],
    answer:
      "Our Intelligent CCTV & Surveillance service covers 4G and WiFi smart cameras, dashcams, and spy cams — for homes, offices, or sites.",
  },
  {
    keywords: [
      "price",
      "cost",
      "quote",
      "how much",
      "budget",
      "payment",
      "expensive",
      "afford",
      "charges",
      "fee",
    ],
    answer:
      "Pricing depends on your specific energy needs and system size, so we don't quote a flat number here. The best next step is a quick consultation — I can connect you with our team below.",
  },
  {
    keywords: ["warranty", "guarantee", "durable", "quality"],
    answer:
      "We use high-quality, durable, warranty-backed products on every installation — quality assurance is one of our five core commitments to clients.",
  },
  {
    keywords: ["maintenance", "support", "after sales", "monitoring", "fix", "repair"],
    answer:
      "After-sales support is built in — we provide ongoing monitoring, maintenance, and reliable customer service after your system is installed.",
  },
  {
    keywords: ["client", "partner", "who do you work with", "customers"],
    answer:
      "We work with real estate developers, hospitals & health centers, educational institutions, corporate offices & SMEs, and agricultural/agro-processing farms.",
  },
  {
    keywords: ["contact", "reach", "phone", "call", "email", "talk to someone", "human", "agent"],
    answer:
      "You can reach our team directly using the WhatsApp or Email buttons below — happy to connect you now.",
  },
  {
    keywords: ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"],
    answer:
      "Hi there! I'm Pixlr. Progrid Assistant. Ask me about our solar solutions, installation process, services, or anything else about Progrid Energy.",
  },
];

const FALLBACK_ANSWER =
  "I don't have a confident answer for that one. You can reach our team directly using the options below and they'll be happy to help.";

/**
 * Escapes regex special characters in a keyword before building a pattern from it.
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Single-word keywords match on a whole-word boundary, so "install" won't
 * accidentally match inside "installation" (that substring bug is what
 * caused pricing questions to get misrouted to the installation-process
 * answer). Multi-word phrases still use a plain substring check, since a
 * phrase like "how much" already implies its own word boundaries.
 */
function matchesKeyword(input: string, keyword: string): boolean {
  if (keyword.includes(" ")) {
    return input.includes(keyword);
  }
  const pattern = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "i");
  return pattern.test(input);
}

function getBotResponse(userText: string): string {
  const input = userText.toLowerCase();
  let bestScore = 0;
  let bestMatchedLength = 0;
  let bestAnswer = FALLBACK_ANSWER;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    let matchedLength = 0;

    for (const kw of entry.keywords) {
      if (matchesKeyword(input, kw)) {
        // Multi-word phrases are a more specific, more deliberate signal
        // than a single word, so they're weighted higher — this is what
        // makes "how much" outweigh a single stray "cost" or "install" hit.
        const weight = kw.includes(" ") ? kw.split(" ").length : 1;
        score += weight;
        matchedLength += kw.length;
      }
    }

    const isBetter =
      score > bestScore || (score === bestScore && matchedLength > bestMatchedLength);

    if (score > 0 && isBetter) {
      bestScore = score;
      bestMatchedLength = matchedLength;
      bestAnswer = entry.answer;
    }
  }

  return bestAnswer;
}

const GREETING: ChatMessage = {
  id: 0,
  sender: "bot",
  text:
    "Hi! I'm the Progrid Assistant \u26A1 Ask me anything about Progrid Energy.",
};

// Simple inline WhatsApp glyph — lucide-react doesn't ship a brand icon for it.
function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.001 2C6.478 2 2 6.477 2 12c0 1.98.579 3.827 1.578 5.383L2 22l4.755-1.55A9.953 9.953 0 0 0 12.001 22C17.523 22 22 17.523 22 12S17.523 2 12.001 2zm0 18.153a8.13 8.13 0 0 1-4.153-1.137l-.298-.177-2.82.918.925-2.75-.194-.283A8.126 8.126 0 0 1 3.85 12c0-4.494 3.657-8.15 8.151-8.15 4.494 0 8.15 3.656 8.15 8.15 0 4.494-3.656 8.153-8.15 8.153z" />
    </svg>
  );
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: ChatMessage = { id: idRef.current++, sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Small delay so the reply doesn't feel jarring/instant
    setTimeout(() => {
      const reply = getBotResponse(text);
      setMessages((prev) => [
        ...prev,
        { id: idRef.current++, sender: "bot", text: reply },
      ]);
      setIsTyping(false);
    }, 550);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="cw-root">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="cw-panel"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="Progrid Energy chat assistant"
          >
            <div className="cw-header">
              <div>
                <span className="cw-header-title">Progrid Assistant</span>
                <span className="cw-header-subtitle">Ask about installations, pricing & more</span>
              </div>
              <button
                className="cw-close-btn"
                aria-label="Close chat"
                onClick={() => setIsOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="cw-messages" ref={scrollRef}>
              {messages.map((m) => (
                <div key={m.id} className={`cw-bubble cw-bubble--${m.sender}`}>
                  {m.text}
                </div>
              ))}
              {isTyping && (
                <div className="cw-bubble cw-bubble--bot cw-typing">
                  <span />
                  <span />
                  <span />
                </div>
              )}
            </div>

            <div className="cw-contact-row">
              <span className="cw-contact-label">Prefer a person?</span>
              <div className="cw-contact-actions">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                    "Hi, I have a question about Progrid Energy's solutions."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cw-contact-btn cw-contact-btn--whatsapp"
                >
                  <WhatsAppIcon />
                  WhatsApp
                </a>
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                    "Website Enquiry"
                  )}`}
                  className="cw-contact-btn cw-contact-btn--email"
                >
                  <Mail size={16} />
                  Email
                </a>
              </div>
            </div>

            <div className="cw-input-row">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type your question..."
                className="cw-input"
                aria-label="Type your question"
              />
              <button
                className="cw-send-btn"
                onClick={handleSend}
                aria-label="Send message"
                disabled={!input.trim()}
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="cw-fab"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ opacity: 0, rotate: -45 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 45 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ opacity: 0, rotate: 45 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -45 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle size={24} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}