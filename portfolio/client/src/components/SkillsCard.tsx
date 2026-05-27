import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import SkillRadar from './SkillRadar';
import SkillsPcb from './SkillsPcb';

// ─── Motion Variants ─────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function SkillsCard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [viewMode, setViewMode] = useState<'radar' | 'pcb'>('pcb');

  return (
    <motion.div
      variants={getCardVariants(isDark)}
      whileHover="hover"
      className="glass-card p-5 relative overflow-hidden transition-all duration-300"
    >
      {/* PCB Corner Accent Brackets */}
      <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-500/30 dark:border-emerald-400/25 pointer-events-none" />
      <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-emerald-500/30 dark:border-emerald-400/25 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-emerald-500/30 dark:border-emerald-400/25 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-emerald-500/30 dark:border-emerald-400/25 pointer-events-none" />

      {/* PCB Trace Overlay (rendered behind content) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.06] dark:opacity-[0.12] pointer-events-none z-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="pcb-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.75" fill="#10b981" />
          </pattern>
        </defs>
        {/* Background Grid Pattern */}
        <rect width="100%" height="100%" fill="url(#pcb-grid)" />

        {/* Decorative Angled Circuit Traces */}
        <path d="M 30,80 L 120,80 L 160,120 L 160,240" stroke="#10b981" strokeWidth="1" fill="none" />
        <path d="M 350,60 L 350,180 L 290,240 L 100,240" stroke="#10b981" strokeWidth="1" fill="none" />
        <path d="M 200,320 L 200,450 L 240,490" stroke="#10b981" strokeWidth="1" fill="none" />
        <path d="M 400,260 L 400,380 L 320,460" stroke="#10b981" strokeWidth="1" fill="none" />

        {/* Terminals / Vias */}
        <circle cx="120" cy="80" r="2.5" fill="#10b981" />
        <circle cx="160" cy="120" r="2.5" fill="#10b981" />
        <circle cx="350" cy="180" r="2.5" fill="#10b981" />
        <circle cx="290" cy="240" r="2.5" fill="#10b981" />
        <circle cx="200" cy="450" r="2.5" fill="#10b981" />
      </svg>

      {/* Card Header & View Switcher */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-white font-mono uppercase tracking-wider font-bold">Skills</h2>
          {viewMode === 'radar' ? (
            <p className="text-[10px] text-slate-500 dark:text-slate-500 font-mono">Telemetry Analyzer (0-5 scale)</p>
          ) : (
            <p className="text-[10px] text-slate-500 dark:text-slate-500 font-mono">Board-level view of my stack</p>
          )}
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-900/60 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800/80 text-[10px] font-mono">
          <button
            onClick={() => setViewMode('radar')}
            className={`px-2 py-0.5 rounded-md transition-all ${
              viewMode === 'radar'
                ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-[#63ffd2] shadow-sm font-medium'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Analyzer
          </button>
          <button
            onClick={() => setViewMode('pcb')}
            className={`px-2 py-0.5 rounded-md transition-all ${
              viewMode === 'pcb'
                ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-[#63ffd2] shadow-sm font-medium'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            PCB Board
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="min-h-[280px] flex flex-col justify-center relative z-10">
        {viewMode === 'radar' ? (
          <SkillRadar />
        ) : (
          <SkillsPcb />
        )}
      </div>
    </motion.div>
  );
}
