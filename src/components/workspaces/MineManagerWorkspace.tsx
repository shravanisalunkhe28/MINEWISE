import React, { useState, useMemo } from 'react';
import { MineRecord, DecarbonizationIntervention } from '../../types';
import { recommendationEngine } from '../../services/recommendationEngine';
import { DataEntryForm } from '../DataEntryForm';
import { WhatIfSimulator } from '../WhatIfSimulator';
import { CostImpactMatrix } from '../CostImpactMatrix';
import { CarbonNeutralityRoadmap } from '../CarbonNeutralityRoadmap';
import { SatelliteVerificationCard } from '../SatelliteVerificationCard';
import { SatelliteHotspotAnalysis } from '../SatelliteHotspotAnalysis';
import { CollieryProgressReport } from '../CollieryProgressReport';
import { CarbonRemovalSection } from '../CarbonRemovalSection';
import { ReportModal } from '../ReportModal';
import { UserAccount } from '../../data/accountsData';
import { DonutChart, TrendLineChart, HorizontalBarChart } from '../charts/VisualCharts';
import { ASSET_IMAGES } from '../../assets/images';
import { MineSatelliteView } from '../MineSatelliteView';
import {
  LayoutDashboard,
  FileEdit,
  Activity,
  Flame,
  Lightbulb,
  Cpu,
  Milestone,
  TrendingUp,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  Zap,
  Truck,
  ArrowRight,
  LogOut,
  Sparkles,
  Info,
  Calendar,
  X,
  ExternalLink,
  ShieldCheck,
  Building2,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';

interface MineManagerWorkspaceProps {
  mine: MineRecord;
  currentUser: UserAccount;
  onDataSubmitted: (updatedMine: MineRecord) => void;
  onToggleIntervention: (interventionId: string) => void;
  onLogout: () => void;
}

type MineManagerNavTab =
  | 'my_mine'
  | 'data_entry'
  | 'carbon_footprint'
  | 'emission_hotspots'
  | 'recommendations'
  | 'what_if_simulator'
  | 'my_roadmap'
  | 'progress'
  | 'reports';

function getInterventionImage(id: string, category: string): string {
  if (category === 'solar') return ASSET_IMAGES.industrialSolar;
  if (category === 'electrification' || category === 'conveyor') return ASSET_IMAGES.electricHaulTruck;
  if (category === 'methane') return ASSET_IMAGES.methaneFacility;
  if (category === 'reclamation') return ASSET_IMAGES.satelliteReclaimed;
  if (category === 'water') return ASSET_IMAGES.waterTreatment;
  return ASSET_IMAGES.industrialSolar;
}

function getRecommendationRationale(rec: DecarbonizationIntervention, mine: MineRecord): string {
  const em = mine.emissions;
  const total = em.totalGrossEmissions || 1;
  const dieselPct = Math.round(((em.scope1.dieselMachinery + em.scope1.dieselGenerators) / total) * 100);
  const methanePct = Math.round((em.scope1.fugitiveMethane / total) * 100);
  const electricityPct = Math.round((em.scope2.gridElectricity / total) * 100);

  if (rec.category === 'electrification' || rec.category === 'conveyor') {
    return `Diesel accounts for ${dieselPct}% of ${mine.name}'s reported emissions. Transitioning haulage machinery directly targets your highest operational emissions driver.`;
  }
  if (rec.category === 'solar') {
    return `Purchased grid electricity represents ${electricityPct}% of colliery emissions. Deploying captive solar on stabilized overburden benches cuts peak commercial tariffs and Scope 2 liabilities.`;
  }
  if (rec.category === 'methane') {
    return `Fugitive methane represents ${methanePct}% of colliery carbon output. Pre-drainage extraction with VAM oxidation generates statutory carbon credits and satisfies DGMS gas safety norms.`;
  }
  if (rec.category === 'reclamation') {
    return `${mine.disturbedLandHa} ha of active overburden is available for biological sequestration, enhancing satellite NDVI score and restoring local bio-canopy.`;
  }
  if (rec.category === 'water') {
    return `Dewatering pumps draw significant continuous grid power. Installing solar-powered variable frequency drives reduces auxiliary electricity draw by ~25%.`;
  }
  return `Targeted efficiency improvements calibrate ${mine.name}'s specific energy consumption to achieve national 2030 decarbonization targets.`;
}

export const MineManagerWorkspace: React.FC<MineManagerWorkspaceProps> = ({
  mine,
  currentUser,
  onDataSubmitted,
  onToggleIntervention,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<MineManagerNavTab>('my_mine');
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [selectedRecModal, setSelectedRecModal] = useState<DecarbonizationIntervention | null>(null);

  const em = mine.emissions;
  const isUG = mine.mineType === 'underground' || mine.mineType === 'mixed';

  // Dynamic recommendations for this mine
  const recommendations = useMemo(() => recommendationEngine.getPersonalizedRecommendations(mine), [mine]);
  const top3Recommendations = useMemo(() => recommendations.slice(0, 3), [recommendations]);

  // Major Emission Sources for Donut Chart
  const dieselTotal = em.scope1.dieselMachinery + em.scope1.dieselGenerators;
  const electricityTotal = em.scope2.gridElectricity;
  const methaneTotal = em.scope1.fugitiveMethane;
  const transportTotal = em.scope3.coalTransport;
  const explosivesTotal = em.scope1.explosives;

  const emissionSourceDonut = useMemo(() => [
    { label: 'Diesel Fuel', value: Math.round(dieselTotal), color: '#D99A2B', unit: 't' },
    { label: 'Grid Electricity', value: Math.round(electricityTotal), color: '#397D8A', unit: 't' },
    { label: 'Seam Methane', value: Math.round(methaneTotal), color: '#C65353', unit: 't' },
    { label: 'Coal Transport', value: Math.round(transportTotal), color: '#64748B', unit: 't' },
    { label: 'Blasting & Other', value: Math.round(explosivesTotal), color: '#5B8C6A', unit: 't' },
  ], [dieselTotal, electricityTotal, methaneTotal, transportTotal, explosivesTotal]);

  // Scope 1, 2, 3 Donut
  const scopeDonut = useMemo(() => [
    { label: 'Scope 1: Direct Operations', value: Math.round(em.scope1.total), color: '#C65353', unit: 'tCO2e' },
    { label: 'Scope 2: Purchased Electricity', value: Math.round(em.scope2.total), color: '#397D8A', unit: 'tCO2e' },
    { label: 'Scope 3: Freight Logistics', value: Math.round(em.scope3.total), color: '#64748B', unit: 'tCO2e' },
  ], [em]);

  // Emission sources horizontal bar items
  const emissionSourcesBar = useMemo(() => [
    { label: 'Heavy Machinery & DG Diesel', value: Math.round(dieselTotal), color: '#D99A2B', sublabel: `${mine.operational.dieselMachineryLiters.toLocaleString()} L`, unit: 'tCO2e' },
    { label: 'Purchased Grid Electricity', value: Math.round(electricityTotal), color: '#397D8A', sublabel: `${mine.operational.gridElectricityKWh.toLocaleString()} kWh @ 0.716 kg/kWh`, unit: 'tCO2e' },
    { label: 'Fugitive Seam Methane (CH4)', value: Math.round(methaneTotal), color: '#C65353', sublabel: isUG ? 'Underground ventilation seam gas' : 'Surface opencast fugitive', unit: 'tCO2e' },
    { label: 'Coal Freight Logistics', value: Math.round(transportTotal), color: '#64748B', sublabel: `${mine.operational.transportDistanceKm} km by ${mine.operational.transportMode}`, unit: 'tCO2e' },
    { label: 'Blasting Explosives & Auxiliary', value: Math.round(explosivesTotal), color: '#5B8C6A', sublabel: `${mine.operational.explosivesKg.toLocaleString()} kg ANFO`, unit: 'tCO2e' },
  ], [dieselTotal, electricityTotal, methaneTotal, transportTotal, explosivesTotal, mine, isUG]);

  // Dominant hotspot data
  let biggestSourceTitle = 'Diesel Fuel Combustion';
  let biggestSourcePct = Math.round((dieselTotal / (em.totalGrossEmissions || 1)) * 100);
  let biggestSourceReduction = Math.round(dieselTotal * 0.42);

  if (methaneTotal > dieselTotal && methaneTotal > electricityTotal) {
    biggestSourceTitle = 'Fugitive Seam Methane (CH4)';
    biggestSourcePct = Math.round((methaneTotal / (em.totalGrossEmissions || 1)) * 100);
    biggestSourceReduction = Math.round(methaneTotal * 0.55);
  } else if (electricityTotal > dieselTotal && electricityTotal > methaneTotal) {
    biggestSourceTitle = 'Purchased Grid Electricity';
    biggestSourcePct = Math.round((electricityTotal / (em.totalGrossEmissions || 1)) * 100);
    biggestSourceReduction = Math.round(electricityTotal * 0.45);
  }

  // Historical trend points for line chart
  const historicalTrend = useMemo(() => {
    return mine.reportingHistory.map(h => ({
      label: h.period.replace('FY24 ', '').replace('FY25 ', ''),
      value: h.emissionsTco2e,
      benchmark: Math.round(h.productionTonnes * mine.targetIntensityTco2e),
    }));
  }, [mine]);

  // Strictly 9 Navigation Tabs (NO MAP as mandated by user permissions)
  const navItems = [
    { id: 'my_mine', label: '1. Dashboard', icon: LayoutDashboard },
    { id: 'data_entry', label: '2. Data Entry', icon: FileEdit },
    { id: 'carbon_footprint', label: '3. Carbon Footprint', icon: Activity },
    { id: 'emission_hotspots', label: '4. Emission Hotspots', icon: Flame },
    { id: 'recommendations', label: '5. Recommendations', icon: Lightbulb },
    { id: 'what_if_simulator', label: '6. What-If Simulator', icon: Cpu },
    { id: 'my_roadmap', label: '7. My Roadmap', icon: Milestone },
    { id: 'progress', label: '8. Progress', icon: TrendingUp },
    { id: 'reports', label: '9. Reports', icon: FileSpreadsheet },
  ] as const;

  return (
    <div className="flex h-screen bg-[#F1F3F5] text-[#25282C] overflow-hidden font-sans">
      {/* ==============================================================
          LEFT: MINE MANAGER NAVIGATION SIDEBAR (GRAPHITE)
          ============================================================== */}
      <aside className="w-64 bg-[#25282C] border-r border-[#343A40] flex flex-col justify-between shrink-0 select-none">
        <div>
          {/* Identity Header */}
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
                  Colliery Management
                </span>
              </div>
            </div>

            {/* Current Mine Info */}
            <div className="mt-3 p-2.5 rounded-md bg-[#2D3137] border border-[#3E444B] text-xs">
              <span className="text-[10px] uppercase font-bold text-[#A3D0B0] block tracking-wider">
                My Colliery
              </span>
              <span className="font-bold text-white block truncate text-sm mt-0.5" title={mine.name}>
                {mine.name}
              </span>
              <span className="text-[11px] text-[#C4C9D0] block truncate">
                {mine.company} · {mine.state}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-2 space-y-0.5 text-xs">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium transition-colors text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#5B8C6A] text-white font-semibold shadow-xs'
                      : 'text-[#C4C9D0] hover:bg-[#343A40] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: User Details & Switcher */}
        <div className="p-3 border-t border-[#343A40] bg-[#1E2024]">
          <div className="flex items-center justify-between p-2 rounded-md bg-[#2D3137] border border-[#3E444B] text-xs">
            <div className="min-w-0 pr-2">
              <span className="text-[10px] text-[#A3D0B0] block uppercase font-bold tracking-wider">
                Verified Colliery Manager
              </span>
              <span className="font-semibold text-white block truncate">
                {currentUser.name}
              </span>
              {currentUser.employeeId && (
                <span className="text-[10px] text-[#94A3B8] font-mono block">
                  ID: {currentUser.employeeId}
                </span>
              )}
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-[#8C939D] px-1">
            <span>Role: Mine Manager</span>
            <button
              onClick={onLogout}
              className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ==============================================================
          RIGHT: MAIN APPLICATION CONTENT AREA
          ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F1F3F5]">
        {/* Top Operational Status Bar */}
        <header className="h-14 bg-white border-b border-[#E2E5E9] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xs font-bold text-[#25282C] uppercase tracking-wider">
              {navItems.find(n => n.id === activeTab)?.label}
            </span>
            <span className="text-[#CBD5E1]">/</span>
            <span className="text-xs text-[#64748B] truncate">
              {mine.name} · Code: <span className="font-mono">{mine.code}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded font-semibold uppercase bg-[#EDF5F0] text-[#3F7D58] border border-[#CDE3D5]">
              {mine.targetStatus.replace('_', ' ')}
            </span>
            <button
              onClick={() => setShowReportModal(true)}
              className="px-3 py-1.5 bg-[#25282C] hover:bg-[#343A40] text-white rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Statutory Report</span>
            </button>
          </div>
        </header>

        {/* Scrollable Tab Content Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* ==========================================================
              TAB 1: MINE MANAGER DASHBOARD (SIMPLE & PERSONAL)
              ========================================================== */}
          {activeTab === 'my_mine' && (
            <div className="space-y-6 max-w-5xl">
              {/* Level 1: Key Status KPI Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* 1. Carbon Footprint */}
                <div className="p-4 bg-white border border-[#E2E5E9] rounded-lg shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
                    CARBON FOOTPRINT
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-[#25282C] font-mono">
                      {Math.round(em.totalGrossEmissions).toLocaleString()}
                    </span>
                    <span className="text-xs text-[#64748B]">tCO2e</span>
                  </div>
                  <span className="text-[11px] text-[#64748B] mt-1 block">Annual gross emissions</span>
                </div>

                {/* 2. Carbon Intensity */}
                <div className="p-4 bg-white border border-[#E2E5E9] rounded-lg shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
                    CARBON INTENSITY
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-[#3F7D58] font-mono">
                      {em.carbonIntensityTco2ePerTonne.toFixed(4)}
                    </span>
                    <span className="text-xs text-[#64748B]">tCO2e/t</span>
                  </div>
                  <span className="text-[11px] text-[#3F7D58] mt-1 block">Target: {mine.targetIntensityTco2e.toFixed(4)}</span>
                </div>

                {/* 3. Reduction Progress */}
                <div className="p-4 bg-white border border-[#E2E5E9] rounded-lg shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
                    REDUCTION ACHIEVED
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-[#3F7D58] font-mono">
                      {mine.currentReductionPct}%
                    </span>
                  </div>
                  <span className="text-[11px] text-[#64748B] mt-1 block">Target: {mine.targetReductionPct}% by 2030</span>
                </div>

                {/* 4. Target Status */}
                <div className="p-4 bg-white border border-[#E2E5E9] rounded-lg shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
                    TARGET STATUS
                  </span>
                  <div className="mt-1">
                    <span className="text-xl font-extrabold text-[#25282C] uppercase font-mono">
                      {mine.targetStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="w-full bg-[#E2E5E9] rounded-full h-2 mt-2.5 overflow-hidden">
                    <div
                      className="bg-[#5B8C6A] h-full rounded-full"
                      style={{ width: `${Math.min(100, Math.round((mine.currentReductionPct / mine.targetReductionPct) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Level 2: Visual Analysis (Donut Chart + Line Chart) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Donut Chart */}
                <div className="bg-white p-5 rounded-lg border border-[#E2E5E9] shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E2E5E9]">
                    <h3 className="text-sm font-bold text-[#25282C]">
                      Where are my emissions coming from?
                    </h3>
                    <span className="text-xs text-[#64748B] font-medium">Activity Share</span>
                  </div>

                  <DonutChart
                    items={emissionSourceDonut}
                    centerLabel="Total Gross"
                    centerValue={`${Math.round(em.totalGrossEmissions).toLocaleString()} t`}
                    size={170}
                  />
                </div>

                {/* Line Chart */}
                <div className="bg-white p-5 rounded-lg border border-[#E2E5E9] shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E2E5E9]">
                    <h3 className="text-sm font-bold text-[#25282C]">
                      How have my emissions changed?
                    </h3>
                    <span className="text-xs text-[#64748B] font-medium">6-Month Trend</span>
                  </div>

                  <TrendLineChart
                    data={historicalTrend}
                    unit="tCO2e"
                    lineColor="#5B8C6A"
                    benchmarkLabel="Target Path"
                    height={150}
                  />
                </div>
              </div>

              {/* Level 3: Top Emission Source Card */}
              <div className="bg-white border-2 border-[#D99A2B]/40 rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-[#D99A2B] border border-amber-200 px-2 py-0.5 rounded">
                      TOP EMISSION SOURCE
                    </span>
                    <strong className="text-sm font-bold text-[#25282C]">
                      {biggestSourceTitle} — {biggestSourcePct}% OF EMISSIONS
                    </strong>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    Primary driver of colliery carbon footprint.
                  </p>
                  <p className="text-xs font-semibold text-[#25282C] mt-1">
                    Potential reduction: <span className="text-[#3F7D58]">~{biggestSourceReduction.toLocaleString()} tCO2e/year</span>
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('recommendations')}
                  className="px-4 py-2 bg-[#25282C] hover:bg-[#343A40] text-white rounded text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <span>Explore Solutions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Level 3B: Land & Reclamation Status Satellite View (Requirement 8) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-[#E2E5E9]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                    LAND & RECLAMATION STATUS
                  </span>
                  <span className="text-[11px] text-[#5B8C6A] font-semibold">CMPDI Verified Orthomosaic</span>
                </div>
                <MineSatelliteView
                  mine={mine}
                  variant="card"
                  onInspectVerification={() => setActiveTab('emission_hotspots')}
                />
              </div>

              {/* Level 4: "WHAT SHOULD I DO NEXT?" (3 Recommendations) */}
              <div className="bg-white p-5 rounded-lg border border-[#E2E5E9] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#E2E5E9]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#5B8C6A]" />
                    <h3 className="text-sm font-bold text-[#25282C]">
                      WHAT SHOULD I DO NEXT?
                    </h3>
                  </div>
                  <span className="text-xs text-[#64748B]">Top 3 Actionable Interventions</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {top3Recommendations.map((rec, i) => (
                    <div
                      key={rec.id}
                      className="p-4 bg-[#F8F9FA] rounded-lg border border-[#E2E5E9] flex flex-col justify-between space-y-3 hover:shadow-sm transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EDF5F0] text-[#3F7D58] border border-[#CDE3D5] uppercase">
                            Action #{i + 1}
                          </span>
                          <span className="text-[11px] font-mono text-[#64748B]">
                            {rec.paybackYears}y payback
                          </span>
                        </div>
                        <h4 className="font-bold text-[#25282C] text-sm leading-snug">
                          {rec.title}
                        </h4>
                        <p className="text-xs text-[#64748B] mt-1 line-clamp-2">
                          {rec.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#E2E5E9] flex items-center justify-between">
                        <span className="font-bold text-[#3F7D58] font-mono text-xs">
                          -{rec.potentialReductionTco2e.toLocaleString()} t/yr
                        </span>
                        <button
                          onClick={() => setSelectedRecModal(rec)}
                          className="text-[#5B8C6A] hover:text-[#3F7D58] font-semibold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <span>Explore Solution</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================================
              TAB 2: DATA ENTRY FORM
              ========================================================== */}
          {activeTab === 'data_entry' && (
            <DataEntryForm
              mine={mine}
              onDataSubmitted={updated => {
                onDataSubmitted(updated);
                setActiveTab('my_mine');
              }}
              onCancel={() => setActiveTab('my_mine')}
            />
          )}

          {/* ==========================================================
              TAB 3: CARBON FOOTPRINT (STRICT VERTICAL STACKED LAYOUT - REQ 11)
              1. OVERVIEW / DISPLAY
              2. SCOPE 1 / 2 / 3
              3. EMISSION SOURCES
              4. HISTORY
              ========================================================== */}
          {activeTab === 'carbon_footprint' && (
            <div className="space-y-8 max-w-5xl animate-fadeIn">
              {/* Header */}
              <div className="pb-3 border-b border-[#E2E5E9]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B8C6A] block">
                  STATUTORY DISCLOSURE ACCOUNTING
                </span>
                <h2 className="text-lg font-bold text-[#25282C]">
                  YOUR CARBON FOOTPRINT
                </h2>
                <p className="text-xs text-[#64748B]">
                  Certified GHG Protocol Scope 1, 2, and 3 disclosure framework for {mine.name}
                </p>
              </div>

              {/* ──────────────────────────────────────────────────────────
                  1. OVERVIEW / DISPLAY (KEY KPIS)
                  ────────────────────────────────────────────────────────── */}
              <section className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] block">
                  1. OVERVIEW & INTENSITY DISPLAY
                </span>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-white border border-[#E2E5E9] rounded-lg shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-[#64748B] block">Gross Emissions</span>
                    <span className="text-2xl font-extrabold text-[#25282C] mt-1 block font-mono">
                      {Math.round(em.totalGrossEmissions).toLocaleString()}
                    </span>
                    <span className="text-[11px] text-[#64748B]">tCO2e / year</span>
                  </div>

                  <div className="p-4 bg-white border border-[#E2E5E9] rounded-lg shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-[#64748B] block">Carbon Intensity</span>
                    <span className="text-2xl font-extrabold text-[#3F7D58] mt-1 block font-mono">
                      {em.carbonIntensityTco2ePerTonne.toFixed(4)}
                    </span>
                    <span className="text-[11px] text-[#64748B]">tCO2e / tonne coal</span>
                  </div>

                  <div className="p-4 bg-white border border-[#E2E5E9] rounded-lg shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-[#64748B] block">Clean Energy Offset</span>
                    <span className="text-2xl font-extrabold text-[#3F7D58] mt-1 block font-mono">
                      -{Math.round(em.emissionReductionsAchieved).toLocaleString()}
                    </span>
                    <span className="text-[11px] text-[#3F7D58]">tCO2e / year</span>
                  </div>

                  <div className="p-4 bg-white border border-[#E2E5E9] rounded-lg shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-[#64748B] block">Sequestration</span>
                    <span className="text-2xl font-extrabold text-[#5B8C6A] mt-1 block font-mono">
                      -{Math.round(em.carbonRemovalsSequestration).toLocaleString()}
                    </span>
                    <span className="text-[11px] text-[#5B8C6A]">tCO2e (Afforestation)</span>
                  </div>
                </div>
              </section>

              {/* ──────────────────────────────────────────────────────────
                  2. SCOPE 1 / 2 / 3 (PROMINENT PIE/DONUT CHART)
                  ────────────────────────────────────────────────────────── */}
              <section className="bg-white p-6 rounded-lg border border-[#E2E5E9] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#E2E5E9]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                    2. GHG PROTOCOL SCOPE 1, 2, AND 3 CONTRIBUTION
                  </span>
                  <span className="text-[11px] text-[#64748B]">ISO 14064 Compliance</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
                  <div className="lg:col-span-6 flex justify-center">
                    <DonutChart
                      items={scopeDonut}
                      title="Scope Contributions"
                      centerLabel="Gross Emissions"
                      centerValue={`${Math.round(em.totalGrossEmissions).toLocaleString()} t`}
                      size={220}
                      showLegend={true}
                    />
                  </div>

                  <div className="lg:col-span-6 space-y-3 text-xs divide-y divide-[#E2E5E9]">
                    <div className="pt-2">
                      <div className="flex justify-between items-center">
                        <strong className="text-[#C65353] font-bold text-sm">Scope 1: Direct Operations</strong>
                        <span className="font-mono font-bold text-[#25282C]">
                          {Math.round(em.scope1.total).toLocaleString()} tCO2e ({Math.round((em.scope1.total / em.totalGrossEmissions) * 100)}%)
                        </span>
                      </div>
                      <p className="text-[#64748B] mt-0.5">
                        HEMM Diesel ({Math.round(em.scope1.dieselMachinery).toLocaleString()} t), DG Sets ({Math.round(em.scope1.dieselGenerators).toLocaleString()} t), Seam Gas ({Math.round(em.scope1.fugitiveMethane).toLocaleString()} t).
                      </p>
                    </div>

                    <div className="pt-3">
                      <div className="flex justify-between items-center">
                        <strong className="text-[#397D8A] font-bold text-sm">Scope 2: Purchased Electricity</strong>
                        <span className="font-mono font-bold text-[#25282C]">
                          {Math.round(em.scope2.total).toLocaleString()} tCO2e ({Math.round((em.scope2.total / em.totalGrossEmissions) * 100)}%)
                        </span>
                      </div>
                      <p className="text-[#64748B] mt-0.5">
                        Central grid power ({mine.operational.gridElectricityKWh.toLocaleString()} kWh @ 0.716 kg/kWh emission factor).
                      </p>
                    </div>

                    <div className="pt-3">
                      <div className="flex justify-between items-center">
                        <strong className="text-[#64748B] font-bold text-sm">Scope 3: Upstream & Freight</strong>
                        <span className="font-mono font-bold text-[#25282C]">
                          {Math.round(em.scope3.total).toLocaleString()} tCO2e ({Math.round((em.scope3.total / em.totalGrossEmissions) * 100)}%)
                        </span>
                      </div>
                      <p className="text-[#64748B] mt-0.5">
                        Coal logistics ({mine.operational.transportDistanceKm} km by {mine.operational.transportMode}) and water management.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* ──────────────────────────────────────────────────────────
                  3. EMISSION SOURCES BREAKDOWN (HORIZONTAL BARS)
                  ────────────────────────────────────────────────────────── */}
              <section className="bg-white p-6 rounded-lg border border-[#E2E5E9] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#E2E5E9]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                    3. WHERE ARE EMISSIONS COMING FROM?
                  </span>
                  <span className="text-[11px] text-[#64748B]">Granular Fuel & Electrical Distribution</span>
                </div>

                <p className="text-xs text-[#64748B]">
                  Detailed breakdown across diesel combustion, grid electrification, seam gas, and supply logistics. Hover over bars to see activity-level shares.
                </p>

                <HorizontalBarChart
                  items={emissionSourcesBar}
                  unit="tCO2e"
                />
              </section>

              {/* ──────────────────────────────────────────────────────────
                  4. HISTORICAL PERFORMANCE TREND
                  ────────────────────────────────────────────────────────── */}
              <section className="bg-white p-6 rounded-lg border border-[#E2E5E9] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#E2E5E9]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                    4. HOW HAS PERFORMANCE CHANGED?
                  </span>
                  <span className="text-[11px] text-[#64748B]">Multi-Quarter Audit Trajectory</span>
                </div>

                <p className="text-xs text-[#64748B]">
                  Quarterly gross emissions tracking against statutory target trajectory. Hover points for period-specific delta diagnostics.
                </p>

                <TrendLineChart
                  data={historicalTrend}
                  unit="tCO2e"
                  lineColor="#5B8C6A"
                  benchmarkLabel="Target Path"
                  height={170}
                />

                {/* Audit History Log Table */}
                <div className="mt-4 pt-3 border-t border-[#E2E5E9]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8F9FA] border-b border-[#E2E5E9] text-[10px] text-[#64748B] uppercase">
                      <tr>
                        <th className="p-2.5">Period</th>
                        <th className="p-2.5 text-right">Coal Output (t)</th>
                        <th className="p-2.5 text-right">Gross CO2e (t)</th>
                        <th className="p-2.5 text-right">Intensity (t/t)</th>
                        <th className="p-2.5 text-center">Audit Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E5E9]">
                      {mine.reportingHistory.map((h, i) => (
                        <tr key={i} className="hover:bg-[#F8F9FA]">
                          <td className="p-2.5 font-medium">{h.period}</td>
                          <td className="p-2.5 text-right font-mono">{h.productionTonnes.toLocaleString()}</td>
                          <td className="p-2.5 text-right font-mono font-bold">{h.emissionsTco2e.toLocaleString()}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-[#3F7D58]">{h.intensity.toFixed(4)}</td>
                          <td className="p-2.5 text-center">
                            <span className="text-[10px] px-2 py-0.5 rounded font-semibold uppercase bg-[#EDF5F0] text-[#3F7D58] border border-[#CDE3D5]">
                              {h.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* ==========================================================
              TAB 4: EMISSION HOTSPOTS & SATELLITE AUDIT
              ========================================================== */}
          {activeTab === 'emission_hotspots' && (
            <div className="space-y-6 max-w-5xl animate-fadeIn">
              {/* Interactive Satellite Hotspot Analysis & Draggable Land Boundary Prototype */}
              <SatelliteHotspotAnalysis mine={mine} />

              <div className="pt-2 border-t border-[#E2E5E9]">
                <SatelliteVerificationCard mine={mine} />
              </div>

              <CarbonRemovalSection mine={mine} />
            </div>
          )}

          {/* ==========================================================
              TAB 5: RECOMMENDATIONS (VISUALLY ATTRACTIVE CARDS WITH IMAGERY)
              ========================================================== */}
          {activeTab === 'recommendations' && (
            <div className="space-y-6 max-w-5xl animate-fadeIn">
              <div className="pb-2 border-b border-[#E2E5E9]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B8C6A] block">
                  DECARBONIZATION STRATEGY
                </span>
                <h2 className="text-base font-bold text-[#25282C]">
                  WHAT SHOULD YOU DO NEXT?
                </h2>
                <p className="text-xs text-[#64748B]">
                  Engineering-grade capital & operational interventions calibrated specifically to {mine.name}
                </p>
              </div>

              {/* Grid of Recommendation Cards with High-Res Imagery */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendations.map(rec => {
                  const isSelected = mine.selectedInterventionIds.includes(rec.id);
                  const imageSrc = getInterventionImage(rec.id, rec.category);
                  const rationale = getRecommendationRationale(rec, mine);

                  return (
                    <div
                      key={rec.id}
                      className={`rounded-lg border overflow-hidden bg-white shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between group ${
                        isSelected ? 'border-[#5B8C6A] ring-1 ring-[#5B8C6A]' : 'border-[#E2E5E9]'
                      }`}
                    >
                      {/* Image Frame with Aspect Ratio */}
                      <div className="relative aspect-[16/9] w-full bg-[#1E2024] overflow-hidden">
                        <img
                          src={imageSrc}
                          alt={rec.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103 group-hover:brightness-105"
                        />

                        {/* Category & Priority Badges */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-xs text-white px-2 py-0.5 rounded">
                            {rec.category}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded backdrop-blur-xs ${
                              rec.priority === 'HIGH'
                                ? 'bg-red-900/80 text-red-200 border border-red-500/40'
                                : 'bg-amber-900/80 text-amber-200 border border-amber-500/40'
                            }`}
                          >
                            {rec.priority} PRIORITY
                          </span>
                        </div>

                        {/* Reduction Tag */}
                        <div className="absolute bottom-2.5 right-2.5 bg-[#166534]/90 backdrop-blur-xs text-white px-2.5 py-1 rounded text-xs font-bold font-mono">
                          -{rec.potentialReductionPct}% ({rec.potentialReductionTco2e.toLocaleString()} t/yr)
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <h4 className="font-bold text-sm text-[#25282C] leading-snug group-hover:text-[#5B8C6A] transition-colors">
                            {rec.title}
                          </h4>
                          <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                            {rec.description}
                          </p>

                          {/* "WHY THIS IS RECOMMENDED" Personalized Callout (Req 16) */}
                          <div className="p-2.5 rounded bg-[#F8F9FA] border border-[#E2E5E9] text-xs space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B8C6A] block">
                              WHY THIS IS RECOMMENDED
                            </span>
                            <p className="text-[11px] text-[#25282C] leading-relaxed italic">
                              "{rationale}"
                            </p>
                          </div>
                        </div>

                        {/* Financials & Actions */}
                        <div className="pt-3 border-t border-[#F1F3F5] space-y-3">
                          <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="bg-[#F8F9FA] p-1.5 rounded">
                              <span className="text-[10px] text-[#64748B] block">CapEx</span>
                              <strong className="text-[#25282C] font-mono">₹{rec.estimatedInvestmentCrores} Cr</strong>
                            </div>
                            <div className="bg-[#F8F9FA] p-1.5 rounded">
                              <span className="text-[10px] text-[#64748B] block">Savings</span>
                              <strong className="text-[#397D8A] font-mono">₹{rec.annualSavingsCrores} Cr/y</strong>
                            </div>
                            <div className="bg-[#F8F9FA] p-1.5 rounded">
                              <span className="text-[10px] text-[#64748B] block">Payback</span>
                              <strong className="text-[#25282C] font-mono">{rec.paybackYears} yrs</strong>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => setSelectedRecModal(rec)}
                              className="flex-1 py-2 px-3 bg-[#25282C] hover:bg-[#343A40] text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                            >
                              <span>Explore Solution</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onToggleIntervention(rec.id)}
                              className={`py-2 px-3 rounded text-xs font-semibold cursor-pointer transition-colors border ${
                                isSelected
                                  ? 'bg-[#EDF5F0] text-[#3F7D58] border-[#CDE3D5]'
                                  : 'bg-white text-[#25282C] border-[#E2E5E9] hover:bg-[#F8F9FA]'
                              }`}
                            >
                              {isSelected ? 'In Roadmap ✓' : 'Add to Plan'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==========================================================
              TAB 6: WHAT-IF SIMULATOR
              ========================================================== */}
          {activeTab === 'what_if_simulator' && (
            <WhatIfSimulator mine={mine} />
          )}

          {/* ==========================================================
              TAB 7: MY ROADMAP (INTERACTIVE DRAG & DROP TIMELINE)
              ========================================================== */}
          {activeTab === 'my_roadmap' && (
            <CarbonNeutralityRoadmap
              mine={mine}
              selectedInterventions={recommendations.filter(r => mine.selectedInterventionIds.includes(r.id))}
              allRecommendations={recommendations}
              onToggleIntervention={onToggleIntervention}
            />
          )}

          {/* ==========================================================
              TAB 8: PROGRESS (AUDITED PERFORMANCE TRAJECTORY & TARGET TRACKING)
              ========================================================== */}
          {activeTab === 'progress' && (
            <CollieryProgressReport
              mine={mine}
              interventions={recommendations}
              selectedInterventionIds={mine.selectedInterventionIds}
              onToggleSelectIntervention={onToggleIntervention}
            />
          )}

          {/* ==========================================================
              TAB 9: REPORTS (AUDIT COMPLIANCE STATEMENT)
              ========================================================== */}
          {activeTab === 'reports' && (
            <div className="space-y-6 max-w-4xl animate-fadeIn">
              <div className="pb-2 border-b border-[#E2E5E9]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B8C6A] block">
                  STATUTORY AUDIT & FILINGS
                </span>
                <h2 className="text-base font-bold text-[#25282C]">
                  Official Decarbonization Audit Filings
                </h2>
                <p className="text-xs text-[#64748B]">
                  Download certified BRSR, CMPDI, and DGMS audit filings for {mine.name}
                </p>
              </div>

              <div className="p-8 bg-white border border-[#E2E5E9] rounded-lg shadow-xs space-y-4 text-center">
                <Printer className="w-12 h-12 text-[#5B8C6A] mx-auto" />
                <h3 className="font-bold text-base text-[#25282C]">
                  Statutory Decarbonization Statement Ready
                </h3>
                <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
                  Generates the complete statutory disclosure document containing CEA electricity grid factors, HEMM specific diesel usage, fugitive seam methane oxidation rates, and Sentinel-2 satellite NDVI verified reclamation ha.
                </p>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="px-5 py-2.5 bg-[#5B8C6A] hover:bg-[#3F7D58] text-white text-xs font-semibold rounded cursor-pointer transition-colors shadow-2xs inline-flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Generate Official Report</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ==============================================================
          SOLUTION EXPLORATION DRAWER / MODAL (REQ 15)
          ============================================================== */}
      {selectedRecModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-xl w-full border border-[#E2E5E9] shadow-2xl overflow-hidden animate-fadeIn my-8">
            {/* Modal Image Header */}
            <div className="relative aspect-[16/8] w-full bg-[#1E2024]">
              <img
                src={getInterventionImage(selectedRecModal.id, selectedRecModal.category)}
                alt={selectedRecModal.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedRecModal(null)}
                className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white cursor-pointer transition-colors"
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded text-white text-[11px] font-bold uppercase">
                {selectedRecModal.category} · Priority: {selectedRecModal.priority}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-bold text-base text-[#25282C] leading-snug">
                  {selectedRecModal.title}
                </h3>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  {selectedRecModal.description}
                </p>
              </div>

              {/* Personalized Rationale */}
              <div className="p-3 bg-[#F8F9FA] rounded-md border border-[#E2E5E9] space-y-1 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B8C6A] block">
                  WHY THIS IS RECOMMENDED FOR {mine.name.toUpperCase()}
                </span>
                <p className="text-xs text-[#25282C] leading-relaxed">
                  {getRecommendationRationale(selectedRecModal, mine)}
                </p>
              </div>

              {/* Financial & Engineering Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 bg-[#F8F9FA] rounded border border-[#E2E5E9]">
                  <span className="text-[10px] text-[#64748B] block">Reduction</span>
                  <strong className="text-[#3F7D58] font-mono text-sm block">
                    -{selectedRecModal.potentialReductionTco2e.toLocaleString()} t
                  </strong>
                  <span className="text-[9px] text-[#3F7D58]">({selectedRecModal.potentialReductionPct}% colliery share)</span>
                </div>

                <div className="p-2.5 bg-[#F8F9FA] rounded border border-[#E2E5E9]">
                  <span className="text-[10px] text-[#64748B] block">CapEx Outlay</span>
                  <strong className="text-[#25282C] font-mono text-sm block">
                    ₹{selectedRecModal.estimatedInvestmentCrores} Cr
                  </strong>
                  <span className="text-[9px] text-[#64748B]">Procurement</span>
                </div>

                <div className="p-2.5 bg-[#F8F9FA] rounded border border-[#E2E5E9]">
                  <span className="text-[10px] text-[#64748B] block">Annual Savings</span>
                  <strong className="text-[#397D8A] font-mono text-sm block">
                    ₹{selectedRecModal.annualSavingsCrores} Cr
                  </strong>
                  <span className="text-[9px] text-[#397D8A]">OPEX recovery</span>
                </div>

                <div className="p-2.5 bg-[#F8F9FA] rounded border border-[#E2E5E9]">
                  <span className="text-[10px] text-[#64748B] block">Payback</span>
                  <strong className="text-[#25282C] font-mono text-sm block">
                    {selectedRecModal.paybackYears} Years
                  </strong>
                  <span className="text-[9px] text-[#64748B]">{selectedRecModal.timeMonths} mo timeline</span>
                </div>
              </div>

              {/* Technical Challenges & Subsidy */}
              <div className="space-y-2 text-xs border-t border-[#F1F3F5] pt-3">
                {selectedRecModal.blockers && (
                  <div>
                    <strong className="text-[#25282C] block font-semibold">Implementation Prerequisites & Dependencies:</strong>
                    <span className="text-[#64748B] block mt-0.5">{selectedRecModal.blockers}</span>
                  </div>
                )}
                {selectedRecModal.subsidyApplicable && (
                  <div className="bg-[#EDF5F0] p-2.5 rounded border border-[#CDE3D5] text-[11px]">
                    <strong className="text-[#3F7D58] block font-bold">Government Incentive / Subsidy Applicable:</strong>
                    <span className="text-[#255238] block mt-0.5">{selectedRecModal.subsidyApplicable}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#E2E5E9] flex items-center justify-end gap-2">
                <button
                  onClick={() => setSelectedRecModal(null)}
                  className="px-3.5 py-1.5 bg-[#F1F3F5] hover:bg-[#E2E5E9] text-[#25282C] rounded text-xs font-semibold cursor-pointer transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onToggleIntervention(selectedRecModal.id);
                    setSelectedRecModal(null);
                  }}
                  className={`px-4 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
                    mine.selectedInterventionIds.includes(selectedRecModal.id)
                      ? 'bg-red-50 text-[#C65353] border border-red-200 hover:bg-red-100'
                      : 'bg-[#5B8C6A] hover:bg-[#3F7D58] text-white shadow-2xs'
                  }`}
                >
                  {mine.selectedInterventionIds.includes(selectedRecModal.id)
                    ? 'Remove from Colliery Plan'
                    : 'Add to Decarbonization Roadmap'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Report Modal */}
      {showReportModal && (
        <ReportModal
          onClose={() => setShowReportModal(false)}
          mine={mine}
        />
      )}
    </div>
  );
};
