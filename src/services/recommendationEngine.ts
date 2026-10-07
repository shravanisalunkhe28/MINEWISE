import { DecarbonizationIntervention, MineRecord, MineType } from '../types';

export const MASTER_INTERVENTIONS: DecarbonizationIntervention[] = [
  {
    id: 'fmc_conveyor',
    title: 'First-Mile Overland Belt Conveyor & In-Pit Crushing System',
    category: 'conveyor',
    priority: 'HIGH',
    potentialReductionTco2e: 42000,
    potentialReductionPct: 28,
    estimatedInvestmentCrores: 48.0,
    annualSavingsCrores: 14.5,
    paybackYears: 3.3,
    timeMonths: 18,
    impactLevel: 'high',
    costLevel: 'high',
    applicability: ['opencast', 'mixed'],
    blockers: 'Requires dedicated pit-to-rail corridor clearance and capital procurement approval under CIL FMC Phase-II.',
    description: 'Replaces long-lead heavy dumper truck haulage with high-capacity continuous in-pit conveyor belts directly connecting pit head to the railway siding/washery.',
    subsidyApplicable: 'Coal India FMC Capital Subsidy & Ministry of Coal Green Mining Grant',
  },
  {
    id: 'solar_pv_plant',
    title: '25 MW Ground-Mounted & Overburden Dump Solar PV Plant',
    category: 'solar',
    priority: 'HIGH',
    potentialReductionTco2e: 29500,
    potentialReductionPct: 20,
    estimatedInvestmentCrores: 32.5,
    annualSavingsCrores: 8.8,
    paybackYears: 3.7,
    timeMonths: 12,
    impactLevel: 'high',
    costLevel: 'high',
    applicability: ['opencast', 'underground', 'mixed'],
    blockers: 'Stabilization of dead OB bench slopes required for structural mounting safety; grid interconnection sub-station sync.',
    description: 'Utilizes non-active de-coaled benches and stabilized OB dump slopes for a captive 25 MW grid-tied solar photovoltaic array.',
    subsidyApplicable: 'MNRE Renewable Energy PSU Support Scheme (20% CFA)',
  },
  {
    id: 'electric_dump_trucks',
    title: 'Battery-Electric / Trolley-Assist 190t Dumper Fleet Conversion',
    category: 'electrification',
    priority: 'HIGH',
    potentialReductionTco2e: 36000,
    potentialReductionPct: 24,
    estimatedInvestmentCrores: 42.0,
    annualSavingsCrores: 11.2,
    paybackYears: 3.8,
    timeMonths: 20,
    impactLevel: 'high',
    costLevel: 'high',
    applicability: ['opencast', 'mixed'],
    blockers: 'Installation of overhead catenary infrastructure on steep ramp gradients; battery charging substations.',
    description: 'Transitions heavy 190t/240t diesel dumpers to electric trolley-assist for uphill loaded runs and battery operation within the loading benches.',
    subsidyApplicable: 'FAME-II Heavy Mining Vehicle Pilot Grant',
  },
  {
    id: 'methane_capture_vam',
    title: 'Coal Mine Methane (CMM) Capture & VAM Thermal Oxidation',
    category: 'methane',
    priority: 'HIGH',
    potentialReductionTco2e: 38000,
    potentialReductionPct: 35,
    estimatedInvestmentCrores: 18.5,
    annualSavingsCrores: 5.6,
    paybackYears: 3.3,
    timeMonths: 14,
    impactLevel: 'high',
    costLevel: 'low',
    applicability: ['underground', 'mixed'],
    blockers: 'Requires DGMS ventilation gas drainage clearance and pipeline routing to surface flaring/co-generation plant.',
    description: 'Drains high-purity methane pre-mining and oxidizes low-concentration Ventilation Air Methane (VAM) with regenerative heat recovery for captive power generation.',
    subsidyApplicable: 'CIL Methane Commercialization Policy Incentive',
  },
  {
    id: 'high_efficiency_fans',
    title: 'Main Mechanical Ventilation Fan Retrofit with Variable Frequency Drives',
    category: 'efficiency',
    priority: 'MEDIUM',
    potentialReductionTco2e: 7800,
    potentialReductionPct: 8,
    estimatedInvestmentCrores: 4.2,
    annualSavingsCrores: 2.1,
    paybackYears: 2.0,
    timeMonths: 6,
    impactLevel: 'low',
    costLevel: 'low',
    applicability: ['underground', 'mixed'],
    blockers: 'Requires planned 48-hour colliery maintenance outage for shaft fan replacement.',
    description: 'Replaces aging fixed-speed centrifugal main exhaust ventilation fans with aerodynamic high-efficiency axial fans governed by demand-responsive VFD automation.',
    subsidyApplicable: 'BEE (Bureau of Energy Efficiency) PAT Scheme E-Certs',
  },
  {
    id: 'mine_water_solar_pump',
    title: 'Solar-Powered High-Recovery Mine Dewatering & Eco-Filtration Plant',
    category: 'water',
    priority: 'MEDIUM',
    potentialReductionTco2e: 4500,
    potentialReductionPct: 4,
    estimatedInvestmentCrores: 5.8,
    annualSavingsCrores: 1.9,
    paybackYears: 3.1,
    timeMonths: 8,
    impactLevel: 'low',
    costLevel: 'low',
    applicability: ['opencast', 'underground', 'mixed'],
    blockers: 'Distribution pipeline rights of way to neighboring command areas.',
    description: 'Upgrades multistage mine dewatering pumps with IE4 super-premium efficiency motors and provides a 5 MLD pressure sand filter plant to supply treated water to surrounding townships.',
    subsidyApplicable: 'Jal Shakti Ministry Industrial Effluent Reuse Credit',
  },
  {
    id: 'afforestation_reclamation',
    title: 'Dense Native Miyawaki Afforestation & Bio-Remediation of OB Dumps',
    category: 'reclamation',
    priority: 'HIGH',
    potentialReductionTco2e: 12500,
    potentialReductionPct: 9,
    estimatedInvestmentCrores: 3.2,
    annualSavingsCrores: 0.9,
    paybackYears: 3.6,
    timeMonths: 12,
    impactLevel: 'high',
    costLevel: 'low',
    applicability: ['opencast', 'mixed', 'underground'],
    blockers: 'Slope geotechnical stability clearance; topsoil composting enrichment availability.',
    description: 'Establishes multi-tiered native botanical barriers (Sal, Teak, Neem, Bamboo, Mahua) over 250 hectares of backfilled de-coaled voids and external dumps for permanent carbon sink generation.',
    subsidyApplicable: 'CAMPA (Compensatory Afforestation Fund) State Window',
  },
  {
    id: 'scada_energy_mgmt',
    title: 'Digital IoT Energy Management & Automated Power Factor Correction',
    category: 'efficiency',
    priority: 'MEDIUM',
    potentialReductionTco2e: 5200,
    potentialReductionPct: 4,
    estimatedInvestmentCrores: 2.4,
    annualSavingsCrores: 1.6,
    paybackYears: 1.5,
    timeMonths: 4,
    impactLevel: 'low',
    costLevel: 'low',
    applicability: ['opencast', 'underground', 'mixed'],
    blockers: 'Substation SCADA telemetry integration.',
    description: 'Deploys real-time smart power meters on all continuous miners, conveyors, and surface transformers to eliminate idle load losses and maintain 0.99 power factor.',
    subsidyApplicable: 'State DISCOM Power Factor Incentive Rebate',
  },
  {
    id: 'dragline_shovel_elec',
    title: 'Electric Shovel & Dragline Auxiliary Regeneration Drive Upgrade',
    category: 'electrification',
    priority: 'MEDIUM',
    potentialReductionTco2e: 16000,
    potentialReductionPct: 11,
    estimatedInvestmentCrores: 14.5,
    annualSavingsCrores: 4.8,
    paybackYears: 3.0,
    timeMonths: 9,
    impactLevel: 'high',
    costLevel: 'low',
    applicability: ['opencast'],
    blockers: 'Original Equipment Manufacturer (OEM) electrical drive retrofit certification.',
    description: 'Installs regenerative braking systems on major 24m³ electric rope shovels and draglines, feeding gravitational descent energy back into the colliery 33kV ring main.',
  },
];

export class RecommendationEngine {
  /**
   * Generates tailored interventions dynamically matched to a mine's characteristics
   */
  public getPersonalizedRecommendations(mine: MineRecord): DecarbonizationIntervention[] {
    const totalEmissions = mine.emissions.totalGrossEmissions || 100000;
    const isOpencast = mine.mineType === 'opencast';
    const isUnderground = mine.mineType === 'underground';

    // Filter applicable interventions
    const applicable = MASTER_INTERVENTIONS.filter(item =>
      item.applicability.includes(mine.mineType)
    );

    // Scale potential reductions and investments based on actual mine production scale
    const scaleFactor = Math.max(0.4, Math.min(3.0, mine.annualCapacityMt / 15.0));

    return applicable.map(item => {
      let scaledReduction = Math.round(item.potentialReductionTco2e * scaleFactor);
      let scaledInvestment = round(item.estimatedInvestmentCrores * Math.pow(scaleFactor, 0.8), 1);
      let scaledSavings = round(item.annualSavingsCrores * scaleFactor, 1);
      const payback = round(scaledInvestment / (scaledSavings || 0.1), 1);
      const reductionPct = totalEmissions > 0 ? round((scaledReduction / totalEmissions) * 100, 1) : 10;

      // Adjust priority based on dominant emission source
      let priority = item.priority;
      if (isOpencast && (item.category === 'conveyor' || item.category === 'electrification')) {
        priority = 'HIGH';
      }
      if (isUnderground && item.category === 'methane') {
        priority = mine.gassinessDegree && mine.gassinessDegree >= 2 ? 'HIGH' : 'MEDIUM';
      }

      return {
        ...item,
        potentialReductionTco2e: scaledReduction,
        potentialReductionPct: reductionPct,
        estimatedInvestmentCrores: scaledInvestment,
        annualSavingsCrores: scaledSavings,
        paybackYears: payback,
        priority,
      };
    }).sort((a, b) => {
      // Prioritize High impact, then fast payback
      if (a.priority === 'HIGH' && b.priority !== 'HIGH') return -1;
      if (b.priority === 'HIGH' && a.priority !== 'HIGH') return 1;
      return a.paybackYears - b.paybackYears;
    });
  }

  /**
   * "If I can only do ONE thing this year"
   * Returns the single highest-impact, most cost-effective intervention ready for fast deployment
   */
  public getTopSingleIntervention(mine: MineRecord): DecarbonizationIntervention {
    const recommendations = this.getPersonalizedRecommendations(mine);
    // Score based on Reduction / Investment ratio weighted by time to deploy
    const scored = [...recommendations].sort((a, b) => {
      const scoreA = (a.potentialReductionTco2e / a.estimatedInvestmentCrores) / (a.timeMonths / 12);
      const scoreB = (b.potentialReductionTco2e / b.estimatedInvestmentCrores) / (b.timeMonths / 12);
      return scoreB - scoreA;
    });

    return scored[0] || recommendations[0];
  }

  /**
   * Budget Optimizer: Finds the optimal combination of interventions within user's available budget
   */
  public optimizeForBudget(
    mine: MineRecord,
    budgetCrores: number
  ): {
    selectedInterventions: DecarbonizationIntervention[];
    totalCostCrores: number;
    totalReductionTco2e: number;
    totalReductionPct: number;
    totalAnnualSavingsCrores: number;
    combinedPaybackYears: number;
  } {
    const list = this.getPersonalizedRecommendations(mine);
    // Sort by efficiency (CO2 reduced per Crore of investment)
    const sorted = [...list].sort((a, b) => {
      const effA = a.potentialReductionTco2e / a.estimatedInvestmentCrores;
      const effB = b.potentialReductionTco2e / b.estimatedInvestmentCrores;
      return effB - effA;
    });

    let remainingBudget = budgetCrores;
    const chosen: DecarbonizationIntervention[] = [];
    let totalCost = 0;
    let totalReduction = 0;
    let totalSavings = 0;

    for (const item of sorted) {
      if (item.estimatedInvestmentCrores <= remainingBudget) {
        chosen.push(item);
        remainingBudget -= item.estimatedInvestmentCrores;
        totalCost += item.estimatedInvestmentCrores;
        totalReduction += item.potentialReductionTco2e;
        totalSavings += item.annualSavingsCrores;
      }
    }

    const baselineEmissions = mine.emissions.totalGrossEmissions || 100000;
    const reductionPct = round((totalReduction / baselineEmissions) * 100, 1);
    const combinedPayback = totalSavings > 0 ? round(totalCost / totalSavings, 1) : 0;

    return {
      selectedInterventions: chosen,
      totalCostCrores: round(totalCost, 1),
      totalReductionTco2e: Math.round(totalReduction),
      totalReductionPct: reductionPct,
      totalAnnualSavingsCrores: round(totalSavings, 1),
      combinedPaybackYears: combinedPayback,
    };
  }
}

function round(val: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

export const recommendationEngine = new RecommendationEngine();
