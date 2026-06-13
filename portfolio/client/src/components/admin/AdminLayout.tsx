import { useState, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconDashboard() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2zM14 13a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5z" />
    </svg>
  );
}
function IconProjects() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}
function IconPosts() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}
function IconMessages() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}
function IconResume() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function IconMenu() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

// ─── Nav link config ──────────────────────────────────────────────────────────

const NAV_LINKS = [
  { to: '/admin',          label: 'Dashboard', icon: <IconDashboard /> },
  { to: '/admin/projects', label: 'Projects',  icon: <IconProjects /> },
  { to: '/admin/posts',    label: 'Posts',     icon: <IconPosts /> },
  { to: '/admin/messages', label: 'Messages',  icon: <IconMessages /> },
  { to: '/admin/resume',   label: 'Resume',    icon: <IconResume /> },
  { to: '/admin/settings', label: 'Settings',  icon: <IconSettings /> },
];

// ─── Sidebar content ──────────────────────────────────────────────────────────

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    logout();
    navigate('/admin');
    onClose?.();
  }, [logout, navigate, onClose]);

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-slate-200/80 dark:border-white/5">
        <div className="flex items-center gap-2">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
            style={{
              background: 'linear-gradient(135deg, rgba(99,255,210,0.3), rgba(139,92,246,0.3))',
              border: isDark ? '1px solid rgba(99,255,210,0.3)' : '1px solid rgba(13,148,136,0.3)',
              color: isDark ? '#63ffd2' : '#0d9488'
            }}
          >
            A
          </span>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white leading-none">Admin Panel</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-[140px]">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow px-3 py-4 space-y-0.5">
        {NAV_LINKS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'text-slate-900 dark:text-white bg-slate-200/50 dark:bg-white/10'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/20 dark:hover:bg-white/5'
              }`
            }
            style={({ isActive }) => isActive
              ? {
                  borderLeft: isDark ? '2px solid #63ffd2' : '2px solid #0d9488',
                  color: isDark ? '#63ffd2' : '#0d9488',
                  background: isDark ? 'rgba(99,255,210,0.08)' : 'rgba(13,148,136,0.06)'
                }
              : { borderLeft: '2px solid transparent' }
            }
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-200/80 dark:border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/5 dark:hover:bg-red-400/8 transition-all"
        >
          <IconLogout />
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── AdminLayout ──────────────────────────────────────────────────────────────

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const close = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="flex h-screen overflow-hidden transition-colors duration-300" style={{ background: isDark ? '#060d1f' : '#f8fafc' }}>
      {/* ── Desktop sidebar (always visible ≥ md) ── */}
      <aside
        className="hidden md:flex flex-col w-56 shrink-0 border-r border-slate-200 dark:border-slate-800 transition-colors duration-300"
        style={{ background: isDark ? 'rgba(8,15,36,0.95)' : 'rgba(255,255,255,0.9)' }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile drawer ── */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={close}
          />
          {/* Drawer */}
          <aside
            className="fixed inset-y-0 left-0 z-50 w-56 flex flex-col md:hidden border-r border-slate-200 dark:border-slate-800 transition-colors duration-300"
            style={{ background: isDark ? 'rgba(6,13,31,0.98)' : '#ffffff' }}
          >
            <SidebarContent onClose={close} />
          </aside>
        </>
      )}

      {/* ── Main area ── */}
      <div className="flex-grow flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div
          className="flex items-center gap-3 px-4 py-3 md:hidden border-b shrink-0 border-slate-200 dark:border-slate-800 transition-colors duration-300"
          style={{ background: isDark ? 'rgba(8,15,36,0.95)' : '#ffffff' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            aria-label="Open menu"
          >
            <IconMenu />
          </button>
          <span className="text-sm font-semibold text-slate-800 dark:text-white">Admin Panel</span>
        </div>

        {/* Scrollable content */}
        <main className="flex-grow overflow-y-auto p-5 md:p-7 text-slate-800 dark:text-slate-100">
          {children}
        </main>
      </div>
    </div>
  );
}
