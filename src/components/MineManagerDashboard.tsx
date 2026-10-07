import React, { useState } from 'react';
import { DecarbonizationIntervention, MineRecord } from '../types';
import { recommendationEngine } from '../services/recommendationEngine';
import { WhatIfSimulator } from './WhatIfSimulator';
import { CostImpactMatrix } from './CostImpactMatrix';
import { CarbonNeutralityRoadmap } from './CarbonNeutralityRoadmap';
import { SatelliteVerificationCard } from './SatelliteVerificationCard';
import { CarbonRemovalSection } from './CarbonRemovalSection';
import { 
  Flame, 
  Zap, 
  Truck, 
  TreePine, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  Sliders, 
  Printer, 
  PlusCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Award
} from 'lucide-react';

interface MineManagerDashboardProps {
  mine: MineRecord;
  onOpenDataEntry: () => void;
  onOpenReportModal: () => void;
  onSelectInterventionToggle: (id: string) => void;
}

export const MineManagerDashboard: React.FC<MineManagerDashboardProps> = ({
  mine,
  onOpenDataEntry,
  onOpenReportModal,
  onSelectInterventionToggle,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'simulator' | 'recommendations' | 'roadmap' | 'land'>('overview');

  const em = mine.emissions;
  const op = mine.operational;
  const isUG = mine.mineType === 'underground' || mine.mineType === 'mixed';

  // Recommendations calculated dynamically
  const recommendations = recommendationEngine.getPersonalizedRecommendations(mine);
  const topAction = recommendationEngine.getTopSingleIntervention(mine);

  // Dominant Emission Hotspot calculation
  const dieselTotal = em.scope1.dieselMachinery + em.scope1.dieselGenerators;
  const electricityTotal = em.scope2.gridElectricity;
  const methaneTotal = em.scope1.fugitiveMethane;
  const transportTotal = em.scope3.coalTransport;

  let biggestSource = 'DIESEL HAULAGE & PIT MACHINERY';
  let biggestSourcePct = Math.round((dieselTotal / (em.totalGrossEmissions || 1)) * 100);
  let biggestSourceDesc = 'Heavy dumper truck hauling and excavator diesel fuel in opencast extraction.';

  if (methaneTotal > dieselTotal && methaneTotal > electricityTotal) {
    biggestSource = 'FUGITIVE COAL SEAM METHANE (CH4)';
    biggestSourcePct = Math.round((methaneTotal / (em.totalGrossEmissions || 1)) * 100);
    biggestSourceDesc = 'Gas desorption from broken coal faces and ventilation return air emissions.';
  } else if (electricityTotal > dieselTotal && electricityTotal > methaneTotal) {
    biggestSource = 'GRID ELECTRICITY CONSUMPTION';
    biggestSourcePct = Math.round((electricityTotal / (em.totalGrossEmissions || 1)) * 100);
    biggestSourceDesc = 'Continuous shaft ventilation fans, heavy dewatering pumps, and winding equipment.';
  }

  return (
    <div className="space-y-6">
      {/* Colliery Title & Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase font-mono">
              {mine.code}
            </span>
            <span className="text-xs text-slate-500">
              {mine.company} ({mine.parentHolding}) · {mine.state}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            {mine.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {mine.mineType.toUpperCase()} Colliery · Grade {mine.coalGrade} · Annual Capacity: {mine.annualCapacityMt} Mtpa
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenDataEntry}
            className="px-4 py-2 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold rounded shadow-sm transition-colors flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Enter Monthly Data</span>
          </button>

          <button
            onClick={onOpenReportModal}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded shadow-sm transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Generate Audit Report</span>
          </button>
        </div>
      </div>

      {/* SECTION 8: TOP LEVEL KPI BANNER */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1: Carbon Footprint */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
            CARBON FOOTPRINT
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 font-tabular">
              {Math.round(em.totalGrossEmissions).toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">tCO2e/year</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Gross direct & purchased energy emissions
          </span>
        </div>

        {/* KPI 2: Carbon Intensity */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
            CARBON INTENSITY
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[#166534] font-tabular">
              {em.carbonIntensityTco2ePerTonne.toFixed(4)}
            </span>
            <span className="text-xs text-slate-500 font-medium">tCO2e / t coal</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Baseline: {mine.baselineIntensityTco2e.toFixed(4)} t/t
          </span>
        </div>

        {/* KPI 3: Target Mandate */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
            STATUTORY TARGET
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-800 font-tabular">
              {mine.targetYear}
            </span>
            <span className="text-xs text-emerald-700 font-semibold font-tabular">
              (-{mine.targetReductionPct}%)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1 font-mono">
            Target: {mine.targetIntensityTco2e.toFixed(4)} t/t
          </span>
        </div>

        {/* KPI 4: Progress Achieved */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
            PROGRESS ACHIEVED
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-emerald-700 font-tabular">
              {mine.currentReductionPct}%
            </span>
            <span className="text-xs font-semibold text-emerald-800">
              {mine.targetStatus === 'on_track' ? 'ON TRACK' : mine.targetStatus.toUpperCase()}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-[#166534] h-full rounded-full"
              style={{ width: `${Math.min(100, Math.round((mine.currentReductionPct / mine.targetReductionPct) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* SECTION 8: "YOUR BIGGEST EMISSION SOURCE" + "WHAT SHOULD YOU DO NEXT?" */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hotspot Identification Box */}
        <div className="bg-amber-50/40 border border-amber-200 p-5 rounded-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded">
                YOUR BIGGEST EMISSION SOURCE
              </span>
              <span className="text-sm font-extrabold text-amber-900 font-tabular">
                {biggestSourcePct}% of total footprint
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              {biggestSource}
            </h3>
            <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
              {biggestSourceDesc} Generated approximately {Math.round(biggestSourcePct * em.totalGrossEmissions / 100).toLocaleString()} tCO2e in the current period.
            </p>
          </div>

          <div className="pt-3 border-t border-amber-200 mt-4 text-[11px] text-amber-800 flex items-center justify-between">
            <span>Critical lever for colliery decarbonization</span>
            <span className="font-semibold underline cursor-pointer" onClick={() => setActiveTab('recommendations')}>
              View mitigation actions →
            </span>
          </div>
        </div>

        {/* Immediate Next Action Box */}
        <div className="bg-emerald-50/40 border border-emerald-200 p-5 rounded-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#166534]" /> WHAT SHOULD YOU DO NEXT?
              </span>
              <span className="text-[11px] font-bold text-emerald-800">
                Priority 1 Action
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              {topAction.title}
            </h3>
            <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
              {topAction.description}
            </p>
          </div>

          <div className="pt-3 border-t border-emerald-200 mt-4 flex items-center justify-between text-xs">
            <span className="font-tabular font-bold text-emerald-800">
              Potential: -{topAction.potentialReductionTco2e.toLocaleString()} tCO2e/yr
            </span>
            <button
              onClick={() => setActiveTab('simulator')}
              className="text-xs font-bold text-[#166534] hover:underline flex items-center gap-1"
            >
              <span>Simulate ROI in What-If</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs for Colliery Workspace */}
      <div className="flex items-center gap-1 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-[#166534] text-[#166534]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Emission Breakdown & History
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'simulator'
              ? 'border-[#166534] text-[#166534]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          What-If Simulator & Budget Solver
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'recommendations'
              ? 'border-[#166534] text-[#166534]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Interventions & Cost-Impact Matrix
        </button>
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'roadmap'
              ? 'border-[#166534] text-[#166534]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          2030/2040 Roadmap
        </button>
        <button
          onClick={() => setActiveTab('land')}
          className={`px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'land'
              ? 'border-[#166534] text-[#166534]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Land & Satellite Verification
        </button>
      </div>

      {/* TAB 1: EMISSION BREAKDOWN & HISTORY */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Scopes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Scope 1 */}
            <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <Flame className="w-4 h-4 text-amber-600" /> Scope 1: Direct Operations
                </span>
                <span className="font-bold font-tabular text-slate-900">
                  {Math.round(em.scope1.total).toLocaleString()} t
                </span>
              </div>
              <div className="space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Machinery Diesel:</span>
                  <strong className="text-slate-900 font-tabular">{Math.round(em.scope1.dieselMachinery).toLocaleString()} t</strong>
                </div>
                <div className="flex justify-between">
                  <span>DG Generators:</span>
                  <strong className="text-slate-900 font-tabular">{Math.round(em.scope1.dieselGenerators).toLocaleString()} t</strong>
                </div>
                <div className="flex justify-between">
                  <span>Fugitive Methane (CH4):</span>
                  <strong className="text-slate-900 font-tabular">{Math.round(em.scope1.fugitiveMethane).toLocaleString()} t</strong>
                </div>
                <div className="flex justify-between">
                  <span>Blasting Explosives:</span>
                  <strong className="text-slate-900 font-tabular">{Math.round(em.scope1.explosives).toLocaleString()} t</strong>
                </div>
              </div>
            </div>

            {/* Scope 2 */}
            <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <Zap className="w-4 h-4 text-cyan-600" /> Scope 2: Purchased Electricity
                </span>
                <span className="font-bold font-tabular text-slate-900">
                  {Math.round(em.scope2.total).toLocaleString()} t
                </span>
              </div>
              <div className="space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Grid Power Billed:</span>
                  <strong className="text-slate-900 font-tabular">{Math.round(em.scope2.gridElectricity).toLocaleString()} t</strong>
                </div>
                <div className="flex justify-between">
                  <span>On-Site Solar Offset:</span>
                  <strong className="text-emerald-700 font-tabular">-{Math.round(em.emissionReductionsAchieved).toLocaleString()} t</strong>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>CEA Baseline Factor:</span>
                  <span className="font-mono">0.716 kg/kWh</span>
                </div>
              </div>
            </div>

            {/* Scope 3 */}
            <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <Truck className="w-4 h-4 text-slate-600" /> Scope 3: Value Chain
                </span>
                <span className="font-bold font-tabular text-slate-900">
                  {Math.round(em.scope3.total).toLocaleString()} t
                </span>
              </div>
              <div className="space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Coal Evacuation Freight:</span>
                  <strong className="text-slate-900 font-tabular">{Math.round(em.scope3.coalTransport).toLocaleString()} t</strong>
                </div>
                <div className="flex justify-between">
                  <span>Water Pumping Energy:</span>
                  <strong className="text-slate-900 font-tabular">{Math.round(em.scope3.waterTreatmentPumping).toLocaleString()} t</strong>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Transport Mode:</span>
                  <span className="capitalize">{mine.operational.transportMode.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 6-Month Historical Reporting Trend Chart */}
          <div className="bg-white p-5 border border-slate-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Rolling Colliery Carbon Emissions & Production History
                </h4>
                <p className="text-[11px] text-slate-500">
                  Monthly statutory submissions with data verification audit tags
                </p>
              </div>
            </div>

            <div className="border border-slate-200 rounded overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="p-2.5">Reporting Period</th>
                    <th className="p-2.5 text-right">Coal Extracted (Tonnes)</th>
                    <th className="p-2.5 text-right">Gross Emissions (tCO2e)</th>
                    <th className="p-2.5 text-right">Specific Intensity (t/t)</th>
                    <th className="p-2.5 text-center">Data Audit State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mine.reportingHistory.map((h, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-medium text-slate-900">{h.period}</td>
                      <td className="p-2.5 text-right font-tabular text-slate-700">{h.productionTonnes.toLocaleString()}</td>
                      <td className="p-2.5 text-right font-tabular text-slate-900 font-semibold">{h.emissionsTco2e.toLocaleString()}</td>
                      <td className="p-2.5 text-right font-tabular font-mono text-[#166534]">{h.intensity.toFixed(4)}</td>
                      <td className="p-2.5 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          h.status === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {h.status}
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

      {/* TAB 2: WHAT-IF SIMULATOR */}
      {activeTab === 'simulator' && (
        <WhatIfSimulator mine={mine} />
      )}

      {/* TAB 3: RECOMMENDATIONS & COST IMPACT MATRIX */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          {/* 2x2 Matrix */}
          <CostImpactMatrix
            interventions={recommendations}
            selectedInterventionIds={mine.selectedInterventionIds}
            onToggleSelectIntervention={onSelectInterventionToggle}
          />

          {/* Detailed Recommendations List */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Engineered Decarbonization Interventions
            </h4>

            <div className="space-y-3">
              {recommendations.map(item => {
                const isSelected = mine.selectedInterventionIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border text-xs transition-all ${
                      isSelected
                        ? 'border-[#166534] bg-emerald-50/20 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            item.priority === 'HIGH' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.priority} PRIORITY
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 capitalize">
                            {item.category}
                          </span>
                        </div>
                        <h5 className="text-sm font-bold text-slate-900">{item.title}</h5>
                        <p className="text-slate-600 max-w-3xl leading-relaxed">{item.description}</p>
                      </div>

                      <button
                        onClick={() => onSelectInterventionToggle(item.id)}
                        className={`px-3 py-1.5 rounded font-semibold text-xs transition-colors flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#166534] text-white shadow-sm'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        {isSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                        <span>{isSelected ? 'Committed in Plan' : '+ Add to Plan'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-3 mt-3 border-t border-slate-100 text-[11px]">
                      <div>
                        <span className="text-slate-400 uppercase text-[10px] block">Expected Reduction</span>
                        <strong className="text-emerald-700 font-tabular font-bold">
                          -{item.potentialReductionTco2e.toLocaleString()} tCO2e/yr (-{item.potentialReductionPct}%)
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase text-[10px] block">Estimated Investment</span>
                        <strong className="text-slate-900 font-tabular font-bold">
                          ₹{item.estimatedInvestmentCrores} Crores
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase text-[10px] block">Annual OpEx Savings</span>
                        <strong className="text-slate-900 font-tabular font-bold">
                          ₹{item.annualSavingsCrores} Cr / yr
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase text-[10px] block">Simple Payback</span>
                        <strong className="text-slate-900 font-tabular font-bold">
                          {item.paybackYears} Years
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase text-[10px] block">Lead Time</span>
                        <strong className="text-slate-900 font-tabular font-bold">
                          {item.timeMonths} Months
                        </strong>
                      </div>
                    </div>

                    {item.blockers && (
                      <div className="mt-2 text-[11px] text-amber-800 bg-amber-50 p-2 rounded">
                        <strong>Implementation Dependencies / Clearances: </strong>{item.blockers}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ROADMAP */}
      {activeTab === 'roadmap' && (
        <CarbonNeutralityRoadmap
          mine={mine}
          selectedInterventions={recommendations.filter(r => mine.selectedInterventionIds.includes(r.id))}
        />
      )}

      {/* TAB 5: LAND & SATELLITE VERIFICATION */}
      {activeTab === 'land' && (
        <div className="space-y-6">
          <SatelliteVerificationCard mine={mine} />
          <CarbonRemovalSection mine={mine} />
        </div>
      )}
    </div>
  );
};
