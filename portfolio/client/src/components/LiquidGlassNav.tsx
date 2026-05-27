import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollPosition } from '../hooks/useScrollPosition';

// ─── Nav links ────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Projects' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────
export default function LiquidGlassNav() {
  const { isScrolled, isVisible } = useScrollPosition(40);

  return (
    <AnimatePresence>
      {/* Outer fixed wrapper — always present but slides in/out */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{
          y: isVisible ? 0 : -100,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className="fixed top-0 inset-x-0 z-50 px-4 pointer-events-none"
        style={{ paddingTop: isScrolled ? '0.5rem' : '0.75rem' }}
      >
        {/* Inner glass pill */}
        <motion.nav
          layout
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={[
            // shape & layout
            'pointer-events-auto mx-auto max-w-6xl flex items-center justify-between',
            'transition-all duration-300 ease-out',
            // rounded corners — full pill on desktop, softer on mobile
            'rounded-xl sm:rounded-2xl',
            // ── GLASS: light ──
            'bg-gradient-to-r from-white/70 via-white/40 to-white/70',
            'border border-white/30',
            'backdrop-blur-2xl',
            // ── GLASS: dark ──
            'dark:from-slate-900/80 dark:via-slate-900/50 dark:to-slate-900/80',
            'dark:border-teal-900/40',
            // padding — shrinks when scrolled
            isScrolled ? 'px-5 py-2' : 'px-6 py-3.5',
            // shadow — intensifies when scrolled
            isScrolled
              ? 'shadow-[0_12px_40px_rgba(15,23,42,0.22)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.9)]'
              : 'shadow-[0_18px_45px_rgba(15,23,42,0.12)] dark:shadow-[0_18px_45px_rgba(0,0,0,0.65)]',
            // border opacity ramps up when scrolled
            isScrolled ? 'border-white/40 dark:border-teal-800/50' : '',
          ].join(' ')}
        >
          {/* ── Shine highlight ── */}
          <div
            className="pointer-events-none absolute inset-x-4 -top-px h-10 rounded-t-2xl
                       bg-gradient-to-b from-white/40 to-transparent
                       dark:from-white/[0.08] dark:to-transparent
                       opacity-60"
            aria-hidden
          />

          {/* ── Logo ── */}
          <Link
            to="/"
            className="relative z-10 text-lg font-bold tracking-tight text-teal-600 dark:text-teal-400 shrink-0"
          >
            DevPortfolio
          </Link>

          {/* ── Links ── */}
          <nav className="relative z-10 flex items-center gap-1 sm:gap-2">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  [
                    'relative px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'text-teal-600 dark:text-teal-400 bg-teal-500/10 dark:bg-teal-500/10'
                      : 'text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-500/5 dark:hover:bg-white/5',
                  ].join(' ')
                }
              >
                {label}
              </NavLink>
            ))}

            {/* Admin pill */}
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                [
                  'px-3 py-1.5 rounded-lg border text-sm font-medium transition-all duration-200 ml-1',
                  isActive
                    ? 'bg-teal-600/10 dark:bg-teal-500/15 border-teal-500/40 text-teal-700 dark:text-teal-300'
                    : 'bg-white/40 dark:bg-white/5 border-slate-200/60 dark:border-slate-700/50 text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 hover:border-teal-400/40',
                ].join(' ')
              }
            >
              Admin
            </NavLink>
          </nav>
        </motion.nav>
      </motion.header>
    </AnimatePresence>
  );
}
