import { useState, useRef } from "react";
import type {FormEvent} from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, ImageIcon, X } from "lucide-react";
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

const STORAGE_BUCKET = "product-images";

export default function AdminProductForm({
  product,
  onSaved,
  onCancel,
}: AdminProductFormProps) {
  const isEditing = Boolean(product);

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [priceNaira, setPriceNaira] = useState(
    product ? String(product.price_kobo / 100) : ""
  );
  const [category, setCategory] = useState(
    product?.category ?? PRODUCT_CATEGORIES[0]
  );
  const [inStock, setInStock] = useState(product?.in_stock ?? true);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.image_url ?? null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadImageIfNeeded = async (): Promise<string | null> => {
    if (!imageFile) return product?.image_url ?? null;

    const fileExt = imageFile.name.split(".").pop();
    const filePath = `${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, imageFile, { upsert: false });

    if (uploadError) {
      throw new Error(`Image upload failed: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return data.publicUrl;
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

      const imageUrl = await uploadImageIfNeeded();

      const payload = {
        name,
        description,
        price_kobo: priceKobo,
        category,
        image_url: imageUrl,
        in_stock: inStock,
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
        setPriceNaira("");
        setCategory(PRODUCT_CATEGORIES[0]);
        setInStock(true);
        clearImage();
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
        <label htmlFor="product-description">Description</label>
        <textarea
          id="product-description"
          rows={3}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSaving}
        />
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
        <label>Product Image</label>
        {imagePreview ? (
          <div className="admin-product-form__preview">
            <img src={imagePreview} alt="Product preview" />
            <button
              type="button"
              className="admin-product-form__preview-remove"
              onClick={clearImage}
              disabled={isSaving}
              aria-label="Remove image"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <label className="admin-product-form__upload">
            <ImageIcon size={20} strokeWidth={1.8} />
            <span>Click to upload an image</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isSaving}
              hidden
            />
          </label>
        )}
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