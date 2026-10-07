import React, { useState, useMemo } from 'react';
import { MineRecord, DecarbonizationIntervention } from '../types';
import { TrendLineChart, HorizontalBarChart, DonutChart } from './charts/VisualCharts';
import { CostImpactMatrix } from './CostImpactMatrix';
import {
  TrendingUp,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Award,
  Zap,
  Flame,
  Truck,
  Leaf,
  Layers,
  CircleDot
} from 'lucide-react';

interface CollieryProgressReportProps {
  mine: MineRecord;
  interventions: DecarbonizationIntervention[];
  selectedInterventionIds: string[];
  onToggleSelectIntervention?: (id: string) => void;
}

export const CollieryProgressReport: React.FC<CollieryProgressReportProps> = ({
  mine,
  interventions,
  selectedInterventionIds,
  onToggleSelectIntervention,
}) => {
  const [showDetailedMatrix, setShowDetailedMatrix] = useState<boolean>(false);
  const [activeReductionHover, setActiveReductionHover] = useState<number | null>(null);

  const em = mine.emissions;
  const currentReductionPct = mine.currentReductionPct;
  const targetReductionPct = mine.targetReductionPct;
  const targetAchievementPct = Math.min(100, Math.round((currentReductionPct / (targetReductionPct || 1)) * 100));
  const totalCo2eReduced = Math.round(em.emissionReductionsAchieved + (em.totalGrossEmissions * (currentReductionPct / 100)));

  // Target vs Actual Trajectory Data points for the main chart (Section 17)
  const trajectoryData = useMemo(() => [
    { month: 'Q1 FY25', targetPct: 8.0, actualPct: 9.5, delta: '+1.5% ahead' },
    { month: 'Q2 FY25', targetPct: 11.0, actualPct: 12.2, delta: '+1.2% ahead' },
    { month: 'Q3 FY25', targetPct: 13.5, actualPct: 14.8, delta: '+1.3% ahead' },
    { month: 'Q4 FY25', targetPct: 15.0, actualPct: 16.5, delta: '+1.5% ahead' },
    { month: 'Q1 FY26', targetPct: 16.5, actualPct: 18.2, delta: '+1.7% ahead' },
    { month: 'Q2 FY26 (Current)', targetPct: 18.0, actualPct: currentReductionPct, delta: `${currentReductionPct >= 18.0 ? '+' : ''}${(currentReductionPct - 18.0).toFixed(1)}% vs target` },
  ], [currentReductionPct]);

  // Historical emissions trend points (Section 18)
  const historicalTrend = useMemo(() => {
    return mine.reportingHistory.map(h => ({
      label: h.period.replace('FY24 ', '').replace('FY25 ', ''),
      value: h.emissionsTco2e,
      benchmark: Math.round(h.productionTonnes * mine.targetIntensityTco2e),
    }));
  }, [mine]);

  // Reduction by Source breakdown (Section 19)
  const reductionSources = useMemo(() => {
    const dieselSavings = Math.round(em.emissionReductionsAchieved * 0.44);
    const solarSavings = Math.round(em.emissionReductionsAchieved * 0.28);
    const methaneSavings = Math.round(em.emissionReductionsAchieved * 0.16);
    const logisticsSavings = Math.round(em.emissionReductionsAchieved * 0.12);

    return [
      { label: 'Mobile Fleet Diesel Efficiency', value: dieselSavings, color: '#D99A2B', sublabel: 'HEMM idling & dumper electrification', unit: 'tCO2e' },
      { label: 'Captive Solar & Grid Offset', value: solarSavings, color: '#397D8A', sublabel: 'Overburden dump PV array', unit: 'tCO2e' },
      { label: 'Fugitive Methane Flaring & VAM', value: methaneSavings, color: '#C65353', sublabel: 'Seam degasification recovery', unit: 'tCO2e' },
      { label: 'First-Mile Conveyor Logistics', value: logisticsSavings, color: '#5B8C6A', sublabel: 'Truck hauling distance reduction', unit: 'tCO2e' },
    ];
  }, [em]);

  // Achievement milestones (Section 21)
  const milestoneSteps = [
    { label: 'Baseline Established', date: 'FY21 Baseline', done: true, note: `${mine.baselineIntensityTco2e.toFixed(4)} t/t locked` },
    { label: 'Data Verified', date: 'Q3 FY25', done: true, note: 'DGMS & Sentinel-2 audited' },
    { label: 'Pathway Approved', date: 'Q4 FY25', done: true, note: 'Ministry statutory approval' },
    { label: 'First Intervention Completed', date: 'Q1 FY26', done: true, note: 'Captive solar & VFD pumps' },
    { label: 'Target Milestone', date: 'FY28 Interim', done: false, note: '25% reduction check' },
    { label: 'Net-Zero Pathway', date: '2030 Mandate', done: false, note: `${mine.targetReductionPct}% statutory target` },
  ];

  return (
    <div className="space-y-6 max-w-5xl animate-fadeIn font-sans">
      {/* Header */}
      <div className="pb-2 border-b border-[#E2E5E9]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B8C6A] block">
          EXECUTIVE PERFORMANCE AUDIT
        </span>
        <h2 className="text-base font-bold text-[#25282C]">
          Colliery Decarbonization Progress & Target Tracking
        </h2>
        <p className="text-xs text-[#64748B]">
          Audited statutory trajectory, cumulative abatement milestones, and performance diagnostics for {mine.name}
        </p>
      </div>

      {/* ==============================================================
          1. PROGRESS TOP KPI SECTION (Section 16)
          ============================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-[#E2E5E9] rounded-lg shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#64748B] block tracking-wider">
            OVERALL REDUCTION
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-[#3F7D58] font-mono">
              -{currentReductionPct}%
            </span>
          </div>
          <span className="text-[11px] text-[#64748B] mt-1 block">
            Against FY21 colliery baseline
          </span>
        </div>

        <div className="p-4 bg-white border border-[#E2E5E9] rounded-lg shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
            TARGET ACHIEVEMENT
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-[#25282C] font-mono">
              {targetAchievementPct}%
            </span>
          </div>
          <span className="text-[11px] text-[#3F7D58] mt-1 block font-medium">
            Of 2030 target ({targetReductionPct}%)
          </span>
        </div>

        <div className="p-4 bg-white border border-[#E2E5E9] rounded-lg shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
            CO2e REDUCED
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-[#3F7D58] font-mono">
              {totalCo2eReduced.toLocaleString()}
            </span>
            <span className="text-xs text-[#64748B]">tCO2e</span>
          </div>
          <span className="text-[11px] text-[#64748B] mt-1 block">
            Cumulative abatement achieved
          </span>
        </div>

        <div className="p-4 bg-white border border-[#E2E5E9] rounded-lg shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
            TARGET STATUS
          </span>
          <div className="mt-1">
            <span className="text-xl font-extrabold text-[#3F7D58] uppercase font-mono">
              {mine.targetStatus.replace('_', ' ')}
            </span>
          </div>
          <div className="w-full bg-[#E2E5E9] rounded-full h-2 mt-2.5 overflow-hidden">
            <div
              className="bg-[#5B8C6A] h-full rounded-full"
              style={{ width: `${targetAchievementPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ==============================================================
          2. MAIN CHART: TARGET VS ACTUAL REDUCTION (Section 17)
          ============================================================== */}
      <div className="bg-white p-6 rounded-lg border border-[#E2E5E9] shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#E2E5E9]">
          <div>
            <h3 className="text-sm font-bold text-[#25282C]">
              TARGET VS ACTUAL REDUCTION TRAJECTORY
            </h3>
            <p className="text-xs text-[#64748B]">
              Multi-quarter trajectory tracking reported colliery reduction percentage against mandated statutory trajectory.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded font-bold uppercase bg-[#EDF5F0] text-[#3F7D58] border border-[#CDE3D5]">
            +1.7% Ahead of Target
          </span>
        </div>

        {/* Large Interactive Target vs Actual Visualization */}
        <div className="relative pt-4 pb-2 select-none">
          <div className="h-56 w-full flex items-end justify-between gap-3 relative">
            {/* Grid horizontal guidelines */}
            <div className="absolute inset-x-0 top-0 border-b border-[#E2E5E9]/60" />
            <div className="absolute inset-x-0 top-1/2 border-b border-[#E2E5E9]/60" />
            <div className="absolute inset-x-0 bottom-8 border-b border-[#CBD5E1]" />

            {trajectoryData.map((pt, idx) => {
              const maxScale = 25; // max scale 25%
              const targetH = (pt.targetPct / maxScale) * 160;
              const actualH = (pt.actualPct / maxScale) * 160;
              const isHovered = activeReductionHover === idx;

              return (
                <div
                  key={pt.month}
                  onMouseEnter={() => setActiveReductionHover(idx)}
                  onMouseLeave={() => setActiveReductionHover(null)}
                  className="flex-1 flex flex-col items-center justify-end h-full relative cursor-pointer group"
                >
                  {/* Interactive Floating Tooltip (Section 17) */}
                  {isHovered && (
                    <div className="absolute -top-16 z-30 bg-[#25282C] text-white p-2.5 rounded-md shadow-xl text-xs whitespace-nowrap border border-[#3E444B] animate-fadeIn">
                      <div className="font-bold text-[11px] pb-1 border-b border-[#3E444B]">
                        {pt.month}
                      </div>
                      <div className="flex justify-between gap-3 text-[11px] pt-1 font-mono">
                        <span className="text-[#94A3B8]">Target: {pt.targetPct}%</span>
                        <span className="text-[#A3D0B0] font-bold">Actual: {pt.actualPct}%</span>
                      </div>
                      <div className="text-[10px] text-[#A3D0B0] pt-0.5 font-bold">
                        Status: {pt.delta}
                      </div>
                    </div>
                  )}

                  {/* Dual Bar Graphic */}
                  <div className="flex items-end gap-1.5 mb-8">
                    {/* Target Bar */}
                    <div
                      style={{ height: `${targetH}px` }}
                      className="w-3 sm:w-4 bg-[#D99A2B]/40 rounded-t-sm border border-dashed border-[#D99A2B]"
                      title={`Target: ${pt.targetPct}%`}
                    />
                    {/* Actual Bar */}
                    <div
                      style={{ height: `${actualH}px` }}
                      className={`w-4 sm:w-6 rounded-t-sm transition-all duration-300 ${
                        pt.actualPct >= pt.targetPct ? 'bg-[#5B8C6A]' : 'bg-[#C65353]'
                      } ${isHovered ? 'ring-2 ring-[#25282C]' : ''}`}
                    />
                  </div>

                  {/* X Axis Label */}
                  <span className={`text-[10px] font-medium text-center truncate max-w-full ${
                    isHovered ? 'font-bold text-[#25282C]' : 'text-[#64748B]'
                  }`}>
                    {pt.month}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-[#64748B] pt-3 border-t border-[#F1F3F5]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded-xs bg-[#5B8C6A]" />
                <span className="text-[#25282C] font-semibold">Actual Reduction Achieved</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded-xs bg-[#D99A2B]/40 border border-dashed border-[#D99A2B]" />
                <span className="text-[#D99A2B] font-semibold">Statutory Target Trajectory</span>
              </span>
            </div>
            <span className="text-[11px] font-mono">
              Current: <strong className="text-[#3F7D58]">+{currentReductionPct}%</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ==============================================================
          3. EMISSIONS TREND & REDUCTION BY SOURCE (Section 18 & 19)
          ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Historical Emissions Trend (Section 18) */}
        <div className="bg-white p-5 rounded-lg border border-[#E2E5E9] shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E5E9]">
            <h3 className="text-sm font-bold text-[#25282C]">
              EMISSIONS TREND OVER TIME
            </h3>
            <span className="text-xs text-[#64748B]">Quarterly Gross tCO2e</span>
          </div>

          <TrendLineChart
            data={historicalTrend}
            unit="tCO2e"
            lineColor="#5B8C6A"
            benchmarkLabel="Target Path"
            height={160}
          />
        </div>

        {/* Reduction by Source (Section 19) */}
        <div className="bg-white p-5 rounded-lg border border-[#E2E5E9] shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E5E9]">
            <h3 className="text-sm font-bold text-[#25282C]">
              REDUCTION ACHIEVED BY SOURCE
            </h3>
            <span className="text-xs text-[#64748B]">Abatement Distribution</span>
          </div>

          <HorizontalBarChart
            items={reductionSources}
            unit="tCO2e"
          />
        </div>
      </div>

      {/* ==============================================================
          4. CONCISE INSIGHT PARAGRAPHS (Section 20)
          ============================================================== */}
      <div className="bg-white p-5 rounded-lg border border-[#E2E5E9] shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-[#E2E5E9]">
          <Sparkles className="w-4 h-4 text-[#5B8C6A]" />
          <h3 className="text-sm font-bold text-[#25282C]">
            KEY PERFORMANCE INSIGHTS
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-[#F8F9FA] rounded-md border border-[#E2E5E9] space-y-1">
            <span className="text-[10px] font-bold text-[#3F7D58] uppercase block">Diesel Abatement</span>
            <p className="text-[#343A40] leading-relaxed">
              "Emissions have declined consistently over the last three reporting periods, with the largest improvement coming from reduced diesel consumption."
            </p>
          </div>

          <div className="p-3 bg-[#F8F9FA] rounded-md border border-[#E2E5E9] space-y-1">
            <span className="text-[10px] font-bold text-[#397D8A] uppercase block">Trajectory Status</span>
            <p className="text-[#343A40] leading-relaxed">
              "The mine is currently 1.7% ahead of its annual reduction trajectory, exceeding statutory interim milestones."
            </p>
          </div>

          <div className="p-3 bg-[#F8F9FA] rounded-md border border-[#E2E5E9] space-y-1">
            <span className="text-[10px] font-bold text-[#D99A2B] uppercase block">Electricity Focus</span>
            <p className="text-[#343A40] leading-relaxed">
              "Electricity-related emissions remain the second-largest reduction opportunity, addressable through scheduled captive solar deployment."
            </p>
          </div>
        </div>
      </div>

      {/* ==============================================================
          5. ACHIEVEMENT TIMELINE (Section 21)
          ============================================================== */}
      <div className="bg-white p-5 rounded-lg border border-[#E2E5E9] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E5E9]">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#5B8C6A]" />
            <h3 className="text-sm font-bold text-[#25282C]">
              DECARBONIZATION ACHIEVEMENT TIMELINE
            </h3>
          </div>
          <span className="text-xs text-[#64748B]">Audited Milestones</span>
        </div>

        {/* Milestone Steps Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
          {milestoneSteps.map((step, idx) => (
            <div
              key={step.label}
              className={`p-3 rounded-md border text-xs flex flex-col justify-between space-y-1.5 ${
                step.done
                  ? 'bg-[#EDF5F0] border-[#CDE3D5]'
                  : 'bg-[#F8F9FA] border-[#E2E5E9]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono font-bold uppercase ${
                  step.done ? 'text-[#3F7D58]' : 'text-[#64748B]'
                }`}>
                  {step.date}
                </span>
                {step.done ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3F7D58]" />
                ) : (
                  <CircleDot className="w-3.5 h-3.5 text-[#64748B]" />
                )}
              </div>

              <div>
                <strong className={`block text-xs leading-snug ${
                  step.done ? 'text-[#25282C]' : 'text-[#64748B]'
                }`}>
                  {step.label}
                </strong>
                <span className="text-[10px] text-[#64748B] block mt-0.5">
                  {step.note}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==============================================================
          6. DETAILED DATA & MATRIX ANALYSIS ACCORDION (Section 22)
          ============================================================== */}
      <div className="bg-white rounded-lg border border-[#E2E5E9] shadow-xs overflow-hidden">
        <button
          onClick={() => setShowDetailedMatrix(!showDetailedMatrix)}
          className="w-full p-4 bg-[#F8F9FA] hover:bg-[#F1F3F5] flex items-center justify-between text-left cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#5B8C6A]" />
            <div>
              <span className="text-xs font-bold text-[#25282C] uppercase tracking-wider block">
                Detailed Data & Marginal Abatement Cost-Impact Matrix
              </span>
              <span className="text-[11px] text-[#64748B]">
                Inspect quadrant categorization (High Impact / Low Cost vs Capital Heavy)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#5B8C6A]">
            <span>{showDetailedMatrix ? 'Hide Details' : 'View Detailed Data'}</span>
            {showDetailedMatrix ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {showDetailedMatrix && (
          <div className="p-6 border-t border-[#E2E5E9] space-y-4 animate-fadeIn">
            <CostImpactMatrix
              interventions={interventions}
              selectedInterventionIds={selectedInterventionIds}
              onToggleSelectIntervention={onToggleSelectIntervention}
            />
          </div>
        )}
      </div>
    </div>
  );
};
