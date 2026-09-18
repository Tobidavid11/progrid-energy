import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import BlogCard from "./BlogCard";
import Pagination from "../common/Pagination";
import { fetchBlogPosts } from "./blogsApi";
import type { BlogPost } from "../../types/blogTypes";
import "./BlogsGrid.css";

const PAGE_SIZE = 9; // 3 columns × 3 rows

export default function BlogsGrid() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read the initial page from the URL (not just default to 1) so a
  // direct link or a browser-back navigation lands on the right page —
  // this is the fix for the same "resets to page 1" bug the product
  // grid had before it stored page state in the URL too.
  const [page, setPage] = useState(
    parseInt(searchParams.get("page") || "1", 10) || 1
  );
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      const { data, error, totalCount } = await fetchBlogPosts({
        page,
        pageSize: PAGE_SIZE,
      });
      if (cancelled) return;

      if (error) {
        setErrorMessage(error);
      } else {
        setErrorMessage("");
        setPosts(data);
        setTotalPages(Math.max(1, Math.ceil(totalCount / PAGE_SIZE)));
      }
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [page]);

  // Keeps the URL in sync with the current page — `replace` so
  // clicking through pages doesn't spam browser history with an entry
  // per page, but still means the exact page is part of the URL the
  // browser remembers when you navigate away and come back.
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (page > 1) {
      next.set("page", String(page));
    } else {
      next.delete("page");
    }
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="blogs-grid-section">
      <div className="container">
        {isLoading && (
          <div className="blogs-grid-section__state">
            <Loader2 size={20} className="blogs-grid-section__spin" />
            Loading posts...
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="blogs-grid-section__state blogs-grid-section__state--error">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && posts.length === 0 && (
          <div className="blogs-grid-section__state">
            No posts published yet.
          </div>
        )}

        {!isLoading && posts.length > 0 && (
          <div className="blogs-grid-section__grid">
            {posts.map((post, i) => (
              <BlogCard key={post.id} post={post} index={i} />
            ))}
          </div>
        )}

        {!isLoading && posts.length > 0 && (
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}