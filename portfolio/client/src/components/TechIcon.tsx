import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TechIconProps {
  name: string;
  label: string;
  colored?: boolean;
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

export default function TechIcon({ name, label, colored = true }: TechIconProps) {
  const normalized = name.toLowerCase().trim();
  const slug = ICON_SLUGS[normalized];

  const getUrl = (stage: number) => {
    if (!slug) return null;
    const format = stage === 0 && !colored ? 'plain' : 'original';
    return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-${format}.svg`;
  };

  const [fallbackStage, setFallbackStage] = useState(0); // 0 = initial, 1 = original fallback, 2 = custom SVG fallback
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    setFallbackStage(0);
    setImgSrc(getUrl(0));
  }, [name, colored]);

  const handleError = () => {
    if (fallbackStage === 0 && !colored) {
      // Try falling back to the colored original version before giving up
      setFallbackStage(1);
      setImgSrc(getUrl(1));
    } else {
      // Fallback to custom SVG icon
      setFallbackStage(2);
      setImgSrc(null);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.08 }}
      className="flex flex-col items-center justify-center w-[60px] h-[70px] rounded-xl border border-teal-200 dark:border-white/5 bg-teal-50 dark:bg-slate-900/40 shadow-sm p-1 transition-all duration-300 hover:border-teal-400 dark:hover:border-teal-400/30 hover:shadow-md group"
    >
      <div className="w-8 h-8 flex items-center justify-center mb-1 shrink-0">
        {imgSrc && fallbackStage < 2 ? (
          <img
            src={imgSrc}
            alt={label}
            className="w-8 h-8 object-contain transition-transform group-hover:scale-110"
            onError={handleError}
          />
        ) : (
          <svg
            className="w-7 h-7 text-teal-600 dark:text-[#63ffd2]/80 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
          </svg>
        )}
      </div>
      <span className="text-[9px] font-semibold text-teal-700 dark:text-slate-400 group-hover:text-teal-900 dark:group-hover:text-[#63ffd2] text-center truncate w-full px-0.5 transition-colors duration-200">
        {label}
      </span>
    </motion.div>
  );
}
