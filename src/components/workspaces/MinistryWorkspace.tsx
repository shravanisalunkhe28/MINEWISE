import React, { useState, useMemo } from 'react';
import { MineRecord, NationalTargets } from '../../types';
import { UserAccount } from '../../data/accountsData';
import { IndiaMineMap } from '../IndiaMineMap';
import { IndiaEmissionsHeatmap } from '../IndiaEmissionsHeatmap';
import { TargetCascadeManager } from '../TargetCascadeManager';
import { MineSatelliteView } from '../MineSatelliteView';
import { SatelliteHotspotAnalysis } from '../SatelliteHotspotAnalysis';
import { DonutChart, HorizontalBarChart } from '../charts/VisualCharts';
import {
  Globe,
  Map,
  Flame,
  Layers,
  GitFork,
  FileSpreadsheet,
  ChevronRight,
  LogOut,
  ShieldCheck,
  TrendingDown,
  Building2,
  Printer,
  Sparkles,
  Zap,
  Info,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
  Scale
} from 'lucide-react';

interface MinistryWorkspaceProps {
  currentUser: UserAccount;
  allMines: MineRecord[];
  nationalTargets: NationalTargets;
  onUpdateNationalTargets: (targets: NationalTargets) => void;
  onApprovePathway: (mineId: string, approved: boolean) => void;
  onLogout: () => void;
}

type MinistryNavTab =
  | 'national_overview'
  | 'india_mine_map'
  | 'emissions_heatmap'
  | 'state_breakdown'
  | 'target_cascade'
  | 'national_reports';

export const MinistryWorkspace: React.FC<MinistryWorkspaceProps> = ({
  currentUser,
  allMines,
  nationalTargets,
  onUpdateNationalTargets,
  onApprovePathway,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<MinistryNavTab>('national_overview');
  const [selectedMineId, setSelectedMineId] = useState<string | null>(allMines[0]?.id || null);
  const [drilldownMine, setDrilldownMine] = useState<MineRecord | null>(null);
  const [satelliteInspectionTab, setSatelliteInspectionTab] = useState<'card' | 'interactive'>('card');

  // State Breakdown filter / selection
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('all');
  const [stateSortBy, setStateSortBy] = useState<'emissions' | 'intensity' | 'production'>('emissions');

  // National Aggregations
  const stats = useMemo(() => {
    const totalMines = allMines.length;
    const totalGrossEmissions = allMines.reduce((sum, m) => sum + m.emissions.totalGrossEmissions, 0);
    const totalProduction = allMines.reduce((sum, m) => sum + m.operational.coalExtractedTonnes, 0);
    const nationalAvgIntensity = totalProduction > 0 ? totalGrossEmissions / totalProduction : 0;
    const totalReductions = allMines.reduce((sum, m) => sum + m.emissions.emissionReductionsAchieved, 0);
    const avgReductionPct = totalMines > 0
      ? Math.round(allMines.reduce((sum, m) => sum + m.currentReductionPct, 0) / totalMines * 10) / 10
      : 0;

    const onTrackMines = allMines.filter(m => m.targetStatus === 'on_track' || m.targetStatus === 'ahead').length;
    const atRiskMines = allMines.filter(m => m.targetStatus === 'behind').length;
    const criticalMines = allMines.filter(m => m.targetStatus === 'critical').length;

    // Top emitting collieries
    const topEmitters = [...allMines].sort((a, b) => b.emissions.totalGrossEmissions - a.emissions.totalGrossEmissions).slice(0, 5);

    return {
      totalMines,
      totalGrossEmissions,
      totalProduction,
      nationalAvgIntensity,
      totalReductions,
      avgReductionPct,
      onTrackMines,
      atRiskMines,
      criticalMines,
      topEmitters,
    };
  }, [allMines]);

  // State-wise aggregated data
  interface StateAggregation {
    state: string;
    mineCount: number;
    totalEmissions: number;
    totalProduction: number;
    avgIntensity: number;
    avgReduction: number;
    mines: MineRecord[];
  }

  const stateSummary = useMemo(() => {
    const record: Record<string, StateAggregation> = {};

    allMines.forEach(m => {
      if (!record[m.state]) {
        record[m.state] = {
          state: m.state,
          mineCount: 0,
          totalEmissions: 0,
          totalProduction: 0,
          avgIntensity: 0,
          avgReduction: 0,
          mines: [],
        };
      }

      const existing = record[m.state];
      existing.mineCount += 1;
      existing.totalEmissions += m.emissions.totalGrossEmissions;
      existing.totalProduction += m.operational.coalExtractedTonnes;
      existing.avgReduction += m.currentReductionPct;
      existing.mines.push(m);
    });

    const list: StateAggregation[] = Object.values(record).map(s => ({
      ...s,
      avgIntensity: s.totalProduction > 0 ? s.totalEmissions / s.totalProduction : 0,
      avgReduction: s.mineCount > 0 ? Math.round((s.avgReduction / s.mineCount) * 10) / 10 : 0,
    }));

    if (stateSortBy === 'emissions') {
      return list.sort((a, b) => b.totalEmissions - a.totalEmissions);
    } else if (stateSortBy === 'intensity') {
      return list.sort((a, b) => b.avgIntensity - a.avgIntensity);
    } else {
      return list.sort((a, b) => b.totalProduction - a.totalProduction);
    }
  }, [allMines, stateSortBy]);

  // Navigation Items - Strictly 6 Ministry tabs
  const navItems = [
    { id: 'national_overview', label: '1. National Overview', icon: Globe },
    { id: 'india_mine_map', label: '2. India Mine Map', icon: Map },
    { id: 'emissions_heatmap', label: '3. Emissions Heatmap', icon: Flame },
    { id: 'state_breakdown', label: '4. State Breakdown', icon: Layers },
    { id: 'target_cascade', label: '5. Target Cascade', icon: GitFork },
    { id: 'national_reports', label: '6. National Reports', icon: FileSpreadsheet },
  ] as const;

  return (
    <div className="flex h-screen bg-[#F1F3F5] text-[#25282C] overflow-hidden font-sans">
      {/* ==============================================================
          LEFT: MINISTRY OF COAL NAVIGATION SIDEBAR (GRAPHITE)
          ============================================================== */}
      <aside className="w-64 bg-[#25282C] border-r border-[#343A40] flex flex-col justify-between shrink-0 select-none">
        <div>
          {/* Ministry Seal / Brand */}
          <div className="p-4 border-b border-[#343A40] bg-[#1E2024]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-[#5B8C6A] text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
                M
              </div>
              <div className="overflow-hidden">
                <span className="font-extrabold text-sm tracking-tight text-white block leading-tight">
                  MINEWISE
                </span>
                <span className="text-[10px] text-[#A3D0B0] font-semibold uppercase tracking-wider block">
                  Ministry of Coal · GoI
                </span>
              </div>
            </div>

            <div className="mt-3 p-2.5 bg-[#2D3137] rounded-md border border-[#3E444B] text-xs">
              <span className="text-[10px] text-[#8E97A2] font-semibold uppercase tracking-wider block">National Scope</span>
              <span className="font-bold text-white block truncate mt-0.5">
                All Indian Coal Collieries (CIL & SCCL)
              </span>
              <span className="text-[10px] text-[#A3D0B0] font-semibold block mt-1 font-mono">
                Target: -{nationalTargets.nationalReductionTargetPct}% by {nationalTargets.targetYear}
              </span>
            </div>
          </div>

          {/* 6 Ministry Navigation Links */}
          <nav className="p-3 space-y-1 text-xs font-medium">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-[#5B8C6A] text-white font-semibold shadow-xs'
                      : 'text-[#C4C9D0] hover:bg-[#343A40] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#8E97A2]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Ministry Official & Role Switcher */}
        <div className="p-3 border-t border-[#343A40] bg-[#1E2024]">
          <div className="p-2 rounded-md bg-[#2D3137] border border-[#3E444B] text-xs">
            <div className="overflow-hidden">
              <span className="font-bold text-white block truncate leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-[#8E97A2] block truncate mt-0.5">
                {currentUser.employeeId ? `${currentUser.employeeId} · ` : ''}{currentUser.designation}
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full mt-2 py-1.5 px-2 text-[11px] text-[#8E97A2] hover:text-[#C65353] flex items-center justify-center gap-1.5 transition-colors font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ==============================================================
          MAIN CONTENT AREA (COOL LIGHT GREY)
          ============================================================== */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F1F3F5]">
        {/* Top Header */}
        <header className="bg-white border-b border-[#E2E5E9] px-6 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#25282C] tracking-tight">
                National Coal Decarbonization Intelligence Portal
              </h1>
              <span className="text-xs px-2 py-0.5 rounded font-semibold bg-[#EBF4F6] text-[#397D8A] border border-[#C5DFE3] font-mono">
                Govt. of India
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Strategic national oversight, India-wide GIS mapping, emissions heatmaps & statutory target cascade.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#64748B]">Sector Decarbonization Status:</span>
            <span className="font-bold text-[#3F7D58] bg-[#EDF5F0] px-2.5 py-1 rounded border border-[#CDE3D5]">
              -{stats.avgReductionPct}% Achieved / -35.0% by 2030
            </span>
          </div>
        </header>

        {/* Tab Content Body */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ==========================================================
              TAB 1: NATIONAL OVERVIEW
              ========================================================== */}
          {activeTab === 'national_overview' && (
            <div className="space-y-6">
              {/* Top 5 National KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-lg border border-[#E2E5E9] shadow-xs">
                  <span className="text-xs font-semibold text-[#64748B] block">Total Monitored Mines</span>
                  <div className="text-2xl font-bold text-[#25282C] mt-1">{stats.totalMines}</div>
                  <span className="text-[11px] text-[#64748B] mt-1 block">
                    Across 8 coal-bearing states
                  </span>
                </div>

                <div className="bg-white p-4 rounded-lg border border-[#E2E5E9] shadow-xs">
                  <span className="text-xs font-semibold text-[#64748B] block">Coal Sector Emissions</span>
                  <div className="text-2xl font-bold text-[#25282C] mt-1">
                    {(stats.totalGrossEmissions / 1000).toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                    <span className="text-xs font-normal text-[#64748B] ml-1">ktCO2e</span>
                  </div>
                  <span className="text-[11px] text-[#3F7D58] mt-1 block font-medium">
                    Annualized: ~{(stats.totalGrossEmissions * 12 / 1000000).toFixed(2)} MtCO2e
                  </span>
                </div>

                <div className="bg-white p-4 rounded-lg border border-[#E2E5E9] shadow-xs">
                  <span className="text-xs font-semibold text-[#64748B] block">National Carbon Intensity</span>
                  <div className="text-2xl font-bold text-[#25282C] mt-1">
                    {stats.nationalAvgIntensity.toFixed(4)}
                    <span className="text-xs font-normal text-[#64748B] ml-1">tCO2e/t</span>
                  </div>
                  <span className="text-[11px] text-[#64748B] mt-1 block">
                    Per tonne coal produced
                  </span>
                </div>

                <div className="bg-white p-4 rounded-lg border border-[#E2E5E9] shadow-xs">
                  <span className="text-xs font-semibold text-[#64748B] block">National Reduction Achieved</span>
                  <div className="text-2xl font-bold text-[#3F7D58] mt-1">
                    -{stats.avgReductionPct}%
                  </div>
                  <span className="text-[11px] text-[#64748B] mt-1 block">
                    Towards 2030 NDC targets
                  </span>
                </div>

                <div className="bg-white p-4 rounded-lg border border-[#E2E5E9] shadow-xs">
                  <span className="text-xs font-semibold text-[#64748B] block">Trajectory Status</span>
                  <div className="text-2xl font-bold text-[#3F7D58] mt-1">
                    On Track
                  </div>
                  <span className="text-[11px] text-[#64748B] mt-1 block">
                    Interim FY26 milestone met
                  </span>
                </div>
              </div>

              {/* National Fleet Trajectory Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-[#CDE3D5] shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#3F7D58]">
                      On Track / Ahead
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#5B8C6A]"></span>
                  </div>
                  <div className="text-3xl font-bold text-[#3F7D58] mt-2">
                    {stats.onTrackMines}
                    <span className="text-sm font-normal text-[#64748B] ml-1.5">
                      / {stats.totalMines} mines
                    </span>
                  </div>
                  <p className="text-xs text-[#343A40] mt-1">
                    Compliant with regional cascaded decarbonization milestones.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-[#F6E1B8] shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#D99A2B]">
                      At Risk (Intervention Needed)
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D99A2B]"></span>
                  </div>
                  <div className="text-3xl font-bold text-[#D99A2B] mt-2">
                    {stats.atRiskMines}
                    <span className="text-sm font-normal text-[#64748B] ml-1.5">
                      / {stats.totalMines} mines
                    </span>
                  </div>
                  <p className="text-xs text-[#343A40] mt-1">
                    Delayed FMC conveyor rollout or captive diesel reliance.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-[#F4CDCD] shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#C65353]">
                      Critical Attention Required
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C65353]"></span>
                  </div>
                  <div className="text-3xl font-bold text-[#C65353] mt-2">
                    {stats.criticalMines}
                    <span className="text-sm font-normal text-[#64748B] ml-1.5">
                      / {stats.totalMines} mines
                    </span>
                  </div>
                  <p className="text-xs text-[#343A40] mt-1">
                    Audit discrepancies or significant underperformance against targets.
                  </p>
                </div>
              </div>

              {/* Interactive National Analysis Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-lg border border-[#E2E5E9] shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E2E5E9]">
                    <h3 className="text-sm font-bold text-[#25282C]">
                      National Fleet Target Trajectory Split
                    </h3>
                    <span className="text-[11px] text-[#64748B]">Colliery Units</span>
                  </div>
                  <DonutChart
                    items={[
                      { label: 'On Track / Ahead', value: stats.onTrackMines, color: '#3F7D58', unit: 'mines' },
                      { label: 'At Risk (Behind)', value: stats.atRiskMines, color: '#D99A2B', unit: 'mines' },
                      { label: 'Critical / Discrepancy', value: stats.criticalMines, color: '#C65353', unit: 'mines' },
                    ]}
                    centerLabel="Total Mines"
                    centerValue={`${stats.totalMines}`}
                    size={175}
                  />
                </div>

                <div className="bg-white p-5 rounded-lg border border-[#E2E5E9] shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E2E5E9]">
                    <h3 className="text-sm font-bold text-[#25282C]">
                      State-Wise Coal Sector Carbon Contribution
                    </h3>
                    <span className="text-[11px] text-[#64748B]">Hover bars for metrics</span>
                  </div>
                  <HorizontalBarChart
                    items={stateSummary.slice(0, 5).map(s => ({
                      label: s.state,
                      value: Math.round(s.totalEmissions / 1000),
                      sublabel: `${s.mineCount} mines`,
                      color: s.avgIntensity > 0.02 ? '#C65353' : '#397D8A',
                      unit: 'kt',
                    }))}
                    unit="ktCO2e"
                  />
                </div>
              </div>

              {/* Top National Emission Hotspots Table */}
              <div className="bg-white p-5 rounded-lg border border-[#E2E5E9] shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-[#25282C]">
                      Top 5 National Colliery Emission Hotspots
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      High-volume opencast pits and gassy underground mines requiring prioritized Ministry intervention funds.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('india_mine_map')}
                    className="text-xs font-semibold text-[#5B8C6A] hover:text-[#3F7D58] flex items-center gap-1 transition-colors"
                  >
                    <span>View on India Map</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F8F9FA] border-b border-[#E2E5E9] text-[#64748B] font-semibold text-[10px] uppercase">
                        <th className="py-2.5 px-3">Rank</th>
                        <th className="py-2.5 px-3">Colliery Name</th>
                        <th className="py-2.5 px-3">PSU Subsidiary</th>
                        <th className="py-2.5 px-3">State</th>
                        <th className="py-2.5 px-3 text-right">Production (t)</th>
                        <th className="py-2.5 px-3 text-right">Gross Emissions (tCO2e)</th>
                        <th className="py-2.5 px-3 text-right">Carbon Intensity</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E5E9]">
                      {stats.topEmitters.map((m, idx) => (
                        <tr key={m.id} className="hover:bg-[#F8F9FA] transition-colors">
                          <td className="py-2.5 px-3 font-bold text-[#64748B]">#{idx + 1}</td>
                          <td className="py-2.5 px-3 font-bold text-[#25282C]">{m.name}</td>
                          <td className="py-2.5 px-3 text-[#64748B]">{m.company}</td>
                          <td className="py-2.5 px-3 text-[#64748B]">{m.state}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-[#25282C]">
                            {m.operational.coalExtractedTonnes.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-[#C65353]">
                            {Math.round(m.emissions.totalGrossEmissions).toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-[#25282C]">
                            {m.emissions.carbonIntensityTco2ePerTonne.toFixed(4)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              m.targetStatus === 'on_track'
                                ? 'bg-[#EDF5F0] text-[#3F7D58] border border-[#CDE3D5]'
                                : 'bg-[#FDF6EA] text-[#D99A2B] border border-[#F6E1B8]'
                            }`}>
                              -{m.currentReductionPct}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================================
              TAB 2: INDIA MINE MAP (Exclusively Ministry Level)
              ========================================================== */}
          {activeTab === 'india_mine_map' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-[#E2E5E9] shadow-xs">
                <h2 className="text-sm font-bold text-[#25282C]">
                  National Geospatial Mine Registry & Emission Map
                </h2>
                <p className="text-xs text-[#64748B]">
                  Interactive GIS projection of all registered coal collieries across Indian coalfield basins.
                </p>
              </div>

              <IndiaMineMap
                mines={allMines}
                selectedMineId={selectedMineId}
                onSelectMine={id => setSelectedMineId(id)}
                onOpenFullProfile={id => {
                  const m = allMines.find(mine => mine.id === id);
                  if (m) setDrilldownMine(m);
                }}
              />
            </div>
          )}

          {/* ==========================================================
              TAB 3: EMISSIONS HEATMAP (Exclusively Ministry Level)
              ========================================================== */}
          {activeTab === 'emissions_heatmap' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-[#E2E5E9] shadow-xs">
                <h2 className="text-sm font-bold text-[#25282C]">
                  India Coalfield Basin Emissions Density Heatmap
                </h2>
                <p className="text-xs text-[#64748B]">
                  Basin-level concentration analysis highlighting heavy carbon intensity corridors and fugitive methane plumes.
                </p>
              </div>

              <IndiaEmissionsHeatmap
                mines={allMines}
                onSelectMine={id => setSelectedMineId(id)}
                onOpenFullProfile={id => {
                  const m = allMines.find(mine => mine.id === id);
                  if (m) setDrilldownMine(m);
                }}
              />
            </div>
          )}

          {/* ==========================================================
              TAB 4: STATE BREAKDOWN
              ========================================================== */}
          {activeTab === 'state_breakdown' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-lg border border-[#E2E5E9] shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-[#25282C]">
                      Inter-State Coal Sector Decarbonization Comparison
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Benchmarking major coal producing states by carbon volume, emissions per tonne, and NDC compliance.
                    </p>
                  </div>

                  {/* Sort Controls */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#64748B] font-semibold">Rank by:</span>
                    <button
                      onClick={() => setStateSortBy('emissions')}
                      className={`px-2.5 py-1.5 rounded font-medium transition-colors ${
                        stateSortBy === 'emissions'
                          ? 'bg-[#25282C] text-white'
                          : 'bg-[#F1F3F5] text-[#25282C] hover:bg-[#E2E5E9]'
                      }`}
                    >
                      Total Emissions
                    </button>
                    <button
                      onClick={() => setStateSortBy('intensity')}
                      className={`px-2.5 py-1.5 rounded font-medium transition-colors ${
                        stateSortBy === 'intensity'
                          ? 'bg-[#25282C] text-white'
                          : 'bg-[#F1F3F5] text-[#25282C] hover:bg-[#E2E5E9]'
                      }`}
                    >
                      Carbon Intensity
                    </button>
                    <button
                      onClick={() => setStateSortBy('production')}
                      className={`px-2.5 py-1.5 rounded font-medium transition-colors ${
                        stateSortBy === 'production'
                          ? 'bg-[#25282C] text-white'
                          : 'bg-[#F1F3F5] text-[#25282C] hover:bg-[#E2E5E9]'
                      }`}
                    >
                      Coal Output
                    </button>
                  </div>
                </div>

                {/* State Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  {stateSummary.map((stateItem, idx) => (
                    <div
                      key={stateItem.state}
                      className="p-4 rounded-lg border border-[#E2E5E9] bg-white hover:border-[#5B8C6A] transition-all shadow-xs"
                    >
                      <div className="flex items-center justify-between border-b border-[#E2E5E9] pb-3">
                        <div>
                          <span className="text-[10px] font-bold text-[#64748B] uppercase">
                            Rank #{idx + 1} State
                          </span>
                          <h3 className="text-base font-bold text-[#25282C]">{stateItem.state}</h3>
                        </div>
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#F1F3F5] text-[#25282C] border border-[#E2E5E9]">
                          {stateItem.mineCount} Mines
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[#64748B] block text-[11px]">Monthly Emissions</span>
                          <span className="font-mono font-bold text-[#25282C]">
                            {Math.round(stateItem.totalEmissions).toLocaleString('en-IN')} t
                          </span>
                        </div>
                        <div>
                          <span className="text-[#64748B] block text-[11px]">Avg Intensity</span>
                          <span className="font-mono font-bold text-[#3F7D58]">
                            {stateItem.avgIntensity.toFixed(4)} t/t
                          </span>
                        </div>
                        <div>
                          <span className="text-[#64748B] block text-[11px]">Production</span>
                          <span className="font-mono text-[#25282C]">
                            {(stateItem.totalProduction / 1000000).toFixed(2)} Mt
                          </span>
                        </div>
                        <div>
                          <span className="text-[#64748B] block text-[11px]">Avg Reduction</span>
                          <span className="font-bold text-[#3F7D58]">
                            -{stateItem.avgReduction}%
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-[#E2E5E9]">
                        <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider block mb-1.5">
                          Collieries in {stateItem.state}
                        </span>
                        <div className="space-y-1">
                          {stateItem.mines.map(m => (
                            <div
                              key={m.id}
                              onClick={() => setDrilldownMine(m)}
                              className="flex items-center justify-between p-1.5 rounded hover:bg-[#F8F9FA] cursor-pointer text-xs transition-colors"
                            >
                              <span className="font-medium text-[#25282C]">{m.name}</span>
                              <span className="font-mono text-[#64748B] text-[11px]">
                                {m.emissions.carbonIntensityTco2ePerTonne.toFixed(4)} t/t
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================================
              TAB 5: TARGET CASCADE (Exclusively Ministry Level)
              ========================================================== */}
          {activeTab === 'target_cascade' && (
            <div className="space-y-4">
              <TargetCascadeManager
                mines={allMines}
                nationalTargets={nationalTargets}
                currentRole="ministry_official"
                onUpdateNationalTarget={onUpdateNationalTargets}
                onApproveMinePathway={onApprovePathway}
                onOpenMineProfile={id => {
                  const m = allMines.find(mine => mine.id === id);
                  if (m) setDrilldownMine(m);
                }}
              />
            </div>
          )}

          {/* ==========================================================
              TAB 6: NATIONAL REPORTS
              ========================================================== */}
          {activeTab === 'national_reports' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border border-[#E2E5E9] shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E5E9] pb-4">
                  <div>
                    <span className="text-xs font-bold text-[#5B8C6A] uppercase tracking-wider block">
                      Statutory Policy Document
                    </span>
                    <h2 className="text-lg font-bold text-[#25282C] mt-0.5">
                      National Coal Sector Carbon Neutrality Roadmap & NDC Progress Report
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Prepared by Ministry of Coal for submission to the PMO and Ministry of Environment, Forest & Climate Change (MoEFCC).
                    </p>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-[#5B8C6A] hover:bg-[#3F7D58] text-white text-xs font-semibold rounded shadow-xs flex items-center gap-2 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print National Report</span>
                  </button>
                </div>

                {/* Printable National Document Preview */}
                <div className="mt-6 p-6 border border-[#E2E5E9] rounded-lg bg-[#F8F9FA] text-xs space-y-6 font-mono">
                  <div className="text-center border-b border-[#E2E5E9] pb-4">
                    <span className="text-sm font-bold text-[#25282C] block font-sans">
                      GOVERNMENT OF INDIA · MINISTRY OF COAL
                    </span>
                    <span className="text-xs text-[#64748B] block mt-1">
                      NATIONAL DECARBONIZATION & GREEN TRANSITION MONITORING CELL
                    </span>
                    <span className="text-[11px] text-[#64748B] block mt-0.5">
                      Annual Statutory Sectoral Carbon Audit Statement · Baseline Year: {nationalTargets.baselineYear} | Target: -{nationalTargets.nationalReductionTargetPct}% by {nationalTargets.targetYear}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded border border-[#E2E5E9] font-sans">
                    <div>
                      <span className="text-[10px] text-[#64748B] uppercase block">Total Collieries</span>
                      <span className="text-base font-bold text-[#25282C]">{stats.totalMines}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] uppercase block">Total Output</span>
                      <span className="text-base font-bold text-[#25282C]">{(stats.totalProduction / 1000000).toFixed(2)} Mt</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] uppercase block">Sector Emissions</span>
                      <span className="text-base font-bold text-[#25282C]">{(stats.totalGrossEmissions / 1000).toFixed(1)} ktCO2e</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] uppercase block">National Intensity</span>
                      <span className="text-base font-bold text-[#25282C]">{stats.nationalAvgIntensity.toFixed(4)} t/t</span>
                    </div>
                  </div>

                  <div className="font-sans">
                    <h3 className="font-bold text-[#25282C] text-xs mb-2">Regional Subsidiary Compliance Summary:</h3>
                    <div className="space-y-1">
                      {['SECL', 'BCCL', 'MCL', 'CCL', 'NCL', 'WCL', 'ECL', 'SCCL'].map(sub => {
                        const target = nationalTargets.regionalTargets[sub] || 35.0;
                        const subMines = allMines.filter(m => m.company === sub);
                        const subReduction = subMines.length > 0
                          ? Math.round(subMines.reduce((s: number, m: MineRecord) => s + m.currentReductionPct, 0) / subMines.length * 10) / 10
                          : 0;
                        return (
                          <div key={sub} className="flex items-center justify-between p-2 bg-white rounded border border-[#E2E5E9] text-xs">
                            <span className="font-bold text-[#25282C]">{sub}</span>
                            <span className="font-mono text-[#64748B]">Mines: {subMines.length} | Cascaded Target: -{target}% | Achieved: -{subReduction}% | Trajectory: {subReduction >= target * 0.4 ? 'COMPLIANT' : 'LAGGING'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Drill-down Mine Modal */}
      {drilldownMine && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`bg-white rounded-lg shadow-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-[#E2E5E9] transition-all ${
            satelliteInspectionTab === 'interactive' ? 'max-w-4xl' : 'max-w-2xl'
          }`}>
            <div className="flex items-center justify-between border-b border-[#E2E5E9] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#25282C]">{drilldownMine.name}</h3>
                <span className="text-xs text-[#64748B] font-mono">
                  {drilldownMine.code} · {drilldownMine.company} · {drilldownMine.district}, {drilldownMine.state}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded border border-[#E2E5E9] p-0.5 bg-[#F8F9FA] text-[11px]">
                  <button
                    onClick={() => setSatelliteInspectionTab('card')}
                    className={`px-2 py-0.5 rounded font-semibold cursor-pointer transition-colors ${
                      satelliteInspectionTab === 'card'
                        ? 'bg-white text-[#25282C] shadow-xs'
                        : 'text-[#64748B] hover:text-[#25282C]'
                    }`}
                  >
                    Quick Summary
                  </button>
                  <button
                    onClick={() => setSatelliteInspectionTab('interactive')}
                    className={`px-2 py-0.5 rounded font-semibold cursor-pointer transition-colors ${
                      satelliteInspectionTab === 'interactive'
                        ? 'bg-[#5B8C6A] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#25282C]'
                    }`}
                  >
                    Satellite Hotspot Prototype
                  </button>
                </div>
                <button
                  onClick={() => {
                    setDrilldownMine(null);
                    setSatelliteInspectionTab('card');
                  }}
                  className="text-[#64748B] hover:text-[#25282C] p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Satellite Earth Observation Inspection (Requirement 10 & Request 3) */}
            {satelliteInspectionTab === 'interactive' ? (
              <SatelliteHotspotAnalysis mine={drilldownMine} />
            ) : (
              <>
                <MineSatelliteView mine={drilldownMine} variant="card" />

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-[#F8F9FA] rounded border border-[#E2E5E9]">
                    <span className="text-[#64748B] block">Monthly Coal Extraction:</span>
                    <span className="text-sm font-bold font-mono text-[#25282C]">
                      {drilldownMine.operational.coalExtractedTonnes.toLocaleString('en-IN')} tonnes
                    </span>
                  </div>
                  <div className="p-3 bg-[#F8F9FA] rounded border border-[#E2E5E9]">
                    <span className="text-[#64748B] block">Total Gross Emissions:</span>
                    <span className="text-sm font-bold font-mono text-[#25282C]">
                      {Math.round(drilldownMine.emissions.totalGrossEmissions).toLocaleString('en-IN')} tCO2e
                    </span>
                  </div>
                  <div className="p-3 bg-[#F8F9FA] rounded border border-[#E2E5E9]">
                    <span className="text-[#64748B] block">Carbon Intensity:</span>
                    <span className="text-sm font-bold font-mono text-[#25282C]">
                      {drilldownMine.emissions.carbonIntensityTco2ePerTonne.toFixed(4)} tCO2e/t
                    </span>
                  </div>
                  <div className="p-3 bg-[#F8F9FA] rounded border border-[#E2E5E9]">
                    <span className="text-[#64748B] block">Decarbonization Pathway:</span>
                    <span className="text-sm font-bold capitalize text-[#3F7D58]">
                      {drilldownMine.pathwayStatus.replace('_', ' ')} (-{drilldownMine.currentReductionPct}%)
                    </span>
                  </div>
                </div>
              </>
            )}

            <div className="border-t border-[#E2E5E9] pt-3 flex justify-end gap-2">
              <button
                onClick={() => {
                  setDrilldownMine(null);
                  setSatelliteInspectionTab('card');
                }}
                className="px-4 py-2 text-xs font-semibold text-[#25282C] bg-[#F1F3F5] hover:bg-[#E2E5E9] rounded cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
