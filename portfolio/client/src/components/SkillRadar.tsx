import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { useTheme } from '../hooks/useTheme';

// ─── Data Types ──────────────────────────────────────────────────────────────

interface SkillDataPoint {
  subject: string;
  current: number;
  target: number;
}

const data: SkillDataPoint[] = [
  { subject: 'Web', current: 5, target: 5 },
  { subject: 'ML / Data', current: 4, target: 5 },
  { subject: 'VLSI', current: 3, target: 4 },
  { subject: 'Embedded', current: 4, target: 5 },
  { subject: 'DevOps / Tools', current: 3, target: 4 }
];

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 dark:bg-slate-950/98 border border-teal-500/30 px-3 py-2 rounded-xl shadow-xl backdrop-blur-md text-[11px] font-mono">
        <p className="font-bold text-slate-200 mb-1 border-b border-slate-800 pb-1">
          {payload[0].payload.subject}
        </p>
        <p className="text-teal-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
          Current: <span className="font-bold text-white">{payload[0].value} / 5</span>
        </p>
        {payload[1] && (
          <p className="text-purple-400 flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            Target:  <span className="font-bold text-white">{payload[1].value} / 5</span>
          </p>
        )}
      </div>
    );
  }
  return null;
};

// ─── Component ────────────────────────────────────────────────────────────────

const SkillRadar: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Theme-aware colors
  const gridColor = isDark ? 'rgba(99, 255, 210, 0.12)' : 'rgba(13, 148, 136, 0.12)';
  const labelColor = isDark ? '#94a3b8' : '#475569';
  
  const currentStroke = isDark ? '#63ffd2' : '#0d9488';
  const currentFill = isDark ? 'rgba(99, 255, 210, 0.25)' : 'rgba(13, 148, 136, 0.18)';
  
  const targetStroke = isDark ? '#a78bfa' : '#7c3aed';
  const targetFill = isDark ? 'rgba(167, 139, 250, 0.15)' : 'rgba(124, 58, 237, 0.12)';

  return (
    <div className="flex flex-col items-center justify-between h-full w-full">
      {/* Chart container */}
      <div className="w-full h-[240px] sm:h-[260px] relative select-none">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius="68%"
            data={data}
            margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
          >
            <PolarGrid stroke={gridColor} gridType="polygon" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: labelColor, fontSize: 10, fontWeight: 500, fontFamily: 'monospace' }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 5]}
              tickCount={6}
              tick={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            
            {/* Target Level Polygon (rendered behind current) */}
            <Radar
              name="Target Level"
              dataKey="target"
              stroke={targetStroke}
              fill={targetFill}
              fillOpacity={1}
              strokeWidth={1.5}
            />
            
            {/* Current Level Polygon */}
            <Radar
              name="Current Level"
              dataKey="current"
              stroke={currentStroke}
              fill={currentFill}
              fillOpacity={1}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Premium custom legend */}
      <div className="flex justify-center gap-6 mt-2 text-[10px] font-mono select-none">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: currentStroke,
              boxShadow: isDark ? `0 0 6px ${currentStroke}` : 'none'
            }}
          />
          <span className="text-slate-600 dark:text-slate-400">Current Level</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: targetStroke,
              boxShadow: isDark ? `0 0 6px ${targetStroke}` : 'none'
            }}
          />
          <span className="text-slate-600 dark:text-slate-400">Target (12m)</span>
        </div>
      </div>
    </div>
  );
};

export default SkillRadar;
