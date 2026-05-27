import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { getPost, type Post } from '../api';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    getPost(slug)
      .then(setPost)
      .catch(() => setError('Post not found or server unavailable.'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 w-3/4 bg-slate-800 rounded" />
        <div className="h-4 w-1/3 bg-slate-800 rounded" />
        <div className="h-64 bg-slate-800 rounded-xl" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 mb-4">{error ?? 'Post not found.'}</p>
        <Link to="/blog" className="text-violet-400 hover:text-violet-300">
          ← Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto">
      {/* Back link */}
      <Link
        to="/blog"
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-violet-400 transition-colors mb-6"
      >
        ← Back to Blog
      </Link>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{post.title}</h1>
        <div className="flex items-center gap-4 flex-wrap">
          <time
            dateTime={post.publishedAt}
            className="text-sm text-slate-400"
          >
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </time>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
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
      </header>

      <hr className="border-slate-700 mb-8" />

      {/* Markdown body */}
      <div className="prose prose-invert prose-violet max-w-none
        prose-headings:font-semibold prose-headings:text-white
        prose-p:text-slate-300 prose-p:leading-relaxed
        prose-a:text-violet-400 prose-a:no-underline hover:prose-a:underline
        prose-code:text-violet-300 prose-code:bg-slate-800 prose-code:px-1 prose-code:rounded
        prose-pre:bg-slate-800/80 prose-pre:border prose-pre:border-slate-700
        prose-blockquote:border-l-violet-500 prose-blockquote:text-slate-400
        prose-strong:text-white prose-li:text-slate-300
      ">
        <ReactMarkdown>{post.content ?? ''}</ReactMarkdown>
      </div>
    </article>
  );
}
