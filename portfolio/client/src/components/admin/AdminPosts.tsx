import { useState, useEffect, useCallback, type FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  getPosts, getPost, createPost, updatePost, deletePost,
  type Post, type PostPayload,
} from '../../api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const INPUT_CLS =
  'w-full bg-slate-900/60 border border-white/10 hover:border-white/20 focus:border-sky-400/40 focus:ring-1 focus:ring-sky-400/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors';

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

type PostForm = { title: string; slug: string; content: string; tags: string };

const DEFAULT_FORM: PostForm = { title: '', slug: '', content: '', tags: '' };

function postToForm(p: Post): PostForm {
  return { title: p.title, slug: p.slug, content: p.content ?? '', tags: p.tags.join(', ') };
}

function formToPayload(f: PostForm): PostPayload {
  return {
    title: f.title.trim(),
    slug: f.slug.trim(),
    content: f.content,
    tags: f.tags.split(',').map((t) => t.trim()).filter(Boolean),
  };
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="rounded-2xl p-6 max-w-sm w-full" style={{ background: '#0a101e', border: '1px solid rgba(248,113,113,0.2)' }}>
        <h3 className="text-base font-semibold text-white mb-1">Delete Post?</h3>
        <p className="text-sm text-slate-400 mb-5">
          <span className="text-white font-medium">{name}</span> will be permanently deleted.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 border border-white/10 rounded-lg transition-colors">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-semibold text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg hover:bg-red-400/20 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Post Form Modal ──────────────────────────────────────────────────────────

interface ModalProps {
  mode: 'add' | 'edit';
  initial: PostForm;
  onSave: (f: PostForm) => Promise<void>;
  onClose: () => void;
}

function PostModal({ mode, initial, onSave, onClose }: ModalProps) {
  const [form, setForm] = useState<PostForm>(initial);
  const [activePanel, setActivePanel] = useState<'write' | 'preview'>('write');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');

  const set = (k: keyof PostForm, v: string) => {
    setForm((f) => {
      const next = { ...f, [k]: v };
      // Auto-generate slug from title if not manually edited
      if (k === 'title' && !slugTouched) {
        next.slug = slugify(v);
      }
      return next;
    });
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm">
      <div
        className="w-full max-w-5xl rounded-2xl flex flex-col"
        style={{ background: '#0a101e', border: '1px solid rgba(255,255,255,0.1)', height: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 shrink-0">
          <h2 className="text-sm font-semibold text-white">
            {mode === 'add' ? 'New Post' : 'Edit Post'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors text-lg leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden">
          {/* Metadata row */}
          <div className="px-5 py-4 border-b border-white/6 shrink-0 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Title *</label>
              <input className={INPUT_CLS} required value={form.title}
                onChange={(e) => set('title', e.target.value)} placeholder="Post title" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Slug *</label>
              <input className={INPUT_CLS} required value={form.slug}
                onChange={(e) => { setSlugTouched(true); set('slug', e.target.value); }}
                placeholder="my-post-slug" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Tags (comma separated)</label>
              <input className={INPUT_CLS} value={form.tags}
                onChange={(e) => set('tags', e.target.value)}
                placeholder="vlsi, python, tutorial" />
            </div>
          </div>

          {/* Editor tabs */}
          <div className="px-5 pt-3 pb-0 shrink-0 flex items-center gap-2 border-b border-white/6">
            {(['write', 'preview'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActivePanel(tab)}
                className={`px-4 py-2 text-xs font-medium rounded-t-lg capitalize transition-colors ${
                  activePanel === tab
                    ? 'text-white border-b-2 border-sky-400'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
            <span className="ml-auto text-[10px] text-slate-600 font-mono hidden md:inline">
              Markdown supported
            </span>
          </div>

          {/* Editor area */}
          <div className="flex-grow overflow-hidden flex">
            {/* Write panel */}
            {(activePanel === 'write') && (
              <textarea
                className="flex-grow p-5 bg-transparent outline-none text-sm text-slate-200 font-mono resize-none"
                placeholder="Write your post in Markdown…"
                value={form.content}
                onChange={(e) => set('content', e.target.value)}
                style={{ lineHeight: '1.75' }}
              />
            )}

            {/* Preview panel */}
            {activePanel === 'preview' && (
              <div className="flex-grow p-5 overflow-y-auto">
                {form.content ? (
                  <div className="prose-sm max-w-none text-slate-300 leading-relaxed">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h1 className="text-xl font-bold text-white mt-4 mb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-lg font-semibold text-white mt-4 mb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-base font-semibold text-slate-200 mt-3 mb-1">{children}</h3>,
                        p: ({ children }) => <p className="text-slate-300 mb-3 leading-relaxed">{children}</p>,
                        code: ({ children }) => (
                          <code className="text-sky-300 bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                        ),
                        pre: ({ children }) => (
                          <pre className="bg-slate-800/80 border border-white/10 rounded-lg p-4 overflow-x-auto text-xs font-mono mb-3">{children}</pre>
                        ),
                        ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3 text-slate-300">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-3 text-slate-300">{children}</ol>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-2 border-sky-500 pl-4 italic text-slate-400 mb-3">{children}</blockquote>
                        ),
                        a: ({ href, children }) => (
                          <a href={href} className="text-sky-400 hover:underline">{children}</a>
                        ),
                      }}
                    >
                      {form.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-slate-600 text-sm italic">Nothing to preview yet…</p>
                )}
              </div>
            )}

            {/* Desktop side-by-side: always show both */}
            {/* (On wider screens show both panels simultaneously) */}
          </div>

          {error && (
            <div className="px-5 pb-2 shrink-0">
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 justify-end px-5 py-4 border-t border-white/8 shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 border border-white/10 hover:border-white/20 rounded-lg transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
              style={{ background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)', color: '#38bdf8' }}
            >
              {saving ? 'Saving…' : mode === 'add' ? 'Publish Post' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── AdminPosts ───────────────────────────────────────────────────────────────

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<Post | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    getPosts()
      .then(setPosts)
      .catch(() => setError('Failed to load posts'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const openAdd = () => { setEditTarget(null); setModalMode('add'); };

  const openEdit = async (p: Post) => {
    // Fetch full post with content before opening editor
    const full = await getPost(p.slug).catch(() => p);
    setEditTarget(full);
    setModalMode('edit');
  };

  const closeModal = () => { setModalMode(null); setEditTarget(null); };

  const handleSave = async (form: PostForm) => {
    const payload = formToPayload(form);
    if (editTarget) {
      await updatePost(editTarget.slug, payload);
    } else {
      await createPost(payload);
    }
    refresh();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deletePost(deleteTarget.slug);
    setDeleteTarget(null);
    refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Posts</h1>
          <p className="text-sm text-slate-500 mt-0.5">{posts.length} published</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors"
          style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.25)', color: '#38bdf8' }}
        >
          + Write Post
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading…</div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 text-sm">{error}</div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">No posts yet. Write your first one!</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/6">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Slug</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Published</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p._id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-200 line-clamp-1">{p.title}</p>
                    {p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.tags.slice(0, 3).map((t) => (
                          <span key={t} className="text-[9px] px-1.5 py-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/15 rounded-full">#{t}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500 font-mono hidden md:table-cell">
                    /{p.slug}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500 hidden sm:table-cell">
                    {new Date(p.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 rounded-lg border border-red-400/20 hover:border-red-400/40 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalMode && (
        <PostModal
          mode={modalMode}
          initial={editTarget ? postToForm(editTarget) : DEFAULT_FORM}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          name={deleteTarget.title}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
