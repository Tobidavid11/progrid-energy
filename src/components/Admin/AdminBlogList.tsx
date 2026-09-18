import { useEffect, useState, useCallback } from "react";
import { Search, Pencil, Trash2, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import Pagination from "../common/Pagination";
import type { DbBlogPost } from "../../types/blogTypes";
import "../Admin/AdminBlogList.css";

interface AdminBlogListProps {
  onEdit?: (post: DbBlogPost) => void;
  refreshKey?: number;
}

const PAGE_SIZE = 10;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { dateStyle: "medium" });
}

export default function AdminBlogList({
  onEdit,
  refreshKey = 0,
}: AdminBlogListProps) {
  const [posts, setPosts] = useState<DbBlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    // Admins see drafts too — this deliberately does not filter on
    // `published`, unlike the public-facing fetchBlogPosts().
    let query = supabase
      .from("blog_posts")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (searchTerm.trim()) {
      query = query.ilike("title", `%${searchTerm.trim()}%`);
    }

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      setErrorMessage(error.message);
    } else {
      setPosts((data as DbBlogPost[]) ?? []);
      setTotalPages(Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)));
    }
    setIsLoading(false);
  }, [searchTerm, page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts, refreshKey]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const togglePublished = async (post: DbBlogPost) => {
    setPendingId(post.id);
    const { error } = await supabase
      .from("blog_posts")
      .update({ published: !post.published })
      .eq("id", post.id);

    if (!error) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, published: !p.published } : p
        )
      );
    }
    setPendingId(null);
  };

  const handleDelete = async (post: DbBlogPost) => {
    const confirmed = window.confirm(`Delete "${post.title}"? This can't be undone.`);
    if (!confirmed) return;

    setPendingId(post.id);
    const { error } = await supabase.from("blog_posts").delete().eq("id", post.id);

    if (!error) {
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      fetchPosts();
    }
    setPendingId(null);
  };

  return (
    <div className="admin-blog-list">
      <div className="admin-blog-list__search">
        <Search size={16} strokeWidth={2} />
        <input
          type="text"
          placeholder="Search posts by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading && (
        <div className="admin-blog-list__state">
          <Loader2 size={18} className="admin-blog-list__spin" />
          Loading posts...
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="admin-blog-list__state admin-blog-list__state--error">
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && posts.length === 0 && (
        <div className="admin-blog-list__state">No posts found.</div>
      )}

      {!isLoading && posts.length > 0 && (
        <>
          <table className="admin-blog-list__table">
            <thead>
              <tr>
                <th>Post</th>
                <th>Date</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <div className="admin-blog-list__post">
                      {post.cover_image_url ? (
                        <img src={post.cover_image_url} alt={post.title} />
                      ) : (
                        <div className="admin-blog-list__thumb-placeholder" />
                      )}
                      <span>{post.title}</span>
                    </div>
                  </td>
                  <td>{formatDate(post.published_at)}</td>
                  <td>
                    <button
                      type="button"
                      className={`admin-blog-list__status-toggle ${
                        post.published ? "is-published" : "is-draft"
                      }`}
                      onClick={() => togglePublished(post)}
                      disabled={pendingId === post.id}
                    >
                      {post.published ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td>
                    <div className="admin-blog-list__actions">
                      <button
                        type="button"
                        aria-label={`Edit ${post.title}`}
                        onClick={() => onEdit?.(post)}
                        disabled={pendingId === post.id}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${post.title}`}
                        className="admin-blog-list__delete"
                        onClick={() => handleDelete(post)}
                        disabled={pendingId === post.id}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}