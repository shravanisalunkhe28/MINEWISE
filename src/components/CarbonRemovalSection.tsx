import React from 'react';
import { MineRecord } from '../types';
import { TreePine, Sprout, ShieldCheck, ArrowDown, Equal } from 'lucide-react';

interface CarbonRemovalSectionProps {
  mine: MineRecord;
}

export const CarbonRemovalSection: React.FC<CarbonRemovalSectionProps> = ({ mine }) => {
  const em = mine.emissions;
  const op = mine.operational;
  const sat = mine.satelliteData;

  // Removals only certified if satellite data has confirmed vegetation
  const verifiedHa = sat.status === 'discrepancy_flagged' ? sat.satelliteObservedHa : op.afforestedLandHa;
  const verifiedSequestration = verifiedHa * 3.8; // 3.8 tonnes CO2e/ha/yr

  const grossEmissions = em.totalGrossEmissions;
  const emissionReductions = em.emissionReductionsAchieved;
  const residualEmissions = Math.max(0, grossEmissions - emissionReductions);
  const carbonRemovals = verifiedSequestration;
  const netBalance = Math.max(0, residualEmissions - carbonRemovals);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <TreePine className="w-5 h-5 text-[#16A34A]" />
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Ecological Restoration & Carbon Removal Accounting
            </h4>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict separation between direct emission reductions and biological carbon sequestration on restored mine lands
          </p>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-[#166534]" />
          <span>Compliant with Indian MoEFCC & CMPDI Eco-Restoration Framework</span>
        </div>
      </div>

      {/* Balance Ledger: Gross -> Reductions -> Residual -> Removals -> Net */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Gross Emissions */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded text-center">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
            GROSS EMISSIONS
          </span>
          <span className="text-xl font-bold text-slate-900 font-tabular block">
            {Math.round(grossEmissions).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400">tCO2e / year</span>
        </div>

        {/* Emission Reductions */}
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded text-center">
          <span className="text-[10px] uppercase font-bold text-blue-700 block mb-1">
            EMISSION REDUCTIONS
          </span>
          <span className="text-xl font-bold text-blue-800 font-tabular block">
            -{Math.round(emissionReductions).toLocaleString()}
          </span>
          <span className="text-[10px] text-blue-600">tCO2e abated</span>
        </div>

        {/* Residual Emissions */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded text-center">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
            RESIDUAL EMISSIONS
          </span>
          <span className="text-xl font-bold text-slate-800 font-tabular block">
            {Math.round(residualEmissions).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400">tCO2e remaining</span>
        </div>

        {/* Verified Carbon Removals */}
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded text-center">
          <span className="text-[10px] uppercase font-bold text-emerald-800 block mb-1">
            CARBON REMOVALS
          </span>
          <span className="text-xl font-bold text-[#166534] font-tabular block">
            -{Math.round(carbonRemovals).toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-600">tCO2e sequestered</span>
        </div>

        {/* Net Emissions Balance */}
        <div className="col-span-2 md:col-span-1 p-3.5 bg-[#166534] text-white rounded text-center shadow-sm">
          <span className="text-[10px] uppercase font-bold text-emerald-200 block mb-1">
            NET BALANCE
          </span>
          <span className="text-xl font-bold font-tabular block">
            {Math.round(netBalance).toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-100">tCO2e / year</span>
        </div>
      </div>

      {/* Land & Reclamation Statistics Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-white border border-slate-200 rounded flex items-center justify-between">
          <div>
            <span className="text-slate-500 block">Total Leased Area:</span>
            <span className="font-bold text-slate-900 font-tabular">{mine.totalLeasedLandHa.toLocaleString()} ha</span>
          </div>
          <Sprout className="w-4 h-4 text-slate-400" />
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded flex items-center justify-between">
          <div>
            <span className="text-slate-500 block">Active Disturbed Mining:</span>
            <span className="font-bold text-slate-900 font-tabular">{mine.disturbedLandHa.toLocaleString()} ha</span>
          </div>
          <span className="text-[11px] text-slate-400 font-tabular">
            {Math.round((mine.disturbedLandHa / mine.totalLeasedLandHa) * 100)}%
          </span>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded flex items-center justify-between">
          <div>
            <span className="text-slate-500 block">Reclaimed & Stabilized:</span>
            <span className="font-bold text-emerald-700 font-tabular">{mine.reclaimedLandHa.toLocaleString()} ha</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-tabular">
            {Math.round((mine.reclaimedLandHa / mine.disturbedLandHa) * 100)}%
          </span>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded flex items-center justify-between">
          <div>
            <span className="text-slate-500 block">Biological Afforestation:</span>
            <span className="font-bold text-[#166534] font-tabular">{mine.afforestedLandHa.toLocaleString()} ha</span>
          </div>
          <span className="text-[11px] text-slate-500">
            @ 3.8 t/ha/yr
          </span>
        </div>
      </div>
    </div>
  );
};
