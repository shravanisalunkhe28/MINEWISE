import React, { useState, useMemo } from 'react';
import { MineRecord } from '../types';
import { 
  Flame, 
  BarChart3, 
  TrendingUp, 
  AlertCircle, 
  ArrowRight, 
  ChevronRight,
  ShieldAlert,
  Building,
  Layers
} from 'lucide-react';

interface IndiaEmissionsHeatmapProps {
  mines: MineRecord[];
  onSelectMine: (mineId: string) => void;
  onOpenFullProfile: (mineId: string) => void;
}

export const IndiaEmissionsHeatmap: React.FC<IndiaEmissionsHeatmapProps> = ({
  mines,
  onSelectMine,
  onOpenFullProfile,
}) => {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [metricMode, setMetricMode] = useState<'total_emissions' | 'intensity' | 'critical_ratio'>('total_emissions');

  // Aggregation by State
  const stateAggregations = useMemo(() => {
    const map = new Map<string, {
      state: string;
      mineCount: number;
      totalEmissionsTco2e: number;
      totalCoalTonnes: number;
      avgIntensity: number;
      onTrackCount: number;
      behindCount: number;
      criticalCount: number;
      psus: Set<string>;
      mines: MineRecord[];
      scope1Total: number;
      scope2Total: number;
      scope3Total: number;
    }>();

    mines.forEach(m => {
      const cur = map.get(m.state) || {
        state: m.state,
        mineCount: 0,
        totalEmissionsTco2e: 0,
        totalCoalTonnes: 0,
        avgIntensity: 0,
        onTrackCount: 0,
        behindCount: 0,
        criticalCount: 0,
        psus: new Set<string>(),
        mines: [],
        scope1Total: 0,
        scope2Total: 0,
        scope3Total: 0,
      };

      cur.mineCount += 1;
      cur.totalEmissionsTco2e += m.emissions.totalGrossEmissions;
      cur.totalCoalTonnes += m.operational.coalExtractedTonnes;
      cur.scope1Total += m.emissions.scope1.total;
      cur.scope2Total += m.emissions.scope2.total;
      cur.scope3Total += m.emissions.scope3.total;

      if (m.targetStatus === 'critical') cur.criticalCount += 1;
      else if (m.targetStatus === 'behind') cur.behindCount += 1;
      else cur.onTrackCount += 1;

      cur.psus.add(m.company);
      cur.mines.push(m);
      map.set(m.state, cur);
    });

    return Array.from(map.values()).map(s => ({
      ...s,
      avgIntensity: s.totalCoalTonnes > 0 ? s.totalEmissionsTco2e / s.totalCoalTonnes : 0,
      onTrackPct: Math.round((s.onTrackCount / s.mineCount) * 100),
    })).sort((a, b) => b.totalEmissionsTco2e - a.totalEmissionsTco2e);
  }, [mines]);

  // Max value for heat relative scaling
  const maxStateEmissions = useMemo(() => {
    return Math.max(...stateAggregations.map(s => s.totalEmissionsTco2e), 1);
  }, [stateAggregations]);

  const maxStateIntensity = useMemo(() => {
    return Math.max(...stateAggregations.map(s => s.avgIntensity), 0.05);
  }, [stateAggregations]);

  const activeStateData = useMemo(() => {
    if (!selectedState) return stateAggregations[0] || null;
    return stateAggregations.find(s => s.state === selectedState) || stateAggregations[0];
  }, [selectedState, stateAggregations]);

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden p-5 space-y-6">
      {/* Top Header & Metric View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-600" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              State-wise Carbon Emissions & Intensity Density Heatmap
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Geographic hotspot analysis across major Indian coal producing states (Damodar, Mahanadi, Son, & Godavari basins)
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 bg-[#F1F3F5] p-1 rounded-md text-xs font-medium border border-[#E2E5E9]">
          <button
            onClick={() => setMetricMode('total_emissions')}
            className={`px-3 py-1.5 rounded transition-colors ${
              metricMode === 'total_emissions'
                ? 'bg-[#25282C] text-white shadow-xs font-semibold'
                : 'text-[#64748B] hover:text-[#25282C]'
            }`}
          >
            Total Gross CO2e (t/yr)
          </button>
          <button
            onClick={() => setMetricMode('intensity')}
            className={`px-3 py-1.5 rounded transition-colors ${
              metricMode === 'intensity'
                ? 'bg-[#25282C] text-white shadow-xs font-semibold'
                : 'text-[#64748B] hover:text-[#25282C]'
            }`}
          >
            Carbon Intensity (tCO2e/t)
          </button>
          <button
            onClick={() => setMetricMode('critical_ratio')}
            className={`px-3 py-1.5 rounded transition-colors ${
              metricMode === 'critical_ratio'
                ? 'bg-[#25282C] text-white shadow-xs font-semibold'
                : 'text-[#64748B] hover:text-[#25282C]'
            }`}
          >
            Behind Target / Critical
          </button>
        </div>
      </div>

      {/* Grid: Left Heatmap Table / Bars, Right Drilldown Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: State Heat Density List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-semibold uppercase tracking-wider">
            <span>State / Coal Basin</span>
            <span>{metricMode === 'intensity' ? 'Intensity' : metricMode === 'critical_ratio' ? 'Behind Target' : 'Annual Gross Footprint'}</span>
          </div>

          <div className="space-y-2">
            {stateAggregations.map(item => {
              const isSelected = activeStateData?.state === item.state;
              const intensityRatio = item.avgIntensity / maxStateIntensity;
              const emissionRatio = item.totalEmissionsTco2e / maxStateEmissions;

              // Color heatmap intensity
              let heatColor = 'bg-[#5B8C6A]';
              let heatBg = 'bg-[#EDF5F0]';
              if (item.criticalCount > 0 || item.avgIntensity > 0.03) {
                heatColor = 'bg-[#C65353]';
                heatBg = 'bg-[#FBEAEA]';
              } else if (item.behindCount > 0 || item.avgIntensity > 0.02) {
                heatColor = 'bg-[#D99A2B]';
                heatBg = 'bg-[#FDF6EA]';
              }

              return (
                <div
                  key={item.state}
                  onClick={() => setSelectedState(item.state)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#5B8C6A] bg-[#EDF5F0]/40 shadow-xs ring-1 ring-[#5B8C6A]'
                      : 'border-[#E2E5E9] bg-white hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#25282C]">
                        {item.state}
                      </span>
                      <span className="text-xs text-[#64748B]">
                        ({item.mineCount} {item.mineCount === 1 ? 'mine' : 'mines'} · {Array.from(item.psus).join(', ')})
                      </span>
                    </div>

                    <div className="text-right">
                      {metricMode === 'total_emissions' && (
                        <span className="text-sm font-bold text-[#25282C] font-tabular">
                          {Math.round(item.totalEmissionsTco2e).toLocaleString()}{' '}
                          <span className="text-xs font-normal text-[#64748B]">tCO2e</span>
                        </span>
                      )}
                      {metricMode === 'intensity' && (
                        <span className="text-sm font-bold text-[#3F7D58] font-tabular">
                          {item.avgIntensity.toFixed(4)}{' '}
                          <span className="text-xs font-normal text-[#64748B]">t/t</span>
                        </span>
                      )}
                      {metricMode === 'critical_ratio' && (
                        <span className="text-xs font-bold text-[#C65353] font-tabular">
                          {item.criticalCount + item.behindCount} of {item.mineCount} require audit
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Relative Heat Bar */}
                  <div className="w-full h-2 bg-[#E2E5E9] rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${heatColor}`}
                      style={{
                        width: `${Math.max(8, Math.round((metricMode === 'intensity' ? intensityRatio : emissionRatio) * 100))}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                    <span>Mines on Track: <strong className="text-slate-800">{item.onTrackPct}%</strong></span>
                    <span>Monthly Production: <strong className="text-slate-800 font-tabular">{(item.totalCoalTonnes / 1000000).toFixed(2)} Mt</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Columns: Detailed Drilldown: INDIA -> STATE -> PSU -> MINE */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col justify-between">
          {activeStateData ? (
            <div className="space-y-4">
              {/* Breadcrumb Hierarchy */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span>India National</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold text-[#166534]">{activeStateData.state}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-700">{Array.from(activeStateData.psus)[0]}</span>
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {activeStateData.state} Regional Profile
                </h4>
                <p className="text-xs text-slate-500">
                  Detailed colliery breakdown and emission sources in {activeStateData.state}
                </p>
              </div>

              {/* State Summary Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">State Gross Emissions</span>
                  <span className="text-base font-bold text-slate-900 font-tabular">
                    {Math.round(activeStateData.totalEmissionsTco2e).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block">tCO2e / year</span>
                </div>

                <div className="p-2.5 bg-white rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">State Avg Intensity</span>
                  <span className="text-base font-bold text-[#166534] font-tabular">
                    {activeStateData.avgIntensity.toFixed(4)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">tCO2e / tonne coal</span>
                </div>
              </div>

              {/* Scope Breakdown */}
              <div className="p-3 bg-white rounded border border-slate-200 text-xs space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Regional Scope Contribution
                </span>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Scope 1 (Direct Fuel & Fugitive):</span>
                  <span className="font-semibold text-slate-900 font-tabular">
                    {Math.round(activeStateData.scope1Total).toLocaleString()} t ({Math.round((activeStateData.scope1Total / activeStateData.totalEmissionsTco2e) * 100)}%)
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Scope 2 (Purchased Grid):</span>
                  <span className="font-semibold text-slate-900 font-tabular">
                    {Math.round(activeStateData.scope2Total).toLocaleString()} t ({Math.round((activeStateData.scope2Total / activeStateData.totalEmissionsTco2e) * 100)}%)
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Scope 3 (Logistics & Other):</span>
                  <span className="font-semibold text-slate-900 font-tabular">
                    {Math.round(activeStateData.scope3Total).toLocaleString()} t ({Math.round((activeStateData.scope3Total / activeStateData.totalEmissionsTco2e) * 100)}%)
                  </span>
                </div>
              </div>

              {/* Mines within State List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Collieries in {activeStateData.state} ({activeStateData.mines.length})
                </span>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {activeStateData.mines.map(m => (
                    <div
                      key={m.id}
                      onClick={() => onSelectMine(m.id)}
                      className="p-2.5 bg-white border border-slate-200 rounded hover:border-[#166534] cursor-pointer transition-colors flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          {m.name}
                          <span className="text-[10px] text-slate-400">({m.mineType.toUpperCase()})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-tabular">
                          {Math.round(m.emissions.totalGrossEmissions).toLocaleString()} tCO2e · {m.emissions.carbonIntensityTco2ePerTonne.toFixed(4)} t/t
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          m.targetStatus === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : m.targetStatus === 'behind'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {m.targetStatus.toUpperCase()}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
