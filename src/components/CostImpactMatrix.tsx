import React from 'react';
import { DecarbonizationIntervention } from '../types';
import { Sparkles, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface CostImpactMatrixProps {
  interventions: DecarbonizationIntervention[];
  selectedInterventionIds: string[];
  onToggleSelectIntervention?: (id: string) => void;
}

export const CostImpactMatrix: React.FC<CostImpactMatrixProps> = ({
  interventions,
  selectedInterventionIds,
  onToggleSelectIntervention,
}) => {
  // Partition into the 4 quadrants:
  // Quadrant 1: High Impact / Low Cost (Quick Wins / Priority 1)
  const highImpactLowCost = interventions.filter(i => i.impactLevel === 'high' && i.costLevel === 'low');
  // Quadrant 2: High Impact / High Cost (Strategic Transformations / Priority 2)
  const highImpactHighCost = interventions.filter(i => i.impactLevel === 'high' && i.costLevel === 'high');
  // Quadrant 3: Low Impact / Low Cost (Operational Improvements)
  const lowImpactLowCost = interventions.filter(i => i.impactLevel === 'low' && i.costLevel === 'low');
  // Quadrant 4: Low Impact / High Cost (Deprioritized)
  const lowImpactHighCost = interventions.filter(i => i.impactLevel === 'low' && i.costLevel === 'high');

  const renderQuadrant = (
    title: string,
    subtitle: string,
    badgeColor: string,
    borderColor: string,
    bgColor: string,
    items: DecarbonizationIntervention[]
  ) => {
    return (
      <div className={`p-4 rounded-lg border ${borderColor} ${bgColor} flex flex-col justify-between min-h-[220px]`}>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${badgeColor}`}>
              {title}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {items.length} {items.length === 1 ? 'Action' : 'Actions'}
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-3">{subtitle}</p>

          <div className="space-y-2">
            {items.map(item => {
              const isSelected = selectedInterventionIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => onToggleSelectIntervention && onToggleSelectIntervention(item.id)}
                  className={`p-2.5 bg-white border rounded text-xs transition-all ${
                    onToggleSelectIntervention ? 'cursor-pointer hover:border-slate-400' : ''
                  } ${
                    isSelected ? 'border-[#166534] ring-1 ring-[#166534] shadow-sm' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-slate-900 leading-snug">
                      {item.title}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#166534] shrink-0 mt-0.5" />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-1 border-t border-slate-100">
                    <span className="text-emerald-700 font-semibold font-tabular">
                      -{item.potentialReductionTco2e.toLocaleString()} tCO2e/yr
                    </span>
                    <span className="font-medium text-slate-700 font-tabular">
                      ₹{item.estimatedInvestmentCrores.toFixed(1)} Cr · {item.paybackYears}y payback
                    </span>
                  </div>
                </div>
              );
            })}
            {items.length === 0 && (
              <div className="text-xs text-slate-400 italic p-3 text-center">
                No interventions in this quadrant
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            2×2 Decarbonization Cost vs Impact Decision Matrix
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Prioritizes mine capital allocation by balancing CO2 abatement potential against required capital expenditure
          </p>
        </div>
        <div className="text-xs text-slate-500 hidden sm:block">
          Click any intervention card to toggle inclusion in roadmap
        </div>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top-Left: High Impact / Low Cost (Highest Priority) */}
        {renderQuadrant(
          'High Impact · Low CapEx',
          'Immediate Priority: Rapid decarbonization with minimal capital exposure and short payback period.',
          'bg-emerald-100 text-emerald-800',
          'border-emerald-200',
          'bg-emerald-50/30',
          highImpactLowCost
        )}

        {/* Top-Right: High Impact / High Cost (Strategic Major Projects) */}
        {renderQuadrant(
          'High Impact · High CapEx',
          'Strategic Transformations: Large-scale capital projects delivering bulk sector emissions reductions.',
          'bg-blue-100 text-blue-800',
          'border-blue-200',
          'bg-blue-50/30',
          highImpactHighCost
        )}

        {/* Bottom-Left: Low Impact / Low Cost (Quick Wins) */}
        {renderQuadrant(
          'Moderate Impact · Low CapEx',
          'Operational Upgrades: Fast-to-implement efficiency retrofits with high ROI and low operational risk.',
          'bg-slate-100 text-slate-700',
          'border-slate-200',
          'bg-slate-50/50',
          lowImpactLowCost
        )}

        {/* Bottom-Right: Low Impact / High Cost (Deprioritized) */}
        {renderQuadrant(
          'Low Impact · High CapEx',
          'Deprioritized: High cost per tonne of CO2 abated; defer until other levers are exhausted.',
          'bg-amber-100 text-amber-800',
          'border-amber-200',
          'bg-amber-50/30',
          lowImpactHighCost
        )}
      </div>
    </div>
  );
};
