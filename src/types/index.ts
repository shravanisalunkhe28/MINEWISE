export type UserRole = 'mine_manager' | 'regional_officer' | 'ministry_official';

export type MineType = 'opencast' | 'underground' | 'mixed';

export type CoalGrade = 'G1' | 'G2' | 'G3' | 'G4' | 'G5' | 'G6' | 'G7' | 'G8' | 'G9' | 'G10' | 'G11' | 'G12' | 'G13' | 'G14' | 'Coking Steel-I' | 'Coking Steel-II' | 'Coking Washery-IV';

export type TargetStatus = 'on_track' | 'behind' | 'ahead' | 'critical';

export type PathwayApprovalStatus = 'approved' | 'in_progress' | 'pending_approval' | 'draft';

export type AnomalySeverity = 'warning' | 'high' | 'critical';

export type AnomalyStatus = 'open' | 'clarification_requested' | 'flagged_for_audit' | 'resolved';

export interface AnomalyEvent {
  id: string;
  mineId: string;
  reportingPeriod: string;
  metric: string;
  observedValue: number;
  expectedRange: string;
  deviationPct: number;
  message: string;
  severity: AnomalySeverity;
  status: AnomalyStatus;
  dateReported: string;
  auditNotes?: string;
}

export interface SatelliteVerificationData {
  selfReportedReclaimedHa: number;
  satelliteObservedHa: number;
  discrepancyHa: number;
  discrepancyPct: number;
  status: 'verified' | 'review_required' | 'discrepancy_flagged';
  satellitePassDate: string;
  sensor: string;
  meanNdviScore: number;
  ndviBaselineYear: number;
  historicalTrendPct: number;
  notes: string;
}

export interface OperationalData {
  periodMonth: string;
  periodYear: number;
  coalExtractedTonnes: number;
  overburdenRemovedM3: number;
  strippingRatio: number;
  dieselMachineryLiters: number;
  dieselGeneratorsLiters: number;
  gridElectricityKWh: number;
  captivePowerKWh: number;
  renewableEnergyKWh: number;
  transportMode: 'rail_mgr' | 'road_truck' | 'belt_conveyor' | 'mixed';
  transportDistanceKm: number;
  explosivesKg: number;
  // Underground/mixed
  methaneContentM3PerTonne?: number;
  ventilationCH4Ppm?: number;
  drainedMethaneM3?: number;
  capturedMethaneM3?: number;
  // Water
  freshWaterPumpedKl: number;
  mineWaterTreatedKl: number;
  waterEnergyKWh: number;
  // Land
  disturbedLandHa: number;
  reclaimedLandHa: number;
  afforestedLandHa: number;
}

export interface MineEmissionsBreakdown {
  scope1: {
    dieselMachinery: number;
    dieselGenerators: number;
    fugitiveMethane: number;
    explosives: number;
    captiveCoal: number;
    total: number;
  };
  scope2: {
    gridElectricity: number;
    total: number;
  };
  scope3: {
    coalTransport: number;
    waterTreatmentPumping: number;
    total: number;
  };
  totalGrossEmissions: number;
  emissionReductionsAchieved: number;
  residualEmissions: number;
  carbonRemovalsSequestration: number;
  netEmissionsBalance: number;
  carbonIntensityTco2ePerTonne: number;
}

export interface MineRecord {
  id: string;
  name: string;
  code: string;
  company: 'SECL' | 'BCCL' | 'MCL' | 'CCL' | 'NCL' | 'WCL' | 'ECL' | 'SCCL';
  parentHolding: 'Coal India Limited (CIL)' | 'Singareni Collieries (SCCL)';
  state: 'Chhattisgarh' | 'Jharkhand' | 'Odisha' | 'Madhya Pradesh' | 'Maharashtra' | 'West Bengal' | 'Telangana' | 'Uttar Pradesh';
  district: string;
  coalfield: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  mineType: MineType;
  coalGrade: CoalGrade;
  depthMeters?: number;
  gassinessDegree?: 1 | 2 | 3;
  ventilationType?: 'Mechanical Exhaust' | 'Forced Axial' | 'Blower & Booster' | 'Natural Draft';
  annualCapacityMt: number;
  yearOpened: number;
  expectedYearsLeft: number;
  totalLeasedLandHa: number;
  disturbedLandHa: number;
  undisturbedLandHa: number;
  reclaimedLandHa: number;
  afforestedLandHa: number;
  operational: OperationalData;
  emissions: MineEmissionsBreakdown;
  satelliteData: SatelliteVerificationData;
  targetYear: number;
  targetIntensityTco2e: number;
  baselineIntensityTco2e: number;
  currentReductionPct: number;
  targetReductionPct: number;
  targetStatus: TargetStatus;
  pathwayStatus: PathwayApprovalStatus;
  pathwayApprovedDate?: string;
  selectedInterventionIds: string[];
  sustainabilityBudgetCrores: number;
  anomalies: AnomalyEvent[];
  reportingHistory: Array<{
    period: string;
    productionTonnes: number;
    emissionsTco2e: number;
    intensity: number;
    status: 'verified' | 'flagged';
  }>;
}

export interface EmissionFactors {
  dieselCombustionKgPerL: number;
  gridElectricityKgPerKwh: number;
  captiveCoalKgPerKwh: number;
  fugitiveMethaneGwp: number;
  opencastFugitiveCh4M3PerTonne: number;
  undergroundDeg1Ch4M3PerTonne: number;
  undergroundDeg2Ch4M3PerTonne: number;
  undergroundDeg3Ch4M3PerTonne: number;
  ch4DensityKgPerM3: number;
  explosivesKgCo2ePerKg: number;
  railTransportKgCo2ePerTkm: number;
  roadTruckTransportKgCo2ePerTkm: number;
  conveyorTransportKgCo2ePerTkm: number;
  treeSequestrationTonnesPerHaYear: number;
}

export interface DecarbonizationIntervention {
  id: string;
  title: string;
  category: 'solar' | 'electrification' | 'efficiency' | 'methane' | 'reclamation' | 'conveyor' | 'water';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  potentialReductionTco2e: number;
  potentialReductionPct: number;
  estimatedInvestmentCrores: number;
  annualSavingsCrores: number;
  paybackYears: number;
  timeMonths: number;
  impactLevel: 'high' | 'low';
  costLevel: 'high' | 'low';
  applicability: MineType[];
  blockers: string;
  description: string;
  subsidyApplicable?: string;
}

export interface NationalTargets {
  nationalReductionTargetPct: number;
  targetYear: number;
  baselineYear: number;
  mandatedScope: 'Scope 1 + Scope 2' | 'All Scopes';
  regionalTargets: Record<string, number>; // subsidiary/region name -> target pct
}
