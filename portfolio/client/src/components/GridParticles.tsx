import { useEffect, useRef, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Direction = 'up' | 'down' | 'left' | 'right';

interface Particle {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  progress: number;
  dir: Direction;
  speed: number;
  life: number;
  maxLife: number;
  hue: number;
  hueTarget: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Must match the background-size in globals.css (60px grid tiles) */
const GRID = 60;
const OFFSET = 30; // Centered on the grid line offset of the SVG
const PARTICLE_COUNT = 40;
const MIN_SPEED = 20;  // px/s
const MAX_SPEED = 40;  // px/s
/** Max segments a particle travels before respawn (in grid cells) */
const MAX_SEGMENTS = 8;
const MIN_SEGMENTS = 3;

// Colors
const TEAL  = { r: 45, g: 255, b: 196 };
const PURPLE = { r: 167, g: 139, b: 250 };

const DIR_OFFSETS: Record<Direction, { x: number; y: number }> = {
  right: { x: 1, y: 0 },
  left: { x: -1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DIRS: Direction[] = ['up', 'down', 'left', 'right'];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randDir(): Direction {
  return DIRS[Math.floor(Math.random() * 4)];
}

function getNextDir(currentDir: Direction): Direction {
  const r = Math.random();
  let left: Direction;
  let right: Direction;
  
  if (currentDir === 'right') {
    left = 'up';
    right = 'down';
  } else if (currentDir === 'left') {
    left = 'down';
    right = 'up';
  } else if (currentDir === 'up') {
    left = 'left';
    right = 'right';
  } else { // 'down'
    left = 'right';
    right = 'left';
  }
  
  if (r < 0.6) {
    return currentDir; // 60% chance to go straight
  } else if (r < 0.8) {
    return left; // 20% chance to turn left
  } else {
    return right; // 20% chance to turn right
  }
}

function lerpColor(t: number): string {
  const r = Math.round(TEAL.r + (PURPLE.r - TEAL.r) * t);
  const g = Math.round(TEAL.g + (PURPLE.g - TEAL.g) * t);
  const b = Math.round(TEAL.b + (PURPLE.b - TEAL.b) * t);
  return `rgba(${r},${g},${b},0.85)`;
}

function spawnParticle(w: number, h: number): Particle {
  const cols = Math.floor((w - OFFSET) / GRID);
  const rows = Math.floor((h - OFFSET) / GRID);
  
  // Pick a random intersection
  const col = Math.floor(rand(0, cols + 1));
  const row = Math.floor(rand(0, rows + 1));
  const startX = col * GRID + OFFSET;
  const startY = row * GRID + OFFSET;
  const dir = randDir();
  const d = DIR_OFFSETS[dir];
  const maxLife = Math.floor(rand(MIN_SEGMENTS, MAX_SEGMENTS)) * GRID;
  
  return {
    startX,
    startY,
    targetX: startX + d.x * GRID,
    targetY: startY + d.y * GRID,
    progress: 0,
    dir,
    speed: rand(MIN_SPEED, MAX_SPEED),
    life: maxLife,
    maxLife,
    hue: Math.random() < 0.8 ? 0 : 1,          // mostly teal
    hueTarget: Math.random() < 0.7 ? 0 : 1,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

const GridParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const frameId = useRef(0);
  const lastTime = useRef(0);

  /** Resize canvas to fill viewport at device pixel ratio */
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    resize();

    const w = window.innerWidth;
    const h = window.innerHeight;

    // Seed particles
    particles.current = Array.from({ length: PARTICLE_COUNT }, () =>
      spawnParticle(w, h)
    );

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ── Animation loop ──
    const tick = (now: number) => {
      const dt = lastTime.current ? (now - lastTime.current) / 1000 : 0.016;
      lastTime.current = now;

      const cw = window.innerWidth;
      const ch = window.innerHeight;

      ctx.clearRect(0, 0, cw, ch);

      for (const p of particles.current) {
        // ── Move ──
        p.progress += (p.speed / GRID) * dt;

        // Check if we reached the target intersection
        while (p.progress >= 1.0) {
          p.life -= GRID;
          if (p.life <= 0) {
            break;
          }

          p.startX = p.targetX;
          p.startY = p.targetY;

          // Choose next direction
          const nextDir = getNextDir(p.dir);
          p.dir = nextDir;

          const d = DIR_OFFSETS[nextDir];
          p.targetX = p.startX + d.x * GRID;
          p.targetY = p.startY + d.y * GRID;

          p.progress -= 1.0;
        }

        // Compute current coordinates
        const x = p.startX + (p.targetX - p.startX) * p.progress;
        const y = p.startY + (p.targetY - p.startY) * p.progress;

        // ── Respawn if off-screen or life depleted ──
        if (p.life <= 0 || x < -GRID || x > cw + GRID || y < -GRID || y > ch + GRID) {
          const fresh = spawnParticle(cw, ch);
          Object.assign(p, fresh);
          continue;
        }

        // ── Opacity calculation (life fade + edge fade) ──
        let opacity = 1;
        const age = p.maxLife - p.life;
        if (age < GRID) {
          opacity = age / GRID;
        } else if (p.life < GRID) {
          opacity = p.life / GRID;
        }

        const edgeDist = Math.min(x, y, cw - x, ch - y);
        if (edgeDist < GRID) {
          opacity = Math.min(opacity, Math.max(0, edgeDist / GRID));
        }

        // Slowly drift hue toward target
        p.hue += (p.hueTarget - p.hue) * 0.005;
        // Randomly retarget hue occasionally
        if (Math.random() < 0.001) {
          p.hueTarget = Math.random() < 0.7 ? 0 : 1;
        }

        // ── Draw ──
        const color = lerpColor(p.hue);
        ctx.save();
        ctx.globalAlpha = opacity;
        
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.fill();

        // Second pass for stronger glow core
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.shadowBlur = 4;
        ctx.shadowColor = color;
        ctx.fill();
        
        ctx.restore();
      }

      frameId.current = requestAnimationFrame(tick);
    };

    frameId.current = requestAnimationFrame(tick);

    // ── Resize listener ──
    const onResize = () => {
      resize();
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frameId.current);
      window.removeEventListener('resize', onResize);
    };
  }, [resize]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  );
};

export default GridParticles;
