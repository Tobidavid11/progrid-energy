import { useEffect, useState } from "react";
import "./PrivacyPolicy.css";

/**
 * ⚠️ LEGAL DISCLAIMER FOR THE DEVELOPER (remove this comment once addressed):
 * This is a comprehensive TEMPLATE, not legal advice. Before publishing this
 * page live, have it reviewed by a Nigerian lawyer familiar with the
 * Nigeria Data Protection Act (NDPA) 2023 and NDPC compliance requirements.
 * Pay particular attention to:
 *   - Whether Progrid needs to register with the NDPC as a data controller
 *     (thresholds depend on data volume/sensitivity)
 *   - Accuracy of every third-party processor listed (Paystack, Resend,
 *     Supabase, Vercel, Hostinger) — confirm nothing has changed
 *   - The Warranty section — consider splitting into a separate
 *     Terms of Sale / Warranty page rather than merging with privacy policy
 *   - Update LAST_UPDATED below whenever this content changes
 */

const LAST_UPDATED = "August 2026"; // TODO: keep this current

interface Section {
  id: string;
  title: string;
}

const SECTIONS: Section[] = [
  { id: "introduction", title: "1. Introduction" },
  { id: "information-we-collect", title: "2. Information We Collect" },
  { id: "how-we-use-it", title: "3. How We Use Your Information" },
  { id: "third-parties", title: "4. Third-Party Services We Use" },
  { id: "cookies", title: "5. Cookies & Tracking" },
  { id: "data-security", title: "6. Data Security" },
  { id: "data-retention", title: "7. Data Retention" },
  { id: "your-rights", title: "8. Your Rights" },
  { id: "warranty", title: "9. Warranty & After-Sales Support" },
  { id: "childrens-privacy", title: "10. Children's Privacy" },
  { id: "changes", title: "11. Changes to This Policy" },
  { id: "contact", title: "12. Contact Us" },
];

export default function PrivacyPolicy() {
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="pp-section">
      <div className="container">
        <div className="pp-header">
          {/* <span className="eyebrow">Legal</span> */}
          <h1 className="pp-title">Privacy Policy</h1>
          <p className="pp-updated">Last updated: {LAST_UPDATED}</p>
          <p className="pp-intro-note">
            Please read this policy carefully. It explains what information
            Progrid Energy collects, how we use and protect it, and what
            rights you have — including details on payment processing,
            third-party services, and product warranty support.
          </p>
        </div>

        <div className="pp-layout">
          <nav className="pp-toc" aria-label="Table of contents">
            <span className="pp-toc-label">On this page</span>
            <ul className="pp-toc-list">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={`pp-toc-link ${
                      activeId === s.id ? "pp-toc-link--active" : ""
                    }`}
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="pp-content">
            <section id="introduction" className="pp-block">
              <h2>1. Introduction</h2>
              <p>
                Progrid Energy ("we," "us," "our") provides solar, inverter,
                surveillance, and related energy solutions through our
                website and services. This Privacy Policy describes how we
                collect, use, disclose, and safeguard your information when
                you visit our website, purchase products, request a
                consultation, or otherwise interact with us. By using our
                website or services, you agree to the practices described
                in this policy.
              </p>
            </section>

            <section id="information-we-collect" className="pp-block">
              <h2>2. Information We Collect</h2>
              <p>We may collect the following categories of information:</p>
              <ul>
                <li>
                  <strong>Contact & identity information</strong> — name,
                  email address, phone number, delivery/installation
                  address, provided when you place an order, book a
                  consultation, or contact us.
                </li>
                <li>
                  <strong>Order & transaction information</strong> — items
                  purchased, order value, order status, and delivery
                  details. We do <strong>not</strong> collect or store your
                  full card number, CVV, or bank login details — these are
                  handled directly by our payment processor, Paystack (see
                  Section 4).
                </li>
                <li>
                  <strong>Communication data</strong> — messages you send
                  through our website chat assistant, WhatsApp, or email,
                  including any details you share to get help with an order
                  or installation.
                </li>
                <li>
                  <strong>Technical data</strong> — IP address, browser
                  type, device information, and pages visited, collected
                  automatically through standard web technologies.
                </li>
                <li>
                  <strong>Site installation details</strong> — where
                  relevant to a solar or CCTV installation, information
                  about your property, energy consumption, or site layout
                  that you share during a consultation or site inspection.
                </li>
              </ul>
            </section>

            <section id="how-we-use-it" className="pp-block">
              <h2>3. How We Use Your Information</h2>
              <ul>
                <li>To process and fulfil your orders, including sending order confirmations and receipts.</li>
                <li>To schedule and carry out site inspections, installations, and after-sales support.</li>
                <li>To respond to enquiries made through our chat assistant, WhatsApp, or email.</li>
                <li>To send important updates about your order, installation, or account.</li>
                <li>To improve our website, products, and services.</li>
                <li>To detect, investigate, and prevent fraud or unauthorized transactions.</li>
                <li>To comply with legal, tax, and regulatory obligations.</li>
              </ul>
              <p>
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section id="third-parties" className="pp-block">
              <h2>4. Third-Party Services We Use</h2>
              <p>
                We rely on a small number of trusted service providers to
                operate our website and business. Each processes data on
                our behalf under their own privacy and security terms:
              </p>
              <ul>
                <li>
                  <strong>Paystack</strong> — processes all payments
                  securely. Paystack, not Progrid Energy, receives and
                  stores your full card/payment details.
                </li>
                {/* <li>
                  <strong>Supabase</strong> — hosts our order and account
                  database and backend infrastructure.
                </li> */}
                <li>
                  <strong>Resend</strong> — delivers transactional emails
                  such as order receipts and confirmations.
                </li>
                {/* <li>
                  <strong>Vercel</strong> — hosts our website.
                </li> */}
                <li>
                  <strong>Hostinger</strong> — hosts our business email
                  (e.g. info@progridenergy.net).
                </li>
              </ul>
              <p>
                We only share the information necessary for each provider
                to perform its function, and we take reasonable steps to
                ensure these providers handle your data securely.
              </p>
            </section>

            <section id="cookies" className="pp-block">
              <h2>5. Cookies &amp; Tracking</h2>
              <p>
                Our website may use cookies and similar technologies to
                remember your preferences, understand how visitors use our
                site, and improve your browsing experience. You can control
                or disable cookies through your browser settings; doing so
                may affect certain features of the site.
              </p>
            </section>

            <section id="data-security" className="pp-block">
              <h2>6. Data Security</h2>
              <p>
                We implement reasonable technical and organizational
                measures to protect your information against unauthorized
                access, alteration, disclosure, or destruction. This
                includes secure data storage, restricted access to customer
                data, and use of reputable, security-vetted third-party
                providers. However, no method of transmission or storage is
                completely secure, and we cannot guarantee absolute
                security.
              </p>
            </section>

            <section id="data-retention" className="pp-block">
              <h2>7. Data Retention</h2>
              <p>
                We retain your personal information for as long as
                necessary to fulfil the purposes described in this policy —
                including order history, warranty tracking, and legal or
                tax record-keeping requirements — after which it is
                securely deleted or anonymized, unless a longer retention
                period is required by law.
              </p>
            </section>

            <section id="your-rights" className="pp-block">
              <h2>8. Your Rights</h2>
              <p>
                Under the Nigeria Data Protection Act (NDPA) 2023 and
                applicable data protection law, you have the right to:
              </p>
              <ul>
                <li>Request access to the personal information we hold about you.</li>
                <li>Request correction of inaccurate or incomplete information.</li>
                <li>Request deletion of your personal information, subject to legal or contractual retention requirements.</li>
                <li>Object to or restrict certain processing of your information.</li>
                <li>Withdraw consent, where processing is based on consent.</li>
                <li>Lodge a complaint with the Nigeria Data Protection Commission (NDPC) if you believe your rights have been violated.</li>
              </ul>
              <p>
                To exercise any of these rights, contact us using the
                details in Section 12.
              </p>
            </section>

            <section id="warranty" className="pp-block">
              <h2>9. Warranty &amp; After-Sales Support</h2>
              <p>
                While primarily a data-protection document, we include a
                summary of our warranty commitments here for transparency.
                For full terms, please refer to your product-specific
                warranty documentation or contact us directly.
              </p>
              <ul>
                <li>
                  Products sold and installed by Progrid Energy are backed
                  by manufacturer warranties, the terms of which vary by
                  product (solar panels, inverters, batteries, CCTV
                  equipment) and are provided at the time of purchase or
                  installation.
                </li>
                <li>
                  Our after-sales support includes ongoing monitoring,
                  scheduled maintenance, and responsive technical support
                  as outlined in your installation agreement.
                </li>
                <li>
                  Warranty coverage generally excludes damage caused by
                  misuse, unauthorized modification, improper maintenance,
                  or events outside our control (e.g. extreme weather,
                  power surges from third-party equipment).
                </li>
                <li>
                  To make a warranty claim, contact us with your order or
                  installation reference, a description of the issue, and
                  supporting photos/videos where applicable.
                </li>
              </ul>
            </section>

            <section id="childrens-privacy" className="pp-block">
              <h2>10. Children's Privacy</h2>
              <p>
                Our website and services are not directed at children under
                18. We do not knowingly collect personal information from
                children. If you believe a child has provided us with
                personal information, please contact us so we can delete
                it.
              </p>
            </section>

            <section id="changes" className="pp-block">
              <h2>11. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time to
                reflect changes in our practices, technology, legal
                requirements, or other factors. We will post the updated
                policy on this page with a revised "Last updated" date. We
                encourage you to review this page periodically.
              </p>
            </section>

            <section id="contact" className="pp-block">
              <h2>12. Contact Us</h2>
              <p>
                If you have questions, concerns, or requests regarding this
                Privacy Policy or how we handle your information, please
                contact us:
              </p>
              <ul className="pp-contact-list">
                <li>
                  Email:{" "}
                  <a href="mailto:info@progridenergy.net">
                    info@progridenergy.net
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}