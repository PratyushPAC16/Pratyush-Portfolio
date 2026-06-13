import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { changePassword } from '../../api';
import { useAuth } from '../../hooks/useAuth';

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconLock() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}
function IconEye({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

// ─── Password strength ────────────────────────────────────────────────────────

function getStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score, label: 'Weak',   color: '#f87171' };
  if (score <= 2) return { score, label: 'Fair',   color: '#fb923c' };
  if (score <= 3) return { score, label: 'Good',   color: '#facc15' };
  if (score <= 4) return { score, label: 'Strong', color: '#34d399' };
  return             { score, label: 'Very Strong', color: '#63ffd2' };
}

// ─── Password input with show/hide toggle ─────────────────────────────────────

function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-slate-400 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
          <IconLock />
        </div>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? '••••••••'}
          autoComplete="off"
          className="w-full bg-slate-900/60 border border-white/10 hover:border-white/20 focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/10 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((s) => !s)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          <IconEye open={show} />
        </button>
      </div>
      {hint && <p className="text-[11px] text-slate-600 mt-1.5">{hint}</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminSettings() {
  const { user } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = getStrength(next);
  const mismatch = confirm.length > 0 && next !== confirm;
  const canSubmit = current.length > 0 && next.length >= 8 && next === confirm && !submitting;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await changePassword(current, next);
      setSuccess(true);
      setCurrent('');
      setNext('');
      setConfirm('');
      // Auto-hide success banner after 4 s
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      const msg: string =
        err?.response?.data?.message ?? 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const cardStyle = {
    background: 'rgba(15,23,42,0.6)',
    border: '1px solid rgba(255,255,255,0.07)',
    backdropFilter: 'blur(12px)',
  };

  return (
    <div>
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="mb-7">
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your admin account security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* ── Left: Change password form ──────────────────────────────────── */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl p-7" style={cardStyle}>

            {/* Card header */}
            <h2 className="text-sm font-semibold text-white mb-6 flex items-center gap-2.5">
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(99,255,210,0.12)', border: '1px solid rgba(99,255,210,0.25)', color: '#63ffd2' }}
              >
                <IconShield />
              </span>
              Change Password
            </h2>

            {/* Success banner */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium mb-5"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}
                >
                  <IconCheck />
                  Password changed successfully!
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm font-medium mb-5"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
                >
                  <span className="shrink-0 mt-0.5">⚠</span>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Current password */}
              <PasswordInput
                id="current-password"
                label="Current Password"
                value={current}
                onChange={setCurrent}
                placeholder="Enter your current password"
              />

              {/* New password + strength meter */}
              <div>
                <PasswordInput
                  id="new-password"
                  label="New Password"
                  value={next}
                  onChange={setNext}
                  hint="Minimum 8 characters"
                />

                {/* Strength bar */}
                {next.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 overflow-hidden"
                  >
                    <div className="flex items-center gap-3 mb-1.5">
                      <div className="flex-grow flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className="flex-1 h-1 rounded-full transition-all duration-300"
                            style={{
                              background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.08)',
                            }}
                          />
                        ))}
                      </div>
                      <span
                        className="text-[11px] font-semibold shrink-0 transition-colors duration-300"
                        style={{ color: strength.color }}
                      >
                        {strength.label}
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Confirm new password */}
              <div>
                <PasswordInput
                  id="confirm-password"
                  label="Confirm New Password"
                  value={confirm}
                  onChange={setConfirm}
                />
                {/* Mismatch warning */}
                <AnimatePresence>
                  {mismatch && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-[11px] text-red-400 mt-1.5"
                    >
                      Passwords don't match
                    </motion.p>
                  )}
                </AnimatePresence>
                {/* Match indicator */}
                <AnimatePresence>
                  {confirm.length > 0 && !mismatch && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1"
                    >
                      <IconCheck /> Passwords match
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={!canSubmit}
                whileHover={canSubmit ? { scale: 1.01 } : {}}
                whileTap={canSubmit ? { scale: 0.98 } : {}}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                style={{
                  background: 'linear-gradient(135deg, rgba(99,255,210,0.18), rgba(139,92,246,0.18))',
                  border: '1px solid rgba(99,255,210,0.28)',
                  color: '#63ffd2',
                  boxShadow: canSubmit ? '0 0 20px rgba(99,255,210,0.06)' : 'none',
                }}
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-[#63ffd2] border-t-transparent animate-spin" />
                    Updating password…
                  </>
                ) : (
                  <>
                    <IconShield />
                    Update Password
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </div>

        {/* ── Right: Account info + tips ──────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Account info card */}
          <div className="rounded-2xl p-5" style={cardStyle}>
            <p className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-widest">Account</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Email</span>
                <span className="text-xs text-slate-300 font-mono truncate max-w-[180px]">
                  {user?.email ?? '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Role</span>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
                  style={{ background: 'rgba(99,255,210,0.1)', color: '#63ffd2', border: '1px solid rgba(99,255,210,0.2)' }}
                >
                  {user?.role ?? 'admin'}
                </span>
              </div>
              <div
                className="flex items-center gap-2 pt-2 mt-2 border-t border-white/5 text-[11px] text-slate-500"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#34d399', boxShadow: '0 0 6px #34d399' }}
                />
                Session active
              </div>
            </div>
          </div>

          {/* Security tips */}
          <div className="rounded-2xl p-5" style={cardStyle}>
            <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-widest">
              Password tips
            </p>
            <ul className="space-y-2.5">
              {[
                'Use at least 8 characters',
                'Mix uppercase & lowercase letters',
                'Include numbers and symbols',
                'Avoid reusing old passwords',
                'Don\'t share your credentials',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
                  <span
                    className="shrink-0 mt-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(99,255,210,0.1)', color: '#63ffd2' }}
                  >
                    ✓
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
