import { useState, useEffect, useCallback, type FormEvent } from 'react';
import {
  getProjects, createProject, updateProject, deleteProject,
  uploadImage, getDirectImageUrl,
  type Project, type ProjectPayload,
} from '../../api';

// ─── Shared UI helpers ────────────────────────────────────────────────────────

const INPUT_CLS =
  'w-full bg-slate-900/60 border border-white/10 hover:border-white/20 focus:border-teal-400/40 focus:ring-1 focus:ring-teal-400/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors';



// ─── Default form shape ───────────────────────────────────────────────────────

type ProjectForm = {
  title: string; description: string;
  techStack: string; githubUrl: string; liveUrl: string;
  thumbnail: string; featured: boolean;
};

const DEFAULT_FORM: ProjectForm = {
  title: '', description: '',
  techStack: '', githubUrl: '', liveUrl: '',
  thumbnail: '', featured: false,
};

function projectToForm(p: Project): ProjectForm {
  return {
    title: p.title, description: p.description,
    techStack: p.techStack.join(', '), githubUrl: p.githubUrl ?? '',
    liveUrl: p.liveUrl ?? '', thumbnail: p.thumbnail ?? '',
    featured: p.featured,
  };
}

function formToPayload(f: ProjectForm): ProjectPayload {
  return {
    title: f.title.trim(), description: f.description.trim(),
    techStack: f.techStack.split(',').map((s) => s.trim()).filter(Boolean),
    githubUrl: f.githubUrl.trim() || undefined,
    liveUrl: f.liveUrl.trim() || undefined,
    thumbnail: f.thumbnail.trim() || undefined,
    featured: f.featured,
  };
}

// ─── Project Form Modal ───────────────────────────────────────────────────────

interface ModalProps {
  mode: 'add' | 'edit';
  initial: ProjectForm;
  onSave: (f: ProjectForm) => Promise<void>;
  onClose: () => void;
}

function ProjectModal({ mode, initial, onSave, onClose }: ModalProps) {
  const [form, setForm] = useState<ProjectForm>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const set = (k: keyof ProjectForm, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    try {
      const result = await uploadImage(file);
      set('thumbnail', result.url);
    } catch (err: any) {
      setUploadError(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="w-full max-w-xl rounded-2xl flex flex-col max-h-[92vh]"
        style={{ background: '#0a101e', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 shrink-0">
          <h2 className="text-sm font-semibold text-white">
            {mode === 'add' ? 'Add Project' : 'Edit Project'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors text-lg leading-none">×</button>
        </div>

        {/* Scrollable form */}
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Title *</label>
            <input className={INPUT_CLS} required value={form.title}
              onChange={(e) => set('title', e.target.value)} placeholder="Project title" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Description *</label>
            <textarea className={`${INPUT_CLS} resize-y min-h-[80px]`} required
              value={form.description} onChange={(e) => set('description', e.target.value)}
              placeholder="Brief project description" />
          </div>



          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Tech Stack (comma separated)</label>
            <input className={INPUT_CLS} value={form.techStack}
              onChange={(e) => set('techStack', e.target.value)}
              placeholder="React, Node.js, MongoDB" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">GitHub URL</label>
              <input className={INPUT_CLS} type="url" value={form.githubUrl}
                onChange={(e) => set('githubUrl', e.target.value)}
                placeholder="https://github.com/…" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Live URL</label>
              <input className={INPUT_CLS} type="url" value={form.liveUrl}
                onChange={(e) => set('liveUrl', e.target.value)}
                placeholder="https://…" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Project Thumbnail *</label>
            {form.thumbnail ? (
              <div className="relative rounded-lg overflow-hidden border border-white/10 aspect-video max-w-sm bg-slate-950/40">
                <img
                  src={getDirectImageUrl(form.thumbnail)}
                  alt="Thumbnail Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => set('thumbnail', '')}
                  className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 hover:scale-105 text-white rounded-full p-1.5 transition-all text-xs font-bold leading-none shadow-md backdrop-blur-sm"
                  title="Remove Image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-teal-400/30 rounded-xl p-6 bg-slate-900/30 transition-all hover:bg-slate-900/50 group relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <svg className="w-8 h-8 text-slate-500 group-hover:text-teal-400 transition-colors mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-slate-400 group-hover:text-slate-300 font-medium">
                  {uploading ? 'Uploading image...' : 'Click or drag image to upload'}
                </span>
                <span className="text-[10px] text-slate-600 mt-1">PNG, JPG, WEBP (max. 5MB)</span>
              </div>
            )}
            {uploadError && (
              <p className="text-xs text-red-400 mt-1.5 bg-red-400/5 px-2 py-1 rounded border border-red-400/10 inline-block">{uploadError}</p>
            )}
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input type="checkbox" checked={form.featured}
              onChange={(e) => set('featured', e.target.checked)}
              className="w-4 h-4 rounded accent-teal-400" />
            <span className="text-sm text-slate-300">Mark as Featured</span>
          </label>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="flex gap-3 justify-end px-5 py-4 border-t border-white/8 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors rounded-lg border border-white/10 hover:border-white/20">
            Cancel
          </button>
          <button
            type="submit"
            form={undefined}
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
            style={{ background: 'rgba(99,255,210,0.15)', border: '1px solid rgba(99,255,210,0.3)', color: '#63ffd2' }}
          >
            {saving ? 'Saving…' : mode === 'add' ? 'Create Project' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete confirm inline ────────────────────────────────────────────────────

function DeleteConfirm({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="rounded-2xl p-6 max-w-sm w-full" style={{ background: '#0a101e', border: '1px solid rgba(248,113,113,0.2)' }}>
        <h3 className="text-base font-semibold text-white mb-1">Delete Project?</h3>
        <p className="text-sm text-slate-400 mb-5">
          <span className="text-white font-medium">{name}</span> will be permanently deleted.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 border border-white/10 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-semibold text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg hover:bg-red-400/20 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AdminProjects ────────────────────────────────────────────────────────────

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    getProjects()
      .then(setProjects)
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const openAdd = () => { setEditTarget(null); setModalMode('add'); };
  const openEdit = (p: Project) => { setEditTarget(p); setModalMode('edit'); };
  const closeModal = () => { setModalMode(null); setEditTarget(null); };

  const handleSave = async (form: ProjectForm) => {
    const payload = formToPayload(form);
    if (editTarget) {
      await updateProject(editTarget._id, payload);
    } else {
      await createProject(payload);
    }
    refresh();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteProject(deleteTarget._id);
    setDeleteTarget(null);
    refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Projects</h1>
          <p className="text-sm text-slate-500 mt-0.5">{projects.length} total</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors"
          style={{ background: 'rgba(99,255,210,0.12)', border: '1px solid rgba(99,255,210,0.25)', color: '#63ffd2' }}
        >
          + Add Project
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading…</div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 text-sm">{error}</div>
        ) : projects.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">No projects yet. Add your first one!</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/6">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Featured</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Created</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p._id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-200 line-clamp-1">{p.title}</p>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    {p.featured ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full text-amber-400 bg-amber-400/10 border border-amber-400/20">⭐ Yes</span>
                    ) : (
                      <span className="text-xs text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500 hidden md:table-cell">
                    {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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

      {/* Modals */}
      {modalMode && (
        <ProjectModal
          mode={modalMode}
          initial={editTarget ? projectToForm(editTarget) : DEFAULT_FORM}
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
