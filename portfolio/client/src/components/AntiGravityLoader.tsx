import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Telemetry boot steps to show in the console subtext
const BOOT_LOGS = [
  'Initializing AntiGravity OS kernel...',
  'Connecting to MongoDB cluster telemetry...',
  'Syncing IoT, ML, and AI nodes...',
  'Calibrating orbital canvas render context...',
  'Preheating semiconductor device simulation modules...',
  'Loading portfolio projects & laboratory logs...',
  'System online. Launching dashboard...',
];

export default function AntiGravityLoader() {
  const [logIndex, setLogIndex] = useState(0);

  // Cycle through boot logs over time
  useEffect(() => {
    const logInterval = setInterval(() => {
      setLogIndex((prev) => (prev < BOOT_LOGS.length - 1 ? prev + 1 : prev));
    }, 450);

    return () => clearInterval(logInterval);
  }, []);

  // Generate 15 static positions for drifting background particles
  const particles = [
    { id: 1, x: '10%', y: '80%', size: 3, delay: 0 },
    { id: 2, x: '25%', y: '60%', size: 2, delay: 1.5 },
    { id: 3, x: '45%', y: '90%', size: 4, delay: 0.5 },
    { id: 4, x: '75%', y: '70%', size: 3, delay: 2 },
    { id: 5, x: '90%', y: '50%', size: 2, delay: 1 },
    { id: 6, x: '15%', y: '30%', size: 3, delay: 2.5 },
    { id: 7, x: '35%', y: '20%', size: 2, delay: 0.8 },
    { id: 8, x: '65%', y: '15%', size: 4, delay: 1.2 },
    { id: 9, x: '80%', y: '35%', size: 3, delay: 1.7 },
    { id: 10, x: '50%', y: '45%', size: 2, delay: 0.3 },
    { id: 11, x: '5%', y: '40%', size: 3, delay: 2.2 },
    { id: 12, x: '30%', y: '85%', size: 2, delay: 0.7 },
    { id: 13, x: '55%', y: '75%', size: 4, delay: 1.9 },
    { id: 14, x: '70%', y: '40%', size: 2, delay: 1.1 },
    { id: 15, x: '85%', y: '80%', size: 3, delay: 2.4 },
  ];

  return (
    <div className="fixed inset-0 bg-[#050815] z-[9999] flex flex-col items-center justify-center overflow-hidden font-mono select-none">
      {/* Background ambient glow spots */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full filter blur-[100px] opacity-15 pointer-events-none"
        style={{
          top: '20%',
          left: '25%',
          background: 'radial-gradient(circle, #63ffd2 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full filter blur-[100px] opacity-15 pointer-events-none"
        style={{
          bottom: '20%',
          right: '25%',
          background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)',
        }}
      />

      {/* Drifting background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-[#63ffd2]/30"
            style={{
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              boxShadow: '0 0 8px rgba(99, 255, 210, 0.4)',
            }}
            animate={{
              y: [0, -60, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 6 + p.size,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Central Interactive Animation Area */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Orbit Ring 1 - Solid with Notch Accents */}
        <motion.div
          className="absolute w-48 h-48 rounded-full border border-[#63ffd2]/20 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        >
          {/* Glowing dot satellite on the outer ring */}
          <div
            className="absolute top-0 w-2.5 h-2.5 rounded-full"
            style={{
              background: '#63ffd2',
              boxShadow: '0 0 10px #63ffd2, 0 0 20px #63ffd2',
            }}
          />
        </motion.div>

        {/* Orbit Ring 2 - Dashed Counter-Rotating */}
        <motion.div
          className="absolute w-40 h-40 rounded-full border border-dashed border-[#a78bfa]/35"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />

        {/* Central Floating Chip (Semiconductor / AI Vibe) */}
        <motion.div
          className="relative w-24 h-24 rounded-2xl border border-[#63ffd2]/30 bg-slate-950/80 backdrop-blur-md flex items-center justify-center"
          style={{
            boxShadow: '0 0 35px rgba(99, 255, 210, 0.12), inset 0 0 15px rgba(99, 255, 210, 0.05)',
          }}
          animate={{
            y: [0, -14, 0],
            rotate: [0, 4, -4, 0],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Futuristic circuit connections on the chip */}
          <div className="absolute inset-2 border border-[#a78bfa]/20 rounded-lg flex items-center justify-center">
            {/* Center Core glowing logo */}
            <motion.div
              className="w-8 h-8 rounded-md bg-slate-900 border border-[#63ffd2]/50 flex items-center justify-center"
              animate={{
                boxShadow: [
                  '0 0 5px rgba(99, 255, 210, 0.3)',
                  '0 0 16px rgba(99, 255, 210, 0.65)',
                  '0 0 5px rgba(99, 255, 210, 0.3)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg className="w-5 h-5 text-[#63ffd2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </motion.div>
          </div>

          {/* Microchip pins around the edges */}
          {[
            'top-[-4px] left-6', 'top-[-4px] left-11', 'top-[-4px] left-16',
            'bottom-[-4px] left-6', 'bottom-[-4px] left-11', 'bottom-[-4px] left-16',
            'left-[-4px] top-6', 'left-[-4px] top-11', 'left-[-4px] top-16',
            'right-[-4px] top-6', 'right-[-4px] top-11', 'right-[-4px] top-16',
          ].map((pinClass, i) => (
            <div
              key={i}
              className={`absolute w-1.5 h-1.5 rounded-full bg-[#63ffd2]/40 ${pinClass}`}
              style={{ boxShadow: '0 0 4px rgba(99, 255, 210, 0.4)' }}
            />
          ))}
        </motion.div>
      </div>

      {/* Title */}
      <div className="mt-8 text-center px-4">
        <h2
          className="text-lg font-black tracking-[0.2em] uppercase text-white"
          style={{ textShadow: '0 0 10px rgba(255, 255, 255, 0.3)' }}
        >
          Pratyush Anand
        </h2>
        <p className="text-[10px] text-[#63ffd2]/70 mt-1 uppercase tracking-widest">
          System Boot v2.0
        </p>
      </div>

      {/* Console Boot Logs (Terminal style logs rolling) */}
      <div className="mt-10 max-w-sm w-full mx-auto px-6 font-mono text-left select-text">
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 min-h-[110px] flex flex-col justify-end text-xs leading-relaxed">
          {/* Print past history lines if index > 0 */}
          {logIndex > 0 && (
            <div className="text-slate-500 opacity-60">
              [ OK ] {BOOT_LOGS[logIndex - 1]}
            </div>
          )}
          {/* Current log line (highlighted with cursor) */}
          <div className="text-[#63ffd2] flex items-center gap-1.5 mt-1">
            <span className="shrink-0 text-[#a78bfa]">&gt;</span>
            <span className="truncate">{BOOT_LOGS[logIndex]}</span>
            <motion.span
              className="w-1.5 h-3.5 bg-[#63ffd2]"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
