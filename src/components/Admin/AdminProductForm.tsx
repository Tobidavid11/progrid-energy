import { useState, useRef } from "react";
import type {FormEvent} from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, ImageIcon, X, Plus } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { PRODUCT_CATEGORIES, type DbProduct } from "../../types/ProductTypes";
import "./AdminProductForm.css";

interface AdminProductFormProps {
  /** Pass an existing product to edit it; omit to create a new one. */
  product?: DbProduct;
  onSaved?: (product: DbProduct) => void;
  onCancel?: () => void;
}

type Status = "idle" | "saving" | "success" | "error";

interface ImageSlot {
  /** Preview URL — either the existing stored URL, or an object URL for a pending file. */
  preview: string;
  /** Set only for a newly-picked file that still needs uploading on submit. */
  file?: File;
}

interface SpecRow {
  key: string;
  value: string;
}

interface BulkTierRow {
  minQty: string;
  unitPriceNaira: string;
}

const STORAGE_BUCKET = "product-images";
const MAX_IMAGES = 3;

function specsToRows(specs: Record<string, string> | null | undefined): SpecRow[] {
  if (!specs) return [];
  return Object.entries(specs).map(([key, value]) => ({ key, value }));
}

function bulkPricingToRows(
  tiers: DbProduct["bulk_pricing"] | null | undefined
): BulkTierRow[] {
  if (!tiers) return [];
  return tiers.map((tier) => ({
    minQty: String(tier.min_qty),
    unitPriceNaira: String(tier.unit_price_kobo / 100),
  }));
}

export default function AdminProductForm({
  product,
  onSaved,
  onCancel,
}: AdminProductFormProps) {
  const isEditing = Boolean(product);

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [longDescription, setLongDescription] = useState(
    product?.long_description ?? ""
  );
  const [priceNaira, setPriceNaira] = useState(
    product ? String(product.price_kobo / 100) : ""
  );
  const [category, setCategory] = useState<string>(
    product?.category ?? PRODUCT_CATEGORIES[0]
  );
  const [inStock, setInStock] = useState(product?.in_stock ?? true);

  const [imageSlots, setImageSlots] = useState<(ImageSlot | null)[]>(() => {
    const existing = (product?.images ?? []).map((url) => ({ preview: url }));
    const padded = [...existing];
    while (padded.length < MAX_IMAGES) padded.push(null as unknown as ImageSlot);
    return padded.slice(0, MAX_IMAGES);
  });
  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const [specRows, setSpecRows] = useState<SpecRow[]>(
    specsToRows(product?.specifications)
  );

  const [bulkTierRows, setBulkTierRows] = useState<BulkTierRow[]>(
    bulkPricingToRows(product?.bulk_pricing)
  );

  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleImagePick = (
    slotIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = { preview: URL.createObjectURL(file), file };
      return next;
    });
  };

  const clearImageSlot = (slotIndex: number) => {
    setImageSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
    const ref = fileInputRefs[slotIndex]?.current;
    if (ref) ref.value = "";
  };

  const addSpecRow = () => setSpecRows((prev) => [...prev, { key: "", value: "" }]);
  const removeSpecRow = (i: number) =>
    setSpecRows((prev) => prev.filter((_, idx) => idx !== i));
  const updateSpecRow = (i: number, field: "key" | "value", val: string) =>
    setSpecRows((prev) =>
      prev.map((row, idx) => (idx === i ? { ...row, [field]: val } : row))
    );

  const addBulkTierRow = () =>
    setBulkTierRows((prev) => [...prev, { minQty: "", unitPriceNaira: "" }]);
  const removeBulkTierRow = (i: number) =>
    setBulkTierRows((prev) => prev.filter((_, idx) => idx !== i));
  const updateBulkTierRow = (
    i: number,
    field: "minQty" | "unitPriceNaira",
    val: string
  ) =>
    setBulkTierRows((prev) =>
      prev.map((row, idx) => (idx === i ? { ...row, [field]: val } : row))
    );

  // Uploads any new (unsaved) files and returns the final list of image
  // URLs in slot order, skipping empty slots.
  const resolveImageUrls = async (): Promise<string[]> => {
    const urls: string[] = [];

    for (const slot of imageSlots) {
      if (!slot) continue;

      if (!slot.file) {
        // Already an uploaded URL (unchanged on edit) — keep as-is.
        urls.push(slot.preview);
        continue;
      }

      const fileExt = slot.file.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, slot.file, { upsert: false });

      if (uploadError) {
        throw new Error(`Image upload failed: ${uploadError.message}`);
      }

      const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      urls.push(data.publicUrl);
    }

    return urls;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("saving");
    setErrorMessage("");

    try {
      const priceKobo = Math.round(parseFloat(priceNaira) * 100);
      if (Number.isNaN(priceKobo) || priceKobo < 0) {
        throw new Error("Enter a valid price.");
      }

      const imageUrls = await resolveImageUrls();

      const specifications = specRows.length
        ? Object.fromEntries(
            specRows
              .filter((row) => row.key.trim())
              .map((row) => [row.key.trim(), row.value.trim()])
          )
        : null;

      const bulkPricing = bulkTierRows
        .filter((row) => row.minQty.trim() && row.unitPriceNaira.trim())
        .map((row) => {
          const minQty = parseInt(row.minQty, 10);
          const unitPriceKobo = Math.round(
            parseFloat(row.unitPriceNaira) * 100
          );
          if (Number.isNaN(minQty) || minQty < 2) {
            throw new Error(
              "Bulk pricing quantity must be a whole number of 2 or more."
            );
          }
          if (Number.isNaN(unitPriceKobo) || unitPriceKobo < 0) {
            throw new Error("Enter a valid bulk price.");
          }
          if (unitPriceKobo >= priceKobo) {
            throw new Error(
              "Bulk price should be lower than the regular price — otherwise it isn't a discount."
            );
          }
          return { min_qty: minQty, unit_price_kobo: unitPriceKobo };
        })
        .sort((a, b) => a.min_qty - b.min_qty);

      const payload = {
        name,
        description,
        long_description: longDescription.trim() || null,
        specifications:
          specifications && Object.keys(specifications).length
            ? specifications
            : null,
        price_kobo: priceKobo,
        category,
        image_url: imageUrls[0] ?? null,
        images: imageUrls,
        in_stock: inStock,
        bulk_pricing: bulkPricing,
        updated_at: new Date().toISOString(),
      };

      if (isEditing && product) {
        const { data, error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", product.id)
          .select()
          .single();

        if (error) throw new Error(error.message);
        setStatus("success");
        onSaved?.(data as DbProduct);
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert(payload)
          .select()
          .single();

        if (error) throw new Error(error.message);
        setStatus("success");
        onSaved?.(data as DbProduct);

        // Reset the form after a successful create so the admin can
        // immediately add another product without re-navigating.
        setName("");
        setDescription("");
        setLongDescription("");
        setPriceNaira("");
        setCategory(PRODUCT_CATEGORIES[0]);
        setInStock(true);
        setImageSlots([null, null, null]);
        setSpecRows([]);
        setBulkTierRows([]);
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  };

  const isSaving = status === "saving";

  return (
    <form className="admin-product-form" onSubmit={handleSubmit}>
      <div className="admin-product-form__field">
        <label htmlFor="product-name">Product Name</label>
        <input
          id="product-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSaving}
        />
      </div>

      <div className="admin-product-form__field">
        <label htmlFor="product-description">Short Description</label>
        <textarea
          id="product-description"
          rows={2}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSaving}
        />
        <span className="admin-product-form__hint">
          Shown on product cards and in search results.
        </span>
      </div>

      <div className="admin-product-form__field">
        <label htmlFor="product-long-description">
          Full Description (optional)
        </label>
        <textarea
          id="product-long-description"
          rows={4}
          value={longDescription}
          onChange={(e) => setLongDescription(e.target.value)}
          disabled={isSaving}
        />
        <span className="admin-product-form__hint">
          Shown on the product's detail page. Leave blank to just use the
          short description there too.
        </span>
      </div>

      <div className="admin-product-form__row">
        <div className="admin-product-form__field">
          <label htmlFor="product-price">Price (₦)</label>
          <input
            id="product-price"
            type="number"
            min="0"
            step="0.01"
            required
            value={priceNaira}
            onChange={(e) => setPriceNaira(e.target.value)}
            disabled={isSaving}
          />
        </div>

        <div className="admin-product-form__field">
          <label htmlFor="product-category">Category</label>
          <select
            id="product-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isSaving}
          >
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-product-form__field">
        <label>Product Images (up to {MAX_IMAGES})</label>
        <div className="admin-product-form__image-grid">
          {imageSlots.map((slot, i) => (
            <div key={i} className="admin-product-form__image-slot">
              {slot ? (
                <div className="admin-product-form__preview">
                  <img src={slot.preview} alt={`Product image ${i + 1}`} />
                  <button
                    type="button"
                    className="admin-product-form__preview-remove"
                    onClick={() => clearImageSlot(i)}
                    disabled={isSaving}
                    aria-label={`Remove image ${i + 1}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="admin-product-form__upload">
                  <ImageIcon size={18} strokeWidth={1.8} />
                  <span>{i === 0 ? "Main image" : "Add image"}</span>
                  <input
                    ref={fileInputRefs[i]}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImagePick(i, e)}
                    disabled={isSaving}
                    hidden
                  />
                </label>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="admin-product-form__field">
        <label>Specifications (optional)</label>
        {specRows.map((row, i) => (
          <div className="admin-product-form__spec-row" key={i}>
            <input
              type="text"
              placeholder="e.g. Wattage"
              value={row.key}
              onChange={(e) => updateSpecRow(i, "key", e.target.value)}
              disabled={isSaving}
            />
            <input
              type="text"
              placeholder="e.g. 300W"
              value={row.value}
              onChange={(e) => updateSpecRow(i, "value", e.target.value)}
              disabled={isSaving}
            />
            <button
              type="button"
              className="admin-product-form__spec-remove"
              onClick={() => removeSpecRow(i)}
              disabled={isSaving}
              aria-label="Remove specification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="admin-product-form__spec-add"
          onClick={addSpecRow}
          disabled={isSaving}
        >
          <Plus size={14} /> Add specification
        </button>
      </div>

      <div className="admin-product-form__field">
        <label>Bulk Pricing (optional)</label>
        <span className="admin-product-form__hint">
          Set a lower per-unit price once a customer buys at least a given
          quantity. Applies automatically at checkout — no coupon code
          needed.
        </span>
        {bulkTierRows.map((row, i) => (
          <div className="admin-product-form__spec-row" key={i}>
            <input
              type="number"
              min="2"
              step="1"
              placeholder="Min. quantity, e.g. 5"
              value={row.minQty}
              onChange={(e) => updateBulkTierRow(i, "minQty", e.target.value)}
              disabled={isSaving}
            />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Price each (₦), e.g. 45000"
              value={row.unitPriceNaira}
              onChange={(e) =>
                updateBulkTierRow(i, "unitPriceNaira", e.target.value)
              }
              disabled={isSaving}
            />
            <button
              type="button"
              className="admin-product-form__spec-remove"
              onClick={() => removeBulkTierRow(i)}
              disabled={isSaving}
              aria-label="Remove bulk pricing tier"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="admin-product-form__spec-add"
          onClick={addBulkTierRow}
          disabled={isSaving}
        >
          <Plus size={14} /> Add bulk pricing tier
        </button>
      </div>

      <label className="admin-product-form__toggle">
        <input
          type="checkbox"
          checked={inStock}
          onChange={(e) => setInStock(e.target.checked)}
          disabled={isSaving}
        />
        <span>In stock</span>
      </label>

      <div className="admin-product-form__footer">
        <motion.button
          type="submit"
          className="btn btn-primary admin-product-form__submit"
          disabled={isSaving}
          whileHover={!isSaving ? { scale: 1.03 } : undefined}
          whileTap={!isSaving ? { scale: 0.97 } : undefined}
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className="admin-product-form__spin" />
              Saving...
            </>
          ) : isEditing ? (
            "Save Changes"
          ) : (
            "Add Product"
          )}
        </motion.button>

        {onCancel && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </button>
        )}

        {status === "success" && (
          <motion.span
            className="admin-product-form__status admin-product-form__status--success"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CheckCircle2 size={16} />
            {isEditing ? "Product updated." : "Product added."}
          </motion.span>
        )}

        {status === "error" && (
          <motion.span
            className="admin-product-form__status admin-product-form__status--error"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {errorMessage}
          </motion.span>
        )}
      </div>
    </form>
  );
}