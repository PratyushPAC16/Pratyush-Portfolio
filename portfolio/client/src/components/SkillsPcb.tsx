import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SkillChip from './SkillChip';

// ─── Data Types ──────────────────────────────────────────────────────────────

interface ChipData {
  id: string;
  partNo: string;
  label: string;
  skills: string[];
  project: string;
  pinCount: number;
  gridClass: string;
}

const pcbChips: ChipData[] = [
  {
    id: 'web',
    partNo: 'IC-WEB.01',
    label: 'WEB STACK',
    skills: ['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'Tailwind'],
    project: 'Full-Stack Portfolio UI & download logger',
    pinCount: 8,
    gridClass: 'col-span-1 lg:col-span-3 row-span-1 lg:row-span-2 min-h-[160px] lg:min-h-[250px]',
  },
  {
    id: 'vlsi',
    partNo: 'IC-VLSI.03',
    label: 'VLSI / RF',
    skills: ['Verilog', 'Cadence', 'ADS'],
    project: 'RISC-V CPU Core & analog filter simulations',
    pinCount: 4,
    gridClass: 'col-span-1 lg:col-span-3 row-span-1 min-h-[110px] lg:min-h-[112px]',
  },
  {
    id: 'embedded',
    partNo: 'IC-EMBD.04',
    label: 'EMBEDDED / IoT',
    skills: ['Arduino', 'ESP32', 'MQTT'],
    project: 'IoT Smart Agriculture ESP32 bridge node',
    pinCount: 4,
    gridClass: 'col-span-1 lg:col-span-3 row-span-1 min-h-[110px] lg:min-h-[112px]',
  },
  {
    id: 'ml',
    partNo: 'IC-ML.02',
    label: 'ML / DATA',
    skills: ['Python', 'PyTorch', 'NumPy', 'Jupyter'],
    project: 'Neural Style Transfer & image classifying pipeline',
    pinCount: 8,
    gridClass: 'col-span-1 lg:col-span-3 row-span-1 lg:row-span-2 min-h-[160px] lg:min-h-[250px]',
  },
  {
    id: 'tools',
    partNo: 'IC-BUS.05',
    label: 'TOOLS',
    skills: ['Git', 'GitHub', 'VSCode', 'Docker', 'Linux'],
    project: 'Dockerized developer runner & version controls',
    pinCount: 6,
    gridClass: 'col-span-1 lg:col-span-6 row-span-1 min-h-[110px] lg:min-h-[112px]',
  },
];

// ─── Sub-Components ───────────────────────────────────────────────────────────

/** DIP Pin Leads extending from the side of the semiconductor package */
const ChipPins: React.FC<{ side: 'left' | 'right'; count: number; active: boolean }> = ({ side, count, active }) => {
  return (
    <div
      className={`absolute ${
        side === 'left' ? '-left-2' : '-right-2'
      } top-0 bottom-0 flex flex-col justify-around py-3 w-2 pointer-events-none z-0`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-center relative w-2 h-2">
          {/* Solder pad on the PCB */}
          <div
            className={`w-2.5 h-1.5 rounded-sm transition-all duration-300 ${
              active
                ? 'bg-amber-400 shadow-[0_0_4px_#fbbf24]'
                : 'bg-gradient-to-r from-slate-400 to-slate-500'
            }`}
          />
          {/* Metal pin lead lying on the solder pad */}
          <div
            className={`absolute w-2 h-0.5 rounded-[1px] bg-gradient-to-b from-slate-200 to-slate-400 border border-slate-300/30 shadow-[0_0.5px_1px_rgba(255,255,255,0.4)] ${
              side === 'left' ? 'left-0.5' : 'right-0.5'
            }`}
          />
        </div>
      ))}
    </div>
  );
};

/** Surface-Mount Devices (Resistors/Capacitors) scattered across the motherboard */
const SMDComponent: React.FC<{
  type: 'resistor' | 'capacitor';
  x: string;
  y: string;
  rotate?: number;
}> = ({ type, x, y, rotate = 0 }) => {
  return (
    <div
      className="absolute hidden lg:flex items-center justify-between w-3 h-1.5 rounded-[1px] bg-slate-950/80 border border-emerald-500/10 pointer-events-none select-none z-10"
      style={{
        left: x,
        top: y,
        transform: `rotate(${rotate}deg)`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.6)',
      }}
    >
      {/* Solder Endcaps */}
      <div className="w-[3px] h-full bg-gradient-to-b from-slate-300 to-slate-400" />
      {/* Device Body */}
      <div className={`flex-grow h-full ${type === 'capacitor' ? 'bg-[#b45309]' : 'bg-[#334155]'}`} />
      <div className="w-[3px] h-full bg-gradient-to-b from-slate-300 to-slate-400" />
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const SkillsPcb: React.FC = () => {
  const [hoveredChip, setHoveredChip] = useState<string | null>(null);

  return (
    <div className="relative w-full p-4 rounded-3xl bg-gradient-to-br from-[#022c22] via-[#094231] to-[#041a14] border border-emerald-500/25 shadow-[inset_0_2px_15px_rgba(0,0,0,0.65),0_8px_20px_rgba(0,0,0,0.4)] overflow-hidden select-none">
      
      {/* ── Motherboard PCB Copper Traces (rendered behind chips) ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        
        {/* Micro-mesh substrate grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.035)_1px,transparent_1px)] bg-[size:10px_10px]" />
        
        {/* Angled Copper Traces (High-Fidelity SVG) */}
        <svg className="absolute inset-0 w-full h-full opacity-35 dark:opacity-55" xmlns="http://www.w3.org/2000/svg">
          {/* Main Gold Telemetry lines */}
          <path d="M 40,200 L 160,200 L 210,250" stroke="#f59e0b" strokeWidth="1.2" fill="none" />
          <path d="M 120,45 L 240,45 L 270,95" stroke="#f59e0b" strokeWidth="1.2" fill="none" />
          <path d="M 370,250 L 420,200 L 540,200" stroke="#f59e0b" strokeWidth="1.2" fill="none" />
          <path d="M 100,105 L 210,105 L 250,145" stroke="#f59e0b" strokeWidth="1.2" fill="none" />
          <path d="M 330,145 L 370,105 L 480,105" stroke="#f59e0b" strokeWidth="1.2" fill="none" />
          
          {/* Secondary Signal lines (emerald green) */}
          <path d="M 60,260 L 110,260 L 130,280" stroke="#10b981" strokeWidth="0.8" fill="none" opacity="0.4" />
          <path d="M 500,260 L 450,260 L 430,280" stroke="#10b981" strokeWidth="0.8" fill="none" opacity="0.4" />
          
          {/* PCB Vias (gold contact circles) */}
          <circle cx="160" cy="200" r="2.5" fill="#eab308" stroke="#b45309" strokeWidth="0.5" />
          <circle cx="210" cy="250" r="2.5" fill="#eab308" stroke="#b45309" strokeWidth="0.5" />
          <circle cx="240" cy="45" r="2.5" fill="#eab308" stroke="#b45309" strokeWidth="0.5" />
          <circle cx="270" cy="95" r="2.5" fill="#eab308" stroke="#b45309" strokeWidth="0.5" />
          <circle cx="210" cy="105" r="2.5" fill="#eab308" stroke="#b45309" strokeWidth="0.5" />
          <circle cx="370" cy="105" r="2.5" fill="#eab308" stroke="#b45309" strokeWidth="0.5" />
        </svg>
      </div>

      {/* ── Motherboard SMD Micro-Components ── */}
      <SMDComponent type="resistor" x="24%" y="15%" rotate={90} />
      <SMDComponent type="capacitor" x="32%" y="28%" rotate={45} />
      <SMDComponent type="resistor" x="73%" y="15%" rotate={0} />
      <SMDComponent type="capacitor" x="68%" y="78%" rotate={90} />
      <SMDComponent type="resistor" x="50%" y="82%" rotate={45} />

      {/* ── PCB Semiconductor Chips Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 relative z-10">
        {pcbChips.map((chip) => {
          const isHovered = hoveredChip === chip.id;
          return (
            <motion.div
              key={chip.id}
              onMouseEnter={() => setHoveredChip(chip.id)}
              onMouseLeave={() => setHoveredChip(null)}
              whileHover={{ y: -3, scale: 1.025 }}
              whileTap={{ scale: 0.98 }}
              className={`relative flex flex-col justify-between p-3.5 rounded-xl border bg-gradient-to-br from-[#1c1d24] via-[#111216] to-[#191a21] shadow-[inset_0_1px_4px_rgba(255,255,255,0.06),0_6px_14px_rgba(0,0,0,0.6)] transition-all duration-300 ${chip.gridClass} ${
                isHovered
                  ? 'border-slate-500 shadow-[0_0_16px_rgba(99,255,210,0.15),0_8px_20px_rgba(0,0,0,0.7)]'
                  : 'border-slate-800'
              }`}
            >
              {/* DIP Pin Leads (Metallic gull-wing pins connected to solder pads) */}
              <ChipPins side="left" count={chip.pinCount} active={isHovered} />
              <ChipPins side="right" count={chip.pinCount} active={isHovered} />

              {/* Silicon Package Notch (Orientation key cutout matching board green) */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-3.5 h-2 bg-[#094231] border-b border-x border-slate-700/60 rounded-b-full z-20 pointer-events-none" />

              {/* Pin-1 Indicator Dot (small dimple on chip corner) */}
              <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center pointer-events-none">
                <div className="w-0.5 h-0.5 rounded-full bg-slate-500/70" />
              </div>

              {/* Chip Markings / Silkscreen */}
              <div>
                <div className="flex flex-col items-start gap-0.5 relative z-10">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 group-hover:text-white">
                    {chip.label}
                  </span>
                  <span className="text-[7.2px] font-mono text-slate-600 select-none">
                    {chip.partNo}
                  </span>
                </div>

                {/* Grid of Skill Chips (replaces old plain chips) */}
                <div className={`grid gap-2 mt-3.5 relative z-10 ${
                  chip.id === 'tools' ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'
                }`}>
                  {chip.skills.map((skill) => (
                    <SkillChip
                      key={skill}
                      name={skill}
                      variant={chip.id as any}
                    />
                  ))}
                </div>
              </div>

              {/* Diagnostic Terminal Output */}
              <div className="mt-3.5 h-5 overflow-hidden flex items-center relative z-10">
                <AnimatePresence mode="wait">
                  {isHovered ? (
                    <motion.div
                      key="project-details"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="text-[8.5px] font-mono text-slate-400 flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span>SYS.LOG:: <span className="text-amber-200 font-bold">{chip.project}</span></span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="system-ok"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.35 }}
                      exit={{ opacity: 0 }}
                      className="text-[7.5px] font-mono text-slate-500"
                    >
                      PCB.PORT::{chip.id.toUpperCase()}//OK
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SkillsPcb;
