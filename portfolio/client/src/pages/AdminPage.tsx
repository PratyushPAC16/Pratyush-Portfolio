import { type FormEvent, useState } from 'react';
import { Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminProjects from '../components/admin/AdminProjects';
import AdminPosts from '../components/admin/AdminPosts';
import AdminMessages from '../components/admin/AdminMessages';
import AdminResume from '../components/admin/AdminResume';
import AdminSettings from '../components/admin/AdminSettings';
import { forgotPassword, resetPassword } from '../api';

// ─── Shared card shell ────────────────────────────────────────────────────────

function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#050815] transition-colors duration-300">
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
        </div>
        <div className="rounded-2xl p-7 bg-white/80 dark:bg-slate-900/70 border border-slate-200/50 dark:border-[#63ffd2]/12 shadow-sm dark:shadow-[0_0_40px_rgba(99,255,210,0.05)] backdrop-blur-xl transition-all duration-300">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Shared input style ───────────────────────────────────────────────────────

const inputCls =
  'w-full bg-slate-100/50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:border-teal-500 dark:focus:border-teal-400/50 focus:ring-1 focus:ring-teal-500/10 dark:focus:ring-teal-400/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 outline-none transition-colors';

const btnCls =
  'w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]';

const btnStyle = {
  background: 'linear-gradient(135deg, rgba(99,255,210,0.2) 0%, rgba(139,92,246,0.2) 100%)',
  border: '1px solid rgba(99,255,210,0.3)',
  color: '#63ffd2',
  boxShadow: '0 0 20px rgba(99,255,210,0.08)',
};

// ─── Login Page ───────────────────────────────────────────────────────────────

type AuthView = 'login' | 'forgot';

function LoginPage() {
  const { login } = useAuth();
  const [view, setView] = useState<AuthView>('login');

  // ── Login state ──────────────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      await login(email, password);
    } catch {
      setLoginError('Invalid email or password.');
    } finally {
      setLoginLoading(false);
    }
  }

  // ── Forgot password state ────────────────────────────────────────────────
  const [fpEmail, setFpEmail] = useState('');
  const [fpLoading, setFpLoading] = useState(false);
  const [fpDone, setFpDone] = useState(false);
  const [fpError, setFpError] = useState<string | null>(null);

  async function handleForgot(e: FormEvent) {
    e.preventDefault();
    setFpError(null);
    setFpLoading(true);
    try {
      await forgotPassword(fpEmail);
      setFpDone(true);
    } catch {
      setFpError('Something went wrong. Please try again.');
    } finally {
      setFpLoading(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  if (view === 'forgot') {
    return (
      <AuthCard>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Forgot password</h1>
        <p className="text-slate-500 text-sm mb-6">
          Enter your admin email and we'll send a reset link.
        </p>

        {fpDone ? (
          <div className="space-y-4">
            <div
              className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}
            >
              <span className="shrink-0 mt-0.5">✓</span>
              <span>
                If that email is registered, a reset link has been sent. Check your inbox
                (and spam folder).
              </span>
            </div>
            <button
              onClick={() => { setView('login'); setFpDone(false); setFpEmail(''); }}
              className={btnCls}
              style={btnStyle}
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleForgot} className="space-y-4" noValidate>
            <div>
              <label htmlFor="fp-email" className="block text-xs font-medium text-slate-400 mb-1.5">
                Email address
              </label>
              <input
                id="fp-email"
                type="email"
                required
                value={fpEmail}
                onChange={(e) => setFpEmail(e.target.value)}
                placeholder="admin@portfolio.com"
                className={inputCls}
              />
            </div>

            {fpError && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2.5">
                {fpError}
              </p>
            )}

            <button type="submit" disabled={fpLoading || !fpEmail} className={btnCls} style={btnStyle}>
              {fpLoading ? 'Sending…' : 'Send Reset Link'}
            </button>

            <button
              type="button"
              onClick={() => setView('login')}
              className="w-full text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-[#63ffd2] transition-colors text-center"
            >
              ← Back to login
            </button>
          </form>
        )}
      </AuthCard>
    );
  }

  // Default: login
  return (
    <AuthCard>
      <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Admin Login</h1>
      <p className="text-slate-500 text-sm mb-6">Portfolio admin panel</p>

      <form onSubmit={handleLogin} className="space-y-4" noValidate>
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
            className={inputCls}
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
            className={inputCls}
          />
        </div>

        {loginError && (
          <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2.5">
            {loginError}
          </p>
        )}

        <button type="submit" disabled={loginLoading} className={btnCls} style={btnStyle}>
          {loginLoading ? 'Signing in…' : 'Sign In'}
        </button>

        {/* Forgot password link */}
        <button
          type="button"
          onClick={() => { setView('forgot'); setLoginError(null); }}
          className="w-full text-sm text-slate-400 hover:text-teal-600 dark:hover:text-[#63ffd2] transition-colors text-center mt-1"
        >
          Forgot password?
        </button>
      </form>

      <p className="text-center text-xs text-slate-500 dark:text-slate-600 mt-5">
        Default: admin@portfolio.com / admin123
      </p>
    </AuthCard>
  );
}

// ─── Reset Password Page (reached via email link) ─────────────────────────────

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mismatch = confirm.length > 0 && newPassword !== confirm;
  const canSubmit = newPassword.length >= 8 && newPassword === confirm && !loading;

  // Guard: if no token/email in URL, redirect to login
  if (!token || !email) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      await resetPassword(email, token, newPassword);
      setDone(true);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard>
      <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Set new password</h1>
      <p className="text-slate-500 text-sm mb-6">
        Choose a new password for <span className="text-slate-300">{email}</span>.
      </p>

      {done ? (
        <div className="space-y-4">
          <div
            className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}
          >
            <span className="shrink-0 mt-0.5">✓</span>
            <span>Your password has been reset successfully!</span>
          </div>
          <button onClick={() => navigate('/admin', { replace: true })} className={btnCls} style={btnStyle}>
            Go to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="rp-new" className="block text-xs font-medium text-slate-400 mb-1.5">
              New Password <span className="text-slate-600">(min 8 chars)</span>
            </label>
            <input
              id="rp-new"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="rp-confirm" className="block text-xs font-medium text-slate-400 mb-1.5">
              Confirm Password
            </label>
            <input
              id="rp-confirm"
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className={inputCls}
            />
            {mismatch && (
              <p className="text-[11px] text-red-400 mt-1.5">Passwords don't match</p>
            )}
            {confirm.length > 0 && !mismatch && (
              <p className="text-[11px] text-emerald-400 mt-1.5">✓ Passwords match</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <button type="submit" disabled={!canSubmit} className={btnCls} style={btnStyle}>
            {loading ? 'Saving…' : 'Reset Password'}
          </button>
        </form>
      )}
    </AuthCard>
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
        <Route path="settings" element={<AdminSettings />} />
        {/* Catch-all inside admin */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}

// ─── AdminPage — auth gate ────────────────────────────────────────────────────

export default function AdminPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm bg-slate-50 dark:bg-[#050815] transition-colors duration-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
          Loading…
        </div>
      </div>
    );
  }

  // Handle reset-password link (even when not authenticated)
  if (searchParams.get('token') && searchParams.get('email')) {
    return <ResetPasswordPage />;
  }

  return isAuthenticated ? <AdminContent /> : <LoginPage />;
}
