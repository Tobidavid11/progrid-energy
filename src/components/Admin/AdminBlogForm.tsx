import { useState, useRef } from "react";
import type { FormEvent} from "react"
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, ImageIcon, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { slugify, type DbBlogPost } from "../../types/blogTypes";
import "../Admin/AdminBlogForm.css";

interface AdminBlogFormProps {
  post?: DbBlogPost;
  onSaved?: (post: DbBlogPost) => void;
  onCancel?: () => void;
}

type Status = "idle" | "saving" | "success" | "error";

const STORAGE_BUCKET = "blog-images";

export default function AdminBlogForm({
  post,
  onSaved,
  onCancel,
}: AdminBlogFormProps) {
  const isEditing = Boolean(post);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditing);
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [author, setAuthor] = useState(post?.author ?? "Progrid Energy");
  const [category, setCategory] = useState(post?.category ?? "");
  const [published, setPublished] = useState(post?.published ?? true);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    post?.cover_image_url ?? null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugManuallyEdited) {
      setSlug(slugify(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlug(value);
    setSlugManuallyEdited(true);
  };

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
    if (!imageFile) return post?.cover_image_url ?? null;

    const fileExt = imageFile.name.split(".").pop();
    const filePath = `${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, imageFile, { upsert: false });

    if (uploadError) {
      throw new Error(`Image upload failed: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("saving");
    setErrorMessage("");

    try {
      const finalSlug = slug.trim() || slugify(title);
      if (!finalSlug) {
        throw new Error("Enter a title so a URL slug can be generated.");
      }

      const coverImageUrl = await uploadImageIfNeeded();

      const payload = {
        title,
        slug: finalSlug,
        excerpt,
        content,
        cover_image_url: coverImageUrl,
        author,
        category: category.trim() || null,
        published,
        updated_at: new Date().toISOString(),
      };

      if (isEditing && post) {
        const { data, error } = await supabase
          .from("blog_posts")
          .update(payload)
          .eq("id", post.id)
          .select()
          .single();

        if (error) throw new Error(error.message);
        setStatus("success");
        onSaved?.(data as DbBlogPost);
      } else {
        const { data, error } = await supabase
          .from("blog_posts")
          .insert(payload)
          .select()
          .single();

        if (error) throw new Error(error.message);
        setStatus("success");
        onSaved?.(data as DbBlogPost);

        setTitle("");
        setSlug("");
        setSlugManuallyEdited(false);
        setExcerpt("");
        setContent("");
        setCategory("");
        setPublished(true);
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
    <form className="admin-blog-form" onSubmit={handleSubmit}>
      <div className="admin-blog-form__field">
        <label htmlFor="post-title">Title</label>
        <input
          id="post-title"
          type="text"
          required
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          disabled={isSaving}
        />
      </div>

      <div className="admin-blog-form__field">
        <label htmlFor="post-slug">URL Slug</label>
        <input
          id="post-slug"
          type="text"
          required
          value={slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          disabled={isSaving}
        />
        <span className="admin-blog-form__hint">
          progridenergy.net/blogs/{slug || "your-post-title"}
        </span>
      </div>

      <div className="admin-blog-form__row">
        <div className="admin-blog-form__field">
          <label htmlFor="post-author">Author</label>
          <input
            id="post-author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            disabled={isSaving}
          />
        </div>

        <div className="admin-blog-form__field">
          <label htmlFor="post-category">Category (optional)</label>
          <input
            id="post-category"
            type="text"
            placeholder="e.g. Guides"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isSaving}
          />
        </div>
      </div>

      <div className="admin-blog-form__field">
        <label htmlFor="post-excerpt">Excerpt</label>
        <textarea
          id="post-excerpt"
          rows={2}
          required
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          disabled={isSaving}
        />
        <span className="admin-blog-form__hint">
          Shown on the blog card and in previews.
        </span>
      </div>

      <div className="admin-blog-form__field">
        <label htmlFor="post-content">Content</label>
        <textarea
          id="post-content"
          rows={10}
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSaving}
        />
        <span className="admin-blog-form__hint">
          Separate paragraphs with a blank line.
        </span>
      </div>

      <div className="admin-blog-form__field">
        <label>Cover Image</label>
        {imagePreview ? (
          <div className="admin-blog-form__preview">
            <img src={imagePreview} alt="Cover preview" />
            <button
              type="button"
              className="admin-blog-form__preview-remove"
              onClick={clearImage}
              disabled={isSaving}
              aria-label="Remove image"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <label className="admin-blog-form__upload">
            <ImageIcon size={20} strokeWidth={1.8} />
            <span>Click to upload a cover image</span>
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

      <label className="admin-blog-form__toggle">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          disabled={isSaving}
        />
        <span>Published (uncheck to save as a draft)</span>
      </label>

      <div className="admin-blog-form__footer">
        <motion.button
          type="submit"
          className="btn btn-primary admin-blog-form__submit"
          disabled={isSaving}
          whileHover={!isSaving ? { scale: 1.03 } : undefined}
          whileTap={!isSaving ? { scale: 0.97 } : undefined}
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className="admin-blog-form__spin" />
              Saving...
            </>
          ) : isEditing ? (
            "Save Changes"
          ) : (
            "Publish Post"
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
            className="admin-blog-form__status admin-blog-form__status--success"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CheckCircle2 size={16} />
            {isEditing ? "Post updated." : "Post saved."}
          </motion.span>
        )}

        {status === "error" && (
          <motion.span
            className="admin-blog-form__status admin-blog-form__status--error"
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