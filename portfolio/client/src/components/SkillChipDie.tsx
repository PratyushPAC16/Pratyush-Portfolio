import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Data Types ──────────────────────────────────────────────────────────────

interface BlockData {
  id: string;
  label: string;
  codename: string;
  skills: string[];
  project: string;
  gridClass: string;
}

const blocks: BlockData[] = [
  {
    id: 'web',
    label: 'Web Stack',
    codename: 'CORE SYSTEM // WEB.CORE',
    skills: ['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'Tailwind'],
    project: 'Personal Portfolio (React 19 + Express + MongoDB)',
    gridClass: 'col-span-1 lg:col-span-2 row-span-1 lg:row-span-2',
  },
  {
    id: 'ml',
    label: 'ML / Data',
    codename: 'NEURAL COPROCESSOR // NPU.01',
    skills: ['Python', 'PyTorch', 'NumPy', 'Jupyter'],
    project: 'Neural Style Transfer & PyTorch Image Classifier',
    gridClass: 'col-span-1 lg:col-span-1 row-span-1 lg:row-span-2',
  },
  {
    id: 'vlsi',
    label: 'VLSI / RF',
    codename: 'RF SIGNAL // ANALOG.MIXED',
    skills: ['Verilog', 'Cadence', 'ADS'],
    project: 'RISC-V 32-bit Core & RF Bandpass Filter Sim',
    gridClass: 'col-span-1 lg:col-span-1 row-span-1',
  },
  {
    id: 'embedded',
    label: 'Embedded / IoT',
    codename: 'INTERFACE BRIDGE // EMBED.IO',
    skills: ['Arduino', 'ESP32', 'MQTT'],
    project: 'Smart Agriculture Node & Telemetry Dispatcher',
    gridClass: 'col-span-1 lg:col-span-1 row-span-1',
  },
  {
    id: 'tools',
    label: 'Tools',
    codename: 'SYSTEM PERIPHERAL // SYS.BUS',
    skills: ['Git', 'GitHub', 'VS Code', 'Docker', 'Linux'],
    project: 'Dockerized Microservices Environment & Git Workflows',
    gridClass: 'col-span-1 lg:col-span-4 row-span-1',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const SkillChipDie: React.FC = () => {
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);

  return (
    <div className="relative w-full p-[1.5px] rounded-[24px] bg-gradient-to-br from-teal-500/40 via-emerald-400/40 to-purple-600/40 shadow-[0_0_24px_rgba(99,255,210,0.06)] select-none">
      {/* Outer Die Container */}
      <div className="relative w-full h-full p-4 rounded-[23px] bg-slate-950/98 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.85)_0%,rgba(5,8,21,1)_100%)] overflow-hidden">
        
        {/* Subtle silicon circuit die layout grid lines in background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

        {/* Die grid cells */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 relative z-10">
          {blocks.map((block) => {
            const isHovered = hoveredBlock === block.id;
            return (
              <motion.div
                key={block.id}
                onMouseEnter={() => setHoveredBlock(block.id)}
                onMouseLeave={() => setHoveredBlock(null)}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={`relative flex flex-col justify-between p-3.5 rounded-2xl border transition-all duration-300 min-h-[120px] ${block.gridClass} ${
                  isHovered
                    ? 'border-emerald-400 bg-slate-900/60 shadow-[0_0_15px_rgba(99,255,210,0.15)]'
                    : 'border-slate-800/80 dark:border-slate-900 bg-slate-950/40'
                }`}
              >
                {/* Glow overlay inside block */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 via-transparent to-purple-500/5 pointer-events-none"
                    />
                  )}
                </AnimatePresence>

                {/* Header info */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 dark:text-[#63ffd2]">
                      {block.label}
                    </span>
                    <span className="text-[7.5px] font-mono text-slate-500 dark:text-slate-600 scale-90">
                      {block.codename}
                    </span>
                  </div>

                  {/* Skills tags list */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {block.skills.map((skill) => (
                      <span
                        key={skill}
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-md border transition-colors ${
                          isHovered
                            ? 'border-emerald-500/20 bg-emerald-500/5 text-slate-200'
                            : 'border-slate-800 bg-slate-950/60 text-slate-400'
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Telemetry Details (shows on hover) */}
                <div className="mt-3 overflow-hidden h-5 flex items-center">
                  <AnimatePresence mode="wait">
                    {isHovered ? (
                      <motion.div
                        key="active-project"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="text-[8.5px] font-mono text-slate-400 flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                        <span>System Ref: <span className="text-purple-300 font-bold">{block.project}</span></span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="idle-ref"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.35 }}
                        exit={{ opacity: 0 }}
                        className="text-[8px] font-mono text-slate-500 select-none"
                      >
                        SYS.REG::{block.id.toUpperCase()}//READY
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default SkillChipDie;
