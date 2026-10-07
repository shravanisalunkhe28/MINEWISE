import React, { useState } from 'react';
import { calculationEngine, DEFAULT_EMISSION_FACTORS } from '../services/calculationEngine';
import { EmissionFactors } from '../types';
import { Sliders, RotateCcw, Check, X, Shield, Info } from 'lucide-react';

interface EmissionFactorsModalProps {
  onClose: () => void;
  onFactorsUpdated: () => void;
}

export const EmissionFactorsModal: React.FC<EmissionFactorsModalProps> = ({
  onClose,
  onFactorsUpdated,
}) => {
  const [factors, setFactors] = useState<EmissionFactors>(calculationEngine.getEmissionFactors());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleChange = (key: keyof EmissionFactors, value: number) => {
    setFactors(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    calculationEngine.updateEmissionFactors(factors);
    onFactorsUpdated();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleReset = () => {
    calculationEngine.resetEmissionFactors();
    setFactors(calculationEngine.getEmissionFactors());
    onFactorsUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold">Standard Emission Factors Configuration</h3>
              <p className="text-xs text-slate-400">Statutory CEA, IPCC AR5 & CMPDI Emission Baseline Parameters</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="p-3 bg-cyan-50 border border-cyan-200 rounded text-cyan-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
            <div>
              <strong>Authorized Administrative Parameters: </strong>
              Emission factors govern all colliery Scope 1, 2, and 3 calculations. Changes take immediate effect across all dashboards and reports.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Diesel */}
            <div className="p-3 border border-slate-200 rounded">
              <label className="font-bold text-slate-800 block mb-1">
                Diesel Fuel Combustion Factor
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.001"
                  value={factors.dieselCombustionKgPerL}
                  onChange={e => handleChange('dieselCombustionKgPerL', parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-medium focus:outline-none focus:border-[#166534]"
                />
                <span className="text-slate-500 whitespace-nowrap">kg CO2e / L</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">IPCC default for High Speed Diesel</span>
            </div>

            {/* Grid Electricity */}
            <div className="p-3 border border-slate-200 rounded">
              <label className="font-bold text-slate-800 block mb-1">
                Central Electricity Authority (CEA) Grid Factor
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.001"
                  value={factors.gridElectricityKgPerKwh}
                  onChange={e => handleChange('gridElectricityKgPerKwh', parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-medium focus:outline-none focus:border-[#166534]"
                />
                <span className="text-slate-500 whitespace-nowrap">kg CO2e / kWh</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">CEA India National Grid Baseline v20</span>
            </div>

            {/* Fugitive Methane GWP */}
            <div className="p-3 border border-slate-200 rounded">
              <label className="font-bold text-slate-800 block mb-1">
                Methane (CH4) 100-Year GWP
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="1"
                  value={factors.fugitiveMethaneGwp}
                  onChange={e => handleChange('fugitiveMethaneGwp', parseFloat(e.target.value) || 28)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-medium focus:outline-none focus:border-[#166534]"
                />
                <span className="text-slate-500 whitespace-nowrap">GWP factor</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">IPCC AR5 standard without CC feedback</span>
            </div>

            {/* Opencast Fugitive CH4 Factor */}
            <div className="p-3 border border-slate-200 rounded">
              <label className="font-bold text-slate-800 block mb-1">
                Opencast Fugitive Methane Emission Rate
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={factors.opencastFugitiveCh4M3PerTonne}
                  onChange={e => handleChange('opencastFugitiveCh4M3PerTonne', parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-medium focus:outline-none focus:border-[#166534]"
                />
                <span className="text-slate-500 whitespace-nowrap">m³ CH4 / tonne</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">CMPDI standard for shallow coal seams</span>
            </div>

            {/* Rail Freight Factor */}
            <div className="p-3 border border-slate-200 rounded">
              <label className="font-bold text-slate-800 block mb-1">
                Indian Railways Coal Freight Emission Factor
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.001"
                  value={factors.railTransportKgCo2ePerTkm}
                  onChange={e => handleChange('railTransportKgCo2ePerTkm', parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-medium focus:outline-none focus:border-[#166534]"
                />
                <span className="text-slate-500 whitespace-nowrap">kg CO2e / t-km</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Electric/Diesel freight average</span>
            </div>

            {/* Road Tipper Truck Factor */}
            <div className="p-3 border border-slate-200 rounded">
              <label className="font-bold text-slate-800 block mb-1">
                Road Commercial Tipper Truck Factor
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.001"
                  value={factors.roadTruckTransportKgCo2ePerTkm}
                  onChange={e => handleChange('roadTruckTransportKgCo2ePerTkm', parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-medium focus:outline-none focus:border-[#166534]"
                />
                <span className="text-slate-500 whitespace-nowrap">kg CO2e / t-km</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Heavy commercial coal truck haulage</span>
            </div>

            {/* Tree Sequestration Factor */}
            <div className="p-3 border border-slate-200 rounded">
              <label className="font-bold text-slate-800 block mb-1">
                Mixed Deciduous Afforestation Sequestration
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={factors.treeSequestrationTonnesPerHaYear}
                  onChange={e => handleChange('treeSequestrationTonnesPerHaYear', parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-medium focus:outline-none focus:border-[#166534]"
                />
                <span className="text-slate-500 whitespace-nowrap">tCO2e / ha / year</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Forest Research Institute (FRI) standard rate</span>
            </div>

            {/* Explosives ANFO */}
            <div className="p-3 border border-slate-200 rounded">
              <label className="font-bold text-slate-800 block mb-1">
                Blasting Explosives (ANFO) Factor
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={factors.explosivesKgCo2ePerKg}
                  onChange={e => handleChange('explosivesKgCo2ePerKg', parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-medium focus:outline-none focus:border-[#166534]"
                />
                <span className="text-slate-500 whitespace-nowrap">kg CO2e / kg ANFO</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Ammonium nitrate fuel oil detonation</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded font-medium flex items-center gap-1.5 hover:bg-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Official Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={`px-4 py-2 text-xs font-semibold text-white rounded flex items-center gap-1.5 transition-colors ${
                savedSuccess ? 'bg-emerald-600' : 'bg-[#166534] hover:bg-[#14532D]'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Parameters Saved!</span>
                </>
              ) : (
                <span>Apply Factor Updates</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
