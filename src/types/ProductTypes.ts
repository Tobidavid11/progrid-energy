// Single source of truth for product categories. Both the customer-facing
// ProductSearchBar filter and the admin product form must use this same
// list — if they drift apart, the admin could tag a product with a
// category the search filter doesn't know about (or vice versa), and it
// would silently never show up under that filter.
//
// Stored/displayed in Title Case rather than the ALL CAPS the categories
// were given in, to match every other label in the existing UI (nav
// links, form labels, etc.) — shout-casing everywhere would be visually
// inconsistent with the rest of the site. If literal ALL CAPS storage is
// actually wanted, this is the one place to change it.
export const PRODUCT_CATEGORIES = [
  "Inverter",
  "Battery",
  "Panels",
  "Panel Accessories",
  "Charge Controller",
  "Wire & Cables",
  "Solar Products",
  "Fan & Accessories",
  "Solar Camera",
  "Solar Streetlight",
  "Tools & Hardware",
  "Breaker & Boxes",
  "Electrical Accessories",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

// A quantity threshold + the per-unit price that applies once a
// customer's quantity meets or exceeds it. Stored in kobo on the DB
// side, naira on the display side — same pattern as price_kobo/price.
export interface DbBulkPricingTier {
  min_qty: number;
  unit_price_kobo: number;
}

export interface BulkPricingTier {
  minQty: number;
  unitPrice: number; // naira
}

// Shape of a row in the `products` table exactly as Supabase returns it.
export interface DbProduct {
  id: string;
  name: string;
  description: string;
  // Longer, comprehensive write-up for the product detail page — the
  // short `description` stays as the card/grid summary.
  long_description: string | null;
  // Structured spec sheet, e.g. { "Wattage": "300W", "Warranty": "2 years" }.
  // A plain object rather than free text so the detail page can render
  // it as a clean list instead of parsing unstructured text.
  specifications: Record<string, string> | null;
  price_kobo: number;
  category: string;
  image_url: string | null;
  // Up to 3 total images including the primary one — enforced in the
  // admin form UI, not the database, since a hard DB constraint on
  // array length is more friction than it's worth for a 3-image cap.
  images: string[];
  in_stock: boolean;
  bulk_pricing: DbBulkPricingTier[];
  created_at: string;
  updated_at: string;
}

// Shape the UI components (ProductCard, etc.) actually consume — naira
// instead of kobo, camelCase instead of snake_case, and a guaranteed
// image string instead of a nullable one.
export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription: string | null;
  specifications: Record<string, string> | null;
  price: number;
  inStock: boolean;
  image: string;
  images: string[];
  category: string;
  bulkPricing: BulkPricingTier[];
}

const PLACEHOLDER_IMAGE = "/assets/products/placeholder.jpg";

export function toDisplayProduct(db: DbProduct): Product {
  return {
    id: db.id,
    name: db.name,
    description: db.description,
    longDescription: db.long_description,
    specifications: db.specifications,
    price: db.price_kobo / 100,
    inStock: db.in_stock,
    image: db.image_url ?? PLACEHOLDER_IMAGE,
    images: db.images?.length ? db.images : db.image_url ? [db.image_url] : [],
    category: db.category,
    bulkPricing: (db.bulk_pricing ?? [])
      .map((tier) => ({
        minQty: tier.min_qty,
        unitPrice: tier.unit_price_kobo / 100,
      }))
      .sort((a, b) => a.minQty - b.minQty),
  };
}

// The actual per-unit price for a given quantity — this is the single
// source of truth used by ProductCard, ProductDetail, and PurchaseFlow,
// so the price shown while browsing and the price actually charged at
// checkout can never drift apart from each other.
export function getEffectiveUnitPrice(product: Product, qty: number): number {
  let best = product.price;

  for (const tier of product.bulkPricing) {
    if (qty >= tier.minQty) {
      best = tier.unitPrice;
    }
  }

  return best;
}

// The next tier a customer hasn't reached yet, if any — used to show
// "Buy 2 more to unlock ₦X each" style prompts. Returns null once the
// best tier is already active or there are no tiers at all.
export function getNextBulkTier(
  product: Product,
  qty: number
): BulkPricingTier | null {
  const upcoming = product.bulkPricing.filter((tier) => tier.minQty > qty);
  if (upcoming.length === 0) return null;
  return upcoming.reduce((a, b) => (a.minQty < b.minQty ? a : b));
}