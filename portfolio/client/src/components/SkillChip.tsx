import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// ─── Props & Types ────────────────────────────────────────────────────────────

interface SkillChipProps {
  name: string;
  variant?: 'web' | 'ml' | 'vlsi' | 'embedded' | 'tools';
}

const ICON_SLUGS: Record<string, string> = {
  "react": "react",
  "node.js": "nodejs",
  "nodejs": "nodejs",
  "express": "express",
  "mongodb": "mongodb",
  "typescript": "typescript",
  "tailwindcss": "tailwindcss",
  "tailwind": "tailwindcss",
  "python": "python",
  "pytorch": "pytorch",
  "jupyter": "jupyter",
  "numpy": "numpy",
  "git": "git",
  "github": "github",
  "vscode": "vscode",
  "docker": "docker",
  "linux": "linux",
  "arduino": "arduino",
};

// ─── Style Mapping ────────────────────────────────────────────────────────────

const variantStyles = {
  web: {
    border: 'border-teal-500/30 dark:border-teal-500/20',
    hoverBorder: 'hover:border-teal-400 dark:hover:border-teal-400',
    text: 'text-teal-400',
    glow: 'hover:shadow-[0_0_12px_rgba(45,212,191,0.35)]',
    iconColor: 'text-teal-400 dark:text-[#63ffd2]/80',
  },
  ml: {
    border: 'border-amber-500/30 dark:border-amber-500/20',
    hoverBorder: 'hover:border-amber-400 dark:hover:border-amber-400',
    text: 'text-amber-400',
    glow: 'hover:shadow-[0_0_12px_rgba(245,158,11,0.35)]',
    iconColor: 'text-amber-400 dark:text-amber-300/80',
  },
  vlsi: {
    border: 'border-cyan-500/30 dark:border-cyan-500/20',
    hoverBorder: 'hover:border-cyan-400 dark:hover:border-cyan-400',
    text: 'text-cyan-400',
    glow: 'hover:shadow-[0_0_12px_rgba(6,182,212,0.35)]',
    iconColor: 'text-cyan-400 dark:text-cyan-300/80',
  },
  embedded: {
    border: 'border-emerald-500/30 dark:border-emerald-500/20',
    hoverBorder: 'hover:border-emerald-400 dark:hover:border-emerald-400',
    text: 'text-emerald-400',
    glow: 'hover:shadow-[0_0_12px_rgba(16,185,129,0.35)]',
    iconColor: 'text-emerald-400 dark:text-emerald-300/80',
  },
  tools: {
    border: 'border-purple-500/30 dark:border-purple-500/20',
    hoverBorder: 'hover:border-purple-400 dark:hover:border-purple-400',
    text: 'text-purple-400',
    glow: 'hover:shadow-[0_0_12px_rgba(168,85,247,0.35)]',
    iconColor: 'text-purple-400 dark:text-purple-300/80',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

const SkillChip: React.FC<SkillChipProps> = ({ name, variant = 'web' }) => {
  const normalized = name.toLowerCase().trim();
  const slug = ICON_SLUGS[normalized];

  const getUrl = () => {
    if (!slug) return null;
    return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-original.svg`;
  };

  const [fallbackStage, setFallbackStage] = useState(0); // 0 = cdn, 1 = fallback SVG
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    setFallbackStage(0);
    setImgSrc(getUrl());
  }, [name]);

  const handleError = () => {
    setFallbackStage(1);
    setImgSrc(null);
  };

  const currentStyle = variantStyles[variant];

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`relative group flex items-center gap-2 h-9 px-3 rounded-lg border bg-gradient-to-br from-slate-800/70 via-slate-900 to-slate-950/90 shadow-[0_2px_6px_rgba(0,0,0,0.5)] transition-all duration-300 cursor-pointer ${currentStyle.border} ${currentStyle.hoverBorder} ${currentStyle.glow}`}
    >
      {/* Pins Left */}
      <div className="absolute -left-1 top-0 bottom-0 flex flex-col justify-around py-1.5 w-1 pointer-events-none">
        {[1, 2, 3].map((i) => (
          <div
            key={`left-pin-${i}`}
            className="w-1 h-0.5 rounded-sm bg-slate-400/40 group-hover:bg-slate-300/80 transition-all duration-300"
          />
        ))}
      </div>

      {/* Pins Right */}
      <div className="absolute -right-1 top-0 bottom-0 flex flex-col justify-around py-1.5 w-1 pointer-events-none">
        {[1, 2, 3].map((i) => (
          <div
            key={`right-pin-${i}`}
            className="w-1 h-0.5 rounded-sm bg-slate-400/40 group-hover:bg-slate-300/80 transition-all duration-300"
          />
        ))}
      </div>

      {/* Technology Icon */}
      <div className="w-5 h-5 flex items-center justify-center shrink-0">
        {imgSrc && fallbackStage === 0 ? (
          <img
            src={imgSrc}
            alt={name}
            className="w-5 h-5 object-contain"
            onError={handleError}
          />
        ) : (
          <svg
            className={`w-4.5 h-4.5 transition-colors ${currentStyle.iconColor}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            {/* Generic microchip layout SVG */}
            <rect x="5" y="5" width="14" height="14" rx="2" />
            <path d="M9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4" />
          </svg>
        )}
      </div>

      {/* Technology Label */}
      <span className="text-[11px] font-mono font-medium text-slate-100 group-hover:text-white transition-colors duration-200">
        {name}
      </span>
    </motion.div>
  );
};

export default SkillChip;
