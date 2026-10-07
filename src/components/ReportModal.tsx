import React from 'react';
import { MineRecord } from '../types';
import { Printer, Download, X, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ReportModalProps {
  mine: MineRecord;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ mine, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const em = mine.emissions;
  const sat = mine.satelliteData;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Toolbar (hidden when printing) */}
        <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold">Official Statutory Decarbonization Report</h3>
              <p className="text-xs text-slate-400">DGMS & Ministry of Coal Carbon Audit Compliance Form</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document (A4 format style) */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-900 bg-white font-sans text-xs">
          {/* Government / PSU Header */}
          <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
            <div className="text-[11px] font-bold tracking-widest text-slate-600 uppercase">
              भारत सरकार | GOVERNMENT OF INDIA
            </div>
            <div className="text-sm font-bold text-slate-900 uppercase">
              MINISTRY OF COAL — SUSTAINABLE DEVELOPMENT CELL
            </div>
            <h1 className="text-lg font-extrabold text-[#166534] uppercase tracking-tight">
              MINEwise Colliery Carbon Footprint & Decarbonization Audit Report
            </h1>
            <div className="text-[11px] text-slate-500 font-mono">
              Report Ref: MOC/SDC/{mine.company}/{mine.code}/2026-Q1 · Generated on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>

          {/* Section 1: Colliery Identification */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2.5 py-1 mb-2 border-l-4 border-[#166534]">
              1. Colliery Operational Profile
            </h2>
            <div className="grid grid-cols-3 gap-3 border border-slate-200 p-3 rounded">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Colliery Name:</span>
                <strong className="text-slate-900 text-sm">{mine.name}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">DGMS Registration Code:</span>
                <strong className="text-slate-800 font-mono">{mine.code}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Owning Company / PSU:</span>
                <strong className="text-slate-800">{mine.company} ({mine.parentHolding})</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Geographic Location:</span>
                <span className="text-slate-800">{mine.district}, {mine.state} ({mine.coordinates.lat.toFixed(4)}°N, {mine.coordinates.lng.toFixed(4)}°E)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Colliery Type & Coal Grade:</span>
                <span className="text-slate-800 font-semibold">{mine.mineType.toUpperCase()} · Grade {mine.coalGrade}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Annual Capacity / Production:</span>
                <span className="text-slate-800 font-semibold">{mine.annualCapacityMt} Mtpa (Reported: {mine.operational.coalExtractedTonnes.toLocaleString()} t)</span>
              </div>
            </div>
          </div>

          {/* Section 2: Greenhouse Gas Inventory & Scope Accounting */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2.5 py-1 mb-2 border-l-4 border-[#166534]">
              2. Certified Carbon Footprint (Reporting Period: {mine.operational.periodMonth} {mine.operational.periodYear})
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-center">
                <span className="text-[10px] text-slate-500 block uppercase">Scope 1 (Direct)</span>
                <strong className="text-base text-slate-900 font-tabular">{Math.round(em.scope1.total).toLocaleString()}</strong>
                <span className="text-[10px] text-slate-400 block">tCO2e</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-center">
                <span className="text-[10px] text-slate-500 block uppercase">Scope 2 (Electricity)</span>
                <strong className="text-base text-slate-900 font-tabular">{Math.round(em.scope2.total).toLocaleString()}</strong>
                <span className="text-[10px] text-slate-400 block">tCO2e</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-center">
                <span className="text-[10px] text-slate-500 block uppercase">Scope 3 (Logistics)</span>
                <strong className="text-base text-slate-900 font-tabular">{Math.round(em.scope3.total).toLocaleString()}</strong>
                <span className="text-[10px] text-slate-400 block">tCO2e</span>
              </div>
              <div className="p-2.5 bg-[#166534] text-white rounded text-center">
                <span className="text-[10px] text-emerald-200 block uppercase">Gross Footprint</span>
                <strong className="text-base font-tabular">{Math.round(em.totalGrossEmissions).toLocaleString()}</strong>
                <span className="text-[10px] text-emerald-100 block">tCO2e</span>
              </div>
            </div>

            <table className="w-full text-left border border-slate-200">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="p-2">Emission Source Category</th>
                  <th className="p-2">Activity Data Reported</th>
                  <th className="p-2">Emission Factor Applied</th>
                  <th className="p-2 text-right">Emissions (tCO2e)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2 font-medium">Diesel Fuel (Heavy Machinery HEMM)</td>
                  <td className="p-2 font-tabular">{mine.operational.dieselMachineryLiters.toLocaleString()} Liters</td>
                  <td className="p-2 font-mono">2.687 kg CO2e / L (IPCC)</td>
                  <td className="p-2 text-right font-tabular font-semibold">{Math.round(em.scope1.dieselMachinery).toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Fugitive Seam Methane (CH4)</td>
                  <td className="p-2 font-tabular">
                    {mine.mineType === 'underground' ? `${mine.operational.methaneContentM3PerTonne || 14.2} m³/t` : '1.2 m³/t seam exposure'}
                  </td>
                  <td className="p-2 font-mono">GWP 28 (IPCC AR5)</td>
                  <td className="p-2 text-right font-tabular font-semibold">{Math.round(em.scope1.fugitiveMethane).toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Purchased Grid Electricity</td>
                  <td className="p-2 font-tabular">{mine.operational.gridElectricityKWh.toLocaleString()} kWh</td>
                  <td className="p-2 font-mono">0.716 kg CO2e / kWh (CEA v20)</td>
                  <td className="p-2 text-right font-tabular font-semibold">{Math.round(em.scope2.gridElectricity).toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Coal Haulage & Evacuation</td>
                  <td className="p-2 font-tabular">{mine.operational.transportDistanceKm} km ({mine.operational.transportMode})</td>
                  <td className="p-2 font-mono">Indian Freight Factor</td>
                  <td className="p-2 text-right font-tabular font-semibold">{Math.round(em.scope3.coalTransport).toLocaleString()}</td>
                </tr>
                <tr className="bg-slate-50 font-bold border-t border-slate-200">
                  <td className="p-2 text-slate-800" colSpan={3}>
                    Colliery Carbon Intensity:
                  </td>
                  <td className="p-2 text-right font-tabular text-[#166534]">
                    {em.carbonIntensityTco2ePerTonne.toFixed(4)} tCO2e / tonne of coal extracted
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Mitigation Pathway & Target Status */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2.5 py-1 mb-2 border-l-4 border-[#166534]">
              3. Decarbonization Pathway & Statutory Target Performance
            </h2>
            <div className="border border-slate-200 p-3 rounded space-y-2">
              <div className="grid grid-cols-4 gap-2 text-center pb-2 border-b border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">2021 Baseline</span>
                  <span className="font-bold text-slate-800 font-tabular">{mine.baselineIntensityTco2e.toFixed(4)} t/t</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Reduction Achieved</span>
                  <span className="font-bold text-emerald-700 font-tabular">-{mine.currentReductionPct}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">{mine.targetYear} Target</span>
                  <span className="font-bold text-slate-900 font-tabular">{mine.targetIntensityTco2e.toFixed(4)} t/t (-{mine.targetReductionPct}%)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Compliance Status</span>
                  <span className="font-bold text-emerald-800 uppercase">{mine.targetStatus.replace('_', ' ')}</span>
                </div>
              </div>

              <div>
                <strong className="text-slate-800 block text-[11px] mb-1">Active Interventions Committed in Approved Plan:</strong>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  First-Mile Rail Conveyor Connection, Captive Solar PV Array (25 MW), SCADA Energy Management, and Continuous Bio-reclamation of Overburden Dumps.
                  Total estimated capital commitment: ₹{mine.sustainabilityBudgetCrores.toFixed(1)} Crores. Pathway Approval: {mine.pathwayStatus.toUpperCase()}.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Data Validation & Satellite Verification Audit */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-2.5 py-1 mb-2 border-l-4 border-[#166534]">
              4. Remote Sensing & Data Quality Audit
            </h2>
            <div className="grid grid-cols-2 gap-3 border border-slate-200 p-3 rounded">
              <div>
                <span className="font-bold text-slate-800 block text-[11px]">Sentinel-2 Satellite Verification:</span>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Reported Reclamation: {sat.selfReportedReclaimedHa} ha | Observed Active Canopy: {sat.satelliteObservedHa} ha (Variance: {sat.discrepancyPct.toFixed(1)}%).
                  Status: <strong className="text-slate-900">{sat.status.toUpperCase()}</strong>.
                </p>
              </div>
              <div>
                <span className="font-bold text-slate-800 block text-[11px]">Anomaly Audit Status:</span>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  {mine.anomalies.length === 0
                    ? 'No statistical outliers recorded in current reporting period. Data passes DGMS consistency checks.'
                    : `Active Notice: ${mine.anomalies[0].message}`}
                </p>
              </div>
            </div>
          </div>

          {/* Signatures & Certification Block */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-6 text-center text-[10px] text-slate-500">
            <div>
              <div className="h-10 border-b border-slate-300 mb-1"></div>
              <strong className="text-slate-800 block">General Manager (Mining)</strong>
              <span>Colliery In-Charge, {mine.company}</span>
            </div>
            <div>
              <div className="h-10 border-b border-slate-300 mb-1"></div>
              <strong className="text-slate-800 block">Regional Sustainability Officer</strong>
              <span>Coal India Limited Subsidiary HQ</span>
            </div>
            <div>
              <div className="h-10 border-b border-slate-300 mb-1"></div>
              <strong className="text-slate-800 block">Director (Technical / Env)</strong>
              <span>Ministry of Coal, Government of India</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
