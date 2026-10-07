import React, { useState, useMemo } from 'react';
import { MineRecord, AnomalyStatus } from '../../types';
import { UserAccount } from '../../data/accountsData';
import { AnomalyAuditCenter } from '../AnomalyAuditCenter';
import { IndiaMineMap } from '../IndiaMineMap';
import { MineSatelliteView } from '../MineSatelliteView';
import { SatelliteHotspotAnalysis } from '../SatelliteHotspotAnalysis';
import {
  Building2,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Flame,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  LogOut,
  ShieldCheck,
  TrendingDown,
  Filter,
  Check,
  X,
  Printer,
  Sparkles,
  Zap,
  Leaf,
  Sun,
  Truck,
  Activity,
  ArrowUpRight,
  Info,
  Calendar,
  Search,
  SlidersHorizontal,
  FileCheck2,
  Clock,
  ExternalLink
} from 'lucide-react';

interface RegionalWorkspaceProps {
  currentUser: UserAccount;
  allMines: MineRecord[];
  onApprovePathway: (mineId: string, approved: boolean) => void;
  onUpdateAnomaly: (mineId: string, anomalyId: string, newStatus: AnomalyStatus, notes?: string) => void;
  onLogout: () => void;
}

type RegionalNavTab =
  | 'regional_overview'
  | 'mine_comparison'
  | 'validation_approvals'
  | 'anomaly_center'
  | 'interventions_support'
  | 'reports';

export const RegionalWorkspace: React.FC<RegionalWorkspaceProps> = ({
  currentUser,
  allMines,
  onApprovePathway,
  onUpdateAnomaly,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<RegionalNavTab>('regional_overview');
  
  // Active regional subsidiary selection (defaults to user's assigned PSU or SECL)
  const defaultSubsidiary = currentUser.assignedRegion || 'SECL';
  const [selectedSubsidiary, setSelectedSubsidiary] = useState<string>(defaultSubsidiary);
  
  // Filters for regional overview / comparison
  const [mineTypeFilter, setMineTypeFilter] = useState<string>('all');
  const [targetStatusFilter, setTargetStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fleetViewMode, setFleetViewMode] = useState<'table' | 'map'>('table');
  
  // Selected mine for detail modal
  const [inspectMine, setInspectMine] = useState<MineRecord | null>(null);
  const [satelliteInspectionTab, setSatelliteInspectionTab] = useState<'card' | 'interactive'>('card');

  // Revision modal state
  const [revisionMineId, setRevisionMineId] = useState<string | null>(null);
  const [revisionNotes, setRevisionNotes] = useState<string>('');

  // Available PSU subsidiaries
  const subsidiaries = ['SECL', 'BCCL', 'MCL', 'CCL', 'NCL', 'WCL', 'ECL', 'SCCL'];

  // Filtered mines in the current regional portfolio
  const regionalMines = useMemo(() => {
    return allMines.filter(m => m.company === selectedSubsidiary);
  }, [allMines, selectedSubsidiary]);

  // Aggregated regional metrics
  const stats = useMemo(() => {
    const totalMines = regionalMines.length;
    const totalGrossEmissions = regionalMines.reduce((sum, m) => sum + m.emissions.totalGrossEmissions, 0);
    const totalProduction = regionalMines.reduce((sum, m) => sum + m.operational.coalExtractedTonnes, 0);
    const avgCarbonIntensity = totalProduction > 0 ? totalGrossEmissions / totalProduction : 0;
    const totalReductions = regionalMines.reduce((sum, m) => sum + m.emissions.emissionReductionsAchieved, 0);
    const avgReductionPct = totalMines > 0
      ? Math.round(regionalMines.reduce((sum, m) => sum + m.currentReductionPct, 0) / totalMines * 10) / 10
      : 0;

    const onTrackCount = regionalMines.filter(m => m.targetStatus === 'on_track' || m.targetStatus === 'ahead').length;
    const atRiskCount = regionalMines.filter(m => m.targetStatus === 'behind').length;
    const criticalCount = regionalMines.filter(m => m.targetStatus === 'critical').length;

    const pendingApprovalsCount = regionalMines.filter(m => m.pathwayStatus === 'pending_approval' || m.pathwayStatus === 'in_progress').length;
    const unresolvedAnomalies = regionalMines.reduce(
      (sum, m) => sum + m.anomalies.filter(a => a.status !== 'resolved').length,
      0
    );

    return {
      totalMines,
      totalGrossEmissions,
      totalProduction,
      avgCarbonIntensity,
      totalReductions,
      avgReductionPct,
      onTrackCount,
      atRiskCount,
      criticalCount,
      pendingApprovalsCount,
      unresolvedAnomalies,
    };
  }, [regionalMines]);

  // Filtered list for display
  const displayedMines = useMemo(() => {
    return regionalMines.filter(m => {
      if (mineTypeFilter !== 'all' && m.mineType !== mineTypeFilter) return false;
      if (targetStatusFilter !== 'all' && m.targetStatus !== targetStatusFilter) return false;
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return (
          m.name.toLowerCase().includes(query) ||
          m.code.toLowerCase().includes(query) ||
          m.district.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [regionalMines, mineTypeFilter, targetStatusFilter, searchQuery]);

  // Navigation Items - Strictly 6 regional tabs
  const navItems = [
    { id: 'regional_overview', label: '1. Regional Overview', icon: Building2, badge: undefined },
    { id: 'mine_comparison', label: '2. Mine Comparison', icon: BarChart3, badge: undefined },
    { id: 'validation_approvals', label: '3. Validation & Approvals', icon: FileCheck2, badge: stats.pendingApprovalsCount > 0 ? stats.pendingApprovalsCount : undefined },
    { id: 'anomaly_center', label: '4. Anomaly Center', icon: AlertTriangle, badge: stats.unresolvedAnomalies > 0 ? stats.unresolvedAnomalies : undefined },
    { id: 'interventions_support', label: '5. Interventions & Support', icon: Sparkles, badge: undefined },
    { id: 'reports', label: '6. Reports', icon: FileSpreadsheet, badge: undefined },
  ] as const;

  return (
    <div className="flex h-screen bg-[#F1F3F5] text-[#25282C] overflow-hidden font-sans">
      {/* ==============================================================
          LEFT: REGIONAL PSU NAVIGATION SIDEBAR (GRAPHITE)
          ============================================================== */}
      <aside className="w-64 bg-[#25282C] border-r border-[#343A40] flex flex-col justify-between shrink-0 select-none">
        <div>
          {/* Subsidiary & Regional Badge */}
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
                  Regional PSU Authority
                </span>
              </div>
            </div>

            {/* Subsidiary Selector */}
            <div className="mt-3">
              <label className="text-[10px] font-semibold text-[#8E97A2] uppercase tracking-wider block mb-1">
                Regional Subsidiary Fleet
              </label>
              <select
                value={selectedSubsidiary}
                onChange={e => setSelectedSubsidiary(e.target.value)}
                className="w-full bg-[#2D3137] border border-[#3E444B] rounded-md px-2.5 py-1.5 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-[#5B8C6A]"
              >
                {subsidiaries.map(sub => (
                  <option key={sub} value={sub}>
                    {sub} — {sub === 'SECL' ? 'South Eastern Coalfields' : sub === 'BCCL' ? 'Bharat Coking Coal' : sub === 'MCL' ? 'Mahanadi Coalfields' : sub === 'CCL' ? 'Central Coalfields' : sub === 'NCL' ? 'Northern Coalfields' : sub === 'WCL' ? 'Western Coalfields' : sub === 'ECL' ? 'Eastern Coalfields' : 'Singareni Collieries'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 6 Regional Navigation Links */}
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
                  <div className="flex items-center gap-1.5">
                    {item.badge !== undefined && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FDF6EA] text-[#D99A2B] border border-[#F6E1B8]">
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Officer Credentials & Role Switcher */}
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
                {selectedSubsidiary} Regional Carbon Management Fleet
              </h1>
              <span className="text-xs px-2 py-0.5 rounded font-semibold bg-[#EDF5F0] text-[#3F7D58] border border-[#CDE3D5]">
                {stats.totalMines} Active Collieries
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Regional environmental governance, pathway approvals & anomaly audits for Coal India subsidiary.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#64748B]">Fleet Reduction:</span>
            <span className="font-bold text-[#3F7D58] bg-[#EDF5F0] px-2.5 py-1 rounded border border-[#CDE3D5]">
              -{stats.avgReductionPct}% Achieved
            </span>
          </div>
        </header>

        {/* Tab Content Body */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ==========================================================
              TAB 1: REGIONAL OVERVIEW
              ========================================================== */}
          {activeTab === 'regional_overview' && (
            <div className="space-y-6">
              {/* Top 5 KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-lg border border-[#E2E5E9] shadow-xs">
                  <span className="text-xs font-semibold text-[#64748B] block">Total Regional Mines</span>
                  <div className="text-2xl font-bold text-[#25282C] mt-1">{stats.totalMines}</div>
                  <span className="text-[11px] text-[#64748B] mt-1 block">
                    Under {selectedSubsidiary} jurisdiction
                  </span>
                </div>

                <div className="bg-white p-4 rounded-lg border border-[#E2E5E9] shadow-xs">
                  <span className="text-xs font-semibold text-[#64748B] block">Total Regional Emissions</span>
                  <div className="text-2xl font-bold text-[#25282C] mt-1">
                    {(stats.totalGrossEmissions / 1000).toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                    <span className="text-xs font-normal text-[#64748B] ml-1">ktCO2e</span>
                  </div>
                  <span className="text-[11px] text-[#3F7D58] mt-1 block font-medium">
                    Gross monthly run-rate
                  </span>
                </div>

                <div className="bg-white p-4 rounded-lg border border-[#E2E5E9] shadow-xs">
                  <span className="text-xs font-semibold text-[#64748B] block">Avg. Carbon Intensity</span>
                  <div className="text-2xl font-bold text-[#25282C] mt-1">
                    {stats.avgCarbonIntensity.toFixed(4)}
                    <span className="text-xs font-normal text-[#64748B] ml-1">tCO2e/t</span>
                  </div>
                  <span className="text-[11px] text-[#64748B] mt-1 block">
                    Per tonne of clean coal
                  </span>
                </div>

                <div className="bg-white p-4 rounded-lg border border-[#E2E5E9] shadow-xs">
                  <span className="text-xs font-semibold text-[#64748B] block">Fleet Reduction Achieved</span>
                  <div className="text-2xl font-bold text-[#3F7D58] mt-1">
                    -{stats.avgReductionPct}%
                  </div>
                  <span className="text-[11px] text-[#64748B] mt-1 block">
                    Vs FY 2021 baseline
                  </span>
                </div>

                <div className="bg-white p-4 rounded-lg border border-[#E2E5E9] shadow-xs">
                  <span className="text-xs font-semibold text-[#64748B] block">2030 Target Cascade</span>
                  <div className="text-2xl font-bold text-[#397D8A] mt-1">
                    38.0%
                  </div>
                  <span className="text-[11px] text-[#64748B] mt-1 block">
                    Mandated PSU trajectory
                  </span>
                </div>
              </div>

              {/* Fleet Status Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-[#CDE3D5] shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#3F7D58]">
                      On Track Mines
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#5B8C6A]"></span>
                  </div>
                  <div className="text-3xl font-bold text-[#3F7D58] mt-2">
                    {stats.onTrackCount}
                    <span className="text-sm font-normal text-[#64748B] ml-1.5">
                      / {stats.totalMines} mines
                    </span>
                  </div>
                  <p className="text-xs text-[#343A40] mt-1">
                    Meeting or exceeding interim FY26 carbon reduction benchmarks.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-[#F6E1B8] shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#D99A2B]">
                      At Risk Mines
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D99A2B]"></span>
                  </div>
                  <div className="text-3xl font-bold text-[#D99A2B] mt-2">
                    {stats.atRiskCount}
                    <span className="text-sm font-normal text-[#64748B] ml-1.5">
                      / {stats.totalMines} mines
                    </span>
                  </div>
                  <p className="text-xs text-[#343A40] mt-1">
                    Intervention lag: 5% to 15% behind trajectory target.
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
                    {stats.criticalCount}
                    <span className="text-sm font-normal text-[#64748B] ml-1.5">
                      / {stats.totalMines} mines
                    </span>
                  </div>
                  <p className="text-xs text-[#343A40] mt-1">
                    Significant deviation or unresolved data anomalies detected.
                  </p>
                </div>
              </div>

              {/* Regional Mines Directory Table */}
              <div className="bg-white rounded-lg border border-[#E2E5E9] shadow-xs overflow-hidden">
                <div className="p-4 border-b border-[#E2E5E9] flex flex-wrap items-center justify-between gap-3 bg-[#F8F9FA]">
                  <div>
                    <h2 className="text-sm font-bold text-[#25282C]">
                      Regional Mine Fleet Roster ({displayedMines.length})
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Live statutory carbon reporting and target adherence for {selectedSubsidiary}.
                    </p>
                  </div>

                  {/* View Switcher & Filters */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center bg-white border border-[#E2E5E9] rounded-md p-0.5">
                      <button
                        onClick={() => setFleetViewMode('table')}
                        className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                          fleetViewMode === 'table'
                            ? 'bg-[#25282C] text-white shadow-xs'
                            : 'text-[#64748B] hover:text-[#25282C]'
                        }`}
                      >
                        Table View
                      </button>
                      <button
                        onClick={() => setFleetViewMode('map')}
                        className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                          fleetViewMode === 'map'
                            ? 'bg-[#25282C] text-white shadow-xs'
                            : 'text-[#64748B] hover:text-[#25282C]'
                        }`}
                      >
                        Regional GIS Map
                      </button>
                    </div>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search colliery..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-8 pr-3 py-1.5 text-xs border border-[#E2E5E9] rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#5B8C6A]"
                      />
                    </div>

                    <select
                      value={mineTypeFilter}
                      onChange={e => setMineTypeFilter(e.target.value)}
                      className="text-xs border border-[#E2E5E9] rounded-md px-2.5 py-1.5 bg-white font-medium text-[#25282C]"
                    >
                      <option value="all">All Mine Types</option>
                      <option value="opencast">Opencast</option>
                      <option value="underground">Underground</option>
                      <option value="mixed">Mixed</option>
                    </select>

                    <select
                      value={targetStatusFilter}
                      onChange={e => setTargetStatusFilter(e.target.value)}
                      className="text-xs border border-[#E2E5E9] rounded-md px-2.5 py-1.5 bg-white font-medium text-[#25282C]"
                    >
                      <option value="all">All Trajectory Status</option>
                      <option value="on_track">On Track</option>
                      <option value="behind">At Risk / Behind</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                {fleetViewMode === 'map' ? (
                  <div className="p-4 bg-[#F8F9FA]">
                    <IndiaMineMap
                      mines={displayedMines}
                      selectedMineId={inspectMine?.id || null}
                      onSelectMine={id => {
                        const m = displayedMines.find(mine => mine.id === id);
                        if (m) setInspectMine(m);
                      }}
                      onOpenFullProfile={id => {
                        const m = displayedMines.find(mine => mine.id === id);
                        if (m) setInspectMine(m);
                      }}
                      userRole="regional_officer"
                    />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F8F9FA] border-b border-[#E2E5E9] text-[#64748B] font-semibold text-[10px] uppercase">
                        <th className="py-3 px-4">Mine & Colliery Code</th>
                        <th className="py-3 px-4">Type & District</th>
                        <th className="py-3 px-4 text-right">Production (t)</th>
                        <th className="py-3 px-4 text-right">Emissions (tCO2e)</th>
                        <th className="py-3 px-4 text-right">Intensity (tCO2e/t)</th>
                        <th className="py-3 px-4 text-center">Pathway Status</th>
                        <th className="py-3 px-4 text-center">Target Status</th>
                        <th className="py-3 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E5E9]">
                      {displayedMines.map(m => (
                        <tr key={m.id} className="hover:bg-[#F8F9FA] transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-bold text-[#25282C] block">{m.name}</span>
                            <span className="text-[10px] text-[#64748B] font-mono">{m.code}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-[#25282C] capitalize block">{m.mineType}</span>
                            <span className="text-[11px] text-[#64748B]">{m.district}, {m.state}</span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-medium text-[#25282C]">
                            {m.operational.coalExtractedTonnes.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-[#25282C]">
                            {Math.round(m.emissions.totalGrossEmissions).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-[#25282C]">
                            {m.emissions.carbonIntensityTco2ePerTonne.toFixed(4)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold inline-block capitalize ${
                              m.pathwayStatus === 'approved'
                                ? 'bg-[#EDF5F0] text-[#3F7D58] border border-[#CDE3D5]'
                                : m.pathwayStatus === 'pending_approval'
                                ? 'bg-[#FDF6EA] text-[#D99A2B] border border-[#F6E1B8]'
                                : 'bg-[#F1F3F5] text-[#25282C] border border-[#E2E5E9]'
                            }`}>
                              {m.pathwayStatus.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold inline-block capitalize ${
                              m.targetStatus === 'on_track' || m.targetStatus === 'ahead'
                                ? 'bg-[#EDF5F0] text-[#3F7D58] border border-[#CDE3D5]'
                                : m.targetStatus === 'behind'
                                ? 'bg-[#FDF6EA] text-[#D99A2B] border border-[#F6E1B8]'
                                : 'bg-[#FBEAEA] text-[#C65353] border border-[#F4CDCD]'
                            }`}>
                              {m.targetStatus.replace('_', ' ')} (-{m.currentReductionPct}%)
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => setInspectMine(m)}
                              className="px-2.5 py-1 text-xs font-semibold text-[#5B8C6A] hover:text-[#3F7D58] bg-[#EDF5F0] hover:bg-[#E2EFE7] rounded border border-[#CDE3D5] transition-colors"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )}
              </div>
            </div>
          )}

          {/* ==========================================================
              TAB 2: MINE COMPARISON
              ========================================================== */}
          {activeTab === 'mine_comparison' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-lg border border-[#E2E5E9] shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-[#25282C]">
                      Regional Mine Carbon Benchmarking & Comparison
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Compare emission intensity, operational efficiency, and decarbonization achievements across {selectedSubsidiary} collieries.
                    </p>
                  </div>
                </div>

                {/* Best vs Highest Emitter Comparison Highlight */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {/* Cleanest / Best Performing */}
                  {(() => {
                    const sortedByIntensity = [...regionalMines].sort(
                      (a, b) => a.emissions.carbonIntensityTco2ePerTonne - b.emissions.carbonIntensityTco2ePerTonne
                    );
                    const best = sortedByIntensity[0];
                    if (!best) return null;
                    return (
                      <div className="p-4 rounded-lg border border-[#CDE3D5] bg-[#EDF5F0]/30">
                        <span className="text-[10px] font-bold text-[#3F7D58] uppercase tracking-wider block">
                          Lowest Carbon Intensity (Benchmark Colliery)
                        </span>
                        <div className="flex items-center justify-between mt-2">
                          <div>
                            <span className="text-base font-bold text-[#25282C] block">{best.name}</span>
                            <span className="text-xs text-[#64748B] capitalize">{best.mineType} · {best.district}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-mono font-bold text-[#3F7D58] block">
                              {best.emissions.carbonIntensityTco2ePerTonne.toFixed(4)}
                            </span>
                            <span className="text-[10px] text-[#64748B] font-medium">tCO2e / tonne</span>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-[#343A40] bg-white p-2.5 rounded border border-[#CDE3D5] flex items-center justify-between">
                          <span>Reduction Achieved: <strong>-{best.currentReductionPct}%</strong></span>
                          <span>Solar Adoption: <strong>{Math.round((best.operational.renewableEnergyKWh / (best.operational.gridElectricityKWh + 1)) * 100)}%</strong></span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Highest Carbon Intensity Emitter */}
                  {(() => {
                    const sortedByIntensity = [...regionalMines].sort(
                      (a, b) => b.emissions.carbonIntensityTco2ePerTonne - a.emissions.carbonIntensityTco2ePerTonne
                    );
                    const highest = sortedByIntensity[0];
                    if (!highest) return null;
                    return (
                      <div className="p-4 rounded-lg border border-[#F4CDCD] bg-[#FBEAEA]/30">
                        <span className="text-[10px] font-bold text-[#C65353] uppercase tracking-wider block">
                          Highest Carbon Intensity (Priority Intervention Colliery)
                        </span>
                        <div className="flex items-center justify-between mt-2">
                          <div>
                            <span className="text-base font-bold text-[#25282C] block">{highest.name}</span>
                            <span className="text-xs text-[#64748B] capitalize">{highest.mineType} · {highest.district}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-mono font-bold text-[#C65353] block">
                              {highest.emissions.carbonIntensityTco2ePerTonne.toFixed(4)}
                            </span>
                            <span className="text-[10px] text-[#64748B] font-medium">tCO2e / tonne</span>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-[#343A40] bg-white p-2.5 rounded border border-[#F4CDCD] flex items-center justify-between">
                          <span>Target Lag: <strong className="text-[#C65353]">Critical ({highest.currentReductionPct}% vs {highest.targetReductionPct}%)</strong></span>
                          <span>Primary Driver: <strong>{highest.mineType === 'underground' ? 'Ventilation Methane' : 'Heavy Diesel Hauling'}</strong></span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Ranked Comparison Bar Chart */}
                <div className="mt-6">
                  <h3 className="text-xs font-bold text-[#25282C] uppercase tracking-wider mb-3">
                    Carbon Intensity Ranking (tCO2e / tonne clean coal)
                  </h3>
                  <div className="space-y-3">
                    {[...regionalMines]
                      .sort((a, b) => a.emissions.carbonIntensityTco2ePerTonne - b.emissions.carbonIntensityTco2ePerTonne)
                      .map((m, idx) => {
                        const intensity = m.emissions.carbonIntensityTco2ePerTonne;
                        const maxIntensity = 0.05;
                        const barPct = Math.min(100, Math.round((intensity / maxIntensity) * 100));
                        return (
                          <div key={m.id} className="text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-[#25282C]">
                                {idx + 1}. {m.name} <span className="text-[#64748B] capitalize font-normal">({m.mineType})</span>
                              </span>
                              <div className="flex items-center gap-3">
                                <span className="font-mono font-bold text-[#25282C]">
                                  {intensity.toFixed(4)} tCO2e/t
                                </span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                  m.targetStatus === 'on_track' ? 'bg-[#EDF5F0] text-[#3F7D58] border border-[#CDE3D5]' : 'bg-[#FDF6EA] text-[#D99A2B] border border-[#F6E1B8]'
                                }`}>
                                  -{m.currentReductionPct}%
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-[#E2E5E9] rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  intensity < 0.02
                                    ? 'bg-[#5B8C6A]'
                                    : intensity < 0.035
                                    ? 'bg-[#D99A2B]'
                                    : 'bg-[#C65353]'
                                }`}
                                style={{ width: `${barPct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================================
              TAB 3: VALIDATION & APPROVALS
              ========================================================== */}
          {activeTab === 'validation_approvals' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-lg border border-[#E2E5E9] shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-[#25282C]">
                      Decarbonization Pathways Awaiting Statutory Approval
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Review proposed colliery mitigation roadmaps, capital allocation, and planned emissions trajectories.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-[#FDF6EA] text-[#D99A2B] border border-[#F6E1B8] text-xs font-semibold rounded">
                    {stats.pendingApprovalsCount} Action Required
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  {regionalMines.map(m => {
                    const isPending = m.pathwayStatus === 'pending_approval' || m.pathwayStatus === 'in_progress';
                    return (
                      <div
                        key={m.id}
                        className={`p-4 rounded-lg border transition-all ${
                          isPending
                            ? 'bg-[#FDF6EA]/20 border-[#F6E1B8]'
                            : m.pathwayStatus === 'approved'
                            ? 'bg-white border-[#E2E5E9]'
                            : 'bg-[#F8F9FA] border-[#E2E5E9]'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-[#25282C]">{m.name}</span>
                              <span className="text-xs font-mono text-[#64748B]">({m.code})</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                m.pathwayStatus === 'approved'
                                  ? 'bg-[#EDF5F0] text-[#3F7D58] border border-[#CDE3D5]'
                                  : m.pathwayStatus === 'pending_approval'
                                  ? 'bg-[#FDF6EA] text-[#D99A2B] border border-[#F6E1B8]'
                                  : 'bg-[#F1F3F5] text-[#25282C] border border-[#E2E5E9]'
                              }`}>
                                {m.pathwayStatus.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-[#64748B] mt-1">
                              <span>Type: <strong className="capitalize text-[#25282C]">{m.mineType}</strong></span>
                              <span>Target: <strong>-{m.targetReductionPct}% by {m.targetYear}</strong></span>
                              <span>Sustainability Budget: <strong>₹{m.sustainabilityBudgetCrores} Crores</strong></span>
                            </div>
                          </div>

                          {/* Approval / Rejection Actions */}
                          <div className="flex items-center gap-2">
                            {m.pathwayStatus === 'approved' ? (
                              <div className="flex items-center gap-1.5 text-xs text-[#3F7D58] font-semibold bg-[#EDF5F0] px-3 py-1.5 rounded border border-[#CDE3D5]">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Approved on {m.pathwayApprovedDate || '2025-11-14'}</span>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setRevisionMineId(m.id);
                                    setRevisionNotes('');
                                  }}
                                  className="px-3 py-1.5 text-xs font-semibold text-[#25282C] bg-white hover:bg-[#F1F3F5] rounded border border-[#E2E5E9] transition-colors"
                                >
                                  Request Revision
                                </button>
                                <button
                                  onClick={() => onApprovePathway(m.id, true)}
                                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#5B8C6A] hover:bg-[#3F7D58] rounded shadow-xs transition-colors flex items-center gap-1.5"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve Pathway</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Selected Interventions Summary */}
                        <div className="mt-3 pt-3 border-t border-[#E2E5E9] text-xs">
                          <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
                            Committed Decarbonization Interventions ({m.selectedInterventionIds.length})
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {m.selectedInterventionIds.map(id => (
                              <span
                                key={id}
                                className="px-2 py-0.5 rounded bg-[#F1F3F5] text-[#25282C] border border-[#E2E5E9] font-mono text-[11px]"
                              >
                                {id.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================================
              TAB 4: ANOMALY CENTER
              ========================================================== */}
          {activeTab === 'anomaly_center' && (
            <div className="space-y-6">
              <AnomalyAuditCenter
                mines={regionalMines}
                onUpdateMineAnomaly={onUpdateAnomaly}
                onOpenMineProfile={id => {
                  const m = regionalMines.find(mine => mine.id === id);
                  if (m) setInspectMine(m);
                }}
              />
            </div>
          )}

          {/* ==========================================================
              TAB 5: INTERVENTIONS & SUPPORT
              ========================================================== */}
          {activeTab === 'interventions_support' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-lg border border-[#E2E5E9] shadow-xs">
                <h2 className="text-base font-bold text-[#25282C]">
                  Regional Fleet Interventions & Capital Assistance
                </h2>
                <p className="text-xs text-[#64748B]">
                  Categorized technical and capital allocation support for {selectedSubsidiary} collieries.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {/* Solar Adoption Support */}
                  <div className="p-4 rounded-lg border border-[#E2E5E9] bg-[#F8F9FA]">
                    <div className="flex items-center gap-2 text-[#D99A2B] font-bold text-sm">
                      <Sun className="w-4 h-4 text-[#D99A2B]" />
                      <span>Solar PV on Reclaimed Dumps</span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-2">
                      Collieries with large backfilled overburden dumps suitable for 20MW+ ground-mount solar plants.
                    </p>
                    <div className="mt-3 space-y-2">
                      {regionalMines
                        .filter(m => m.mineType === 'opencast')
                        .map(m => (
                          <div key={m.id} className="p-2.5 bg-white rounded border border-[#E2E5E9] text-xs">
                            <span className="font-bold text-[#25282C] block">{m.name}</span>
                            <span className="text-[11px] text-[#64748B]">
                              Reclaimed: {m.reclaimedLandHa} Ha · Solar Potential: {Math.round(m.reclaimedLandHa * 0.3)} MW
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* VAM / Methane Drainage Support */}
                  <div className="p-4 rounded-lg border border-[#E2E5E9] bg-[#F8F9FA]">
                    <div className="flex items-center gap-2 text-[#397D8A] font-bold text-sm">
                      <Flame className="w-4 h-4 text-[#397D8A]" />
                      <span>Methane Drainage & VAM Capture</span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-2">
                      High gassiness Underground (Degree II & III) collieries requiring commercial CBM drainage or RTO oxidizers.
                    </p>
                    <div className="mt-3 space-y-2">
                      {regionalMines
                        .filter(m => m.mineType === 'underground' || m.mineType === 'mixed')
                        .map(m => (
                          <div key={m.id} className="p-2.5 bg-white rounded border border-[#E2E5E9] text-xs">
                            <span className="font-bold text-[#25282C] block">{m.name}</span>
                            <span className="text-[11px] text-[#64748B]">
                              Gassiness: Degree {m.gassinessDegree || 2} · Depth: {m.depthMeters || 320}m
                            </span>
                          </div>
                        ))}
                      {regionalMines.filter(m => m.mineType === 'underground' || m.mineType === 'mixed').length === 0 && (
                        <span className="text-xs text-[#64748B] italic">No underground collieries in this subsidiary fleet.</span>
                      )}
                    </div>
                  </div>

                  {/* Fleet Electrification Support */}
                  <div className="p-4 rounded-lg border border-[#E2E5E9] bg-[#F8F9FA]">
                    <div className="flex items-center gap-2 text-[#5B8C6A] font-bold text-sm">
                      <Truck className="w-4 h-4 text-[#5B8C6A]" />
                      <span>HEMM Fleet Electrification & FMC</span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-2">
                      High-diesel consumption collieries prioritized for First Mile Connectivity (FMC) pipe conveyors and electric dumpers.
                    </p>
                    <div className="mt-3 space-y-2">
                      {regionalMines
                        .filter(m => m.operational.dieselMachineryLiters > 5000000)
                        .map(m => (
                          <div key={m.id} className="p-2.5 bg-white rounded border border-[#E2E5E9] text-xs">
                            <span className="font-bold text-[#25282C] block">{m.name}</span>
                            <span className="text-[11px] text-[#64748B]">
                              Diesel: {(m.operational.dieselMachineryLiters / 1000000).toFixed(1)}M Liters/mo
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================================
              TAB 6: REPORTS
              ========================================================== */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border border-[#E2E5E9] shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E5E9] pb-4">
                  <div>
                    <span className="text-xs font-bold text-[#5B8C6A] uppercase tracking-wider block">
                      Official PSU Report
                    </span>
                    <h2 className="text-lg font-bold text-[#25282C] mt-0.5">
                      {selectedSubsidiary} Regional Fleet Decarbonization Audit Report
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Compiled for CIL Board of Directors and Ministry of Coal oversight.
                    </p>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-[#5B8C6A] hover:bg-[#3F7D58] text-white text-xs font-semibold rounded shadow-xs flex items-center gap-2 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Regional Report</span>
                  </button>
                </div>

                {/* Printable Regional Report Preview */}
                <div className="mt-6 p-6 border border-[#E2E5E9] rounded-lg bg-[#F8F9FA] text-xs space-y-6 font-mono">
                  <div className="text-center border-b border-[#E2E5E9] pb-4">
                    <span className="text-sm font-bold text-[#25282C] block font-sans">
                      COAL INDIA LIMITED · {selectedSubsidiary.toUpperCase()} REGIONAL HEADQUARTERS
                    </span>
                    <span className="text-xs text-[#64748B] block mt-1">
                      ENVIRONMENT & SUSTAINABILITY GOVERNANCE COMMITTEE
                    </span>
                    <span className="text-[11px] text-[#64748B] block mt-0.5">
                      Statutory Carbon Neutrality Compliance Statement · FY 2025-26
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded border border-[#E2E5E9] font-sans">
                    <div>
                      <span className="text-[10px] text-[#64748B] uppercase block">Active Collieries</span>
                      <span className="text-base font-bold text-[#25282C]">{stats.totalMines}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] uppercase block">Fleet Production</span>
                      <span className="text-base font-bold text-[#25282C]">{(stats.totalProduction / 1000000).toFixed(2)} Mt</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] uppercase block">Total Emissions</span>
                      <span className="text-base font-bold text-[#25282C]">{(stats.totalGrossEmissions / 1000).toFixed(1)} ktCO2e</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] uppercase block">Avg Carbon Intensity</span>
                      <span className="text-base font-bold text-[#25282C]">{stats.avgCarbonIntensity.toFixed(4)} tCO2e/t</span>
                    </div>
                  </div>

                  <div className="font-sans">
                    <h3 className="font-bold text-[#25282C] text-xs mb-2">Mine-by-Mine Compliance Summary:</h3>
                    <div className="space-y-1">
                      {regionalMines.map(m => (
                        <div key={m.id} className="flex items-center justify-between p-2 bg-white rounded border border-[#E2E5E9] text-xs">
                          <span className="font-medium text-[#25282C]">{m.name} ({m.code})</span>
                          <span className="font-mono text-[#64748B]">Intensity: {m.emissions.carbonIntensityTco2ePerTonne.toFixed(4)} | Reduction: -{m.currentReductionPct}% | Status: {m.pathwayStatus.toUpperCase()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Inspect Mine Modal */}
      {inspectMine && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`bg-white rounded-lg shadow-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-[#E2E5E9] transition-all ${
            satelliteInspectionTab === 'interactive' ? 'max-w-4xl' : 'max-w-2xl'
          }`}>
            <div className="flex items-center justify-between border-b border-[#E2E5E9] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#25282C]">{inspectMine.name}</h3>
                <span className="text-xs text-[#64748B] font-mono">{inspectMine.code} · {inspectMine.company} · {inspectMine.state}</span>
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
                    setInspectMine(null);
                    setSatelliteInspectionTab('card');
                  }}
                  className="text-[#64748B] hover:text-[#25282C] p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Satellite Earth Observation Inspection (Requirement 9 & Request 3) */}
            {satelliteInspectionTab === 'interactive' ? (
              <SatelliteHotspotAnalysis mine={inspectMine} />
            ) : (
              <>
                <MineSatelliteView mine={inspectMine} variant="card" />

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-[#F8F9FA] rounded border border-[#E2E5E9]">
                    <span className="text-[#64748B] block">Monthly Coal Extraction:</span>
                    <span className="text-sm font-bold font-mono text-[#25282C]">{inspectMine.operational.coalExtractedTonnes.toLocaleString('en-IN')} tonnes</span>
                  </div>
                  <div className="p-3 bg-[#F8F9FA] rounded border border-[#E2E5E9]">
                    <span className="text-[#64748B] block">Total Gross Emissions:</span>
                    <span className="text-sm font-bold font-mono text-[#25282C]">{Math.round(inspectMine.emissions.totalGrossEmissions).toLocaleString('en-IN')} tCO2e</span>
                  </div>
                  <div className="p-3 bg-[#F8F9FA] rounded border border-[#E2E5E9]">
                    <span className="text-[#64748B] block">Carbon Intensity:</span>
                    <span className="text-sm font-bold font-mono text-[#25282C]">{inspectMine.emissions.carbonIntensityTco2ePerTonne.toFixed(4)} tCO2e/t</span>
                  </div>
                  <div className="p-3 bg-[#F8F9FA] rounded border border-[#E2E5E9]">
                    <span className="text-[#64748B] block">Decarbonization Pathway:</span>
                    <span className="text-sm font-bold capitalize text-[#3F7D58]">{inspectMine.pathwayStatus.replace('_', ' ')}</span>
                  </div>
                </div>
              </>
            )}

            <div className="border-t border-[#E2E5E9] pt-3 flex justify-end gap-2">
              <button
                onClick={() => {
                  setInspectMine(null);
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

      {/* Revision Request Modal */}
      {revisionMineId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4 border border-[#E2E5E9]">
            <h3 className="text-sm font-bold text-[#25282C]">Request Pathway Revision</h3>
            <p className="text-xs text-[#64748B]">
              Provide feedback to the Mine Manager explaining what adjustments are required in their decarbonization roadmap before statutory approval.
            </p>
            <textarea
              rows={4}
              placeholder="e.g., Increase solar PV capacity target; provide additional budget allocation for VAM capture..."
              value={revisionNotes}
              onChange={e => setRevisionNotes(e.target.value)}
              className="w-full text-xs p-3 border border-[#E2E5E9] rounded focus:outline-none focus:ring-1 focus:ring-[#5B8C6A]"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRevisionMineId(null)}
                className="px-3 py-1.5 text-xs text-[#64748B] hover:bg-[#F1F3F5] rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onApprovePathway(revisionMineId, false);
                  setRevisionMineId(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#D99A2B] hover:bg-[#B78022] rounded shadow-xs"
              >
                Submit Revision Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
