import React, { useState, useMemo } from 'react';
import { MineRecord, NationalTargets } from '../types';
import { AnomalyAuditCenter } from './AnomalyAuditCenter';
import { TargetCascadeManager } from './TargetCascadeManager';
import { BenchmarkingView } from './BenchmarkingView';
import { 
  Building2, 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Scale, 
  FileCheck, 
  ShieldAlert, 
  GitFork,
  ArrowRight
} from 'lucide-react';

interface RegionalOfficerDashboardProps {
  mines: MineRecord[];
  assignedRegion: string;
  nationalTargets: NationalTargets;
  onSelectMine: (mineId: string) => void;
  onApprovePathway: (mineId: string, approved: boolean) => void;
  onUpdateNationalTargets: (targets: NationalTargets) => void;
  onUpdateMineAnomaly: (mineId: string, anomalyId: string, status: any, notes?: string) => void;
}

export const RegionalOfficerDashboard: React.FC<RegionalOfficerDashboardProps> = ({
  mines,
  assignedRegion,
  nationalTargets,
  onSelectMine,
  onApprovePathway,
  onUpdateNationalTargets,
  onUpdateMineAnomaly,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'comparison' | 'approvals' | 'anomalies' | 'benchmarks'>('overview');

  // Filter mines belonging to this PSU / region (or all if viewing all)
  const regionalMines = useMemo(() => {
    return mines.filter(m => assignedRegion === 'ALL' || m.company === assignedRegion);
  }, [mines, assignedRegion]);

  // Aggregated KPIs
  const totalRegionalEmissions = useMemo(() => {
    return regionalMines.reduce((acc, m) => acc + m.emissions.totalGrossEmissions, 0);
  }, [regionalMines]);

  const totalRegionalCoal = useMemo(() => {
    return regionalMines.reduce((acc, m) => acc + m.operational.coalExtractedTonnes, 0);
  }, [regionalMines]);

  const avgRegionalIntensity = totalRegionalCoal > 0 ? totalRegionalEmissions / totalRegionalCoal : 0;

  // Best & Worst performing mines
  const sortedByIntensity = useMemo(() => {
    return [...regionalMines].sort((a, b) => a.emissions.carbonIntensityTco2ePerTonne - b.emissions.carbonIntensityTco2ePerTonne);
  }, [regionalMines]);

  const bestMines = sortedByIntensity.slice(0, 2);
  const worstMines = sortedByIntensity.slice(-2).reverse();
  const minesBehindTarget = regionalMines.filter(m => m.targetStatus === 'behind' || m.targetStatus === 'critical');
  const pendingApprovals = regionalMines.filter(m => m.pathwayStatus === 'pending_approval' || m.pathwayStatus === 'draft');

  // Mine Comparison State
  const [compareMineAId, setCompareMineAId] = useState<string>(regionalMines[0]?.id || mines[0]?.id);
  const [compareMineBId, setCompareMineBId] = useState<string>(regionalMines[1]?.id || mines[1]?.id);

  const mineA = mines.find(m => m.id === compareMineAId) || mines[0];
  const mineB = mines.find(m => m.id === compareMineBId) || mines[1];

  return (
    <div className="space-y-6">
      {/* Regional Office Masthead */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase font-mono">
              {assignedRegion} REGIONAL SUSTAINABILITY DIRECTORATE
            </span>
            <span className="text-xs text-slate-500">
              Coal India Subsidiary Regional Office
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Regional Colliery Decarbonization & Compliance Command
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Overseeing {regionalMines.length} operating collieries across the regional coalfield command area
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Regional 2030 Target:</span>
          <span className="px-2.5 py-1 bg-emerald-100 text-[#166534] font-bold rounded font-tabular">
            -{nationalTargets.regionalTargets[assignedRegion] || 35}% Reduction
          </span>
        </div>
      </div>

      {/* Regional Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
            COLLIERIES UNDER REGION
          </span>
          <span className="text-2xl font-bold text-slate-900 font-tabular block">
            {regionalMines.length}
          </span>
          <span className="text-[11px] text-slate-400">
            Active reporting units
          </span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
            REGIONAL GROSS CO2e
          </span>
          <span className="text-2xl font-bold text-slate-900 font-tabular block">
            {(totalRegionalEmissions / 1000).toFixed(1)}k
          </span>
          <span className="text-[11px] text-slate-400">
            tCO2e gross footprint / year
          </span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
            AVERAGE REGIONAL INTENSITY
          </span>
          <span className="text-2xl font-bold text-[#166534] font-tabular block">
            {avgRegionalIntensity.toFixed(4)}
          </span>
          <span className="text-[11px] text-slate-400">
            tCO2e / tonne coal mined
          </span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
            COLLIERIES BEHIND TARGET
          </span>
          <span className={`text-2xl font-bold font-tabular block ${minesBehindTarget.length > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
            {minesBehindTarget.length} of {regionalMines.length}
          </span>
          <span className="text-[11px] text-slate-400">
            Requires intervention
          </span>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeSubTab === 'overview'
              ? 'border-[#166534] text-[#166534]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Regional Fleet Overview
        </button>
        <button
          onClick={() => setActiveSubTab('comparison')}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeSubTab === 'comparison'
              ? 'border-[#166534] text-[#166534]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Compare Similar Mines
        </button>
        <button
          onClick={() => setActiveSubTab('approvals')}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeSubTab === 'approvals'
              ? 'border-[#166534] text-[#166534]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Pathway Approvals ({pendingApprovals.length})
        </button>
        <button
          onClick={() => setActiveSubTab('anomalies')}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeSubTab === 'anomalies'
              ? 'border-[#166534] text-[#166534]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Anomalies & Audit Mandates
        </button>
        <button
          onClick={() => setActiveSubTab('benchmarks')}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeSubTab === 'benchmarks'
              ? 'border-[#166534] text-[#166534]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Peer Benchmarking & Standings
        </button>
      </div>

      {/* TAB 1: FLEET OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Best vs Worst Performing Mines Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Decarbonization Performers */}
            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-[#166534]" /> Best Performing Collieries (Lowest Intensity)
              </span>
              <div className="space-y-2 pt-1">
                {bestMines.map(m => (
                  <div
                    key={m.id}
                    onClick={() => onSelectMine(m.id)}
                    className="p-2.5 bg-white border border-emerald-200 rounded hover:border-[#166534] cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="text-slate-900 block">{m.name}</strong>
                      <span className="text-[11px] text-slate-500 font-mono font-tabular">
                        {m.emissions.carbonIntensityTco2ePerTonne.toFixed(4)} t/t coal · -{m.currentReductionPct}% cut
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      AHEAD
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Collieries Requiring Immediate Authority Attention */}
            <div className="p-4 bg-red-50/50 border border-red-200 rounded-lg space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" /> Collieries Requiring Authority Intervention
              </span>
              <div className="space-y-2 pt-1">
                {worstMines.map(m => (
                  <div
                    key={m.id}
                    onClick={() => onSelectMine(m.id)}
                    className="p-2.5 bg-white border border-red-200 rounded hover:border-red-400 cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="text-slate-900 block">{m.name}</strong>
                      <span className="text-[11px] text-slate-500 font-mono font-tabular">
                        {m.emissions.carbonIntensityTco2ePerTonne.toFixed(4)} t/t coal · {m.anomalies.length} active anomalies
                      </span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      m.targetStatus === 'critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {m.targetStatus.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Complete Fleet Roster Table */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                All Operating Mines Under {assignedRegion} Jurisdiction
              </h4>
              <span className="text-xs text-slate-500">
                Click any row to open mine workspace
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 uppercase font-bold">
                <tr>
                  <th className="p-3">Mine / Colliery</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 text-right">Production (Tonnes)</th>
                  <th className="p-3 text-right">Gross CO2e</th>
                  <th className="p-3 text-right">Intensity (t/t)</th>
                  <th className="p-3 text-right">Progress</th>
                  <th className="p-3">Pathway Status</th>
                  <th className="p-3 text-center">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {regionalMines.map(m => (
                  <tr
                    key={m.id}
                    onClick={() => onSelectMine(m.id)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-semibold text-slate-900">
                      <div>{m.name}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{m.code} · {m.district}</span>
                    </td>
                    <td className="p-3 text-slate-600 uppercase font-mono text-[11px]">
                      {m.mineType}
                    </td>
                    <td className="p-3 text-right font-tabular text-slate-700">
                      {m.operational.coalExtractedTonnes.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-tabular text-slate-900 font-semibold">
                      {Math.round(m.emissions.totalGrossEmissions).toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-[#166534] font-tabular">
                      {m.emissions.carbonIntensityTco2ePerTonne.toFixed(4)}
                    </td>
                    <td className="p-3 text-right font-tabular font-semibold text-emerald-700">
                      -{m.currentReductionPct}%
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        m.pathwayStatus === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : m.pathwayStatus === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {m.pathwayStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        m.targetStatus === 'critical'
                          ? 'bg-red-100 text-red-800'
                          : m.targetStatus === 'behind'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {m.targetStatus.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: COMPARE MINES TOOL */}
      {activeSubTab === 'comparison' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#166534]" />
                <h3 className="text-base font-bold text-slate-900">
                  Side-by-Side Colliery Comparison
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Benchmark production scale, energy intensity, specific fuel consumption, and progress across similar collieries
              </p>
            </div>
          </div>

          {/* Selectors for Mine A and Mine B */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-2">
              <label className="font-bold text-slate-800 block">Select Colliery A:</label>
              <select
                value={compareMineAId}
                onChange={e => setCompareMineAId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-900"
              >
                {mines.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.mineType.toUpperCase()} · {m.company})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-slate-800 block">Select Colliery B:</label>
              <select
                value={compareMineBId}
                onChange={e => setCompareMineBId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-900"
              >
                {mines.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.mineType.toUpperCase()} · {m.company})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparative Metrics Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 uppercase font-bold">
                <tr>
                  <th className="p-3 w-1/3">Engineering & Carbon Parameter</th>
                  <th className="p-3 w-1/3 font-bold text-slate-900">{mineA.name}</th>
                  <th className="p-3 w-1/3 font-bold text-slate-900">{mineB.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3 font-medium text-slate-600">Mining Technology & Type</td>
                  <td className="p-3 uppercase font-semibold">{mineA.mineType}</td>
                  <td className="p-3 uppercase font-semibold">{mineB.mineType}</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-600">Annual Production Capacity</td>
                  <td className="p-3 font-tabular font-bold">{mineA.annualCapacityMt} Mtpa</td>
                  <td className="p-3 font-tabular font-bold">{mineB.annualCapacityMt} Mtpa</td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="p-3 font-semibold text-slate-800">Carbon Intensity (tCO2e / t coal)</td>
                  <td className="p-3 font-mono font-bold text-[#166534] font-tabular">
                    {mineA.emissions.carbonIntensityTco2ePerTonne.toFixed(4)}
                  </td>
                  <td className="p-3 font-mono font-bold text-[#166534] font-tabular">
                    {mineB.emissions.carbonIntensityTco2ePerTonne.toFixed(4)}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-600">Annual Gross Emissions</td>
                  <td className="p-3 font-tabular font-bold">{Math.round(mineA.emissions.totalGrossEmissions).toLocaleString()} tCO2e</td>
                  <td className="p-3 font-tabular font-bold">{Math.round(mineB.emissions.totalGrossEmissions).toLocaleString()} tCO2e</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-600">Scope 1 Direct Share</td>
                  <td className="p-3 font-tabular">
                    {Math.round((mineA.emissions.scope1.total / mineA.emissions.totalGrossEmissions) * 100)}%
                  </td>
                  <td className="p-3 font-tabular">
                    {Math.round((mineB.emissions.scope1.total / mineB.emissions.totalGrossEmissions) * 100)}%
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-600">Decarbonization Progress Achieved</td>
                  <td className="p-3 font-tabular font-bold text-emerald-700">-{mineA.currentReductionPct}%</td>
                  <td className="p-3 font-tabular font-bold text-emerald-700">-{mineB.currentReductionPct}%</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-600">Biological Afforestation / Removals</td>
                  <td className="p-3 font-tabular">{mineA.afforestedLandHa} ha (-{Math.round(mineA.emissions.carbonRemovalsSequestration)} t/yr)</td>
                  <td className="p-3 font-tabular">{mineB.afforestedLandHa} ha (-{Math.round(mineB.emissions.carbonRemovalsSequestration)} t/yr)</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-600">Satellite Verification Status</td>
                  <td className="p-3 font-semibold uppercase">{mineA.satelliteData.status}</td>
                  <td className="p-3 font-semibold uppercase">{mineB.satelliteData.status}</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-600">Active Operational Anomalies</td>
                  <td className="p-3 font-bold">{mineA.anomalies.length} Flagged</td>
                  <td className="p-3 font-bold">{mineB.anomalies.length} Flagged</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PATHWAY APPROVALS & TARGET CASCADE */}
      {activeSubTab === 'approvals' && (
        <TargetCascadeManager
          mines={regionalMines}
          nationalTargets={nationalTargets}
          currentRole="regional_officer"
          onUpdateNationalTarget={onUpdateNationalTargets}
          onApproveMinePathway={onApprovePathway}
          onOpenMineProfile={onSelectMine}
        />
      )}

      {/* TAB 4: ANOMALIES & AUDIT MANDATES */}
      {activeSubTab === 'anomalies' && (
        <AnomalyAuditCenter
          mines={regionalMines}
          onUpdateMineAnomaly={onUpdateMineAnomaly}
          onOpenMineProfile={onSelectMine}
        />
      )}

      {/* TAB 5: BENCHMARKING */}
      {activeSubTab === 'benchmarks' && (
        <BenchmarkingView
          mines={regionalMines}
          onSelectMine={onSelectMine}
        />
      )}
    </div>
  );
};
