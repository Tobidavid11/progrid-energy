import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";
import type { BlogPost } from "../../types/blogTypes";
import "./BlogCard.css";

interface BlogCardProps {
  post: BlogPost;
  index?: number;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    dateStyle: "medium",
  });
}

export default function BlogCard({ post, index = 0 }: BlogCardProps) {
  return (
    <motion.article
      className="blog-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
    >
      <Link to={`/blogs/${post.slug}`} className="blog-card__image">
        <motion.img
          src={post.coverImage}
          alt={post.title}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </Link>

      <div className="blog-card__body">
        {post.category && (
          <span className="blog-card__category">{post.category}</span>
        )}

        <Link to={`/blogs/${post.slug}`} className="blog-card__title-link">
          <h3 className="blog-card__title">{post.title}</h3>
        </Link>

        <p className="blog-card__excerpt">{post.excerpt}</p>

        <div className="blog-card__footer">
          <span className="blog-card__date">
            <Calendar size={13} /> {formatDate(post.publishedAt)}
          </span>

          <Link to={`/blogs/${post.slug}`} className="blog-card__read-more">
            Read More <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}