// Single source of truth for product categories. Both the customer-facing
// ProductSearchBar filter and the admin product form must use this same
// list — if they drift apart, the admin could tag a product with a
// category the search filter doesn't know about (or vice versa), and it
// would silently never show up under that filter.
export const PRODUCT_CATEGORIES = [
  "Solar Panels",
  "Inverters",
  "Batteries",
  "Charge Controllers",
  "Accessories",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

// Shape of a row in the `products` table exactly as Supabase returns it.
export interface DbProduct {
  id: string;
  name: string;
  description: string;
  price_kobo: number;
  category: string;
  image_url: string | null;
  in_stock: boolean;
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
  price: number;
  inStock: boolean;
  image: string;
  category: string;
}

const PLACEHOLDER_IMAGE = "/assets/products/placeholder.jpg";

export function toDisplayProduct(db: DbProduct): Product {
  return {
    id: db.id,
    name: db.name,
    description: db.description,
    price: db.price_kobo / 100,
    inStock: db.in_stock,
    image: db.image_url ?? PLACEHOLDER_IMAGE,
    category: db.category,
  };
}