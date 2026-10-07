import React, { useState, useRef, useMemo } from 'react';

// ============================================================================
// 1. INTERACTIVE DONUT CHART WITH FLOATING TOOLTIP & LEGEND SYNC
// ============================================================================
export interface DonutChartItem {
  label: string;
  value: number;
  color: string;
  unit?: string;
}

interface DonutChartProps {
  items: DonutChartItem[];
  title?: string;
  centerLabel?: string;
  centerValue?: string;
  size?: number;
  showLegend?: boolean;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  items,
  title,
  centerLabel,
  centerValue,
  size = 200,
  showLegend = true,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = useMemo(() => items.reduce((sum, item) => sum + Math.max(0, item.value), 0), [items]);
  const radius = size * 0.38;
  const strokeWidth = size * 0.16;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let accumulatedPercent = 0;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative flex flex-col sm:flex-row items-center justify-between gap-6 w-full select-none"
    >
      {/* SVG Donut Ring */}
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg] overflow-visible">
          {/* Background track circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#E2E5E9"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {items.map((item, index) => {
            const safeVal = Math.max(0, item.value);
            const percent = total > 0 ? safeVal / total : 0;
            const strokeDasharray = `${percent * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedPercent * circumference;
            accumulatedPercent += percent;

            const isHovered = hoveredIndex === index;
            const isAnyHovered = hoveredIndex !== null;

            return (
              <circle
                key={item.label}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="butt"
                opacity={isAnyHovered && !isHovered ? 0.45 : 1}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Center Static or Dynamic Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
          {hoveredIndex !== null && items[hoveredIndex] ? (
            <>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] truncate max-w-[110px]">
                {items[hoveredIndex].label}
              </span>
              <span className="text-lg font-extrabold text-[#25282C] font-mono leading-none my-0.5">
                {total > 0 ? Math.round((items[hoveredIndex].value / total) * 100) : 0}%
              </span>
              <span className="text-[10px] text-[#5B8C6A] font-mono font-bold">
                {items[hoveredIndex].value.toLocaleString()} {items[hoveredIndex].unit || 't'}
              </span>
            </>
          ) : (
            <>
              {centerValue ? (
                <span className="text-sm font-extrabold text-[#25282C] font-mono leading-tight">
                  {centerValue}
                </span>
              ) : (
                <span className="text-sm font-extrabold text-[#25282C] font-mono leading-tight">
                  {total.toLocaleString()}
                </span>
              )}
              <span className="text-[10px] text-[#64748B] font-medium leading-tight mt-0.5 max-w-[100px] truncate">
                {centerLabel || (title ? title : 'Total')}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Floating Interactive Tooltip */}
      {hoveredIndex !== null && items[hoveredIndex] && mousePos && (
        <div
          className="absolute z-30 pointer-events-none bg-[#25282C] text-white p-2.5 rounded-md shadow-xl text-xs space-y-0.5 transition-transform duration-75 min-w-[130px] border border-[#3E444B]"
          style={{
            left: `${Math.min(mousePos.x + 12, (containerRef.current?.clientWidth || 300) - 140)}px`,
            top: `${Math.max(10, mousePos.y - 45)}px`,
          }}
        >
          <div className="flex items-center gap-1.5 pb-1 border-b border-[#3E444B]">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: items[hoveredIndex].color }}
            />
            <span className="font-bold uppercase tracking-wider text-[10px] text-[#A3D0B0]">
              {items[hoveredIndex].label}
            </span>
          </div>
          <div className="flex justify-between items-baseline pt-1">
            <span className="text-base font-extrabold font-mono">
              {total > 0 ? ((items[hoveredIndex].value / total) * 100).toFixed(1) : '0'}%
            </span>
            <span className="text-[11px] font-mono text-[#E2E8F0]">
              {items[hoveredIndex].value.toLocaleString()} {items[hoveredIndex].unit || 'tCO2e'}
            </span>
          </div>
        </div>
      )}

      {/* Clean Legend Beside/Below Donut with Hover Highlights */}
      {showLegend && (
        <div className="flex-1 w-full space-y-1.5 text-xs">
          {items.map((item, index) => {
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
            const isHovered = hoveredIndex === index;
            const isAnyHovered = hoveredIndex !== null;

            return (
              <div
                key={item.label}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`p-1.5 px-2 rounded-md transition-all flex items-center justify-between gap-2 cursor-pointer border ${
                  isHovered
                    ? 'bg-[#F1F3F5] border-[#CBD5E1] shadow-2xs'
                    : isAnyHovered
                    ? 'opacity-40 border-transparent'
                    : 'hover:bg-[#F8F9FA] border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-[#25282C] truncate">
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                  <span className="text-[#64748B]">
                    {item.value.toLocaleString()} {item.unit || ''}
                  </span>
                  <span className="font-bold text-[#25282C] w-9 text-right">
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 2. INTERACTIVE TREND LINE CHART WITH CURSOR TRACKING TOOLTIP
// ============================================================================
export interface TrendPoint {
  label: string;
  value: number;
  benchmark?: number;
}

interface TrendLineChartProps {
  data: TrendPoint[];
  unit?: string;
  lineColor?: string;
  benchmarkLabel?: string;
  height?: number;
  title?: string;
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({
  data,
  unit = 'tCO2e',
  lineColor = '#5B8C6A',
  benchmarkLabel = 'Target Path',
  height = 160,
  title,
}) => {
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (data.length === 0) return null;

  const width = 500;
  const paddingX = 40;
  const paddingTop = 24;
  const paddingBottom = 30;

  const minVal = Math.min(...data.map(d => Math.min(d.value, d.benchmark ?? d.value))) * 0.90;
  const maxVal = Math.max(...data.map(d => Math.max(d.value, d.benchmark ?? d.value))) * 1.10;
  const range = maxVal - minVal || 1;

  const getX = (idx: number) => paddingX + (idx / (data.length - 1 || 1)) * (width - 2 * paddingX);
  const getY = (val: number) =>
    paddingTop + (1 - (val - minVal) / range) * (height - paddingTop - paddingBottom);

  // SVG Line path
  const linePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.value)}`)
    .join(' ');

  // Gradient area path
  const areaPath = `${linePath} L ${getX(data.length - 1)} ${height - paddingBottom} L ${getX(
    0
  )} ${height - paddingBottom} Z`;

  // Benchmark path if available
  const hasBenchmark = data.some(d => d.benchmark !== undefined);
  const benchmarkPath = hasBenchmark
    ? data
        .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.benchmark ?? d.value)}`)
        .join(' ')
    : '';

  // Calculate percentage vs previous point
  const getPrevDiff = (idx: number) => {
    if (idx === 0) return null;
    const prev = data[idx - 1].value;
    const curr = data[idx].value;
    if (prev === 0) return null;
    const diffPct = ((curr - prev) / prev) * 100;
    return {
      diffPct: Math.abs(Math.round(diffPct * 10) / 10),
      isDown: diffPct < 0,
      isUp: diffPct > 0,
    };
  };

  return (
    <div ref={containerRef} className="w-full space-y-2 select-none font-sans">
      {title && (
        <div className="flex items-center justify-between text-xs pb-1">
          <span className="font-bold text-[#25282C] uppercase tracking-wider text-[11px]">
            {title}
          </span>
          <span className="text-[10px] text-[#64748B]">Hover points for period diagnostics</span>
        </div>
      )}

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
          style={{ minHeight: `${height}px` }}
          onMouseLeave={() => setActivePoint(null)}
        >
          <defs>
            <linearGradient id={`trendGrad_${lineColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.22" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Clean Grid Lines */}
          <line
            x1={paddingX}
            y1={height - paddingBottom}
            x2={width - paddingX}
            y2={height - paddingBottom}
            stroke="#CBD5E1"
            strokeWidth="1.2"
          />
          <line
            x1={paddingX}
            y1={paddingTop + (height - paddingTop - paddingBottom) / 2}
            x2={width - paddingX}
            y2={paddingTop + (height - paddingTop - paddingBottom) / 2}
            stroke="#E2E5E9"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={paddingTop}
            x2={width - paddingX}
            y2={paddingTop}
            stroke="#E2E5E9"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Area Fill */}
          <path d={areaPath} fill={`url(#trendGrad_${lineColor.replace('#', '')})`} />

          {/* Benchmark Line */}
          {hasBenchmark && (
            <path
              d={benchmarkPath}
              fill="none"
              stroke="#D99A2B"
              strokeWidth="1.8"
              strokeDasharray="4 3"
            />
          )}

          {/* Main Trend Line */}
          <path d={linePath} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinecap="round" />

          {/* Vertical Crosshair Guide when hovering */}
          {activePoint !== null && (
            <line
              x1={getX(activePoint)}
              y1={paddingTop}
              x2={getX(activePoint)}
              y2={height - paddingBottom}
              stroke="#64748B"
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.8"
            />
          )}

          {/* Interactive Data Points */}
          {data.map((d, i) => {
            const x = getX(i);
            const y = getY(d.value);
            const isHovered = activePoint === i;
            const isAnyHovered = activePoint !== null;

            return (
              <g
                key={d.label}
                className="cursor-pointer"
                onMouseEnter={() => setActivePoint(i)}
              >
                {/* Invisible hit target for smooth mouse capture */}
                <circle cx={x} cy={y} r="16" fill="transparent" />

                {/* Highlight Glow */}
                {isHovered && (
                  <circle
                    cx={x}
                    cy={y}
                    r="9"
                    fill={lineColor}
                    fillOpacity="0.25"
                    className="animate-ping"
                  />
                )}

                {/* Visible Data Point */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 3.5}
                  fill="#FFFFFF"
                  stroke={lineColor}
                  strokeWidth={isHovered ? 2.5 : 2}
                  opacity={isAnyHovered && !isHovered ? 0.4 : 1}
                  className="transition-all duration-150"
                />

                {/* X-Axis Month / Date Label */}
                <text
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  fill={isHovered ? '#25282C' : '#64748B'}
                  fontSize="10"
                  fontWeight={isHovered ? '700' : '500'}
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Polished Floating Cursor Tooltip */}
        {activePoint !== null && data[activePoint] && (
          <div
            className="absolute z-30 pointer-events-none bg-[#25282C] text-white p-2.5 rounded-md shadow-xl text-xs space-y-1 min-w-[150px] border border-[#3E444B] transition-transform duration-75"
            style={{
              left: `${Math.max(10, Math.min(getX(activePoint) - 75, width - 170))}px`,
              top: '6px',
            }}
          >
            <div className="flex items-center justify-between pb-1 border-b border-[#3E444B]">
              <span className="font-bold text-[11px] text-white">
                {data[activePoint].label}
              </span>
              <span className="text-[10px] text-[#A3D0B0] font-mono">
                Actual
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-0.5">
              <span className="text-[10px] text-[#94A3B8]">Gross Emissions:</span>
              <strong className="text-sm font-mono text-white font-extrabold">
                {data[activePoint].value.toLocaleString()} {unit}
              </strong>
            </div>

            {/* Differential vs Previous */}
            {getPrevDiff(activePoint) && (
              <div className="flex items-center justify-between text-[10px] pt-0.5 font-semibold">
                <span className="text-[#94A3B8]">Vs Previous:</span>
                <span
                  className={
                    getPrevDiff(activePoint)?.isDown
                      ? 'text-[#A3D0B0]'
                      : 'text-[#FCA5A5]'
                  }
                >
                  {getPrevDiff(activePoint)?.isDown ? '↓' : '↑'}{' '}
                  {getPrevDiff(activePoint)?.diffPct}%
                </span>
              </div>
            )}

            {data[activePoint].benchmark !== undefined && (
              <div className="flex items-center justify-between text-[10px] pt-0.5 border-t border-[#3E444B] text-[#D99A2B]">
                <span>{benchmarkLabel}:</span>
                <span className="font-mono font-bold">
                  {data[activePoint].benchmark?.toLocaleString()} {unit}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Clean Bottom Legend */}
      <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-1.5 border-t border-[#E2E5E9]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded" style={{ backgroundColor: lineColor }} />
            <span className="font-medium text-[#25282C]">Actual Emissions</span>
          </span>
          {hasBenchmark && (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#D99A2B] border-t border-dashed border-[#D99A2B]" />
              <span className="font-medium text-[#D99A2B]">{benchmarkLabel}</span>
            </span>
          )}
        </div>
        <span className="font-mono text-[10px]">
          Latest: <strong className="text-[#25282C]">{data[data.length - 1]?.value.toLocaleString()}</strong> {unit}
        </span>
      </div>
    </div>
  );
};

// ============================================================================
// 3. INTERACTIVE HORIZONTAL COMPARISON BAR CHART WITH HOVER HIGHLIGHTS
// ============================================================================
export interface BarItem {
  label: string;
  value: number;
  sublabel?: string;
  color?: string;
  benchmark?: number;
  badge?: string;
  unit?: string;
  onClick?: () => void;
}

interface HorizontalBarChartProps {
  items: BarItem[];
  unit?: string;
  maxCustomValue?: number;
  title?: string;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  items,
  unit = '',
  maxCustomValue,
  title,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = useMemo(() => items.reduce((s, i) => s + Math.max(0, i.value), 0), [items]);
  const maxValue = maxCustomValue || Math.max(...items.map(i => Math.max(i.value, i.benchmark || 0)), 1);

  return (
    <div className="space-y-3 w-full font-sans select-none">
      {title && (
        <div className="flex items-center justify-between text-xs pb-1 border-b border-[#E2E5E9]">
          <span className="font-bold text-[#25282C] uppercase tracking-wider text-[11px]">
            {title}
          </span>
          <span className="text-[10px] text-[#64748B]">Hover bars for precise metrics</span>
        </div>
      )}

      {items.map((item, idx) => {
        const pct = Math.min(100, Math.max(3, Math.round((item.value / maxValue) * 100)));
        const shareOfTotal = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
        const barColor = item.color || '#5B8C6A';
        const isHovered = hoveredIdx === idx;
        const isAnyHovered = hoveredIdx !== null;

        return (
          <div
            key={item.label}
            onClick={item.onClick}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            className={`space-y-1 p-1.5 rounded-md transition-all ${
              item.onClick ? 'cursor-pointer' : ''
            } ${
              isHovered
                ? 'bg-[#F1F3F5] shadow-2xs'
                : isAnyHovered
                ? 'opacity-50'
                : 'hover:bg-[#F8F9FA]'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <span className={`font-bold truncate ${isHovered ? 'text-[#25282C]' : 'text-[#343A40]'}`}>
                  {item.label}
                </span>
                {item.sublabel && (
                  <span className="text-[11px] text-[#64748B] hidden sm:inline truncate">
                    ({item.sublabel})
                  </span>
                )}
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-[#EDF5F0] text-[#3F7D58] border border-[#CDE3D5]">
                    {item.badge}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                {isHovered && total > 0 && (
                  <span className="text-[11px] font-bold text-[#5B8C6A]">
                    {shareOfTotal}%
                  </span>
                )}
                <span className="font-bold text-[#25282C]">
                  {item.value.toLocaleString()} {item.unit || unit}
                </span>
              </div>
            </div>

            {/* Bar Track & Progress */}
            <div className="w-full h-3 bg-[#E2E5E9] rounded-md overflow-hidden relative border border-[#CBD5E1]/60">
              {/* Optional benchmark tick */}
              {item.benchmark !== undefined && (
                <div
                  style={{ left: `${Math.min(100, (item.benchmark / maxValue) * 100)}%` }}
                  className="absolute top-0 bottom-0 w-1 bg-[#25282C] z-10"
                  title={`Target: ${item.benchmark.toLocaleString()}`}
                />
              )}
              {/* Bar Fill */}
              <div
                style={{
                  width: `${pct}%`,
                  backgroundColor: barColor,
                  filter: isHovered ? 'brightness(1.1)' : 'none',
                }}
                className="h-full rounded-md transition-all duration-300"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// 4. VERTICAL COMPARISON BAR CHART (TARGET VS ACTUAL / MINE COMPARISONS)
// ============================================================================
export interface VerticalBarGroup {
  label: string;
  actual: number;
  target?: number;
  secondaryValue?: number;
  highlight?: boolean;
}

interface VerticalBarChartProps {
  groups: VerticalBarGroup[];
  unit?: string;
  height?: number;
  title?: string;
}

export const VerticalBarChart: React.FC<VerticalBarChartProps> = ({
  groups,
  unit = 'tCO2e',
  height = 180,
  title,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxVal = Math.max(
    ...groups.map(g => Math.max(g.actual, g.target || 0, g.secondaryValue || 0)),
    1
  ) * 1.15;

  return (
    <div className="w-full space-y-2 font-sans select-none">
      {title && (
        <div className="flex items-center justify-between text-xs pb-1 border-b border-[#E2E5E9]">
          <span className="font-bold text-[#25282C] uppercase tracking-wider text-[11px]">
            {title}
          </span>
          <span className="text-[10px] text-[#64748B]">Hover column to inspect colliery delta</span>
        </div>
      )}

      <div className="relative w-full flex items-end justify-between gap-2 pt-6" style={{ height: `${height}px` }}>
        {/* Background baseline */}
        <div className="absolute bottom-6 left-0 right-0 h-px bg-[#CBD5E1]" />

        {groups.map((g, idx) => {
          const actualHeight = Math.max(6, (g.actual / maxVal) * (height - 40));
          const targetHeight = g.target ? Math.max(6, (g.target / maxVal) * (height - 40)) : 0;
          const isHovered = hoveredIdx === idx;
          const isAnyHovered = hoveredIdx !== null;

          return (
            <div
              key={g.label}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex-1 flex flex-col items-center justify-end h-full relative cursor-pointer transition-opacity ${
                isAnyHovered && !isHovered ? 'opacity-40' : 'opacity-100'
              }`}
            >
              {/* Tooltip on hover */}
              {isHovered && (
                <div className="absolute -top-12 z-20 bg-[#25282C] text-white px-2 py-1 rounded text-[10px] font-mono whitespace-nowrap shadow-md border border-[#3E444B]">
                  <strong className="block">{g.label}</strong>
                  <span>Actual: {g.actual.toLocaleString()} {unit}</span>
                  {g.target && <span className="block text-[#D99A2B]">Target: {g.target.toLocaleString()}</span>}
                </div>
              )}

              {/* Bars container */}
              <div className="flex items-end gap-1 mb-6">
                {/* Actual Bar */}
                <div
                  style={{ height: `${actualHeight}px` }}
                  className={`w-4 sm:w-6 rounded-t-sm transition-all duration-300 ${
                    g.actual <= (g.target || g.actual)
                      ? 'bg-[#5B8C6A]'
                      : 'bg-[#C65353]'
                  } ${isHovered ? 'ring-2 ring-[#25282C]' : ''}`}
                />

                {/* Target Bar (if provided) */}
                {g.target !== undefined && (
                  <div
                    style={{ height: `${targetHeight}px` }}
                    className="w-2.5 sm:w-3.5 bg-[#D99A2B]/80 rounded-t-sm border border-dashed border-[#D99A2B]"
                    title={`Target: ${g.target}`}
                  />
                )}
              </div>

              {/* Label */}
              <span className="text-[10px] text-[#64748B] font-medium truncate max-w-full text-center">
                {g.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[11px] text-[#64748B] pt-1">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-xs bg-[#5B8C6A]" />
          <span>Reported Emissions</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-xs bg-[#D99A2B]/80 border border-dashed border-[#D99A2B]" />
          <span>Statutory Target</span>
        </span>
      </div>
    </div>
  );
};
