import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Check, X } from "lucide-react";
import { PRODUCT_CATEGORIES } from "../../types/ProductTypes";
import "./ProductSearchBar.css";

export interface ProductFilters {
  searchTerm: string;
  category: string;
}

interface ProductSearchBarProps {
  /** Category options shown in the filter dropdown. First item is treated as "no filter". */
  categories?: string[];
  placeholder?: string;
  /** Called whenever the search text or selected category changes. */
  onFilterChange?: (filters: ProductFilters) => void;
}

const defaultCategories = ["All Categories", ...PRODUCT_CATEGORIES];

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export default function ProductSearchBar({
  categories = defaultCategories,
  placeholder = "Search products...",
  onFilterChange,
}: ProductSearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close the dropdown on outside click.
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    onFilterChange?.({ searchTerm, category });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, category]);

  const isFiltered = category !== categories[0];

  return (
    <div className="product-search">
      <div className="product-search__field">
        <Search size={18} strokeWidth={2} className="product-search__icon" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          aria-label="Search products"
        />
        {searchTerm && (
          <button
            type="button"
            className="product-search__clear"
            onClick={() => setSearchTerm("")}
            aria-label="Clear search"
          >
            <X size={15} strokeWidth={2} />
          </button>
        )}
      </div>

      <div className="product-search__divider" aria-hidden="true" />

      <div className="product-search__filter" ref={dropdownRef}>
        <button
          type="button"
          className={`product-search__filter-btn ${isFiltered ? "product-search__filter-btn--active" : ""}`}
          onClick={() => setIsOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          {category}
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="product-search__chevron"
          >
            <ChevronDown size={16} strokeWidth={2} />
          </motion.span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.ul
              className="product-search__dropdown"
              role="listbox"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.18, ease: EASE_OUT }}
            >
              {categories.map((option) => {
                const selected = option === category;
                return (
                  <li key={option}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={`product-search__option ${selected ? "product-search__option--selected" : ""}`}
                      onClick={() => {
                        setCategory(option);
                        setIsOpen(false);
                      }}
                    >
                      {option}
                      {selected && (
                        <Check size={15} strokeWidth={2.4} />
                      )}
                    </button>
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}