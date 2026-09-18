import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Calendar, User } from "lucide-react";
import { fetchBlogPostBySlug } from "./blogsApi";
import type { BlogPost } from "../../types/blogTypes";
import "./BlogDetails.css";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { dateStyle: "long" });
}

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      const { data, error } = await fetchBlogPostBySlug(slug);
      if (cancelled) return;

      if (error) {
        setErrorMessage(error);
      } else {
        setPost(data);
      }
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Uses browser history instead of a hardcoded link to /blogs — a
  // fixed link would always land on page 1, discarding whatever page
  // of the blog grid the reader actually came from. navigate(-1)
  // returns to the exact previous URL (page and all), same fix
  // applied to the product detail page's back link.
  const handleBack = () => navigate(-1);

  if (isLoading) {
    return <div className="blog-detail__state">Loading post...</div>;
  }

  if (errorMessage || !post) {
    return (
      <div className="blog-detail__state blog-detail__state--error">
        {errorMessage || "Post not found."}
        <button type="button" className="blog-detail__back-link" onClick={handleBack}>
          <ChevronLeft size={14} /> Back to Blog
        </button>
      </div>
    );
  }

  return (
    <div className="blog-detail">
      <div className="container">
        <button type="button" className="blog-detail__back-link" onClick={handleBack}>
          <ChevronLeft size={14} /> Back to Blog
        </button>

        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {post.category && (
            <span className="blog-detail__category">{post.category}</span>
          )}

          <h1 className="blog-detail__title">{post.title}</h1>

          <div className="blog-detail__meta">
            <span>
              <User size={14} /> {post.author}
            </span>
            <span>
              <Calendar size={14} /> {formatDate(post.publishedAt)}
            </span>
          </div>

          <div className="blog-detail__cover">
            <img src={post.coverImage} alt={post.title} />
          </div>

          <div className="blog-detail__content">
            {post.content.split("\n").map((paragraph, i) =>
              paragraph.trim() ? <p key={i}>{paragraph}</p> : null
            )}
          </div>
        </motion.article>
      </div>
    </div>
  );
}