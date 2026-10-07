import React, { useState } from 'react';
import { CoalGrade, MineRecord, MineType } from '../types';
import { calculationEngine } from '../services/calculationEngine';
import { Building2, X, PlusCircle, Check } from 'lucide-react';

interface MineRegistrationModalProps {
  onClose: () => void;
  onMineCreated: (newMine: MineRecord) => void;
}

export const MineRegistrationModal: React.FC<MineRegistrationModalProps> = ({
  onClose,
  onMineCreated,
}) => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState<MineRecord['company']>('SECL');
  const [state, setState] = useState<MineRecord['state']>('Chhattisgarh');
  const [district, setDistrict] = useState('');
  const [coalfield, setCoalfield] = useState('Korba');
  const [lat, setLat] = useState<number>(22.35);
  const [lng, setLng] = useState<number>(82.55);
  const [mineType, setMineType] = useState<MineType>('opencast');
  const [coalGrade, setCoalGrade] = useState<CoalGrade>('G11');
  const [annualCapacityMt, setAnnualCapacityMt] = useState<number>(10.0);
  const [yearOpened, setYearOpened] = useState<number>(1995);
  const [expectedYearsLeft, setExpectedYearsLeft] = useState<number>(20);
  const [totalLeasedLandHa, setTotalLeasedLandHa] = useState<number>(1500);
  const [disturbedLandHa, setDisturbedLandHa] = useState<number>(900);
  const [undisturbedLandHa, setUndisturbedLandHa] = useState<number>(600);
  const [depthMeters, setDepthMeters] = useState<number>(300);
  const [gassinessDegree, setGassinessDegree] = useState<1 | 2 | 3>(1);
  const [ventilationType, setVentilationType] = useState<MineRecord['ventilationType']>('Mechanical Exhaust');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !district) return;

    const id = `mine-${Date.now()}`;
    const code = `${company}-${district.slice(0, 3).toUpperCase()}-0${Math.floor(Math.random() * 9 + 1)}`;

    // Initial operational defaults
    const coalTonnes = Math.round((annualCapacityMt * 1000000) / 12);
    const obM3 = mineType === 'opencast' ? Math.round(coalTonnes * 2.2) : 0;
    const dieselLiters = mineType === 'opencast' ? Math.round(coalTonnes * 1.9) : Math.round(coalTonnes * 0.2);
    const powerKWh = mineType === 'underground' ? Math.round(coalTonnes * 30) : Math.round(coalTonnes * 8);

    const initialOp = {
      periodMonth: 'March',
      periodYear: 2026,
      coalExtractedTonnes: coalTonnes,
      overburdenRemovedM3: obM3,
      strippingRatio: mineType === 'opencast' ? 2.2 : 0,
      dieselMachineryLiters: dieselLiters,
      dieselGeneratorsLiters: Math.round(dieselLiters * 0.05),
      gridElectricityKWh: powerKWh,
      captivePowerKWh: 0,
      renewableEnergyKWh: Math.round(powerKWh * 0.15),
      transportMode: 'rail_mgr' as const,
      transportDistanceKm: 18,
      explosivesKg: mineType === 'opencast' ? Math.round(obM3 * 0.35) : 15000,
      methaneContentM3PerTonne: mineType === 'underground' ? (gassinessDegree === 3 ? 14.5 : gassinessDegree === 2 ? 8.0 : 3.0) : undefined,
      freshWaterPumpedKl: Math.round(coalTonnes * 0.2),
      mineWaterTreatedKl: Math.round(coalTonnes * 0.18),
      waterEnergyKWh: Math.round(powerKWh * 0.04),
      disturbedLandHa,
      reclaimedLandHa: Math.round(disturbedLandHa * 0.2),
      afforestedLandHa: Math.round(disturbedLandHa * 0.16),
    };

    const emissions = calculationEngine.calculateEmissions(
      initialOp,
      mineType,
      gassinessDegree,
      (initialOp.renewableEnergyKWh * 0.716) / 1000
    );

    const newMine: MineRecord = {
      id,
      name,
      code,
      company,
      parentHolding: company === 'SCCL' ? 'Singareni Collieries (SCCL)' : 'Coal India Limited (CIL)',
      state,
      district,
      coalfield: coalfield || 'Korba',
      coordinates: { lat, lng },
      mineType,
      coalGrade,
      depthMeters: mineType === 'underground' ? depthMeters : undefined,
      gassinessDegree: mineType === 'underground' ? gassinessDegree : undefined,
      ventilationType: mineType === 'underground' ? ventilationType : undefined,
      annualCapacityMt,
      yearOpened,
      expectedYearsLeft,
      totalLeasedLandHa,
      disturbedLandHa,
      undisturbedLandHa,
      reclaimedLandHa: Math.round(disturbedLandHa * 0.2),
      afforestedLandHa: Math.round(disturbedLandHa * 0.16),
      operational: initialOp,
      emissions,
      satelliteData: {
        selfReportedReclaimedHa: Math.round(disturbedLandHa * 0.2),
        satelliteObservedHa: Math.round(disturbedLandHa * 0.19),
        discrepancyHa: Math.round(disturbedLandHa * 0.01),
        discrepancyPct: 5.0,
        status: 'verified',
        satellitePassDate: '2026-02-15',
        sensor: 'Sentinel-2 (10m)',
        meanNdviScore: 0.65,
        ndviBaselineYear: 2021,
        historicalTrendPct: 15.0,
        notes: 'Initial registration baseline imagery captured.',
      },
      targetYear: 2030,
      targetIntensityTco2e: round(emissions.carbonIntensityTco2ePerTonne * 0.65, 4),
      baselineIntensityTco2e: round(emissions.carbonIntensityTco2ePerTonne * 1.15, 4),
      currentReductionPct: 12.0,
      targetReductionPct: 35.0,
      targetStatus: 'on_track',
      pathwayStatus: 'draft',
      selectedInterventionIds: ['solar_pv_plant'],
      sustainabilityBudgetCrores: 25.0,
      anomalies: [],
      reportingHistory: [
        {
          period: 'Mar 2026',
          productionTonnes: coalTonnes,
          emissionsTco2e: Math.round(emissions.totalGrossEmissions),
          intensity: emissions.carbonIntensityTco2ePerTonne,
          status: 'verified',
        },
      ],
    };

    onMineCreated(newMine);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold">Register New Indian Coal Mine</h3>
              <p className="text-xs text-slate-400">Establish Static Colliery Parameters & Calculation Engine Profile</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Mine / Colliery Name *</label>
              <input
                type="text"
                required
                placeholder="e.g., Rampur Batra Opencast Project"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium focus:outline-none focus:border-[#166534]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Owning PSU / Subsidiary *</label>
              <select
                value={company}
                onChange={e => setCompany(e.target.value as any)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium focus:outline-none focus:border-[#166534]"
              >
                <option value="SECL">SECL (South Eastern Coalfields)</option>
                <option value="MCL">MCL (Mahanadi Coalfields)</option>
                <option value="NCL">NCL (Northern Coalfields)</option>
                <option value="CCL">CCL (Central Coalfields)</option>
                <option value="BCCL">BCCL (Bharat Coking Coal)</option>
                <option value="WCL">WCL (Western Coalfields)</option>
                <option value="ECL">ECL (Eastern Coalfields)</option>
                <option value="SCCL">SCCL (Singareni Collieries)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">State *</label>
              <select
                value={state}
                onChange={e => setState(e.target.value as any)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium focus:outline-none focus:border-[#166534]"
              >
                <option value="Chhattisgarh">Chhattisgarh</option>
                <option value="Jharkhand">Jharkhand</option>
                <option value="Odisha">Odisha</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Telangana">Telangana</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">District *</label>
              <input
                type="text"
                required
                placeholder="e.g., Korba, Dhanbad, Angul"
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium focus:outline-none focus:border-[#166534]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Latitude (°N)</label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={e => setLat(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium font-mono focus:outline-none focus:border-[#166534]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Longitude (°E)</label>
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={e => setLng(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium font-mono focus:outline-none focus:border-[#166534]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Mine Operational Type *</label>
              <select
                value={mineType}
                onChange={e => setMineType(e.target.value as any)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium focus:outline-none focus:border-[#166534]"
              >
                <option value="opencast">Opencast (OC)</option>
                <option value="underground">Underground (UG)</option>
                <option value="mixed">Mixed</option>
              </select>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Determines Scope 1 calculation methodology
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Coal Grade / Seam Quality</label>
              <select
                value={coalGrade}
                onChange={e => setCoalGrade(e.target.value as any)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium focus:outline-none focus:border-[#166534]"
              >
                <option value="G10">G10 (Thermal 4300-4600 kcal/kg)</option>
                <option value="G11">G11 (Thermal 4000-4300 kcal/kg)</option>
                <option value="G12">G12 (Thermal 3700-4000 kcal/kg)</option>
                <option value="G13">G13 (Thermal 3400-3700 kcal/kg)</option>
                <option value="Coking Steel-I">Coking Steel-I (Prime Coking)</option>
                <option value="Coking Washery-IV">Coking Washery-IV (Medium Coking)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Annual Production Capacity (Mtpa)</label>
              <input
                type="number"
                step="0.5"
                value={annualCapacityMt}
                onChange={e => setAnnualCapacityMt(parseFloat(e.target.value) || 1)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium focus:outline-none focus:border-[#166534]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Total Leased Area (Hectares)</label>
              <input
                type="number"
                value={totalLeasedLandHa}
                onChange={e => setTotalLeasedLandHa(parseFloat(e.target.value) || 100)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium focus:outline-none focus:border-[#166534]"
              />
            </div>

            {mineType === 'underground' && (
              <>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">DGMS Gassiness Degree</label>
                  <select
                    value={gassinessDegree}
                    onChange={e => setGassinessDegree(parseInt(e.target.value) as any)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium focus:outline-none focus:border-[#166534]"
                  >
                    <option value={1}>Degree I (&lt; 1 m³/t)</option>
                    <option value={2}>Degree II (1 - 10 m³/t)</option>
                    <option value={3}>Degree III (&gt; 10 m³/t - Gassy)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Shaft Depth (Meters)</label>
                  <input
                    type="number"
                    value={depthMeters}
                    onChange={e => setDepthMeters(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-medium focus:outline-none focus:border-[#166534]"
                  />
                </div>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#166534] hover:bg-[#14532D] text-white rounded font-semibold transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register Colliery & Open Workspace</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function round(val: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}
