import React, { useState, useMemo } from 'react';
import { MineRecord } from '../types';
import { simulatorEngine, SimulatorInputs } from '../services/simulatorEngine';
import { recommendationEngine } from '../services/recommendationEngine';
import { 
  Sparkles, 
  Zap, 
  Sun, 
  Truck, 
  Flame, 
  TrendingDown, 
  DollarSign, 
  Layers, 
  Clock, 
  RotateCcw,
  CheckCircle2,
  TreePine,
  ShieldCheck,
  Award
} from 'lucide-react';

interface WhatIfSimulatorProps {
  mine: MineRecord;
  onApplySimulationToPlan?: (results: any) => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  mine,
  onApplySimulationToPlan,
}) => {
  const isUG = mine.mineType === 'underground' || mine.mineType === 'mixed';

  // Simulator Levers
  const [inputs, setInputs] = useState<SimulatorInputs>({
    solarAdoptionPct: 40,
    equipmentElectrificationPct: 30,
    energyEfficiencyPct: 15,
    methaneCapturePct: isUG ? 50 : 0,
    conveyorAdoptionPct: isUG ? 0 : 50,
    additionalAfforestationHa: 100,
  });

  // Budget Solver State
  const [userBudget, setUserBudget] = useState<number>(mine.sustainabilityBudgetCrores || 25.0);
  const [budgetSolverActive, setBudgetSolverActive] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<'custom' | 'max_reduction' | 'min_investment' | 'best_roi'>('custom');

  // Compute simulation outputs in real time
  const simResults = useMemo(() => {
    return simulatorEngine.simulate(mine, inputs);
  }, [mine, inputs]);

  // Compute budget optimization
  const budgetOptimization = useMemo(() => {
    return recommendationEngine.optimizeForBudget(mine, userBudget);
  }, [mine, userBudget]);

  // Single top priority intervention ("If I can only do ONE thing this year")
  const topSingleAction = useMemo(() => {
    return recommendationEngine.getTopSingleIntervention(mine);
  }, [mine]);

  const handlePresetSelect = (preset: 'max_reduction' | 'min_investment' | 'best_roi') => {
    setActivePreset(preset);
    const newInputs = simulatorEngine.getOptimizationPreset(preset, mine);
    setInputs(newInputs);
  };

  const handleInputChange = (field: keyof SimulatorInputs, val: number) => {
    setActivePreset('custom');
    setInputs(prev => ({
      ...prev,
      [field]: val,
    }));
  };

  const handleResetToBaseline = () => {
    setActivePreset('custom');
    setInputs({
      solarAdoptionPct: 0,
      equipmentElectrificationPct: 0,
      energyEfficiencyPct: 0,
      methaneCapturePct: 0,
      conveyorAdoptionPct: 0,
      additionalAfforestationHa: 0,
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6">
      {/* Header & Preset Switchers */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#166534]" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Interactive What-If Decarbonization Simulator
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Test policy, clean tech, and operational interventions in real-time for {mine.name}
          </p>
        </div>

        {/* 3 Optimization Presets */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-md text-xs font-medium">
          <button
            onClick={() => handlePresetSelect('max_reduction')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activePreset === 'max_reduction'
                ? 'bg-[#166534] text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Maximum CO2 Reduction
          </button>
          <button
            onClick={() => handlePresetSelect('min_investment')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activePreset === 'min_investment'
                ? 'bg-[#166534] text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Minimum Investment
          </button>
          <button
            onClick={() => handlePresetSelect('best_roi')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activePreset === 'best_roi'
                ? 'bg-[#166534] text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Best ROI
          </button>
        </div>
      </div>

      {/* Top Real-time Before / After Impact Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
            Current Baseline
          </span>
          <span className="text-lg font-bold text-slate-900 font-tabular block">
            {Math.round(simResults.baselineGrossEmissions).toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {simResults.baselineCarbonIntensity.toFixed(4)} t/t
          </span>
        </div>

        <div>
          <span className="text-[10px] text-emerald-800 uppercase font-bold block mb-1">
            Projected Footprint
          </span>
          <span className="text-lg font-bold text-[#166534] font-tabular block">
            {Math.round(simResults.projectedGrossEmissions).toLocaleString()}
          </span>
          <span className="text-[11px] text-emerald-700 font-mono font-semibold">
            {simResults.newCarbonIntensity.toFixed(4)} t/t
          </span>
        </div>

        <div>
          <span className="text-[10px] text-cyan-800 uppercase font-bold block mb-1">
            Emissions Abated
          </span>
          <span className="text-lg font-bold text-cyan-700 font-tabular block">
            -{Math.round(simResults.absoluteReductionTco2e).toLocaleString()}
          </span>
          <span className="text-[11px] text-cyan-700 font-semibold font-tabular">
            -{simResults.percentageReduction.toFixed(1)}% reduction
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
            Estimated CapEx
          </span>
          <span className="text-lg font-bold text-slate-800 font-tabular block">
            ₹{simResults.estimatedCapexCrores.toFixed(1)} Cr
          </span>
          <span className="text-[11px] text-slate-500 font-tabular">
            Total capital deployment
          </span>
        </div>

        <div className="col-span-2 md:col-span-1 bg-white p-2 rounded border border-slate-200">
          <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
            Annual OpEx Savings
          </span>
          <span className="text-base font-bold text-emerald-700 font-tabular block">
            ₹{simResults.annualOpexSavingsCrores.toFixed(1)} Cr / yr
          </span>
          <span className="text-[11px] text-slate-600 font-medium font-tabular">
            Payback: {simResults.simplePaybackYears.toFixed(1)} years
          </span>
        </div>
      </div>

      {/* Simulator Sliders & Levers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        {/* Lever 1: Solar Adoption */}
        <div className="p-3.5 bg-white border border-slate-200 rounded space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-500" /> Captive Solar Energy Adoption:
            </span>
            <span className="font-mono font-bold text-slate-900 font-tabular">
              {inputs.solarAdoptionPct}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={inputs.solarAdoptionPct}
            onChange={e => handleInputChange('solarAdoptionPct', parseInt(e.target.value))}
            className="w-full accent-[#166534] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0% (Grid only)</span>
            <span className="text-emerald-700 font-medium font-tabular">
              Displaces ~{Math.round(simResults.categoryReductions.electricityReductionTco2e).toLocaleString()} tCO2e/yr
            </span>
            <span>100% (100% RE)</span>
          </div>
        </div>

        {/* Lever 2: Fleet Electrification */}
        <div className="p-3.5 bg-white border border-slate-200 rounded space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-600" /> Equipment Fleet Electrification:
            </span>
            <span className="font-mono font-bold text-slate-900 font-tabular">
              {inputs.equipmentElectrificationPct}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={inputs.equipmentElectrificationPct}
            onChange={e => handleInputChange('equipmentElectrificationPct', parseInt(e.target.value))}
            className="w-full accent-[#166534] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0% (100% Diesel)</span>
            <span className="text-emerald-700 font-medium font-tabular">
              Saves ~{Math.round(simResults.categoryReductions.dieselReductionTco2e).toLocaleString()} tCO2e diesel
            </span>
            <span>100% (Electric Dumper / Shovel)</span>
          </div>
        </div>

        {/* Lever 3: Energy Efficiency */}
        <div className="p-3.5 bg-white border border-slate-200 rounded space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-emerald-600" /> Energy Efficiency & VFD Automation:
            </span>
            <span className="font-mono font-bold text-slate-900 font-tabular">
              {inputs.energyEfficiencyPct}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            step="2"
            value={inputs.energyEfficiencyPct}
            onChange={e => handleInputChange('energyEfficiencyPct', parseInt(e.target.value))}
            className="w-full accent-[#166534] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0% Baseline</span>
            <span className="text-emerald-700 font-medium">Motor upgrades, SCADA idle reduction</span>
            <span>30% Max EE</span>
          </div>
        </div>

        {/* Lever 4: First-Mile In-Pit Conveyor (OC) or Methane Capture (UG) */}
        {isUG ? (
          <div className="p-3.5 bg-white border border-slate-200 rounded space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-red-600" /> Coal Mine Methane (CMM) Capture & VAM:
              </span>
              <span className="font-mono font-bold text-slate-900 font-tabular">
                {inputs.methaneCapturePct}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={inputs.methaneCapturePct}
              onChange={e => handleInputChange('methaneCapturePct', parseInt(e.target.value))}
              className="w-full accent-[#166534] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0% (Vented)</span>
              <span className="text-emerald-700 font-medium font-tabular">
                Abates ~{Math.round(simResults.categoryReductions.methaneReductionTco2e).toLocaleString()} tCO2e fugitive CH4
              </span>
              <span>90% Captured</span>
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-white border border-slate-200 rounded space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-slate-600" /> In-Pit Overland Conveyor Shift:
              </span>
              <span className="font-mono font-bold text-slate-900 font-tabular">
                {inputs.conveyorAdoptionPct}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={inputs.conveyorAdoptionPct}
              onChange={e => handleInputChange('conveyorAdoptionPct', parseInt(e.target.value))}
              className="w-full accent-[#166534] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0% (All road trucks)</span>
              <span className="text-emerald-700 font-medium font-tabular">
                Saves ~{Math.round(simResults.categoryReductions.transportReductionTco2e).toLocaleString()} tCO2e freight
              </span>
              <span>100% First-Mile Belt</span>
            </div>
          </div>
        )}

        {/* Lever 5: Afforestation / Bio-reclamation */}
        <div className="p-3.5 bg-white border border-slate-200 rounded space-y-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <TreePine className="w-4 h-4 text-emerald-700" /> Additional Biological Afforestation & Eco-Restoration:
            </span>
            <span className="font-mono font-bold text-slate-900 font-tabular">
              +{inputs.additionalAfforestationHa} hectares
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="500"
            step="20"
            value={inputs.additionalAfforestationHa}
            onChange={e => handleInputChange('additionalAfforestationHa', parseInt(e.target.value))}
            className="w-full accent-[#166534] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0 ha</span>
            <span className="text-[#166534] font-medium font-tabular">
              Permanent biological carbon sink: -{Math.round(simResults.categoryReductions.afforestationRemovalTco2e).toLocaleString()} tCO2e/yr
            </span>
            <span>+500 ha</span>
          </div>
        </div>
      </div>

      {/* SECTION 11: BUDGET-BASED RECOMMENDATION & SINGLE ACTION MODE */}
      <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-200">
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-[#166534]" /> Budget-Constrained Interventions Optimizer
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Algorithmic knapsack solver selecting the highest carbon abatement portfolio for your available capital
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <label className="font-bold text-slate-800 whitespace-nowrap">My Available Budget:</label>
            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded px-2 py-1">
              <span className="font-bold text-slate-700">₹</span>
              <input
                type="number"
                value={userBudget}
                onChange={e => setUserBudget(parseFloat(e.target.value) || 0)}
                className="w-16 font-bold text-slate-900 focus:outline-none"
              />
              <span className="text-slate-500 font-medium">Cr</span>
            </div>
          </div>
        </div>

        {/* Two Modes: "Optimal Bundle within Budget" AND "If I Can Only Do ONE Thing" */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Box 1: Optimal Combination for ₹X Cr */}
          <div className="p-3.5 bg-white border border-slate-200 rounded space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">
                Optimal Bundle for ₹{userBudget} Cr Budget
              </span>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-tabular">
                -{budgetOptimization.totalReductionPct}% Reduction
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              {budgetOptimization.selectedInterventions.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-slate-700 py-0.5 border-b border-slate-50">
                  <span className="truncate pr-2 font-medium">{item.title}</span>
                  <span className="font-mono text-slate-500 font-tabular whitespace-nowrap">
                    ₹{item.estimatedInvestmentCrores} Cr
                  </span>
                </div>
              ))}
              {budgetOptimization.selectedInterventions.length === 0 && (
                <div className="text-slate-400 italic py-2">
                  Budget limit insufficient for major capital interventions. Increase budget above ₹4 Cr for efficiency retrofits.
                </div>
              )}
            </div>

            <div className="pt-2 text-[11px] text-slate-500 flex justify-between font-tabular border-t border-slate-100">
              <span>Total CapEx: <strong className="text-slate-900">₹{budgetOptimization.totalCostCrores} Cr</strong></span>
              <span>Abatement: <strong className="text-emerald-700">-{budgetOptimization.totalReductionTco2e.toLocaleString()} tCO2e</strong></span>
            </div>
          </div>

          {/* Box 2: "IF I CAN ONLY DO ONE THING THIS YEAR" */}
          <div className="p-3.5 bg-white border-2 border-[#166534] rounded space-y-2 relative shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[#166534] uppercase tracking-wider flex items-center gap-1">
                <Award className="w-4 h-4" /> IF I CAN ONLY DO ONE THING THIS YEAR
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Highest Impact / CapEx Ratio
              </span>
            </div>

            <h5 className="font-bold text-slate-900 text-sm">
              {topSingleAction.title}
            </h5>
            <p className="text-slate-600 leading-snug text-xs">
              {topSingleAction.description}
            </p>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">CO2 Cut</span>
                <strong className="text-emerald-700 font-tabular">-{topSingleAction.potentialReductionTco2e.toLocaleString()} t</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Investment</span>
                <strong className="text-slate-800 font-tabular">₹{topSingleAction.estimatedInvestmentCrores} Cr</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Payback</span>
                <strong className="text-slate-800 font-tabular">{topSingleAction.paybackYears} Years</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
