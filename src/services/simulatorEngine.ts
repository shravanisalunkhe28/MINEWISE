import { MineRecord } from '../types';

export interface SimulatorInputs {
  solarAdoptionPct: number; // 0 - 100% of grid electricity replaced
  equipmentElectrificationPct: number; // 0 - 100% of diesel machinery replaced with electric
  energyEfficiencyPct: number; // 0 - 30% reduction in specific power/fuel
  methaneCapturePct: number; // 0 - 90% of fugitive methane captured/flared
  conveyorAdoptionPct: number; // 0 - 100% of road truck transport shifted to in-pit conveyor
  additionalAfforestationHa: number; // additional hectares planted
}

export interface SimulatorResults {
  baselineGrossEmissions: number;
  projectedGrossEmissions: number;
  absoluteReductionTco2e: number;
  percentageReduction: number;
  newCarbonIntensity: number;
  baselineCarbonIntensity: number;
  estimatedCapexCrores: number;
  annualOpexSavingsCrores: number;
  simplePaybackYears: number;
  residualEmissions: number;
  carbonRemovalsSequestration: number;
  netEmissionsBalance: number;
  categoryReductions: {
    dieselReductionTco2e: number;
    electricityReductionTco2e: number;
    methaneReductionTco2e: number;
    transportReductionTco2e: number;
    afforestationRemovalTco2e: number;
  };
}

export class SimulatorEngine {
  public simulate(mine: MineRecord, inputs: SimulatorInputs): SimulatorResults {
    const baseline = mine.emissions;
    const coalTonnes = mine.operational.coalExtractedTonnes || 1;

    // 1. Diesel reduction from electrification & energy efficiency
    const dieselBaseEmissions = baseline.scope1.dieselMachinery + baseline.scope1.dieselGenerators;
    // Efficiency improves diesel consumption first
    const efficiencyFactor = 1 - (inputs.energyEfficiencyPct / 100);
    // Electrification cuts the remaining diesel machinery emissions
    const dieselAfterEfficiency = dieselBaseEmissions * efficiencyFactor;
    const dieselElectrificationReduction = dieselAfterEfficiency * (inputs.equipmentElectrificationPct / 100);
    const newDieselEmissions = Math.max(0, dieselAfterEfficiency - dieselElectrificationReduction);
    const dieselReductionTco2e = dieselBaseEmissions - newDieselEmissions;

    // Note: Electrification adds to electrical demand (at high efficiency), but solar helps offset it
    const addedElectricityFromFleetKWh = (inputs.equipmentElectrificationPct / 100) * (mine.operational.dieselMachineryLiters * 3.5);

    // 2. Scope 2 Grid Electricity Reduction via Solar & Efficiency
    const baseGridKWh = mine.operational.gridElectricityKWh;
    const efficientGridKWh = baseGridKWh * efficiencyFactor;
    const totalElectricalDemandKWh = efficientGridKWh + addedElectricityFromFleetKWh;

    // Solar displacement
    const solarSolarDisplacedKWh = totalElectricalDemandKWh * (inputs.solarAdoptionPct / 100);
    const netGridKWh = Math.max(0, totalElectricalDemandKWh - solarSolarDisplacedKWh);
    const newScope2Emissions = (netGridKWh * 0.716) / 1000;
    const electricityReductionTco2e = Math.max(0, baseline.scope2.total - newScope2Emissions);

    // 3. Methane Reduction (especially for underground/mixed)
    const baseMethaneEmissions = baseline.scope1.fugitiveMethane;
    const methaneReductionTco2e = baseMethaneEmissions * (inputs.methaneCapturePct / 100);
    const newMethaneEmissions = Math.max(0, baseMethaneEmissions - methaneReductionTco2e);

    // 4. Transport reduction via Conveyor
    const baseTransportEmissions = baseline.scope3.coalTransport;
    // Conveyor is ~85% cleaner than truck transport
    const transportShift = inputs.conveyorAdoptionPct / 100;
    const transportReductionTco2e = baseTransportEmissions * transportShift * 0.85;
    const newTransportEmissions = Math.max(0, baseTransportEmissions - transportReductionTco2e);

    // 5. Afforestation Removals
    const baselineRemovals = baseline.carbonRemovalsSequestration;
    const addedRemovals = inputs.additionalAfforestationHa * 3.8; // 3.8 tCO2e/ha/yr
    const totalCarbonRemovals = baselineRemovals + addedRemovals;

    // Total Projected Gross Emissions
    const otherScope1 = baseline.scope1.explosives + baseline.scope1.captiveCoal;
    const otherScope3 = baseline.scope3.waterTreatmentPumping;

    const projectedGrossScope1 = newDieselEmissions + newMethaneEmissions + otherScope1;
    const projectedGrossScope2 = newScope2Emissions;
    const projectedGrossScope3 = newTransportEmissions + otherScope3;

    const projectedGrossEmissions = projectedGrossScope1 + projectedGrossScope2 + projectedGrossScope3;
    const baselineGross = baseline.totalGrossEmissions;

    const absoluteReduction = Math.max(0, baselineGross - projectedGrossEmissions);
    const percentageReduction = baselineGross > 0 ? (absoluteReduction / baselineGross) * 100 : 0;

    // Financial estimations (derived from Indian mining industry benchmarks)
    // Solar: ~₹3.5 Cr per MW (1 MW yields ~1.5 million kWh/yr)
    const solarMW = (solarSolarDisplacedKWh / 1500000);
    const solarCapex = solarMW * 3.6;

    // Fleet electrification: ~₹15 Cr per 100t dumper electric conversion
    const fleetCapex = (inputs.equipmentElectrificationPct / 100) * (mine.annualCapacityMt * 2.8);

    // Conveyor Capex: ~₹12 Cr per km or capacity scale
    const conveyorCapex = (inputs.conveyorAdoptionPct / 100) * (mine.annualCapacityMt * 3.2);

    // Methane Capture: ~₹15 Cr for degasification & flare/genset
    const methaneCapex = (inputs.methaneCapturePct / 100) * (isUndergroundOrMixed(mine) ? 22 : 8);

    // Efficiency: ~₹2.5 Cr for VFDs and SCADA
    const efficiencyCapex = (inputs.energyEfficiencyPct / 30) * 4.5;

    // Afforestation: ~₹0.012 Cr (₹1.2 Lakhs) per ha
    const afforestationCapex = (inputs.additionalAfforestationHa * 0.012);

    const totalCapexCrores = round(solarCapex + fleetCapex + conveyorCapex + methaneCapex + efficiencyCapex + afforestationCapex, 1);

    // Annual OPEX savings:
    // Diesel fuel saved: ₹90 / liter
    const dieselLitersSaved = (dieselReductionTco2e * 1000) / 2.687;
    const dieselSavingsCrores = (dieselLitersSaved * 90) / 10000000;

    // Grid electricity saved: ₹7.5 / kWh
    const gridKWhSaved = Math.max(0, baseGridKWh - netGridKWh);
    const powerSavingsCrores = (gridKWhSaved * 7.5) / 10000000;

    // Methane power generation savings / transport savings
    const transportSavingsCrores = (transportReductionTco2e / 1000) * 0.45;
    const methaneSavingsCrores = (methaneReductionTco2e / 1000) * 0.35;

    const totalAnnualSavingsCrores = round(dieselSavingsCrores + powerSavingsCrores + transportSavingsCrores + methaneSavingsCrores, 1);
    const payback = totalAnnualSavingsCrores > 0 ? round(totalCapexCrores / totalAnnualSavingsCrores, 1) : 0;

    const residual = Math.max(0, projectedGrossEmissions);
    const netBalance = Math.max(0, residual - totalCarbonRemovals);

    const newIntensity = coalTonnes > 0 ? projectedGrossEmissions / coalTonnes : 0;

    return {
      baselineGrossEmissions: round(baselineGross, 1),
      projectedGrossEmissions: round(projectedGrossEmissions, 1),
      absoluteReductionTco2e: round(absoluteReduction, 1),
      percentageReduction: round(percentageReduction, 1),
      newCarbonIntensity: round(newIntensity, 4),
      baselineCarbonIntensity: round(baseline.carbonIntensityTco2ePerTonne, 4),
      estimatedCapexCrores: totalCapexCrores,
      annualOpexSavingsCrores: totalAnnualSavingsCrores,
      simplePaybackYears: payback,
      residualEmissions: round(residual, 1),
      carbonRemovalsSequestration: round(totalCarbonRemovals, 1),
      netEmissionsBalance: round(netBalance, 1),
      categoryReductions: {
        dieselReductionTco2e: round(dieselReductionTco2e, 1),
        electricityReductionTco2e: round(electricityReductionTco2e, 1),
        methaneReductionTco2e: round(methaneReductionTco2e, 1),
        transportReductionTco2e: round(transportReductionTco2e, 1),
        afforestationRemovalTco2e: round(addedRemovals, 1),
      },
    };
  }

  public getOptimizationPreset(mode: 'max_reduction' | 'min_investment' | 'best_roi', mine: MineRecord): SimulatorInputs {
    const isUG = isUndergroundOrMixed(mine);

    switch (mode) {
      case 'max_reduction':
        return {
          solarAdoptionPct: 80,
          equipmentElectrificationPct: 65,
          energyEfficiencyPct: 20,
          methaneCapturePct: isUG ? 75 : 0,
          conveyorAdoptionPct: isUG ? 20 : 85,
          additionalAfforestationHa: 300,
        };
      case 'min_investment':
        return {
          solarAdoptionPct: 25,
          equipmentElectrificationPct: 10,
          energyEfficiencyPct: 18,
          methaneCapturePct: isUG ? 30 : 0,
          conveyorAdoptionPct: 15,
          additionalAfforestationHa: 80,
        };
      case 'best_roi':
      default:
        return {
          solarAdoptionPct: 55,
          equipmentElectrificationPct: 35,
          energyEfficiencyPct: 22,
          methaneCapturePct: isUG ? 60 : 0,
          conveyorAdoptionPct: isUG ? 0 : 60,
          additionalAfforestationHa: 150,
        };
    }
  }
}

function isUndergroundOrMixed(mine: MineRecord): boolean {
  return mine.mineType === 'underground' || mine.mineType === 'mixed';
}

function round(val: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

export const simulatorEngine = new SimulatorEngine();
