import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  /** Canonical path only, e.g. "/services" — the domain is prepended automatically. */
  path?: string;
  /** Absolute URL to a preview image (1200x630 recommended) for social shares. */
  image?: string;
  /** JSON-LD structured data object(s) — e.g. LocalBusiness, Product, FAQPage schema. */
  structuredData?: object | object[];
}

const SITE_URL = "https://progridenergy.net"; // TODO: confirm this matches your live domain exactly
const DEFAULT_IMAGE = `${SITE_URL}/og-default.jpg`; // TODO: add a real 1200x630 social share image at this path

/**
 * Sets document title, meta description, canonical URL, Open Graph /
 * Twitter tags, and optional JSON-LD structured data for the current page.
 *
 * IMPORTANT LIMITATION: because this app is a client-side rendered SPA,
 * these tags are injected AFTER JavaScript runs. Google's crawler handles
 * this reasonably well, but crawlers that don't execute JS (WhatsApp,
 * Facebook, Twitter/X link previews, some older bots) will only ever see
 * whatever is in the raw index.html — NOT what this component sets. This
 * component is genuinely useful for Google ranking and browser tab titles,
 * but for reliable social-share previews, the defaults in index.html
 * (see accompanying instructions) matter more than this component does.
 */
export default function SEO({
  title,
  description,
  path = "/",
  image = DEFAULT_IMAGE,
  structuredData,
}: SEOProps) {
  useEffect(() => {
    const fullTitle = title.includes("Progrid") ? title : `${title} | Progrid Energy`;
    document.title = fullTitle;

    const canonicalUrl = `${SITE_URL}${path}`;

    setMetaTag("description", description);
    setMetaTag("og:title", fullTitle, "property");
    setMetaTag("og:description", description, "property");
    setMetaTag("og:image", image, "property");
    setMetaTag("og:url", canonicalUrl, "property");
    setMetaTag("og:type", "website", "property");
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:title", fullTitle);
    setMetaTag("twitter:description", description);
    setMetaTag("twitter:image", image);

    setCanonicalLink(canonicalUrl);

    const scriptId = "seo-structured-data";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (structuredData) {
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    } else if (script) {
      script.remove();
    }
  }, [title, description, path, image, structuredData]);

  return null;
}

function setMetaTag(name: string, content: string, attr: "name" | "property" = "name") {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonicalLink(url: string) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", url);
}