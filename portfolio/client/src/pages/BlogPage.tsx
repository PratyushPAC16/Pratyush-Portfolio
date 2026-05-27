import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPosts, type Post } from '../api';

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPosts()
      .then(setPosts)
      .catch(() => setError('Failed to load posts. Is the server running?'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <h1 className="text-3xl font-bold text-white mb-2">Blog</h1>
      <p className="text-slate-400 mb-8">Technical writing on embedded systems, ML, and software engineering.</p>

      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-slate-800 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <p className="text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {!loading && !error && posts.length === 0 && (
        <p className="text-slate-500 text-center py-16">No posts published yet.</p>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post._id}
              to={`/blog/${post.slug}`}
              className="group block bg-slate-800/60 border border-slate-700/50 hover:border-violet-500/50 hover:bg-slate-800 rounded-xl p-5 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-grow">
                  <h2 className="text-lg font-semibold text-white group-hover:text-violet-300 transition-colors mb-1">
                    {post.title}
                  </h2>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 text-violet-300 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date */}
                <time
                  dateTime={post.publishedAt}
                  className="shrink-0 text-xs text-slate-500 mt-1"
                >
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </time>
              </div>

              <span className="text-sm text-violet-400 group-hover:text-violet-300 transition-colors">
                Read more →
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
