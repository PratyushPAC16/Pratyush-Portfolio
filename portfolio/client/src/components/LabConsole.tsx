import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
  type ChangeEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getProjects, type Project } from '../api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OutputLine {
  id: number;
  text: string;
  type: 'input' | 'output' | 'error' | 'success' | 'info' | 'divider';
}

// ─── Static data ──────────────────────────────────────────────────────────────

const WHOAMI_LINES = [
  '  name    : Pratyush',
  '  role    : Full-Stack Developer • IoT • ML • AI',
  '  college : NIT Tiruchirappalli (ECE)',
  '  status  : Open to SDE / Embedded / IoT roles',
  '  stack   : React • Node.js • MongoDB • Python • Verilog',
];

const SKILLS_LINES = [
  '  [Web]      React · Node.js · Express · MongoDB · TypeScript · Tailwind',
  '  [ML]       Python · PyTorch · Scikit-learn · NumPy · OpenCV',
  '  [AI]       TensorFlow · PyTorch · Keras · HuggingFace · LLMs',
  '  [Embedded] IoT · MQTT · Arduino · ESP32 · FreeRTOS · Raspberry Pi',
];

const HELP_LINES = [
  '  help              — show this help menu',
  '  whoami            — display profile information',
  '  skills            — list skills by category',
  '  show projects     — list all portfolio projects',
  '  open <name>       — navigate to a matching project',
  '  contact           — show contact & social links',
  '  clear             — clear the terminal output',
  '',
  '  Keyboard shortcuts:',
  '  ArrowUp / ArrowDown — cycle command history',
  '  ESC                 — close the console',
];

const CONTACT_LINES = [
  '  email    : pratyush@example.com',
  '  github   : https://github.com/pratyush',
  '  linkedin : https://linkedin.com/in/pratyush',
  '  open to  : Full-time · Contract · Open-source',
];

const BANNER = [
  '╔══════════════════════════════════════════════════╗',
  '║          portfolio@lab:~ — Lab Console v1.0      ║',
  '║  Type "help" to see available commands.          ║',
  '╚══════════════════════════════════════════════════╝',
];

// ─── Typewriter hook ──────────────────────────────────────────────────────────

function useTypewriter() {
  const [queue, setQueue] = useState<{ lines: string[]; type: OutputLine['type']; baseId: number }[]>([]);
  const [output, setOutput] = useState<OutputLine[]>([]);
  const processing = useRef(false);
  const idCounter = useRef(0);

  const nextId = () => ++idCounter.current;

  // Process the queue one batch at a time
  useEffect(() => {
    if (queue.length === 0 || processing.current) return;

    processing.current = true;
    const batch = queue[0];

    const processLines = async () => {
      for (const text of batch.lines) {
        if (text === '' || text.startsWith('─') || text.startsWith('╔') || text.startsWith('║') || text.startsWith('╚')) {
          // Static lines — no typewriter
          setOutput((prev) => [...prev, { id: nextId(), text, type: batch.type }]);
          await delay(30);
          continue;
        }

        // Typewriter: build the line char-by-char via a placeholder entry
        const lineId = nextId();
        setOutput((prev) => [...prev, { id: lineId, text: '', type: batch.type }]);

        for (let i = 1; i <= text.length; i++) {
          await delay(28);
          setOutput((prev) =>
            prev.map((l) => (l.id === lineId ? { ...l, text: text.slice(0, i) } : l))
          );
        }
        await delay(20);
      }

      setQueue((prev) => prev.slice(1));
      processing.current = false;
    };

    processLines();
  }, [queue]);

  const addLines = useCallback(
    (lines: string[], type: OutputLine['type'] = 'output') => {
      setQueue((prev) => [...prev, { lines, type, baseId: nextId() }]);
    },
    []
  );

  const addImmediate = useCallback(
    (lines: string[], type: OutputLine['type'] = 'output') => {
      setOutput((prev) => [
        ...prev,
        ...lines.map((text) => ({ id: nextId(), text, type })),
      ]);
    },
    []
  );

  const clearOutput = useCallback(() => {
    setOutput([]);
    setQueue([]);
    processing.current = false;
  }, []);

  return { output, addLines, addImmediate, clearOutput };
}

function delay(ms: number) {
  return new Promise<void>((res) => setTimeout(res, ms));
}

// ─── Command processor ────────────────────────────────────────────────────────

function useCommands(
  addLines: (lines: string[], type?: OutputLine['type']) => void,
  addImmediate: (lines: string[], type?: OutputLine['type']) => void,
  clearOutput: () => void,
  navigate: ReturnType<typeof useNavigate>
) {
  const projectsCache = useRef<Project[]>([]);

  // Pre-fetch projects once
  useEffect(() => {
    getProjects()
      .then((ps) => { projectsCache.current = ps; })
      .catch(() => {});
  }, []);

  const run = useCallback(
    (raw: string) => {
      const cmd = raw.trim().toLowerCase();

      // Echo the input
      addImmediate([`❯ ${raw}`], 'input');

      if (!cmd) return;

      // ── help ──
      if (cmd === 'help') {
        addLines(['', ...HELP_LINES, ''], 'info');
        return;
      }

      // ── whoami ──
      if (cmd === 'whoami') {
        addLines(['', ...WHOAMI_LINES, ''], 'success');
        return;
      }

      // ── skills ──
      if (cmd === 'skills') {
        addLines(['', ...SKILLS_LINES, ''], 'success');
        return;
      }

      // ── contact ──
      if (cmd === 'contact') {
        addLines(['', ...CONTACT_LINES, ''], 'info');
        return;
      }

      // ── clear ──
      if (cmd === 'clear') {
        clearOutput();
        return;
      }

      // ── show projects ──
      if (cmd === 'show projects') {
        const projects = projectsCache.current;
        if (projects.length === 0) {
          addLines(['  (no projects cached — server may be offline)', ''], 'error');
          return;
        }
        const lines = [
          '',
          `  Found ${projects.length} project(s):`,
          ...projects.map((p, i) => `  ${i + 1}. [${p.domain}] ${p.title}`),
          '',
          '  Tip: type "open <project name>" to navigate.',
          '',
        ];
        addLines(lines, 'output');
        return;
      }

      // ── open <name> ──
      if (cmd.startsWith('open ')) {
        const query = raw.slice(5).trim().toLowerCase();
        const projects = projectsCache.current;
        const match = projects.find((p) =>
          p.title.toLowerCase().includes(query)
        );
        if (!match) {
          addLines([
            `  project not found: "${raw.slice(5).trim()}"`,
            '  Run "show projects" to see available projects.',
            '',
          ], 'error');
          return;
        }
        addLines([
          `  Opening: ${match.title}`,
          `  Navigating to /projects/${match._id} ...`,
          '',
        ], 'success');
        setTimeout(() => navigate(`/projects/${match._id}`), 900);
        return;
      }

      // ── unknown ──
      addLines([
        `  command not found: ${cmd}`,
        '  Type "help" to see available commands.',
        '',
      ], 'error');
    },
    [addLines, addImmediate, clearOutput, navigate]
  );

  return { run };
}

// ─── Text color by line type ──────────────────────────────────────────────────

function lineColor(type: OutputLine['type']): string {
  switch (type) {
    case 'input':   return '#63ffd2';
    case 'success': return '#4ade80';
    case 'error':   return '#f87171';
    case 'info':    return '#93c5fd';
    case 'divider': return 'rgba(99,255,210,0.18)';
    default:        return 'rgba(220,252,231,0.75)';
  }
}

// ─── LabConsole Component ──────────────────────────────────────────────────────

interface LabConsoleProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LabConsole({ isOpen, onClose }: LabConsoleProps) {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const historyIndex = useRef(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputEndRef = useRef<HTMLDivElement>(null);
  const { output, addLines, addImmediate, clearOutput } = useTypewriter();
  const { run } = useCommands(addLines, addImmediate, clearOutput, navigate);
  const initialized = useRef(false);

  // Show banner on first open
  useEffect(() => {
    if (isOpen && !initialized.current) {
      initialized.current = true;
      addImmediate(BANNER, 'divider');
      addLines(['  Welcome! Type "help" to get started.', ''], 'info');
    }
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, addImmediate, addLines]);

  // Auto-scroll to bottom whenever output updates
  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  // ESC to close
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const submitCommand = useCallback(() => {
    const raw = inputValue.trim();
    setInputValue('');
    historyIndex.current = -1;
    if (raw) {
      setHistory((prev) => [raw, ...prev].slice(0, 50));
    }
    run(raw);
  }, [inputValue, run]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        submitCommand();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const next = Math.min(historyIndex.current + 1, history.length - 1);
        historyIndex.current = next;
        setInputValue(history[next] ?? '');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = Math.max(historyIndex.current - 1, -1);
        historyIndex.current = next;
        setInputValue(next === -1 ? '' : (history[next] ?? ''));
      }
    },
    [submitCommand, history]
  );

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    historyIndex.current = -1;
  }, []);

  // Click backdrop to close
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dim backdrop (only on mobile) */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={handleBackdropClick}
          />

          {/* Console panel — slides in from right */}
          <motion.div
            key="console"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32, mass: 0.9 }}
            className="fixed top-0 right-0 bottom-0 z-50 flex flex-col w-full md:w-[42%] min-w-0 md:min-w-[420px]"
            style={{
              background: 'rgba(0, 0, 0, 0.93)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderLeft: '1px solid rgba(99, 255, 210, 0.3)',
              boxShadow: '-8px 0 60px rgba(99,255,210,0.08), -2px 0 20px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── macOS-style title bar ── */}
            <div
              className="flex items-center gap-2 px-4 py-3 shrink-0 select-none"
              style={{
                background: 'rgba(99,255,210,0.04)',
                borderBottom: '1px solid rgba(99,255,210,0.15)',
              }}
            >
              {/* Traffic lights */}
              <button
                onClick={onClose}
                aria-label="Close console"
                className="group w-3 h-3 rounded-full transition-opacity hover:opacity-80 focus:outline-none"
                style={{ background: '#ff5f57', boxShadow: '0 0 6px rgba(255,95,87,0.4)' }}
              >
                <span className="sr-only">Close</span>
              </button>
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: '#ffbd2e', boxShadow: '0 0 6px rgba(255,189,46,0.3)' }}
              />
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: '#28ca41', boxShadow: '0 0 6px rgba(40,202,65,0.3)' }}
              />

              {/* Title */}
              <span
                className="ml-3 text-xs font-mono font-medium"
                style={{ color: 'rgba(99,255,210,0.7)' }}
              >
                portfolio@lab:~
              </span>

              {/* Right controls */}
              <div className="ml-auto flex items-center gap-3">
                <span
                  className="text-[10px] font-mono hidden sm:inline"
                  style={{ color: 'rgba(99,255,210,0.25)' }}
                >
                  [ESC] close
                </span>
                <button
                  onClick={onClose}
                  aria-label="Close console"
                  className="text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ── Scrollable output area ── */}
            <div
              className="flex-grow overflow-y-auto px-4 pt-4 pb-2 lab-terminal"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,255,210,0.2) transparent' }}
              onClick={() => inputRef.current?.focus()}
            >
              {output.map((line) => (
                <div
                  key={line.id}
                  className="leading-relaxed whitespace-pre-wrap break-words"
                  style={{
                    color: lineColor(line.type),
                    textShadow:
                      line.type === 'input'
                        ? '0 0 10px rgba(99,255,210,0.4)'
                        : line.type === 'success'
                        ? '0 0 8px rgba(74,222,128,0.3)'
                        : line.type === 'error'
                        ? '0 0 8px rgba(248,113,113,0.3)'
                        : 'none',
                    fontWeight: line.type === 'input' ? '600' : '400',
                    fontSize: '13px',
                  }}
                >
                  {line.text}
                </div>
              ))}
              <div ref={outputEndRef} />
            </div>

            {/* ── Divider ── */}
            <div style={{ height: '1px', background: 'rgba(99,255,210,0.1)' }} />

            {/* ── Input row ── */}
            <div
              className="flex items-center gap-2 px-4 py-3 shrink-0"
              style={{ background: 'rgba(99,255,210,0.02)' }}
            >
              {/* Prompt symbol */}
              <span
                className="text-sm font-mono font-bold select-none shrink-0"
                style={{ color: '#63ffd2', textShadow: '0 0 8px rgba(99,255,210,0.5)' }}
              >
                ❯
              </span>

              {/* Input */}
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="type a command…"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className="flex-grow bg-transparent outline-none text-sm font-mono placeholder-transparent"
                style={{
                  color: '#63ffd2',
                  caretColor: '#63ffd2',
                  textShadow: '0 0 6px rgba(99,255,210,0.3)',
                  // Custom placeholder via global CSS
                }}
                aria-label="Terminal input"
              />

              {/* Enter hint */}
              <kbd
                className="shrink-0 text-[10px] px-1.5 py-0.5 rounded font-mono hidden sm:inline"
                style={{
                  background: 'rgba(99,255,210,0.08)',
                  border: '1px solid rgba(99,255,210,0.2)',
                  color: 'rgba(99,255,210,0.4)',
                }}
              >
                ↵
              </kbd>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
