import React, { useState, useMemo } from 'react';
import { DecarbonizationIntervention, MineRecord } from '../types';
import {
  Calendar,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Clock,
  Sparkles,
  Milestone,
  ShieldCheck,
  GripVertical,
  AlertTriangle,
  RotateCcw,
  Zap,
  Sun,
  Truck,
  Leaf,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sliders,
  DollarSign,
  BarChart3,
  Flame,
  Check,
  Plus,
  Info,
  Target,
  CircleDot
} from 'lucide-react';

interface ScheduledIntervention extends DecarbonizationIntervention {
  scheduledYear: number;
  implementationQuarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  isCustomRescheduled?: boolean;
}

interface CarbonNeutralityRoadmapProps {
  mine: MineRecord;
  selectedInterventions: DecarbonizationIntervention[];
  allRecommendations?: DecarbonizationIntervention[];
  onToggleIntervention?: (interventionId: string) => void;
  projectedEmissions?: number;
  projectedReductionPct?: number;
}

// Available timeline horizon years
const TIMELINE_YEARS = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035];
const STATUTORY_TARGET_YEAR = 2030;

// Default initial schedule mapper
function getInitialYear(item: DecarbonizationIntervention, index: number): number {
  if (item.category === 'efficiency' || item.category === 'water') return 2027;
  if (item.category === 'solar') return 2028;
  if (item.category === 'conveyor') return 2029;
  if (item.category === 'methane') return 2028;
  if (item.category === 'reclamation') return 2030;
  if (item.category === 'electrification') return 2031;
  return 2027 + (index % 5);
}

// Get standardized phase status (Requirement 9)
function getPhaseStatus(year: number, index: number): { label: string; icon: string; bg: string; text: string; border: string; dotColor: string } {
  if (year <= 2026 || index === 0) {
    return {
      label: 'COMPLETED',
      icon: '✓',
      bg: 'bg-[#EDF5F0]',
      text: 'text-[#3F7D58]',
      border: 'border-[#CDE3D5]',
      dotColor: 'bg-[#3F7D58]',
    };
  }
  if (year <= 2027 || index === 1) {
    return {
      label: 'IN PROGRESS',
      icon: '●',
      bg: 'bg-[#EBF4F6]',
      text: 'text-[#397D8A]',
      border: 'border-[#C5DFE3]',
      dotColor: 'bg-[#397D8A]',
    };
  }
  return {
    label: 'PLANNED',
    icon: '○',
    bg: 'bg-[#F8F9FA]',
    text: 'text-[#64748B]',
    border: 'border-[#E2E5E9]',
    dotColor: 'bg-[#94A3B8]',
  };
}

export const CarbonNeutralityRoadmap: React.FC<CarbonNeutralityRoadmapProps> = ({
  mine,
  selectedInterventions,
  allRecommendations = [],
  onToggleIntervention,
}) => {
  const currentEmissions = mine.emissions.totalGrossEmissions;
  const currentIntensity = mine.emissions.carbonIntensityTco2ePerTonne;
  const targetYear = mine.targetYear || STATUTORY_TARGET_YEAR;
  const targetReductionPct = mine.targetReductionPct || 35.0;

  // Pool of interventions to display on timeline
  const activePool = useMemo(() => {
    if (selectedInterventions.length > 0) return selectedInterventions;
    if (allRecommendations.length > 0) return allRecommendations.slice(0, 5);
    return [];
  }, [selectedInterventions, allRecommendations]);

  // Scheduled interventions state with draggable years
  const [scheduledItems, setScheduledItems] = useState<ScheduledIntervention[]>(() => {
    return activePool.map((item, idx) => ({
      ...item,
      scheduledYear: getInitialYear(item, idx),
      implementationQuarter: idx % 2 === 0 ? 'Q2' : 'Q4',
      isCustomRescheduled: false,
    }));
  });

  // Drag and drop tracking state
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverYear, setDragOverYear] = useState<number | null>(null);
  const [dragOverCardId, setDragOverCardId] = useState<string | null>(null);
  const [activeViewMode, setActiveViewMode] = useState<'journey_timeline' | 'annual_grid' | 'trajectory_curve'>('journey_timeline');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Sync state if activePool changes and scheduledItems is empty
  React.useEffect(() => {
    if (scheduledItems.length === 0 && activePool.length > 0) {
      setScheduledItems(
        activePool.map((item, idx) => ({
          ...item,
          scheduledYear: getInitialYear(item, idx),
          implementationQuarter: idx % 2 === 0 ? 'Q2' : 'Q4',
          isCustomRescheduled: false,
        }))
      );
    }
  }, [activePool, scheduledItems.length]);

  // Reschedule an intervention to a specific year
  const handleReschedule = (itemId: string, newYear: number) => {
    if (newYear < 2026 || newYear > 2035) return;
    setScheduledItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, scheduledYear: newYear, isCustomRescheduled: true }
          : item
      )
    );
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, itemId: string) => {
    e.dataTransfer.setData('text/plain', itemId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItemId(itemId);
  };

  const handleDragOverYearSlot = (e: React.DragEvent<HTMLDivElement>, year: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverYear !== year) {
      setDragOverYear(year);
    }
  };

  const handleDragOverCardSlot = (e: React.DragEvent<HTMLDivElement>, cardId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCardId !== cardId) {
      setDragOverCardId(cardId);
    }
  };

  const handleDropOnYear = (e: React.DragEvent<HTMLDivElement>, year: number) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain') || draggedItemId;
    if (itemId) {
      handleReschedule(itemId, year);
    }
    setDraggedItemId(null);
    setDragOverYear(null);
    setDragOverCardId(null);
  };

  const handleDropOnCard = (e: React.DragEvent<HTMLDivElement>, targetItem: ScheduledIntervention) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain') || draggedItemId;
    if (itemId && itemId !== targetItem.id) {
      handleReschedule(itemId, targetItem.scheduledYear);
    }
    setDraggedItemId(null);
    setDragOverYear(null);
    setDragOverCardId(null);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDragOverYear(null);
    setDragOverCardId(null);
  };

  // Scenario Presets
  const handleApplyFastTrack = () => {
    setScheduledItems(prev =>
      prev.map(item => {
        let year = item.scheduledYear;
        if (item.category === 'solar') year = 2027;
        else if (item.category === 'conveyor') year = 2028;
        else if (item.category === 'electrification') year = 2029;
        else if (item.category === 'methane') year = 2027;
        else if (item.category === 'efficiency') year = 2026;
        else if (item.category === 'reclamation') year = 2028;
        return { ...item, scheduledYear: Math.max(2026, year), isCustomRescheduled: true };
      })
    );
  };

  const handleApplyBalancedCapEx = () => {
    const yearsSpread = [2027, 2028, 2029, 2030, 2031, 2032];
    setScheduledItems(prev =>
      prev.map((item, idx) => ({
        ...item,
        scheduledYear: yearsSpread[idx % yearsSpread.length],
        isCustomRescheduled: true,
      }))
    );
  };

  const handleResetBaseline = () => {
    setScheduledItems(
      activePool.map((item, idx) => ({
        ...item,
        scheduledYear: getInitialYear(item, idx),
        implementationQuarter: idx % 2 === 0 ? 'Q2' : 'Q4',
        isCustomRescheduled: false,
      }))
    );
  };

  const handleSaveScenario = () => {
    setSaveSuccessMessage('Rescheduled timeline scenario recorded in local colliery decarbonization ledger.');
    setTimeout(() => setSaveSuccessMessage(null), 4000);
  };

  // ==============================================================
  // DYNAMIC TARGET & TRAJECTORY SIMULATION
  // ==============================================================

  // Annual calculation from 2026 to 2035
  const yearlyTrajectory = useMemo(() => {
    return TIMELINE_YEARS.map(year => {
      const activeUpToYear = scheduledItems.filter(item => item.scheduledYear <= year);
      
      const totalReductionTco2e = activeUpToYear.reduce(
        (sum, item) => sum + item.potentialReductionTco2e,
        0
      );

      const cumPct = Math.min(
        92.0,
        Math.round((mine.currentReductionPct + (totalReductionTco2e / (currentEmissions || 1)) * 100) * 10) / 10
      );

      const remainingEmissions = Math.max(
        0,
        Math.round(currentEmissions * (1 - cumPct / 100))
      );

      const remainingIntensity =
        mine.operational.coalExtractedTonnes > 0
          ? remainingEmissions / mine.operational.coalExtractedTonnes
          : currentIntensity * (1 - cumPct / 100);

      const yearCapExCrores = scheduledItems
        .filter(item => item.scheduledYear === year)
        .reduce((sum, item) => sum + item.estimatedInvestmentCrores, 0);

      const yearSavingsCrores = activeUpToYear.reduce(
        (sum, item) => sum + item.annualSavingsCrores,
        0
      );

      return {
        year,
        activeInterventionsCount: activeUpToYear.length,
        newInterventionsCount: scheduledItems.filter(item => item.scheduledYear === year).length,
        cumReductionPct: cumPct,
        totalReductionTco2e,
        remainingEmissions,
        remainingIntensity,
        yearCapExCrores: Math.round(yearCapExCrores * 10) / 10,
        yearSavingsCrores: Math.round(yearSavingsCrores * 10) / 10,
        isMilestoneYear: year === STATUTORY_TARGET_YEAR,
      };
    });
  }, [scheduledItems, mine, currentEmissions, currentIntensity]);

  // 2030 Statutory Mandate Trajectory Assessment
  const sim2030 = useMemo(() => {
    const data2030 = yearlyTrajectory.find(y => y.year === STATUTORY_TARGET_YEAR);
    const achievedPct = data2030 ? data2030.cumReductionPct : mine.currentReductionPct;
    const diff = Math.round((achievedPct - targetReductionPct) * 10) / 10;
    
    let status: 'ahead' | 'on_track' | 'behind' | 'critical' = 'on_track';
    if (diff >= 3.0) status = 'ahead';
    else if (diff >= 0) status = 'on_track';
    else if (diff >= -5.0) status = 'behind';
    else status = 'critical';

    return {
      achievedPct,
      targetReductionPct,
      diff,
      status,
      remainingEmissions: data2030?.remainingEmissions || currentEmissions,
      remainingIntensity: data2030?.remainingIntensity || currentIntensity,
    };
  }, [yearlyTrajectory, targetReductionPct, mine.currentReductionPct, currentEmissions, currentIntensity]);

  // Total CapEx across all scheduled interventions
  const totalCapEx = useMemo(() => {
    return scheduledItems.reduce((sum, i) => sum + i.estimatedInvestmentCrores, 0);
  }, [scheduledItems]);

  const hasCustomChanges = useMemo(() => {
    return scheduledItems.some(i => i.isCustomRescheduled);
  }, [scheduledItems]);

  // Chronologically sorted items for Decarbonization Journey Sequence (Requirements 4, 5, 6)
  const journeyPhases = useMemo(() => {
    return [...scheduledItems].sort((a, b) => a.scheduledYear - b.scheduledYear);
  }, [scheduledItems]);

  // Category visual metadata
  const getCategoryMeta = (cat: string) => {
    switch (cat) {
      case 'solar':
        return { icon: Sun, color: 'text-[#D99A2B]', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Solar & Clean Power' };
      case 'electrification':
        return { icon: Zap, color: 'text-[#397D8A]', bg: 'bg-[#EBF4F6]', border: 'border-[#C5DFE3]', label: 'Electric Haulage' };
      case 'conveyor':
        return { icon: Truck, color: 'text-[#5B8C6A]', bg: 'bg-[#EDF5F0]', border: 'border-[#CDE3D5]', label: 'FMC Belt Conveyor' };
      case 'methane':
        return { icon: Flame, color: 'text-[#C65353]', bg: 'bg-red-50', border: 'border-red-200', label: 'CMM & VAM Capture' };
      case 'efficiency':
        return { icon: Sliders, color: 'text-[#397D8A]', bg: 'bg-[#EBF4F6]', border: 'border-[#C5DFE3]', label: 'Energy Efficiency' };
      case 'reclamation':
        return { icon: Leaf, color: 'text-[#5B8C6A]', bg: 'bg-[#EDF5F0]', border: 'border-[#CDE3D5]', label: 'OB Afforestation' };
      default:
        return { icon: Layers, color: 'text-[#64748B]', bg: 'bg-[#F8F9FA]', border: 'border-[#E2E5E9]', label: 'Decarbonization' };
    }
  };

  return (
    <div className="space-y-6 max-w-6xl font-sans text-[#25282C]">
      {/* ==============================================================
          1. ROADMAP HEADER & COMPACT EXECUTIVE KPIS (Requirement 8)
          ============================================================== */}
      <div className="bg-white border border-[#E2E5E9] rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#E2E5E9]">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-[#EDF5F0] border border-[#CDE3D5] flex items-center justify-center text-[#5B8C6A] shrink-0">
                <Milestone className="w-4 h-4 text-[#5B8C6A]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#25282C] tracking-tight uppercase">
                  MY DECARBONIZATION ROADMAP
                </h3>
                <p className="text-xs text-[#64748B]">
                  Colliery: <strong className="text-[#25282C]">{mine.name}</strong> ({mine.code}) · Strategic multi-year decarbonization journey from operational baseline to 2030 statutory target.
                </p>
              </div>
            </div>
          </div>

          {/* Scenario Preset Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleApplyFastTrack}
              className="px-2.5 py-1.5 text-xs font-semibold rounded bg-[#EBF4F6] text-[#397D8A] hover:bg-[#D5EAF0] border border-[#C5DFE3] transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Move high-impact interventions earlier to beat 2030 mandate"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Fast-Track Plan</span>
            </button>

            <button
              onClick={handleApplyBalancedCapEx}
              className="px-2.5 py-1.5 text-xs font-semibold rounded bg-[#F1F3F5] text-[#25282C] hover:bg-[#E2E5E9] border border-[#E2E5E9] transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Spread capital spend evenly across the timeline"
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Balanced CapEx</span>
            </button>

            {hasCustomChanges && (
              <button
                onClick={handleResetBaseline}
                className="px-2.5 py-1.5 text-xs font-semibold rounded bg-white text-[#64748B] hover:text-[#C65353] hover:bg-red-50 border border-[#E2E5E9] transition-colors flex items-center gap-1 cursor-pointer"
                title="Revert all interventions to baseline schedule"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            <button
              onClick={handleSaveScenario}
              className="px-3 py-1.5 text-xs font-semibold rounded bg-[#5B8C6A] hover:bg-[#3F7D58] text-white transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Scenario</span>
            </button>
          </div>
        </div>

        {/* Save confirmation toast */}
        {saveSuccessMessage && (
          <div className="p-2.5 bg-[#EDF5F0] border border-[#CDE3D5] rounded-md text-xs text-[#3F7D58] font-medium flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-[#3F7D58]" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}

        {/* Compact Executive KPIs (Requirement 8: Current Emissions, Target Reduction, Projected Reduction, Target Year, Investment) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1 text-xs">
          {/* KPI 1: Current Emissions */}
          <div className="p-3 bg-[#F8F9FA] rounded-md border border-[#E2E5E9] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
              Current Emissions
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold font-tabular text-[#25282C]">
                {Math.round(currentEmissions).toLocaleString()}
              </span>
              <span className="text-[#64748B] text-[10px]">tCO2e/yr</span>
            </div>
            <span className="text-[10px] text-[#64748B] block truncate">
              Intensity: {currentIntensity.toFixed(4)} t/t
            </span>
          </div>

          {/* KPI 2: Target Reduction */}
          <div className="p-3 bg-[#F8F9FA] rounded-md border border-[#E2E5E9] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
              Target Reduction
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold font-tabular text-[#C65353]">
                -{targetReductionPct.toFixed(1)}%
              </span>
            </div>
            <span className="text-[10px] text-[#64748B] block truncate">
              Statutory cap by {targetYear}
            </span>
          </div>

          {/* KPI 3: Projected Reduction */}
          <div className="p-3 bg-[#F8F9FA] rounded-md border border-[#E2E5E9] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
                Projected Reduction
              </span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                sim2030.status === 'ahead' || sim2030.status === 'on_track'
                  ? 'bg-[#EDF5F0] text-[#3F7D58]'
                  : 'bg-amber-100 text-amber-900'
              }`}>
                {sim2030.status === 'ahead' ? 'Ahead' : sim2030.status === 'on_track' ? 'On Track' : 'Deficit'}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold font-tabular text-[#3F7D58]">
                -{sim2030.achievedPct.toFixed(1)}%
              </span>
            </div>
            <span className={`text-[10px] block truncate font-medium ${
              sim2030.diff >= 0 ? 'text-[#3F7D58]' : 'text-[#C65353]'
            }`}>
              {sim2030.diff >= 0 ? `+${sim2030.diff.toFixed(1)}% surplus` : `${sim2030.diff.toFixed(1)}% deficit`}
            </span>
          </div>

          {/* KPI 4: Target Year */}
          <div className="p-3 bg-[#F8F9FA] rounded-md border border-[#E2E5E9] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
              Target Year
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold font-tabular text-[#25282C]">
                {targetYear}
              </span>
              <span className="text-[#397D8A] text-[10px] font-semibold">Mandate</span>
            </div>
            <span className="text-[10px] text-[#64748B] block truncate">
              Target intensity: {mine.targetIntensityTco2e.toFixed(4)}
            </span>
          </div>

          {/* KPI 5: Investment */}
          <div className="p-3 bg-[#F8F9FA] rounded-md border border-[#E2E5E9] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
              Investment (CapEx)
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold font-tabular text-[#25282C]">
                ₹{totalCapEx.toFixed(1)}
              </span>
              <span className="text-[#64748B] text-[10px]">Crores</span>
            </div>
            <span className="text-[10px] text-[#397D8A] block truncate font-medium">
              {scheduledItems.length} Interventions Active
            </span>
          </div>
        </div>
      </div>

      {/* ==============================================================
          2. DECARBONIZATION JOURNEY PROGRESSION BAR (Requirement 4)
          CURRENT STATE → PLANNED INTERVENTIONS → IMPLEMENTATION → REDUCTION → TARGET
          ============================================================== */}
      <div className="bg-white border border-[#E2E5E9] rounded-lg p-3.5 shadow-xs">
        <div className="flex items-center justify-between text-[11px] font-semibold text-[#64748B] overflow-x-auto pb-1 gap-2">
          <div className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded bg-[#F8F9FA] border border-[#E2E5E9] text-[#25282C]">
            <span className="w-2 h-2 rounded-full bg-[#397D8A]" />
            <span className="font-bold uppercase tracking-wider">CURRENT STATE</span>
            <span className="text-[10px] font-mono text-[#64748B]">({Math.round(currentEmissions).toLocaleString()} tCO2e)</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />

          <div className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded bg-[#F8F9FA] border border-[#E2E5E9] text-[#25282C]">
            <span className="w-2 h-2 rounded-full bg-[#5B8C6A]" />
            <span className="font-bold uppercase tracking-wider">PLANNED INTERVENTIONS</span>
            <span className="text-[10px] font-mono text-[#64748B]">({scheduledItems.length} items)</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />

          <div className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded bg-[#F8F9FA] border border-[#E2E5E9] text-[#25282C]">
            <span className="w-2 h-2 rounded-full bg-[#D99A2B]" />
            <span className="font-bold uppercase tracking-wider">IMPLEMENTATION</span>
            <span className="text-[10px] font-mono text-[#64748B]">(2026–{targetYear})</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />

          <div className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded bg-[#F8F9FA] border border-[#E2E5E9] text-[#25282C]">
            <span className="w-2 h-2 rounded-full bg-[#3F7D58]" />
            <span className="font-bold uppercase tracking-wider">REDUCTION</span>
            <span className="text-[10px] font-mono text-[#3F7D58]">(-{sim2030.achievedPct.toFixed(1)}%)</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />

          <div className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded bg-[#EDF5F0] border border-[#CDE3D5] text-[#3F7D58]">
            <Target className="w-3 h-3 text-[#3F7D58]" />
            <span className="font-bold uppercase tracking-wider">TARGET MANDATE</span>
            <span className="text-[10px] font-mono font-bold text-[#3F7D58]">(-{targetReductionPct}%)</span>
          </div>
        </div>
      </div>

      {/* ==============================================================
          3. VIEW SWITCHER TABS
          ============================================================== */}
      <div className="flex items-center justify-between border-b border-[#E2E5E9] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveViewMode('journey_timeline')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeViewMode === 'journey_timeline'
                ? 'bg-[#25282C] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#25282C] bg-white border border-[#E2E5E9]'
            }`}
          >
            <Milestone className="w-3.5 h-3.5 text-[#5B8C6A]" />
            <span>Decarbonization Journey Sequence</span>
          </button>

          <button
            onClick={() => setActiveViewMode('annual_grid')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeViewMode === 'annual_grid'
                ? 'bg-[#25282C] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#25282C] bg-white border border-[#E2E5E9]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-[#397D8A]" />
            <span>Annual Horizon Grid (2026–2035)</span>
          </button>

          <button
            onClick={() => setActiveViewMode('trajectory_curve')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeViewMode === 'trajectory_curve'
                ? 'bg-[#25282C] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#25282C] bg-white border border-[#E2E5E9]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#397D8A]" />
            <span>Trajectory Curve & CapEx</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-[#64748B]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3F7D58]" /> ✓ Completed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#397D8A]" /> ● In Progress
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#94A3B8]" /> ○ Planned
          </span>
        </div>
      </div>

      {/* ==============================================================
          MODE 1: DECARBONIZATION JOURNEY TIMELINE (Requirements 4, 5, 6, 7, 9, 10, 11, 12, 13)
          ============================================================== */}
      {activeViewMode === 'journey_timeline' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Instructions banner with drag-and-drop indicator */}
          <div className="bg-[#EDF5F0]/60 border border-[#CDE3D5] rounded-md px-3.5 py-2.5 flex items-center justify-between text-xs text-[#25282C]">
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-[#5B8C6A] shrink-0" />
              <span>
                <strong>Interactive Decarbonization Journey:</strong> Drag and drop any Phase card to reschedule its commissioning year, or use the <strong>[◀] [▶]</strong> year adjusters on each card.
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#3F7D58] font-semibold hidden md:inline">
              Mandate Benchmark: -{targetReductionPct}% by {targetYear}
            </span>
          </div>

          {/* Visual Timeline Track Behind / Between the Phases (Requirement 5) */}
          <div className="relative">
            {/* Visual Backbone Guideline (Desktop: Horizontal, Mobile: Vertical) */}
            <div className="hidden lg:block absolute top-7 left-8 right-8 h-1 bg-[#E2E5E9] z-0 rounded-full">
              <div
                className="h-full bg-[#5B8C6A] rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(15, (sim2030.achievedPct / targetReductionPct) * 100))}%`
                }}
              />
            </div>

            {/* Start and Target Anchors */}
            <div className="hidden lg:flex items-center justify-between mb-4 px-2 text-xs">
              <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-md border border-[#E2E5E9] shadow-2xs z-10">
                <div className="w-2.5 h-2.5 rounded-full bg-[#397D8A]" />
                <span className="font-bold text-[#25282C]">CURRENT BASELINE</span>
                <span className="font-mono text-[#64748B]">FY21</span>
              </div>

              <div className="flex items-center gap-2 bg-[#EDF5F0] px-2.5 py-1 rounded-md border border-[#CDE3D5] shadow-2xs z-10 text-[#3F7D58]">
                <Target className="w-3.5 h-3.5 text-[#3F7D58]" />
                <span className="font-bold uppercase tracking-wider">{targetYear} STATUTORY TARGET (-{targetReductionPct}%)</span>
              </div>
            </div>

            {/* Grid of Phase Cards (Requirement 6, 7, 9, 10, 11, 12, 13) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
              {journeyPhases.map((item, idx) => {
                const phaseNum = String(idx + 1).padStart(2, '0');
                const phaseStatus = getPhaseStatus(item.scheduledYear, idx);
                const meta = getCategoryMeta(item.category);
                const Icon = meta.icon;
                const isDraggingThis = draggedItemId === item.id;
                const isDragTarget = dragOverCardId === item.id;

                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={e => handleDragStart(e, item.id)}
                    onDragOver={e => handleDragOverCardSlot(e, item.id)}
                    onDrop={e => handleDropOnCard(e, item)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white rounded-lg border transition-all duration-200 p-5 flex flex-col justify-between select-none relative group ${
                      isDraggingThis
                        ? 'opacity-40 scale-95 shadow-lg border-[#5B8C6A] ring-2 ring-[#5B8C6A]/30'
                        : isDragTarget
                        ? 'border-2 border-dashed border-[#5B8C6A] bg-[#EDF5F0]/70 shadow-md ring-2 ring-[#5B8C6A]/20 scale-101'
                        : 'border-[#E2E5E9] shadow-xs hover:shadow-md hover:border-[#5B8C6A] hover:-translate-y-0.5'
                    } ${item.isCustomRescheduled ? 'border-t-4 border-t-[#5B8C6A]' : ''}`}
                  >
                    {/* Top Row: Phase Indicator & Status Pill (Requirement 6 & 9) */}
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-[#F1F3F5] gap-2">
                        <div className="flex items-center gap-2">
                          <div className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-[#F1F3F5] text-[#8E97A2] group-hover:text-[#5B8C6A] transition-colors" title="Drag to reorder or reschedule">
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#5B8C6A] block">
                              PHASE {phaseNum}
                            </span>
                            <span className="text-[10px] text-[#64748B] font-mono block">
                              Commissioning Q{item.implementationQuarter || 'Q2'} {item.scheduledYear}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge (Requirement 9: ✓ COMPLETED, ● IN PROGRESS, ○ PLANNED) */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1 border ${phaseStatus.bg} ${phaseStatus.text} ${phaseStatus.border}`}>
                            <span>{phaseStatus.icon}</span>
                            <span>{phaseStatus.label}</span>
                          </span>
                        </div>
                      </div>

                      {/* Category Badge & Live Year Rescheduler */}
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold flex items-center gap-1 ${meta.bg} ${meta.color} border ${meta.border}`}>
                          <Icon className="w-3 h-3" />
                          <span>{meta.label}</span>
                        </span>

                        {/* Quick year stepper buttons */}
                        <div className="flex items-center gap-1 bg-[#F8F9FA] border border-[#E2E5E9] rounded p-0.5">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleReschedule(item.id, item.scheduledYear - 1);
                            }}
                            disabled={item.scheduledYear <= 2026}
                            className="w-4 h-4 rounded flex items-center justify-center text-[10px] bg-white hover:bg-[#E2E5E9] text-[#25282C] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Move 1 year earlier"
                          >
                            ◀
                          </button>
                          <span className="font-mono text-[10px] font-bold text-[#25282C] px-1">
                            {item.scheduledYear}
                          </span>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleReschedule(item.id, item.scheduledYear + 1);
                            }}
                            disabled={item.scheduledYear >= 2035}
                            className="w-4 h-4 rounded flex items-center justify-center text-[10px] bg-white hover:bg-[#E2E5E9] text-[#25282C] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Move 1 year later"
                          >
                            ▶
                          </button>
                        </div>
                      </div>

                      {/* Card Title (Requirement 6) */}
                      <h4 className="mt-2.5 text-sm font-bold text-[#25282C] leading-snug group-hover:text-[#1E2024] transition-colors">
                        {item.title}
                      </h4>

                      {/* Existing Description in short readable paragraphs (Requirement 6 & 10) */}
                      <p className="mt-2 text-xs text-[#64748B] leading-relaxed">
                        {item.description}
                      </p>

                      {/* Blockers / Prerequisite note */}
                      {item.blockers && (
                        <div className="mt-2 text-[10px] text-[#64748B] bg-[#F8F9FA] p-2 rounded border border-[#E2E5E9]/80 leading-normal">
                          <strong className="text-[#25282C]">Deployment Key:</strong> {item.blockers}
                        </div>
                      )}
                    </div>

                    {/* Divider & Key Metrics Hierarchy (Requirement 6) */}
                    <div className="mt-4 pt-3 border-t border-[#E2E5E9] space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {/* Expected Reduction */}
                        <div className="p-2 rounded bg-[#F8F9FA] border border-[#E2E5E9]/80">
                          <span className="text-[10px] text-[#64748B] uppercase font-bold block">
                            Expected Reduction
                          </span>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-sm font-extrabold text-[#3F7D58] font-mono">
                              -{item.potentialReductionPct}%
                            </span>
                          </div>
                          <span className="text-[10px] text-[#64748B] font-mono block">
                            -{item.potentialReductionTco2e.toLocaleString()} tCO2e/yr
                          </span>
                        </div>

                        {/* Investment */}
                        <div className="p-2 rounded bg-[#F8F9FA] border border-[#E2E5E9]/80">
                          <span className="text-[10px] text-[#64748B] uppercase font-bold block">
                            Investment
                          </span>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-sm font-extrabold text-[#25282C] font-mono">
                              ₹{item.estimatedInvestmentCrores} Cr
                            </span>
                          </div>
                          <span className="text-[10px] text-[#397D8A] font-medium block">
                            Payback: {item.paybackYears} yrs
                          </span>
                        </div>
                      </div>

                      {/* Timeline & Status Footer Row */}
                      <div className="flex items-center justify-between text-[11px] pt-1 text-[#64748B]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#94A3B8]" />
                          <span>Timeline: <strong>{item.timeMonths} months</strong></span>
                        </span>

                        <span className="flex items-center gap-1 font-medium">
                          <span>Status:</span>
                          <strong className={`capitalize ${phaseStatus.text}`}>
                            {phaseStatus.label.toLowerCase()}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODE 2: ANNUAL HORIZON GRID (2026–2035) (All existing columns & logic preserved)
          ============================================================== */}
      {activeViewMode === 'annual_grid' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Instructions banner */}
          <div className="bg-[#EDF5F0]/60 border border-[#CDE3D5] rounded-md px-3.5 py-2.5 flex items-center justify-between text-xs text-[#25282C]">
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-[#5B8C6A] shrink-0" />
              <span>
                <strong>Annual Horizon Grid:</strong> Drag interventions across the 10 calendar columns to assign commissioning years.
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#3F7D58] font-semibold hidden md:inline">
              Mandate Benchmark: -{targetReductionPct}% by {targetYear}
            </span>
          </div>

          {/* Timeline Grid (Horizontal scrolling year columns) */}
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[960px] grid grid-cols-10 gap-2.5">
              {TIMELINE_YEARS.map(year => {
                const is2030Milestone = year === STATUTORY_TARGET_YEAR;
                const isDragTarget = dragOverYear === year;
                const itemsInYear = scheduledItems.filter(i => i.scheduledYear === year);
                const yearCapEx = itemsInYear.reduce((s, i) => s + i.estimatedInvestmentCrores, 0);
                const yearTrajectoryPoint = yearlyTrajectory.find(y => y.year === year);

                return (
                  <div
                    key={year}
                    onDragOver={e => handleDragOverYearSlot(e, year)}
                    onDragLeave={() => setDragOverYear(null)}
                    onDrop={e => handleDropOnYear(e, year)}
                    className={`flex flex-col rounded-lg border transition-all min-h-[380px] ${
                      isDragTarget
                        ? 'border-2 border-dashed border-[#5B8C6A] bg-[#EDF5F0]'
                        : is2030Milestone
                        ? 'border-[#5B8C6A] bg-white ring-2 ring-[#5B8C6A]/20 shadow-xs'
                        : year <= 2030
                        ? 'border-[#E2E5E9] bg-white hover:border-[#CBD5E1]'
                        : 'border-[#E2E5E9] bg-[#F8F9FA]'
                    }`}
                  >
                    {/* Year Column Header */}
                    <div
                      className={`p-2.5 border-b rounded-t-lg text-center transition-colors ${
                        is2030Milestone
                          ? 'bg-[#25282C] text-white border-[#343A40]'
                          : isDragTarget
                          ? 'bg-[#5B8C6A] text-white border-[#3F7D58]'
                          : 'bg-[#F8F9FA] border-[#E2E5E9] text-[#25282C]'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-extrabold text-sm font-tabular">
                          {year}
                        </span>
                        {is2030Milestone && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-[#5B8C6A] text-white font-bold tracking-tight">
                            MANDATE
                          </span>
                        )}
                      </div>

                      {/* Cumulative metric pill */}
                      <div className="mt-1 text-[10px]">
                        <span className={`font-semibold ${is2030Milestone ? 'text-[#A3D0B0]' : 'text-[#3F7D58]'}`}>
                          -{yearTrajectoryPoint?.cumReductionPct || 0}%
                        </span>
                        <span className={`block text-[9px] ${is2030Milestone ? 'text-slate-300' : 'text-[#64748B]'}`}>
                          cum. reduction
                        </span>
                      </div>

                      {yearCapEx > 0 && (
                        <div className={`mt-1 text-[9px] font-mono px-1 py-0.5 rounded font-medium ${
                          is2030Milestone ? 'bg-[#343A40] text-white' : 'bg-white border border-[#E2E5E9] text-[#25282C]'
                        }`}>
                          ₹{yearCapEx.toFixed(1)} Cr CapEx
                        </div>
                      )}
                    </div>

                    {/* Drop Area & Interventions in this Year */}
                    <div className="p-2 flex-1 flex flex-col gap-2">
                      {itemsInYear.map(item => {
                        const meta = getCategoryMeta(item.category);
                        const isDraggingThis = draggedItemId === item.id;

                        return (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={e => handleDragStart(e, item.id)}
                            onDragEnd={handleDragEnd}
                            className={`p-2.5 rounded-md border text-xs bg-white cursor-grab active:cursor-grabbing transition-all select-none group relative shadow-xs hover:shadow-sm ${
                              isDraggingThis ? 'opacity-40 scale-95 border-[#5B8C6A]' : 'border-[#E2E5E9] hover:border-[#5B8C6A]'
                            } ${item.isCustomRescheduled ? 'border-l-4 border-l-[#5B8C6A]' : ''}`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <div className="flex items-center gap-1 overflow-hidden">
                                <GripVertical className="w-3 h-3 text-[#8E97A2] group-hover:text-[#5B8C6A] shrink-0" />
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold truncate ${meta.bg} ${meta.color}`}>
                                  {item.category.toUpperCase()}
                                </span>
                              </div>

                              <div className="flex items-center gap-0.5 opacity-90 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleReschedule(item.id, item.scheduledYear - 1);
                                  }}
                                  disabled={item.scheduledYear <= 2026}
                                  className="w-4 h-4 rounded flex items-center justify-center text-[10px] bg-[#F1F3F5] hover:bg-[#E2E5E9] text-[#25282C] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                  title="Move 1 year earlier"
                                >
                                  ◀
                                </button>
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleReschedule(item.id, item.scheduledYear + 1);
                                  }}
                                  disabled={item.scheduledYear >= 2035}
                                  className="w-4 h-4 rounded flex items-center justify-center text-[10px] bg-[#F1F3F5] hover:bg-[#E2E5E9] text-[#25282C] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                  title="Move 1 year later"
                                >
                                  ▶
                                </button>
                              </div>
                            </div>

                            <h5 className="font-bold text-[11px] text-[#25282C] line-clamp-2 leading-snug mb-1.5" title={item.title}>
                              {item.title}
                            </h5>

                            <div className="space-y-0.5 text-[10px] font-mono border-t border-[#F1F3F5] pt-1.5">
                              <div className="flex justify-between text-[#3F7D58] font-bold">
                                <span>CO2 cut:</span>
                                <span>-{item.potentialReductionPct}%</span>
                              </div>
                              <div className="flex justify-between text-[#64748B]">
                                <span>tCO2e:</span>
                                <span>{item.potentialReductionTco2e.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-[#25282C] font-semibold">
                                <span>CapEx:</span>
                                <span>₹{item.estimatedInvestmentCrores} Cr</span>
                              </div>
                            </div>

                            {item.isCustomRescheduled && (
                              <span className="block text-[8px] uppercase tracking-wider text-[#5B8C6A] font-bold mt-1 text-right">
                                • Rescheduled
                              </span>
                            )}
                          </div>
                        );
                      })}

                      {itemsInYear.length === 0 && (
                        <div
                          className={`flex-1 min-h-[120px] rounded border border-dashed flex flex-col items-center justify-center text-center p-2 text-[10px] transition-colors ${
                            isDragTarget
                              ? 'border-[#5B8C6A] bg-[#EDF5F0] text-[#3F7D58] font-semibold'
                              : 'border-[#E2E5E9] text-[#8E97A2]'
                          }`}
                        >
                          <span>{isDragTarget ? 'Drop here to schedule' : 'No interventions'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODE 3: TRAJECTORY CURVE & CAPEX PROGRESSION (All existing logic preserved)
          ============================================================== */}
      {activeViewMode === 'trajectory_curve' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white border border-[#E2E5E9] rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#25282C]">
                  Annual Trajectory & Milestone Projections (2026–2035)
                </h4>
                <p className="text-xs text-[#64748B]">
                  Simulated emission cuts and capital expenditure progression under current rescheduled timeline.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#F8F9FA] text-[#25282C] border border-[#E2E5E9]">
                Baseline: {mine.baselineIntensityTco2e.toFixed(4)} tCO2e/t
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {yearlyTrajectory.map(pt => {
                const pct = pt.cumReductionPct;
                const is2030 = pt.year === STATUTORY_TARGET_YEAR;
                const targetMet = pct >= targetReductionPct;

                return (
                  <div key={pt.year} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold font-tabular w-12 ${is2030 ? 'text-[#5B8C6A]' : 'text-[#25282C]'}`}>
                          {pt.year}
                        </span>
                        {is2030 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase bg-[#EDF5F0] text-[#3F7D58] border border-[#CDE3D5]">
                            2030 Mandate (-{targetReductionPct}%)
                          </span>
                        )}
                        <span className="text-[11px] text-[#64748B]">
                          Intensity: <strong className="text-[#25282C]">{pt.remainingIntensity.toFixed(4)}</strong> tCO2e/t
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-tabular">
                        <span className="text-[#64748B] hidden sm:inline">
                          Remaining: <strong className="text-[#25282C]">{pt.remainingEmissions.toLocaleString()}</strong> tCO2e
                        </span>
                        {pt.yearCapExCrores > 0 && (
                          <span className="text-[#397D8A] font-semibold">
                            CapEx: ₹{pt.yearCapExCrores} Cr
                          </span>
                        )}
                        <strong className={`font-bold text-xs ${pct >= targetReductionPct ? 'text-[#3F7D58]' : 'text-[#25282C]'}`}>
                          -{pct.toFixed(1)}%
                        </strong>
                      </div>
                    </div>

                    <div className="w-full h-3 bg-[#F1F3F5] rounded-full overflow-hidden relative border border-[#E2E5E9]">
                      <div
                        style={{ left: `${Math.min(100, targetReductionPct)}%` }}
                        className="absolute top-0 bottom-0 w-0.5 bg-[#C65353] z-10"
                        title={`Target Mandate: ${targetReductionPct}%`}
                      />

                      <div
                        style={{ width: `${Math.min(100, pct)}%` }}
                        className={`h-full transition-all duration-500 rounded-full ${
                          is2030
                            ? targetMet
                              ? 'bg-[#5B8C6A]'
                              : 'bg-[#D99A2B]'
                            : pct >= targetReductionPct
                            ? 'bg-[#3F7D58]'
                            : 'bg-[#397D8A]'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          4. RESCHEDULED INTERVENTIONS INVENTORY TABLE (Preserved 100%)
          ============================================================== */}
      <div className="bg-white border border-[#E2E5E9] rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-[#25282C] uppercase tracking-wider">
              Intervention Deployment Schedule & Target Recalculation
            </h4>
            <p className="text-xs text-[#64748B]">
              Directly adjust scheduled years or quarters below to simulate alternative commissioning windows.
            </p>
          </div>
          <span className="text-xs text-[#64748B] font-mono">
            {scheduledItems.length} Interventions Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9FA] border-b border-[#E2E5E9] text-[10px] text-[#64748B] uppercase font-semibold">
              <tr>
                <th className="p-3">Intervention Action</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-center">Scheduled Year</th>
                <th className="p-3 text-right">Potential CO2 Cut</th>
                <th className="p-3 text-right">CapEx (₹ Cr)</th>
                <th className="p-3 text-right">Annual Savings</th>
                <th className="p-3 text-center">2030 Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E5E9]">
              {scheduledItems.map(item => {
                const isPre2030 = item.scheduledYear <= STATUTORY_TARGET_YEAR;
                const meta = getCategoryMeta(item.category);
                const Icon = meta.icon;

                return (
                  <tr key={item.id} className="hover:bg-[#F8F9FA] transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${meta.color} shrink-0`} />
                        <div>
                          <strong className="text-[#25282C] block font-semibold">{item.title}</strong>
                          <span className="text-[10px] text-[#64748B] block">{item.blockers.substring(0, 65)}...</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold capitalize ${meta.bg} ${meta.color}`}>
                        {item.category}
                      </span>
                    </td>

                    {/* Interactive Year Selector */}
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-1 bg-[#F1F3F5] rounded p-1 border border-[#E2E5E9]">
                        <button
                          onClick={() => handleReschedule(item.id, item.scheduledYear - 1)}
                          disabled={item.scheduledYear <= 2026}
                          className="w-5 h-5 flex items-center justify-center text-xs font-bold text-[#25282C] hover:bg-white rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          ◀
                        </button>
                        <select
                          value={item.scheduledYear}
                          onChange={e => handleReschedule(item.id, parseInt(e.target.value, 10))}
                          className="bg-white border border-[#E2E5E9] rounded px-2 py-0.5 text-xs font-bold text-[#25282C] focus:outline-none focus:ring-1 focus:ring-[#5B8C6A] cursor-pointer"
                        >
                          {TIMELINE_YEARS.map(y => (
                            <option key={y} value={y}>
                              {y} {y === 2030 ? '(Target)' : ''}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleReschedule(item.id, item.scheduledYear + 1)}
                          disabled={item.scheduledYear >= 2035}
                          className="w-5 h-5 flex items-center justify-center text-xs font-bold text-[#25282C] hover:bg-white rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          ▶
                        </button>
                      </div>
                    </td>

                    <td className="p-3 text-right font-tabular">
                      <span className="font-bold text-[#3F7D58]">
                        -{item.potentialReductionPct}%
                      </span>
                      <span className="text-[10px] text-[#64748B] block">
                        -{item.potentialReductionTco2e.toLocaleString()} tCO2e
                      </span>
                    </td>

                    <td className="p-3 text-right font-tabular font-semibold text-[#25282C]">
                      ₹{item.estimatedInvestmentCrores} Cr
                    </td>

                    <td className="p-3 text-right font-tabular text-[#397D8A] font-semibold">
                      ₹{item.annualSavingsCrores} Cr/yr
                    </td>

                    <td className="p-3 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        isPre2030
                          ? 'bg-[#EDF5F0] text-[#3F7D58] border border-[#CDE3D5]'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {isPre2030 ? 'Counts in 2030' : 'Post-2030'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
