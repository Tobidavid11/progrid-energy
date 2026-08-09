/**
 * LocalBusiness structured data — this is what helps Google understand
 * "Progrid Energy is a solar installer located in Abeokuta, Nigeria" as a
 * fact, rather than something it has to guess from your page text.
 *
 * TODO before using: fill in the real street address, phone number, and
 * exact geo coordinates (get these from Google Maps — right-click your
 * business location, the lat/lng shown is what to use). Accuracy here
 * matters — this should match your Google Business Profile exactly (same
 * name, address, phone format) since mismatches hurt local ranking trust.
 */
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Progrid Energy",
  description:
    "Progrid Energy provides solar installation, inverter systems, CCTV & surveillance, energy consulting, and solar training services across Abeokuta, Ogun State and Nigeria.",
  url: "https://progridenergy.net",
  telephone: "+234-XXX-XXX-XXXX", // TODO: real business phone number
  email: "info@progridenergy.net",
  address: {
    "@type": "PostalAddress",
    streetAddress: "TODO — real street address",
    addressLocality: "Abeokuta",
    addressRegion: "Ogun State",
    addressCountry: "NG",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 7.1475, // TODO: replace with exact coordinates from Google Maps
    longitude: 3.3619,
  },
  areaServed: [
    { "@type": "City", name: "Abeokuta" },
    { "@type": "Country", name: "Nigeria" },
  ],
  priceRange: "$$",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "9:00",
    },
  ],
};

/**
 * FAQPage schema — this is what can make your FAQ answers show up directly
 * in Google search results as expandable snippets, which is one of the
 * more attainable ways to stand out for the exact questions people search
 * ("where can I buy solar panels in Nigeria", etc). Add real Q&As here
 * matching genuine search phrasing — these should mirror content that
 * ALSO appears as visible text somewhere on the page, not just in this
 * hidden schema, since Google penalizes structured data that doesn't
 * match visible content.
 */
export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Where can I buy affordable solar products in Nigeria?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Progrid Energy supplies and sells solar panels, inverters, batteries, and electrical accessories directly, with pricing tailored to your budget and energy needs. Contact us for a quote based on your specific requirements.",
      },
    },
    {
      "@type": "Question",
      name: "Who can install solar panels for me in Abeokuta?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Progrid Energy provides full solar installation services in Abeokuta, Ogun State, and across Nigeria — from residential home systems to commercial and industrial installations, handled by certified solar engineers.",
      },
    },
    {
      "@type": "Question",
      name: "Where can I learn solar installation and system design in Nigeria?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Progrid Energy offers solar design and installation training and workshops for individuals and organizations looking to build hands-on renewable energy skills.",
      },
    },
  ],
};