import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  Sun,
  Package,
  Camera,
  ClipboardList,
  GraduationCap,
  Wrench,
  CheckCircle2,
  Home,
  Building2,
  Factory,
} from "lucide-react";
import "./Servicecontent.css";

interface Service {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  title: string;
  tagline: string;
  description: string;
  scope: string[];
}

const SERVICES: Service[] = [
  {
    icon: Sun,
    title: "Solar & Inverter Installation",
    tagline: "Residential, commercial & industrial systems",
    description:
      "We design and install complete solar power systems sized to your actual energy needs — from a single-home backup setup to large hybrid systems powering commercial and industrial sites. Every system is engineered around your load, budget, and building layout, not a one-size-fits-all package.",
    scope: [
      "Solar panel (mono/bifacial) installation",
      "Inverter sizing, supply & installation",
      "Lithium & tubular battery storage systems",
      "Hybrid solar system design & deployment",
      "Complete AC/DC protection infrastructure",
      "Residential, commercial & industrial scale projects",
    ],
  },
  {
    icon: Package,
    title: "Supply & Sales",
    tagline: "Solar & electrical products, gadgets and accessories",
    description:
      "Beyond installation, we supply the actual hardware — genuine, warranty-backed solar and electrical products, appliances, gadgets, and accessories, sold directly or as part of a full installation package.",
    scope: [
      "Solar panels, inverters & batteries",
      "Electrical appliances & accessories",
      "Cables, protection devices & mounting hardware",
      "Smart energy gadgets & monitoring devices",
      "Genuine, warranty-backed products only",
    ],
  },
  {
    icon: Camera,
    title: "Intelligent CCTV & Surveillance",
    tagline: "4G/WiFi smart cameras, dashcams & spy cams",
    description:
      "Security is often paired with power — so we also design and install surveillance systems for homes, offices, and business sites, using connected smart cameras that you can monitor remotely.",
    scope: [
      "4G & WiFi smart camera installation",
      "Dashcam supply & fitting",
      "Discreet spy cam solutions",
      "Remote monitoring setup",
      "Home, office & site coverage",
    ],
  },
  {
    icon: ClipboardList,
    title: "Energy Consulting",
    tagline: "Audits, system design & advisory",
    description:
      "Before any equipment goes in, we assess what you actually need. Our consulting service covers energy audits and system design advisory — so you invest in a system correctly sized to your consumption, not guesswork.",
    scope: [
      "On-site energy audits",
      "Load assessment & consumption analysis",
      "Custom solar system design & specification",
      "Budget-aligned solution planning",
      "Independent advisory for existing systems",
    ],
  },
  {
    icon: GraduationCap,
    title: "Training & Workshops",
    tagline: "Solar design & system training",
    description:
      "We run structured training and workshops for individuals and organizations looking to build real solar design and installation skills — from fundamentals through to hands-on system training.",
    scope: [
      "Solar system design training",
      "Hands-on installation workshops",
      "Energy audit methodology training",
      "Sessions for individuals & organizations",
    ],
  },
  {
    icon: Wrench,
    title: "Maintenance & After-Sales Support",
    tagline: "Ongoing monitoring, servicing & support",
    description:
      "Our relationship doesn't end at installation. Every system we deploy is backed by ongoing monitoring, scheduled maintenance, and responsive technical support to keep it performing at its best for years.",
    scope: [
      "Scheduled system maintenance",
      "Remote performance monitoring",
      "Fault diagnosis & repair",
      "Warranty claim support",
      "Responsive customer service line",
    ],
  },
];

interface ClientType {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
}

const CLIENT_TYPES: ClientType[] = [
  { icon: Home, label: "Homes & Residences" },
  { icon: Building2, label: "Real Estate Developers" },
  { icon: Building2, label: "Hospitals & Health Centers" },
  { icon: GraduationCap, label: "Educational Institutions" },
  { icon: Building2, label: "Corporate Offices & SMEs" },
  { icon: Factory, label: "Agricultural & Agro-Processing Farms" },
];

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const headerVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

function ServiceRow({ service, index }: { service: Service; index: number }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(rowRef, { once: true, amount: 0.25 });
  const prefersReducedMotion = useReducedMotion();
  const Icon = service.icon;
  const reversed = index % 2 === 1;

  return (
    <motion.article
      className={`sc-row ${reversed ? "sc-row--reversed" : ""}`}
      ref={rowRef}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: EASE_OUT }}
    >
      <div className="sc-row-copy">
        <div className="sc-icon">
          <Icon size={22} strokeWidth={2} />
        </div>
        <span className="sc-tagline">{service.tagline}</span>
        <h3 className="sc-row-title">{service.title}</h3>
        <p className="sc-row-desc">{service.description}</p>
      </div>

      <div className="sc-row-scope">
        <span className="sc-scope-label">What's included</span>
        <ul className="sc-scope-list">
          {service.scope.map((item) => (
            <li key={item} className="sc-scope-item">
              <CheckCircle2 size={16} strokeWidth={2} className="sc-scope-check" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}

export default function ServiceContent() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const clientsRef = useRef<HTMLDivElement>(null);
  const clientsInView = useInView(clientsRef, { once: true, amount: 0.2 });

  return (
    <section className="sc-section" ref={sectionRef}>
      <div className="container">
        <motion.div
          className="sc-header"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={headerVariants}
        >
          <span className="eyebrow">What We Offer</span>
          <h2 className="sc-heading">Everything You Need, Under One Roof</h2>
          <p className="sc-subheading">
            From the first energy audit to years of after-sales support —
            here's the full scope of what Progrid Energy handles for every
            client, residential or industrial.
          </p>
        </motion.div>

        <div className="sc-rows">
          {SERVICES.map((service, i) => (
            <ServiceRow service={service} index={i} key={service.title} />
          ))}
        </div>

        <motion.div
          className="sc-clients"
          ref={clientsRef}
          initial={{ opacity: 0, y: 20 }}
          animate={clientsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE_OUT }}
        >
          <span className="sc-clients-label">Who We Work With</span>
          <div className="sc-clients-grid">
            {CLIENT_TYPES.map((client) => {
              const ClientIcon = client.icon;
              return (
                <div className="sc-client-chip" key={client.label}>
                  <ClientIcon size={16} strokeWidth={2} />
                  <span>{client.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          className="sc-cta"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.2 }}
        >
          <div>
            <h3 className="sc-cta-heading">Not sure which service fits?</h3>
            <p className="sc-cta-text">
              Talk to our team — we'll assess your needs and recommend the
              right solution, no pressure.
            </p>
          </div>
          <a href="/contact" className="btn btn-primary">
            Book a Consultation
          </a>
        </motion.div>
      </div>
    </section>
  );
}