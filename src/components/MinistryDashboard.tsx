import React, { useState, useMemo } from 'react';
import { MineRecord, NationalTargets } from '../types';
import { IndiaMineMap } from './IndiaMineMap';
import { IndiaEmissionsHeatmap } from './IndiaEmissionsHeatmap';
import { TargetCascadeManager } from './TargetCascadeManager';
import { BenchmarkingView } from './BenchmarkingView';
import { AnomalyAuditCenter } from './AnomalyAuditCenter';
import { 
  Building, 
  Flame, 
  Map, 
  BarChart3, 
  TrendingDown, 
  GitFork, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  SlidersHorizontal,
  Compass
} from 'lucide-react';

interface MinistryDashboardProps {
  mines: MineRecord[];
  nationalTargets: NationalTargets;
  selectedMineId: string | null;
  onSelectMine: (mineId: string) => void;
  onOpenFullProfile: (mineId: string) => void;
  onUpdateNationalTargets: (targets: NationalTargets) => void;
  onApprovePathway: (mineId: string, approved: boolean) => void;
  onUpdateMineAnomaly: (mineId: string, anomalyId: string, status: any, notes?: string) => void;
}

export const MinistryDashboard: React.FC<MinistryDashboardProps> = ({
  mines,
  nationalTargets,
  selectedMineId,
  onSelectMine,
  onOpenFullProfile,
  onUpdateNationalTargets,
  onApprovePathway,
  onUpdateMineAnomaly,
}) => {
  const [activeTab, setActiveTab] = useState<'map_view' | 'heatmap_view' | 'cascade_targets' | 'benchmarks' | 'audit_alerts'>('map_view');

  // National Sector Aggregations
  const nationalKPIs = useMemo(() => {
    const totalMines = mines.length;
    const totalEmissionsTco2e = mines.reduce((acc, m) => acc + m.emissions.totalGrossEmissions, 0);
    const totalCoalTonnes = mines.reduce((acc, m) => acc + m.operational.coalExtractedTonnes, 0);
    const avgIntensity = totalCoalTonnes > 0 ? totalEmissionsTco2e / totalCoalTonnes : 0;

    const onTrackMines = mines.filter(m => m.targetStatus === 'on_track' || m.targetStatus === 'ahead').length;
    const onTrackPct = totalMines > 0 ? Math.round((onTrackMines / totalMines) * 100) : 0;

    const totalMtCoal = (totalCoalTonnes / 1000000);
    const totalMtEmissions = (totalEmissionsTco2e / 1000000);

    return {
      totalMines,
      totalMtEmissions,
      totalMtCoal,
      avgIntensity,
      onTrackPct,
      onTrackMines,
    };
  }, [mines]);

  return (
    <div className="space-y-6">
      {/* Ministry Top Masthead */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-900 text-white uppercase font-mono tracking-wider">
              MINISTRY OF COAL · GOI
            </span>
            <span className="text-xs text-slate-500">
              National Decarbonization & Clean Coal Technology Command
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            National Coal Mining Greenhouse Gas & Decarbonization Intelligence
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time monitoring of all public sector coalfields (CIL Subsidiaries & SCCL) under India's NDC 2030 framework
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">National NDC Commitment:</span>
          <span className="px-3 py-1 bg-[#166534] text-white font-bold rounded font-tabular">
            -{nationalTargets.nationalReductionTargetPct}% Reduction by {nationalTargets.targetYear}
          </span>
        </div>
      </div>

      {/* SECTION 16: NATIONAL LEVEL KPIS BANNER */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* KPI 1: TOTAL MINES */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
            TOTAL COLLIERIES
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 font-tabular">
              {nationalKPIs.totalMines}
            </span>
            <span className="text-xs text-slate-500 font-medium">units</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Active reporting fleet
          </span>
        </div>

        {/* KPI 2: TOTAL SECTOR EMISSIONS */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
            TOTAL SECTOR EMISSIONS
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 font-tabular">
              {nationalKPIs.totalMtEmissions.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 font-medium">MtCO2e / yr</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Gross direct + indirect
          </span>
        </div>

        {/* KPI 3: AVERAGE CARBON INTENSITY */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
            AVERAGE CARBON INTENSITY
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[#166534] font-tabular">
              {nationalKPIs.avgIntensity.toFixed(4)}
            </span>
            <span className="text-xs text-slate-500 font-medium">tCO2e / t</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Sector weighted average
          </span>
        </div>

        {/* KPI 4: MINES ON TRACK */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
            COLLIERIES ON TRACK
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-emerald-700 font-tabular">
              {nationalKPIs.onTrackPct}%
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ({nationalKPIs.onTrackMines}/{nationalKPIs.totalMines})
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-[#166534] h-full rounded-full"
              style={{ width: `${nationalKPIs.onTrackPct}%` }}
            />
          </div>
        </div>

        {/* KPI 5: NATIONAL TARGET */}
        <div className="col-span-2 md:col-span-1 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
            NATIONAL 2030 TARGET
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 font-tabular">
              -{nationalTargets.nationalReductionTargetPct}%
            </span>
            <span className="text-xs text-slate-500 font-medium">intensity cut</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1 font-mono">
            Mandate Scope: {nationalTargets.mandatedScope}
          </span>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('map_view')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'map_view'
              ? 'border-[#166534] text-[#166534]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>India Interactive Mine Map</span>
        </button>

        <button
          onClick={() => setActiveTab('heatmap_view')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'heatmap_view'
              ? 'border-[#166534] text-[#166534]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Flame className="w-4 h-4 text-red-600" />
          <span>India Emissions Heatmap & State Drill-down</span>
        </button>

        <button
          onClick={() => setActiveTab('cascade_targets')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'cascade_targets'
              ? 'border-[#166534] text-[#166534]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <GitFork className="w-4 h-4 text-blue-600" />
          <span>National Target Cascade & Approvals</span>
        </button>

        <button
          onClick={() => setActiveTab('benchmarks')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'benchmarks'
              ? 'border-[#166534] text-[#166534]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>National Benchmarks & Leaderboard</span>
        </button>

        <button
          onClick={() => setActiveTab('audit_alerts')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'audit_alerts'
              ? 'border-[#166534] text-[#166534]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Statutory Audit & Anomaly Alerts</span>
        </button>
      </div>

      {/* VIEW A: INDIA INTERACTIVE MINE MAP */}
      {activeTab === 'map_view' && (
        <IndiaMineMap
          mines={mines}
          selectedMineId={selectedMineId}
          onSelectMine={onSelectMine}
          onOpenFullProfile={onOpenFullProfile}
        />
      )}

      {/* VIEW B: INDIA EMISSIONS HEATMAP */}
      {activeTab === 'heatmap_view' && (
        <IndiaEmissionsHeatmap
          mines={mines}
          onSelectMine={onSelectMine}
          onOpenFullProfile={onOpenFullProfile}
        />
      )}

      {/* VIEW C: NATIONAL TARGET CASCADE */}
      {activeTab === 'cascade_targets' && (
        <TargetCascadeManager
          mines={mines}
          nationalTargets={nationalTargets}
          currentRole="ministry_official"
          onUpdateNationalTarget={onUpdateNationalTargets}
          onApproveMinePathway={onApprovePathway}
          onOpenMineProfile={onOpenFullProfile}
        />
      )}

      {/* VIEW D: BENCHMARKS & LEADERBOARD */}
      {activeTab === 'benchmarks' && (
        <BenchmarkingView
          mines={mines}
          onSelectMine={onOpenFullProfile}
        />
      )}

      {/* VIEW E: AUDIT & ANOMALIES */}
      {activeTab === 'audit_alerts' && (
        <AnomalyAuditCenter
          mines={mines}
          onUpdateMineAnomaly={onUpdateMineAnomaly}
          onOpenMineProfile={onOpenFullProfile}
        />
      )}
    </div>
  );
};
