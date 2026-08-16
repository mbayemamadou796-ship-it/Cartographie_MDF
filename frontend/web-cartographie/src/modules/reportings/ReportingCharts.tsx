import React, { useState } from 'react';

// 1. Grouped Bar Chart: Cas Remontés vs Cas Traités
interface BarGroupItem {
  period: string;
  remontes: number;
  traites: number;
}

export const CustomBarChartComparison: React.FC<{
  data: BarGroupItem[];
}> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-slate-400">
        Aucune donnée sur la période sélectionnée
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => Math.max(d.remontes, d.traites)), 4);
  const chartHeight = 190;
  const paddingBottom = 30;
  const usableHeight = chartHeight - paddingBottom;

  return (
    <div className="w-full h-full flex flex-col justify-between select-none">
      {/* Chart Canvas */}
      <div className="relative flex-1 w-full flex items-end justify-between gap-2 px-4 pt-4 pb-2 border-b border-slate-100">
        
        {/* Horizontal grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-2 pt-4 pb-8 opacity-30">
          <div className="border-b border-dashed border-slate-300 w-full" />
          <div className="border-b border-dashed border-slate-300 w-full" />
          <div className="border-b border-dashed border-slate-300 w-full" />
        </div>

        {data.map((item, idx) => {
          const hRemontes = (item.remontes / maxVal) * usableHeight;
          const hTraites = (item.traites / maxVal) * usableHeight;
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={item.period}
              className="flex-1 flex flex-col items-center h-full justify-end relative group"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-12 z-30 bg-slate-900 text-white text-[11px] font-medium py-1.5 px-3 rounded-xl shadow-xl border border-slate-700 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                  <p className="font-bold text-emerald-400">{item.period}</p>
                  <p className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>Remontés : {item.remontes}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Traités : {item.traites}</span>
                  </p>
                </div>
              )}

              {/* Bars Pair */}
              <div className="flex items-end gap-1.5 w-full justify-center">
                {/* Remontes bar */}
                <div
                  className="w-3.5 sm:w-5 bg-blue-500 hover:bg-blue-400 rounded-t-md transition-all duration-300 relative"
                  style={{ height: `${Math.max(4, hRemontes)}px` }}
                >
                  {item.remontes > 0 && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.remontes}
                    </span>
                  )}
                </div>

                {/* Traites bar */}
                <div
                  className="w-3.5 sm:w-5 bg-emerald-500 hover:bg-emerald-400 rounded-t-md transition-all duration-300 relative"
                  style={{ height: `${Math.max(4, hTraites)}px` }}
                >
                  {item.traites > 0 && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.traites}
                    </span>
                  )}
                </div>
              </div>

              {/* X Axis label */}
              <span className={`text-[10px] sm:text-[11px] font-semibold mt-2 truncate max-w-full transition-colors ${
                isHovered ? 'text-slate-900 font-bold' : 'text-slate-500'
              }`}>
                {item.period}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-blue-500" />
          <span className="text-slate-600 font-medium">Cas remontés</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-emerald-500" />
          <span className="text-slate-600 font-medium">Cas traités</span>
        </div>
      </div>
    </div>
  );
};


// 2. Horizontal Bar Chart: Activité par Référent
interface ReferentActivityItem {
  referentName: string;
  count: number;
}

export const CustomHorizontalBarChart: React.FC<{
  data: ReferentActivityItem[];
  onSelectReferent?: (name: string) => void;
}> = ({ data, onSelectReferent }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-slate-400">
        Aucune donnée
      </div>
    );
  }

  const items = data.slice(0, 6);
  const maxCount = Math.max(...items.map((i) => i.count), 1);

  return (
    <div className="w-full h-full flex flex-col justify-center space-y-3 px-1 py-1">
      {items.map((item) => {
        const pct = (item.count / maxCount) * 100;
        return (
          <div
            key={item.referentName}
            onClick={() => onSelectReferent && onSelectReferent(item.referentName)}
            className="group cursor-pointer space-y-1 select-none"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate max-w-[170px]">
                {item.referentName}
              </span>
              <span className="font-black text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all text-[11px]">
                {item.count} {item.count > 1 ? 'remontées' : 'remontée'}
              </span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-indigo-500 group-hover:bg-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.max(8, pct)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};


// 3. Donut Pie Chart: Statuts des Cas
interface StatusDistItem {
  name: string;
  value: number;
  color: string;
}

export const CustomDonutChart: React.FC<{
  data: StatusDistItem[];
  onSelectStatus?: (status: string) => void;
}> = ({ data, onSelectStatus }) => {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-slate-400">
        Aucun cas enregistré
      </div>
    );
  }

  // SVG Circular Math
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-40 h-40 transform -rotate-90">
        {data.map((item) => {
          const ratio = item.value / total;
          const strokeDasharray = `${ratio * circumference} ${circumference}`;
          const strokeDashoffset = -accumulatedOffset;
          accumulatedOffset += ratio * circumference;
          const isHovered = hoveredSlice === item.name;

          return (
            <circle
              key={item.name}
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke={item.color}
              strokeWidth={isHovered ? 16 : 14}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="cursor-pointer transition-all duration-300 hover:opacity-90"
              onMouseEnter={() => setHoveredSlice(item.name)}
              onMouseLeave={() => setHoveredSlice(null)}
              onClick={() => onSelectStatus && onSelectStatus(item.name)}
            />
          );
        })}
      </svg>

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-black text-slate-900 font-['Outfit']">{total}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cas</span>
      </div>
    </div>
  );
};


// 4. Area Chart: Timeline Évolution de l'activité
interface TimelineItem {
  label: string;
  count: number;
}

export const CustomAreaChart: React.FC<{
  data: TimelineItem[];
}> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-slate-400">
        Aucune donnée chronologique
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.count), 3);
  const width = 500;
  const height = 180;
  const paddingX = 30;
  const paddingY = 25;
  const graphWidth = width - paddingX * 2;
  const graphHeight = height - paddingY * 2;

  const points = data.map((item, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * graphWidth;
    const y = height - paddingY - (item.count / maxVal) * graphHeight;
    return { x, y, item, i };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="w-full h-full flex flex-col justify-between relative select-none">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d9488" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#e2e8f0" strokeDasharray="3 3" />
        <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="#e2e8f0" strokeDasharray="3 3" />
        <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#cbd5e1" />

        {/* Area fill */}
        <path d={areaD} fill="url(#areaGradient)" />

        {/* Line stroke */}
        <path d={pathD} fill="none" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points & Interactive Tooltips */}
        {points.map((pt) => {
          const isHovered = hoveredIdx === pt.i;
          return (
            <g key={pt.i} className="cursor-pointer">
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 6 : 4}
                fill={isHovered ? '#042f2e' : '#0d9488'}
                stroke="#ffffff"
                strokeWidth="2"
                onMouseEnter={() => setHoveredIdx(pt.i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
              <text
                x={pt.x}
                y={height - 5}
                textAnchor="middle"
                fontSize="10"
                fill={isHovered ? '#0f172a' : '#64748b'}
                fontWeight={isHovered ? 'bold' : 'normal'}
              >
                {pt.item.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Dynamic tooltip on hover */}
      {hoveredIdx !== null && points[hoveredIdx] && (
        <div 
          className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-medium py-1 px-3 rounded-xl shadow-lg border border-slate-700 pointer-events-none"
        >
          <span className="text-teal-400 font-bold">{points[hoveredIdx].item.label} : </span>
          <span>{points[hoveredIdx].item.count} remontée(s)</span>
        </div>
      )}
    </div>
  );
};
