import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProjects, type Project } from '../api';
import LabConsole from './LabConsole';
import pratyushImg from '../assets/Pratyush.png';
import { useResumeDownload } from '../hooks/useResumeDownload';
import { useTheme } from '../hooks/useTheme';
import TechIcon from './TechIcon';
import SkillsCard from './SkillsCard';

// ─── Motion variants ──────────────────────────────────────────────────────────

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const getCardVariants = (isDark: boolean) => ({
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: 'easeOut' as const },
  },
  hover: {
    y: -5,
    boxShadow: isDark
      ? '0 12px 30px rgba(99, 255, 210, 0.08), 0 0 0 1px rgba(99, 255, 210, 0.25)'
      : '0 10px 25px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(203, 213, 225, 1)',
    transition: { duration: 0.25, ease: 'easeOut' as const },
  },
});

// ─── 1. HeroCard ──────────────────────────────────────────────────────────────

function HeroCard({ onLabMode }: { onLabMode: () => void }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { download, isLoading: isDownloading } = useResumeDownload();

  return (
    <motion.div
      variants={getCardVariants(isDark)}
      whileHover="hover"
      className="glass-card md:col-span-2 md:row-span-2 p-7 flex flex-col justify-between min-h-[360px] relative overflow-hidden transition-all duration-300"
    >
      {/* Background glow accent */}
      <div
        className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(99,255,210,0.08) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(13,148,136,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Main Content Column (Text & CTAs) */}
      <div className="relative z-10 flex flex-col justify-between h-full w-full sm:max-w-[55%] md:max-w-[60%]">
        <div>
          {/* Mobile Profile Image (only visible on mobile screens) */}
          <div className="sm:hidden flex justify-center mb-6 relative">
            <div
              className="absolute -inset-1 rounded-full opacity-40 blur-sm"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, #63ffd2 0%, #a78bfa 100%)'
                  : 'linear-gradient(135deg, #0d9488 0%, #8b5cf6 100%)',
              }}
            />
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-teal-500/30 dark:border-[#63ffd2]/30">
              {/* Soft gradient fill behind photo in light mode */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-teal-50 to-slate-100 dark:from-transparent dark:to-transparent" />
              <img
                src={pratyushImg}
                alt="Pratyush Anand"
                className="relative w-full h-full object-cover rounded-full object-top"
                style={{ mixBlendMode: isDark ? 'normal' : 'multiply' }}
              />
            </div>
          </div>

          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full text-xs font-medium border bg-teal-500/5 dark:bg-[#63ffd2]/5 border-teal-500/20 dark:border-[#63ffd2]/25 text-teal-600 dark:text-[#63ffd2]"
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-[#63ffd2]"
              style={{ boxShadow: isDark ? '0 0 6px #63ffd2' : '0 0 6px #0d9488' }}
            />
            Available for new roles
          </motion.div>

          {/* Name */}
          <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-2 leading-tight">
            Pratyush Anand
          </h1>

          {/* Title line with accent */}
          <p
            className="text-base font-semibold mb-3 text-teal-600 dark:text-[#63ffd2]"
            style={{ textShadow: isDark ? '0 0 20px rgba(99,255,210,0.4)' : undefined }}
          >
            Full-Stack Developer&nbsp;•&nbsp;IoT&nbsp;•&nbsp;ML&nbsp;•&nbsp;VLSI
          </p>

          {/* Tagline */}
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-md">
            Building systems from silicon to servers. Passionate about embedded systems,
            machine learning pipelines, and full-stack web architecture.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-wrap gap-3 mt-8">
          <motion.div whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/projects"
              className={`block px-4 py-2.5 rounded-xl text-sm font-semibold text-center transition-all ${
                isDark
                  ? 'text-white'
                  : 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm hover:shadow'
              }`}
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(99,255,210,0.2) 0%, rgba(139,92,246,0.2) 100%)'
                  : undefined,
                border: isDark ? '1px solid rgba(99,255,210,0.3)' : '1px solid transparent',
                boxShadow: isDark ? '0 0 20px rgba(99,255,210,0.1)' : undefined,
              }}
            >
              View Projects
            </Link>
          </motion.div>

          <motion.div whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <button
              onClick={download}
              disabled={isDownloading}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-center transition-all disabled:opacity-75 disabled:cursor-wait ${
                isDark
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
              style={{
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1',
                background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc'
              }}
            >
              {isDownloading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-teal-600 dark:text-[#63ffd2]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Downloading...
                </>
              ) : (
                'Download Resume'
              )}
            </button>
          </motion.div>

          <motion.div whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <button
              onClick={onLabMode}
              className={`block w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-center transition-all ${
                isDark
                  ? 'text-[#63ffd2] hover:text-[#63ffd2]'
                  : 'text-teal-700 hover:text-teal-900'
              }`}
              style={{
                border: isDark ? '1px solid rgba(99,255,210,0.2)' : '1px solid #99f6e4',
                background: isDark ? 'rgba(99,255,210,0.05)' : '#f0fdfa',
              }}
            >
              ⌘ Lab Mode
            </button>
          </motion.div>
        </div>
      </div>

      {/* Desktop/Tablet Profile Image & Tech Scanning Rings (Absolute positioned on the right) */}
      <div className="absolute right-0 bottom-0 top-0 w-full sm:w-[45%] pointer-events-none select-none overflow-hidden z-0 hidden sm:block">
        {/* Tech scanning rings centered around the image background */}
        <div className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] md:w-[400px] md:h-[400px] flex items-center justify-center">
          {/* Inner radial gradient glow — soft teal circle in light, neon in dark */}
          <div
            className="absolute w-[180px] h-[180px] md:w-[240px] md:h-[240px] rounded-full"
            style={{
              background: isDark
                ? 'radial-gradient(circle, rgba(99,255,210,0.18) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(13,148,136,0.08) 0%, rgba(240,253,250,0.6) 50%, transparent 75%)',
            }}
          />
          {/* Ring 1 - Solid teal orbit line */}
          <div className="absolute w-[200px] h-[200px] md:w-[260px] md:h-[260px] rounded-full border border-teal-400/20 dark:border-[#63ffd2]/25" />
          {/* Ring 2 - Rotating dashed tech ring */}
          <div className="absolute w-[240px] h-[240px] md:w-[310px] md:h-[310px] rounded-full border border-teal-300/15 dark:border-[#63ffd2]/15 border-dashed animate-[spin_80s_linear_infinite]" />
          {/* Ring 3 - Outer thin orbit ring */}
          <div className="absolute w-[280px] h-[280px] md:w-[360px] md:h-[360px] rounded-full border border-teal-200/10 dark:border-[#63ffd2]/5" />
        </div>

        {/* Soft circular gradient behind photo — light mode only */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[260px] h-[340px] md:w-[300px] md:h-[400px] z-[5]"
          style={{
            background: isDark
              ? 'none'
              : 'radial-gradient(ellipse at 50% 70%, rgba(240,253,250,0.9) 0%, rgba(241,245,249,0.7) 40%, transparent 70%)',
          }}
        />

        {/* Profile Image with subtle fade mask at bottom */}
        <img
          src={pratyushImg}
          alt="Pratyush Anand"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[90%] md:h-[95%] w-auto object-contain object-bottom z-10 transition-transform duration-700 hover:scale-102"
          style={{
            maskImage: 'linear-gradient(to top, transparent 0%, black 15%)',
            WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 15%)',
            mixBlendMode: isDark ? 'normal' : 'multiply',
          }}
        />
      </div>

      {/* Decorative bottom bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: isDark
            ? 'linear-gradient(90deg, transparent, rgba(99,255,210,0.3), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(13,148,136,0.25), transparent)',
        }}
      />
    </motion.div>
  );
}

// ─── 2. ProjectsCard ──────────────────────────────────────────────────────────

function ProjectsCard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjects()
      .then((all) => setProjects(all.filter((p) => p.featured).slice(0, 3)))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const fallbackProjects = [
    { _id: '1', title: 'Smart Agriculture IoT Hub', techStack: ['MQTT', 'ESP32', 'Node.js'] },
    { _id: '2', title: 'Neural Style Transfer', techStack: ['PyTorch', 'Python', 'CUDA'] },
    { _id: '3', title: 'RISC-V Processor Core', techStack: ['Verilog', 'Cadence', 'Synopsys'] },
  ] as Project[];

  const displayProjects = projects.length > 0 ? projects : (!loading ? fallbackProjects : []);

  return (
    <motion.div
      variants={getCardVariants(isDark)}
      whileHover="hover"
      className="glass-card md:row-span-2 p-5 flex flex-col min-h-[340px] transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-white">Featured Projects</h2>
        <Link
          to="/projects"
          className="text-xs transition-colors text-teal-600 dark:text-[#63ffd2]"
        >
          View all →
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3 flex-grow">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl animate-pulse bg-slate-200/50 dark:bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="space-y-3 flex-grow">
          {displayProjects.map((p) => {
            return (
              <Link
                key={p._id}
                to={`/projects/${p._id}`}
                className="block rounded-xl p-3 transition-all hover:scale-[1.02]"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                  border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #cbd5e1',
                }}
              >
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2 line-clamp-1">{p.title}</p>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {p.techStack.slice(0, 3).map((t) => (
                    <TechIcon
                      key={t}
                      name={t}
                      label={t}
                    />
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div
        className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800"
      >
        <p className="text-[11px] text-slate-500 dark:text-slate-500">
          Engineering & development projects
        </p>
      </div>
    </motion.div>
  );
}

// ─── 3. SystemTopologyCard ────────────────────────────────────────────────────

const RELATIONSHIPS: Record<string, string[]> = {
  "Portfolio UI": ["Vercel (Frontend)", "Express API"],
  "Lab Console": ["Express API"],
  "Admin Dashboard": ["Express API", "Auth Service (JWT)"],
  "Express API": [
    "Portfolio UI", "Lab Console", "Admin Dashboard", "Auth Service (JWT)",
    "Contact Service (Email)", "Analytics Logger", "Blog Service", "MongoDB Atlas",
    "Render (Backend)"
  ],
  "Auth Service (JWT)": ["Express API", "Admin Dashboard"],
  "Contact Service (Email)": ["Express API", "Email Provider (SMTP)"],
  "Blog Service": ["Express API", "MongoDB Atlas"],
  "Analytics Logger": ["Express API", "MongoDB Atlas"],
  "MongoDB Atlas": ["Express API", "Analytics Logger", "Blog Service"],
  "Email Provider (SMTP)": ["Contact Service (Email)"],
  "Vercel (Frontend)": ["Portfolio UI"],
  "Render (Backend)": ["Express API"],
};

function SystemTopologyCard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [hoveredNode, setHoveredNode] = useState<{ name: string; desc: string } | null>(null);

  const Connector = ({
    label,
    direction = 'vertical',
    gradient,
  }: {
    label?: string;
    direction?: 'vertical' | 'horizontal';
    gradient: string;
  }) => {
    return (
      <div className={`flex ${direction === 'vertical' ? 'flex-col h-10' : 'row w-12'} items-center justify-center my-1 select-none`}>
        {direction === 'vertical' ? (
          <>
            <div className={`w-px flex-grow bg-gradient-to-b ${gradient}`} />
            {label && (
              <span className="text-[8px] font-mono font-semibold px-1.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-500 scale-90 -my-1 relative z-10">
                {label}
              </span>
            )}
            <div className={`w-px flex-grow bg-gradient-to-b ${gradient}`} />
          </>
        ) : (
          <>
            <div className={`h-px flex-grow bg-gradient-to-r ${gradient}`} />
            {label && (
              <span className="text-[8px] font-mono font-semibold px-1.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-500 scale-90 -mx-1 relative z-10">
                {label}
              </span>
            )}
            <div className={`h-px flex-grow bg-gradient-to-r ${gradient}`} />
          </>
        )}
      </div>
    );
  };

  const Node = ({
    name,
    sub,
    type,
    desc,
  }: {
    name: string;
    sub?: string;
    type: 'client' | 'backend' | 'data' | 'external' | 'deploy';
    desc: string;
  }) => {
    const isHighlighted = hoveredNode && (
      hoveredNode.name === name ||
      (RELATIONSHIPS[hoveredNode.name] && RELATIONSHIPS[hoveredNode.name].includes(name))
    );

    const colors = {
      client: {
        border: 'border-teal-500/20 dark:border-teal-500/10',
        borderHover: 'hover:border-teal-400 dark:hover:border-teal-400',
        highlight: 'border-teal-500 bg-teal-500/15 text-teal-600 dark:text-[#63ffd2] shadow-[0_0_12px_rgba(99,255,210,0.25)]',
        text: 'text-teal-600 dark:text-teal-400/90',
        bg: 'bg-teal-500/[0.02]',
      },
      backend: {
        border: 'border-blue-500/20 dark:border-blue-500/10',
        borderHover: 'hover:border-blue-400 dark:hover:border-blue-400',
        highlight: 'border-blue-500 bg-blue-500/15 text-blue-600 dark:text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.25)]',
        text: 'text-blue-600 dark:text-blue-400/90',
        bg: 'bg-blue-500/[0.02]',
      },
      data: {
        border: 'border-emerald-500/20 dark:border-emerald-500/10',
        borderHover: 'hover:border-emerald-400 dark:hover:border-emerald-400',
        highlight: 'border-emerald-400 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
        text: 'text-emerald-600 dark:text-emerald-400/90',
        bg: 'bg-emerald-500/[0.02]',
      },
      external: {
        border: 'border-purple-500/20 dark:border-purple-500/10',
        borderHover: 'hover:border-purple-400 dark:hover:border-purple-400',
        highlight: 'border-purple-500 bg-purple-500/15 text-purple-600 dark:text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.25)]',
        text: 'text-purple-600 dark:text-purple-400/90',
        bg: 'bg-purple-500/[0.02]',
      },
      deploy: {
        border: 'border-slate-500/20 dark:border-slate-500/10',
        borderHover: 'hover:border-slate-400 dark:hover:border-slate-400',
        highlight: 'border-slate-500 bg-slate-500/15 text-slate-600 dark:text-slate-400 shadow-[0_0_12px_rgba(148,163,184,0.25)]',
        text: 'text-slate-600 dark:text-slate-400/90',
        bg: 'bg-slate-500/[0.02]',
      },
    };

    const style = colors[type];

    return (
      <motion.div
        whileHover={{ y: -1, scale: 1.015 }}
        onMouseEnter={() => setHoveredNode({ name, desc })}
        onMouseLeave={() => setHoveredNode(null)}
        className={`p-2.5 rounded-xl border text-[11px] font-mono text-center transition-all cursor-pointer select-none ${style.bg} ${
          isHighlighted ? style.highlight : `${style.border} ${style.borderHover} ${style.text}`
        }`}
      >
        <div className="font-semibold">{name}</div>
        {sub && <div className="text-[9px] opacity-60 font-sans mt-0.5">{sub}</div>}
      </motion.div>
    );
  };

  return (
    <motion.div
      variants={getCardVariants(isDark)}
      whileHover="hover"
      className="glass-card p-5 transition-all duration-300"
    >
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-white">System Architecture & Topology</h2>
        <p className="text-[10px] text-slate-500 dark:text-slate-500">Interactive live mapping & dependencies</p>
      </div>

      {/* Main Diagram Area */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* LEFT COLUMN: Core Path (3/5 width on desktop) */}
        <div className="lg:col-span-3 flex flex-col justify-between">
          
          {/* Client Layer */}
          <div className="border border-teal-500/10 bg-teal-500/[0.01] p-3.5 rounded-2xl">
            <div className="text-[9px] font-mono text-teal-500/80 uppercase tracking-widest mb-2.5 font-bold">Client Layer</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Node
                name="Portfolio UI"
                sub="React 19 SPA"
                type="client"
                desc="Client Single Page Application built with React 19, Vite, and Tailwind CSS. Hosted on Vercel."
              />
              <Node
                name="Lab Console"
                sub="Telemetry overlay"
                type="client"
                desc="Interactive slide-out terminal console overlay for monitoring system statistics and running virtual diagnostics."
              />
              <Node
                name="Admin Dashboard"
                sub="Analytics UI"
                type="client"
                desc="Protected admin route for monitoring download metrics, resume logs, and managing portfolio content."
              />
            </div>
          </div>

          <Connector label="REST / WS" gradient="from-teal-500/20 to-blue-500/20" />

          {/* Backend Layer */}
          <div className="border border-blue-500/10 bg-blue-500/[0.01] p-3.5 rounded-2xl">
            <div className="text-[9px] font-mono text-blue-500/80 uppercase tracking-widest mb-2.5 font-bold">Backend Layer</div>
            <div className="flex flex-col gap-3">
              <Node
                name="Express API"
                sub="Node.js Gateway"
                type="backend"
                desc="Core backend API server built with Node.js and Express. Handles API routing, rate limiting, and database queries. Hosted on Render."
              />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Node
                  name="Auth Service (JWT)"
                  sub="Session guardian"
                  type="backend"
                  desc="Secures admin routes using JSON Web Tokens (JWT) for protected portfolio management."
                />
                <Node
                  name="Contact Service (Email)"
                  sub="Form dispatcher"
                  type="backend"
                  desc="Processes messages sent from the contact form and dispatches them via SMTP (Nodemailer)."
                />
                <Node
                  name="Blog Service"
                  sub="Posts CRUD"
                  type="backend"
                  desc="Manages blog posts with full CRUD operations, slug-based routing, and tag categorization."
                />
                <Node
                  name="Analytics Logger"
                  sub="Telemetry logs"
                  type="backend"
                  desc="Intercepts resume download actions and logs timestamps, user agents, and IP hashes to MongoDB."
                />
              </div>
            </div>
          </div>

          <Connector label="Mongoose / ODM" gradient="from-blue-500/20 to-emerald-500/20" />

          {/* Data Layer */}
          <div className="border border-emerald-500/10 bg-emerald-500/[0.01] p-3.5 rounded-2xl">
            <div className="text-[9px] font-mono text-emerald-500/80 uppercase tracking-widest mb-2.5 font-bold">Data Layer</div>
            <div className="grid grid-cols-1 gap-2">
              <Node
                name="MongoDB Atlas"
                sub="Database Cluster"
                type="data"
                desc="Cloud-hosted MongoDB Atlas NoSQL database storing projects, uploaded images, blog posts, contact messages, download logs, and admin credentials."
              />
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Deployment & External (2/5 width on desktop) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* Hosting & Deployment */}
          <div className="border border-slate-500/10 bg-slate-500/[0.01] p-3.5 rounded-2xl flex flex-col gap-2">
            <div>
              <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2.5 font-bold">Hosting & Delivery</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Node
                  name="Vercel (Frontend)"
                  sub="Global Edge CDN"
                  type="deploy"
                  desc="Edge-delivery platform hosting the static portfolio UI with global CDN caching and atomic deployments."
                />
                <Node
                  name="Render (Backend)"
                  sub="Web Service Dyno"
                  type="deploy"
                  desc="Cloud application platform hosting the dynamic Node.js/Express server and background workers."
                />
              </div>
            </div>
          </div>

          {/* External Services */}
          <div className="border border-purple-500/10 bg-purple-500/[0.01] p-3.5 rounded-2xl flex flex-col gap-2">
            <div className="text-[9px] font-mono text-purple-500/80 uppercase tracking-widest mb-1.5 font-bold">External Services</div>
            <div className="flex flex-col gap-2">
              <Node
                name="Email Provider (SMTP)"
                sub="Nodemailer Dispatcher"
                type="external"
                desc="Transactional email delivery service (SMTP/Nodemailer) for instant contact form notifications."
              />
            </div>
          </div>

        </div>

      </div>

      {/* Dynamic Telemetry Diagnostic Terminal Console */}
      <div className="mt-6 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/90 font-mono text-[11px] min-h-[48px] flex items-center transition-colors duration-300">
        <span className="text-teal-500 dark:text-[#63ffd2] mr-2 shrink-0 animate-pulse">&gt;</span>
        {hoveredNode ? (
          <div className="text-slate-700 dark:text-slate-300">
            <strong className="text-slate-900 dark:text-white">{hoveredNode.name}</strong>: {hoveredNode.desc}
          </div>
        ) : (
          <span className="text-slate-400 dark:text-slate-500">Hover over any architecture node to inspect diagnostic telemetry...</span>
        )}
      </div>
    </motion.div>
  );
}



// ─── 5. ContactCard ───────────────────────────────────────────────────────────

function ContactCard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const email = 'pratyushanand160705@gmail.com';
  const github = 'https://github.com/PratyushPAC16';
  const linkedin = 'https://linkedin.com/in/pratyush-anand-';
  const leetcode = 'https://leetcode.com/u/PratyushPAC/';
  const twitter = 'https://x.com/pratyushpac?s=21';

  return (
    <motion.div variants={getCardVariants(isDark)} whileHover="hover" className="glass-card p-5 flex flex-col justify-between transition-all duration-300">
      <div>
        {/* Availability pill */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-3"
          style={{
            background: isDark ? 'rgba(99,255,210,0.07)' : '#f0fdfa',
            border: isDark ? '1px solid rgba(99,255,210,0.18)' : '1px solid #99f6e4',
            color: isDark ? '#63ffd2' : '#0f766e',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse bg-teal-500 dark:bg-[#63ffd2]"
            style={{ boxShadow: isDark ? '0 0 6px #63ffd2' : '0 0 6px #0d9488' }}
          />
          Open to opportunities
        </div>

        <h2 className="text-sm font-semibold text-slate-800 dark:text-white mb-1">Let's Connect</h2>
        <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-4">
          Open to SDE&nbsp;/&nbsp;Embedded&nbsp;/&nbsp;IoT roles — full-time or contract.
        </p>
      </div>

      <div className="space-y-2">
        {/* Email button */}
        <a
          href={`mailto:${email}`}
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm transition-all hover:scale-[1.02]"
          style={{
            background: isDark ? 'rgba(99,255,210,0.08)' : '#f0fdfa',
            border: isDark ? '1px solid rgba(99,255,210,0.2)' : '1px solid #99f6e4',
            color: isDark ? '#63ffd2' : '#0f766e',
          }}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="text-xs font-medium truncate">{email}</span>
        </a>

        {/* Social grid */}
        <div className="grid grid-cols-2 gap-2">
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-[1.02]"
            style={{
              background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
              border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid #cbd5e1',
              color: isDark ? '#94a3b8' : '#334155',
            }}
          >
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.387.6.113.793-.263.793-.587v-2.05c-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.775.418-1.305.762-1.605-2.665-.3-5.467-1.334-5.467-5.932 0-1.31.468-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.3 1.23A11.5 11.5 0 0112 6.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.655 1.653.243 2.874.12 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.807 5.628-5.48 5.922.43.372.814 1.103.814 2.222v3.293c0 .327.19.705.8.586C20.565 21.796 24 17.298 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </a>

          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-[1.02]"
            style={{
              background: isDark ? 'rgba(10,102,194,0.1)' : '#eff6ff',
              border: isDark ? '1px solid rgba(10,102,194,0.3)' : '1px solid #93c5fd',
              color: isDark ? '#60a5fa' : '#0a66c2',
            }}
          >
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            LinkedIn
          </a>

          <a
            href={leetcode}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-[1.02]"
            style={{
              background: isDark ? 'rgba(255,161,22,0.08)' : '#fffbeb',
              border: isDark ? '1px solid rgba(255,161,22,0.25)' : '1px solid #fde68a',
              color: isDark ? '#ffa116' : '#b45309',
            }}
          >
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13.483 0a1.374 1.374 0 0 0-.961.411L7.1 5.828a1.374 1.374 0 0 0-.005 1.945l6.4 6.4a1.374 1.374 0 0 0 1.942.007l5.421-5.419a1.374 1.374 0 0 0-.007-1.942l-6.4-6.4a1.374 1.374 0 0 0-.968-.41zm-.022 1.372l6.4 6.4-5.42 5.42-6.4-6.4zm-8.603 9.612a1.374 1.374 0 0 0-.968.41L.412 14.162a1.374 1.374 0 0 0 .007 1.942l6.4 6.4a1.374 1.374 0 0 0 1.942-.007l2.768-2.766a1.374 1.374 0 0 0-.007-1.942l-6.4-6.4a1.374 1.374 0 0 0-.968-.41zm-.022 1.372l6.4 6.4-2.766 2.768-6.4-6.4z" />
            </svg>
            LeetCode
          </a>

          <a
            href={twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-[1.02]"
            style={{
              background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
              border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1',
              color: isDark ? '#ffffff' : '#0f172a',
            }}
          >
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            X
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// ─── BentoGrid (main export) ──────────────────────────────────────────────────

export default function BentoGrid() {
  const [labOpen, setLabOpen] = useState(false);
  const openLab = useCallback(() => setLabOpen(true), []);
  const closeLab = useCallback(() => setLabOpen(false), []);

  return (
    <>
      {/* Slide-in Lab Console */}
      <LabConsole isOpen={labOpen} onClose={closeLab} />

      {/* Main wrapper for staggered animations and bottom spacing */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="space-y-4 pb-16"
      >
        {/* Row 1: Hero & Featured Projects */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          style={{ gridAutoRows: 'minmax(180px, auto)' }}
        >
          <HeroCard onLabMode={openLab} />
          <ProjectsCard />
        </div>

        {/* Row 2: Vertical Stack of detailed cards (full width) */}
        <div className="flex flex-col gap-4">
          <SkillsCard />
          <SystemTopologyCard />
          <ContactCard />
        </div>
      </motion.div>
    </>
  );
}
