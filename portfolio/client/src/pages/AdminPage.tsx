import { type FormEvent, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminProjects from '../components/admin/AdminProjects';
import AdminPosts from '../components/admin/AdminPosts';
import AdminMessages from '../components/admin/AdminMessages';
import AdminResume from '../components/admin/AdminResume';

// ─── Login Page ───────────────────────────────────────────────────────────────

function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      // AuthProvider will update isAuthenticated and the page re-renders to dashboard
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#050815] transition-colors duration-300"
    >
      {/* Circuit overlay (inherit from globals.css body) */}
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4 text-lg font-black"
            style={{
              background: 'linear-gradient(135deg, rgba(99,255,210,0.2), rgba(139,92,246,0.2))',
              border: '1px solid rgba(99,255,210,0.3)',
              boxShadow: '0 0 30px rgba(99,255,210,0.1)',
              color: '#63ffd2',
            }}
          >
            A
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Admin Login</h1>
          <p className="text-slate-500 text-sm mt-1">Portfolio admin panel</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-7 bg-white/80 dark:bg-slate-900/70 border border-slate-200/50 dark:border-[#63ffd2]/12 shadow-sm dark:shadow-[0_0_40px_rgba(99,255,210,0.05)] backdrop-blur-xl transition-all duration-300"
        >
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="admin-email" className="block text-xs font-medium text-slate-400 mb-1.5">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@portfolio.com"
                className="w-full bg-slate-100/50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:border-teal-500 dark:focus:border-teal-400/50 focus:ring-1 focus:ring-teal-500/10 dark:focus:ring-teal-400/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-medium text-slate-400 mb-1.5">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-100/50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:border-teal-500 dark:focus:border-teal-400/50 focus:ring-1 focus:ring-teal-500/10 dark:focus:ring-teal-400/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 outline-none transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: 'linear-gradient(135deg, rgba(99,255,210,0.2) 0%, rgba(139,92,246,0.2) 100%)',
                border: '1px solid rgba(99,255,210,0.3)',
                color: '#63ffd2',
                boxShadow: '0 0 20px rgba(99,255,210,0.08)',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-600 mt-5">
            Default: admin@portfolio.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Admin content with layout + routes ──────────────────────────────────────

function AdminContent() {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="posts" element={<AdminPosts />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="resume" element={<AdminResume />} />
        {/* Catch-all inside admin */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}

// ─── AdminPage — auth gate ────────────────────────────────────────────────────

export default function AdminPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-slate-500 text-sm bg-slate-50 dark:bg-[#050815] transition-colors duration-300"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
          Loading…
        </div>
      </div>
    );
  }

  return isAuthenticated ? <AdminContent /> : <LoginPage />;
}
