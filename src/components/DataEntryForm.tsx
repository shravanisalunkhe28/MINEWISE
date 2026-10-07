import React, { useState } from 'react';
import { AnomalyEvent, MineRecord, OperationalData } from '../types';
import { anomalyDetectionService } from '../services/anomalyDetection';
import { calculationEngine } from '../services/calculationEngine';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Send, 
  RotateCcw,
  Zap,
  Flame,
  Truck,
  Droplets,
  TreePine,
  DollarSign
} from 'lucide-react';

interface DataEntryFormProps {
  mine: MineRecord;
  onDataSubmitted: (updatedMine: MineRecord) => void;
  onCancel?: () => void;
}

export const DataEntryForm: React.FC<DataEntryFormProps> = ({
  mine,
  onDataSubmitted,
  onCancel,
}) => {
  const isUG = mine.mineType === 'underground' || mine.mineType === 'mixed';

  // Form State initialized from existing mine operational data
  const [formData, setFormData] = useState<OperationalData>({
    ...mine.operational,
    periodMonth: 'March',
    periodYear: 2026,
  });

  const [sustainabilityBudget, setSustainabilityBudget] = useState<number>(mine.sustainabilityBudgetCrores);

  // Anomaly check modal / notification state
  const [detectedAnomalies, setDetectedAnomalies] = useState<any[]>([]);
  const [showAnomalyModal, setShowAnomalyModal] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);

  const handleInputChange = (field: keyof OperationalData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRunValidationAndSubmit = (forceSubmissionStatus?: 'flagged' | 'normal') => {
    // 1. Run statistical anomaly detection
    const validation = anomalyDetectionService.validateOperationalData(
      formData,
      mine.mineType,
      formData.strippingRatio || 2.5
    );

    if (validation.hasAnomaly && !forceSubmissionStatus) {
      setDetectedAnomalies(validation.anomalies);
      setShowAnomalyModal(true);
      return;
    }

    // 2. Compute updated emissions
    const newEmissions = calculationEngine.calculateEmissions(
      formData,
      mine.mineType,
      mine.gassinessDegree || 1,
      (formData.renewableEnergyKWh * 0.716) / 1000
    );

    // 3. Check for land discrepancy
    const landCheck = anomalyDetectionService.checkLandSatelliteDiscrepancy(
      formData.reclaimedLandHa,
      mine.satelliteData.satelliteObservedHa
    );

    // 4. Build anomaly record if flagged
    const newAnomalies: AnomalyEvent[] = [...mine.anomalies];
    if (validation.hasAnomaly && forceSubmissionStatus === 'flagged') {
      validation.anomalies.forEach((a, idx) => {
        newAnomalies.unshift({
          id: `anom-${Date.now()}-${idx}`,
          mineId: mine.id,
          reportingPeriod: `${formData.periodYear}-${formData.periodMonth}`,
          metric: a.metric,
          observedValue: a.observedValue,
          expectedRange: a.expectedRange,
          deviationPct: a.deviationPct,
          message: a.message,
          severity: a.severity,
          status: 'open',
          dateReported: new Date().toISOString().split('T')[0],
          auditNotes: 'Submitted by Mine Manager with Flagged Status for Regional Review.',
        });
      });
    }

    // Update historical reporting series
    const updatedHistory = [
      ...mine.reportingHistory,
      {
        period: `${formData.periodMonth.slice(0, 3)} ${formData.periodYear}`,
        productionTonnes: formData.coalExtractedTonnes,
        emissionsTco2e: Math.round(newEmissions.totalGrossEmissions),
        intensity: newEmissions.carbonIntensityTco2ePerTonne,
        status: validation.hasAnomaly ? ('flagged' as const) : ('verified' as const),
      },
    ];

    const updatedMine: MineRecord = {
      ...mine,
      operational: { ...formData },
      emissions: newEmissions,
      sustainabilityBudgetCrores: sustainabilityBudget,
      reclaimedLandHa: formData.reclaimedLandHa,
      afforestedLandHa: formData.afforestedLandHa,
      disturbedLandHa: formData.disturbedLandHa,
      satelliteData: {
        ...mine.satelliteData,
        selfReportedReclaimedHa: formData.reclaimedLandHa,
        status: landCheck.status,
      },
      anomalies: newAnomalies,
      reportingHistory: updatedHistory,
    };

    setShowAnomalyModal(false);
    setSubmissionSuccess(true);
    setTimeout(() => {
      onDataSubmitted(updatedMine);
    }, 800);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#166534]" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Periodic Colliery Data Submission: {mine.name}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Statutory monthly/quarterly greenhouse gas operational returns. Enter verified colliery logs below.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Period:</span>
          <select
            value={formData.periodMonth}
            onChange={e => handleInputChange('periodMonth', e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-800"
          >
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            value={formData.periodYear}
            onChange={e => handleInputChange('periodYear', parseInt(e.target.value))}
            className="text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-800"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
          </select>
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="space-y-6 text-xs">
        {/* Group A: Coal Extraction & Overburden (Required) */}
        <div>
          <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-[#166534]"></span>
            <span>A. Primary Production & Earthmoving (Mandatory)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <label className="font-semibold text-slate-800 block mb-1">
                Net Coal Extracted *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={formData.coalExtractedTonnes}
                  onChange={e => handleInputChange('coalExtractedTonnes', parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium bg-white focus:outline-none focus:border-[#166534]"
                  required
                />
                <span className="text-slate-500 font-medium">Tonnes</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Weighbridge certified dispatch/stock</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <label className="font-semibold text-slate-800 block mb-1">
                Overburden (OB) Removed *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={formData.overburdenRemovedM3}
                  onChange={e => {
                    const ob = parseFloat(e.target.value) || 0;
                    const coal = formData.coalExtractedTonnes || 1;
                    handleInputChange('overburdenRemovedM3', ob);
                    handleInputChange('strippingRatio', parseFloat((ob / coal).toFixed(2)));
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium bg-white focus:outline-none focus:border-[#166534]"
                  required
                />
                <span className="text-slate-500 font-medium">m³</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Stripping ratio: {formData.strippingRatio}:1</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <label className="font-semibold text-slate-800 block mb-1">
                Explosives Used (Blasting)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={formData.explosivesKg}
                  onChange={e => handleInputChange('explosivesKg', parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium bg-white focus:outline-none focus:border-[#166534]"
                />
                <span className="text-slate-500 font-medium">kg ANFO</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Optional — improves calculation accuracy</span>
            </div>
          </div>
        </div>

        {/* Group B: Fuel & Electrical Energy Consumption (Required) */}
        <div>
          <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
            <span>B. Fuel & Power Utility Consumption (Mandatory)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <label className="font-semibold text-slate-800 block mb-1">
                HEMM Machinery Diesel *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={formData.dieselMachineryLiters}
                  onChange={e => handleInputChange('dieselMachineryLiters', parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium bg-white focus:outline-none focus:border-[#166534]"
                  required
                />
                <span className="text-slate-500 font-medium">Liters</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Dumpers, shovels, dozers, drills</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <label className="font-semibold text-slate-800 block mb-1">
                DG Set Generator Diesel
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={formData.dieselGeneratorsLiters}
                  onChange={e => handleInputChange('dieselGeneratorsLiters', parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium bg-white focus:outline-none focus:border-[#166534]"
                />
                <span className="text-slate-500 font-medium">Liters</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Standby power generation</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <label className="font-semibold text-slate-800 block mb-1">
                Grid Electricity (DISCOM) *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={formData.gridElectricityKWh}
                  onChange={e => handleInputChange('gridElectricityKWh', parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium bg-white focus:outline-none focus:border-[#166534]"
                  required
                />
                <span className="text-slate-500 font-medium">kWh</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Billed tariff meter readings</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <label className="font-semibold text-slate-800 block mb-1">
                Renewable Solar Generation
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={formData.renewableEnergyKWh}
                  onChange={e => handleInputChange('renewableEnergyKWh', parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium bg-white focus:outline-none focus:border-[#166534]"
                />
                <span className="text-slate-500 font-medium">kWh</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Offsets Scope 2 grid emissions</span>
            </div>
          </div>
        </div>

        {/* Group C: Underground Gas Dynamics (if underground/mixed) */}
        {isUG && (
          <div>
            <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-cyan-600"></span>
              <span>C. Colliery Methane & Ventilation Readings (Underground Colliery)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <label className="font-semibold text-slate-800 block mb-1">
                  Seam Gas Content
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.methaneContentM3PerTonne || 14.2}
                    onChange={e => handleInputChange('methaneContentM3PerTonne', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium bg-white focus:outline-none focus:border-[#166534]"
                  />
                  <span className="text-slate-500 font-medium">m³/tonne</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">CMPDI core desorption lab test</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <label className="font-semibold text-slate-800 block mb-1">
                  Main Shaft VAM Reading
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.ventilationCH4Ppm || 4800}
                    onChange={e => handleInputChange('ventilationCH4Ppm', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium bg-white focus:outline-none focus:border-[#166534]"
                  />
                  <span className="text-slate-500 font-medium">ppm CH4</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">Continuous statutory tele-monitoring</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <label className="font-semibold text-slate-800 block mb-1">
                  Borehole Drained Gas
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.drainedMethaneM3 || 0}
                    onChange={e => handleInputChange('drainedMethaneM3', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium bg-white focus:outline-none focus:border-[#166534]"
                  />
                  <span className="text-slate-500 font-medium">m³</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">Pre-drainage borehole extraction</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <label className="font-semibold text-slate-800 block mb-1">
                  Captured / Flared Methane
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.capturedMethaneM3 || 0}
                    onChange={e => handleInputChange('capturedMethaneM3', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium bg-white focus:outline-none focus:border-[#166534]"
                  />
                  <span className="text-slate-500 font-medium">m³</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Abated fugitive methane</span>
              </div>
            </div>
          </div>
        )}

        {/* Group D: Transport Logistics & Land Rehabilitation */}
        <div>
          <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>D. Logistics & Periodic Land Rehabilitation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <label className="font-semibold text-slate-800 block mb-1">
                Primary Transport Mode
              </label>
              <select
                value={formData.transportMode}
                onChange={e => handleInputChange('transportMode', e.target.value as any)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium bg-white focus:outline-none focus:border-[#166534]"
              >
                <option value="belt_conveyor">Overland Belt Conveyor / Pipe</option>
                <option value="rail_mgr">Dedicated Rail Rake / MGR</option>
                <option value="road_truck">Heavy Tipper Road Truck</option>
                <option value="mixed">Mixed Rail & Truck</option>
              </select>
              <span className="text-[10px] text-slate-400 block mt-1">Determines freight factor</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <label className="font-semibold text-slate-800 block mb-1">
                Haulage Distance
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={formData.transportDistanceKm}
                  onChange={e => handleInputChange('transportDistanceKm', parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium bg-white focus:outline-none focus:border-[#166534]"
                />
                <span className="text-slate-500 font-medium">km</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">To siding, washery, or power plant</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <label className="font-semibold text-slate-800 block mb-1">
                Reclaimed Land Area
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={formData.reclaimedLandHa}
                  onChange={e => handleInputChange('reclaimedLandHa', parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium bg-white focus:outline-none focus:border-[#166534]"
                />
                <span className="text-slate-500 font-medium">hectares</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Audited against satellite NDVI</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <label className="font-semibold text-slate-800 block mb-1">
                Biological Afforestation
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={formData.afforestedLandHa}
                  onChange={e => handleInputChange('afforestedLandHa', parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium bg-white focus:outline-none focus:border-[#166534]"
                />
                <span className="text-slate-500 font-medium">hectares</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Native mixed species plantation</span>
            </div>
          </div>
        </div>

        {/* Group E: Planning & Sustainability Budget */}
        <div>
          <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider mb-3">
            <DollarSign className="w-4 h-4 text-[#166534]" />
            <span>E. Annual Sustainability Capital Budget Allocation</span>
          </div>

          <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="font-bold text-slate-800 block text-xs">
                Colliery Decarbonization Capital Budget (CapEx Window)
              </span>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Utilized by the AI Budget Optimizer to calculate the highest CO2 reduction combination within your funding limit.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-700 font-semibold">₹</span>
              <input
                type="number"
                step="0.5"
                value={sustainabilityBudget}
                onChange={e => setSustainabilityBudget(parseFloat(e.target.value) || 0)}
                className="w-28 px-3 py-1.5 border border-slate-300 rounded font-bold text-slate-900 bg-white focus:outline-none focus:border-[#166534]"
              />
              <span className="text-slate-700 font-semibold">Crores</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Submission Bar */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 transition-colors font-medium text-xs"
          >
            Cancel
          </button>
        )}

        <div className="flex items-center gap-3 ml-auto">
          <button
            type="button"
            onClick={() => handleRunValidationAndSubmit()}
            className="px-5 py-2.5 bg-[#166534] hover:bg-[#14532D] text-white rounded font-semibold text-xs shadow-sm transition-colors flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Validate Operational Logs & Compute Emissions</span>
          </button>
        </div>
      </div>

      {/* ANOMALY DETECTION MODAL (Section 6 Requirement) */}
      {showAnomalyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6 space-y-4 border-t-4 border-red-600">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                  ⚠ DATA ANOMALY DETECTED
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Statistical outlier flagged by automated DGMS/CMPDI engineering rules
                </p>
              </div>
            </div>

            <div className="space-y-3 p-3.5 bg-red-50/70 border border-red-200 rounded text-xs">
              {detectedAnomalies.map((a, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between font-bold text-red-900">
                    <span>{a.metric}</span>
                    <span className="text-[11px] font-mono">+{a.deviationPct}% deviation</span>
                  </div>
                  <p className="text-red-800 leading-snug">{a.message}</p>
                  <div className="text-[11px] text-red-700 font-mono">
                    Observed: {a.observedValue} · Expected Benchmark: {a.expectedRange}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-600">
              Please choose how you wish to proceed with this submission:
            </p>

            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAnomalyModal(false)}
                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded transition-colors text-left flex items-center justify-between"
              >
                <span>1. Review & Correct Data (Edit form fields)</span>
                <span className="text-[10px] text-slate-500">Recommended</span>
              </button>

              <button
                onClick={() => handleRunValidationAndSubmit('flagged')}
                className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold rounded transition-colors text-left flex items-center justify-between"
              >
                <span>2. Submit for Regional Review (Alerts Regional Officer)</span>
                <span className="text-[10px] text-amber-700 font-bold">Audit Notice</span>
              </button>

              <button
                onClick={() => handleRunValidationAndSubmit('flagged')}
                className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-red-900 border border-red-200 text-xs font-semibold rounded transition-colors text-left flex items-center justify-between"
              >
                <span>3. Continue with Flagged Status (Records persistent alert)</span>
                <span className="text-[10px] text-red-700">Flagged</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
