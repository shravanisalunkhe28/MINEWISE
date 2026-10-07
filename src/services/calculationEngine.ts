import { EmissionFactors, MineEmissionsBreakdown, MineType, OperationalData } from '../types';

// Default Emission Factors based on CEA (Central Electricity Authority, India 2024),
// IPCC 2006 Guidelines for National Greenhouse Gas Inventories & CMPDI norms
export const DEFAULT_EMISSION_FACTORS: EmissionFactors = {
  dieselCombustionKgPerL: 2.687, // IPCC Default for High-Speed Diesel (HSD)
  gridElectricityKgPerKwh: 0.716, // CEA CO2 Baseline Database for the Indian Power Sector
  captiveCoalKgPerKwh: 1.020, // Indian sub-bituminous coal captive power gen
  fugitiveMethaneGwp: 28, // IPCC AR5 100-year GWP without climate-carbon feedbacks
  opencastFugitiveCh4M3PerTonne: 1.2, // CMPDI typical opencast fugitive methane factor
  undergroundDeg1Ch4M3PerTonne: 3.2, // Degree I (low gassiness < 1 m3/t or CMPDI tier)
  undergroundDeg2Ch4M3PerTonne: 8.5, // Degree II gassiness (1 - 10 m3/t)
  undergroundDeg3Ch4M3PerTonne: 14.8, // Degree III gassiness (> 10 m3/t, e.g. Moonidih)
  ch4DensityKgPerM3: 0.67, // Density of methane gas at standard temperature & pressure
  explosivesKgCo2ePerKg: 0.170, // ANFO (Ammonium Nitrate Fuel Oil) blasting agent
  railTransportKgCo2ePerTkm: 0.032, // Dedicated Indian Railways freight rake / MGR
  roadTruckTransportKgCo2ePerTkm: 0.108, // Heavy commercial tipper truck
  conveyorTransportKgCo2ePerTkm: 0.015, // High-efficiency pipe/overland conveyor
  treeSequestrationTonnesPerHaYear: 3.8, // Indian native mixed deciduous forest carbon rate
};

class CalculationEngine {
  private factors: EmissionFactors = { ...DEFAULT_EMISSION_FACTORS };

  public getEmissionFactors(): EmissionFactors {
    return { ...this.factors };
  }

  public updateEmissionFactors(newFactors: Partial<EmissionFactors>): void {
    this.factors = { ...this.factors, ...newFactors };
  }

  public resetEmissionFactors(): void {
    this.factors = { ...DEFAULT_EMISSION_FACTORS };
  }

  /**
   * Calculates comprehensive Scope 1, 2, and 3 emissions for an Indian coal mine
   */
  public calculateEmissions(
    op: OperationalData,
    mineType: MineType,
    gassinessDegree: 1 | 2 | 3 = 1,
    existingRenewableOffsetTonnes: number = 0
  ): MineEmissionsBreakdown {
    const f = this.factors;

    // --- SCOPE 1: Direct Emissions ---
    // 1. Diesel combustion (Machinery & Generators)
    const dieselMachineryCo2e = (op.dieselMachineryLiters * f.dieselCombustionKgPerL) / 1000; // Tonnes CO2e
    const dieselGeneratorsCo2e = (op.dieselGeneratorsLiters * f.dieselCombustionKgPerL) / 1000;

    // 2. Fugitive Methane (CH4)
    let fugitiveMethaneCo2e = 0;

    if (mineType === 'opencast') {
      // Opencast seam exposure and post-mining desorption
      const ch4VolumeM3 = op.coalExtractedTonnes * f.opencastFugitiveCh4M3PerTonne;
      const ch4MassKg = ch4VolumeM3 * f.ch4DensityKgPerM3;
      fugitiveMethaneCo2e = (ch4MassKg * f.fugitiveMethaneGwp) / 1000;
    } else if (mineType === 'underground') {
      // Underground seam emission factor by DGMS Gassiness Degree
      let gasFactor = f.undergroundDeg1Ch4M3PerTonne;
      if (gassinessDegree === 2) gasFactor = f.undergroundDeg2Ch4M3PerTonne;
      if (gassinessDegree === 3) gasFactor = f.undergroundDeg3Ch4M3PerTonne;

      // If specific measured gas content is provided, prefer measured
      if (op.methaneContentM3PerTonne && op.methaneContentM3PerTonne > 0) {
        gasFactor = op.methaneContentM3PerTonne;
      }

      const totalGasReleasedM3 = op.coalExtractedTonnes * gasFactor;
      // Subtract captured methane if any
      const capturedM3 = op.capturedMethaneM3 || 0;
      const netVentedM3 = Math.max(0, totalGasReleasedM3 - capturedM3);

      const ch4MassKg = netVentedM3 * f.ch4DensityKgPerM3;
      fugitiveMethaneCo2e = (ch4MassKg * f.fugitiveMethaneGwp) / 1000;
    } else {
      // Mixed mine: 70% opencast, 30% underground allocation
      const ocCh4 = (op.coalExtractedTonnes * 0.7 * f.opencastFugitiveCh4M3PerTonne * f.ch4DensityKgPerM3 * f.fugitiveMethaneGwp) / 1000;
      const ugFactor = gassinessDegree === 3 ? f.undergroundDeg3Ch4M3PerTonne : f.undergroundDeg2Ch4M3PerTonne;
      const ugCh4 = (op.coalExtractedTonnes * 0.3 * ugFactor * f.ch4DensityKgPerM3 * f.fugitiveMethaneGwp) / 1000;
      fugitiveMethaneCo2e = ocCh4 + ugCh4;
    }

    // 3. Explosives (ANFO)
    const explosivesCo2e = (op.explosivesKg * f.explosivesKgCo2ePerKg) / 1000;

    // 4. Captive Coal Power Generation (if any)
    const captiveCoalCo2e = (op.captivePowerKWh * f.captiveCoalKgPerKwh) / 1000;

    const scope1Total = dieselMachineryCo2e + dieselGeneratorsCo2e + fugitiveMethaneCo2e + explosivesCo2e + captiveCoalCo2e;

    // --- SCOPE 2: Indirect Purchased Electricity ---
    // Net purchased grid electricity (minus on-site renewable generation)
    const netGridKWh = Math.max(0, op.gridElectricityKWh - op.renewableEnergyKWh);
    const gridElectricityCo2e = (netGridKWh * f.gridElectricityKgPerKwh) / 1000;
    const scope2Total = gridElectricityCo2e;

    // --- SCOPE 3: Value Chain (Transport & Water) ---
    // Coal transport from pit head to railhead / washery / thermal plant
    let transportFactor = f.railTransportKgCo2ePerTkm;
    if (op.transportMode === 'road_truck') transportFactor = f.roadTruckTransportKgCo2ePerTkm;
    if (op.transportMode === 'belt_conveyor') transportFactor = f.conveyorTransportKgCo2ePerTkm;
    if (op.transportMode === 'mixed') transportFactor = (f.railTransportKgCo2ePerTkm * 0.6) + (f.roadTruckTransportKgCo2ePerTkm * 0.4);

    const coalTransportCo2e = (op.coalExtractedTonnes * op.transportDistanceKm * transportFactor) / 1000;

    // Water Treatment & De-watering pumping electricity emissions
    const waterCo2e = (op.waterEnergyKWh * f.gridElectricityKgPerKwh) / 1000;

    const scope3Total = coalTransportCo2e + waterCo2e;

    // --- AGGREGATIONS ---
    const totalGrossEmissions = scope1Total + scope2Total + scope3Total;

    // Carbon Removals through established afforestation & ecological restoration
    const carbonRemovalsSequestration = op.afforestedLandHa * f.treeSequestrationTonnesPerHaYear;

    const emissionReductionsAchieved = existingRenewableOffsetTonnes;
    const residualEmissions = Math.max(0, totalGrossEmissions - emissionReductionsAchieved);
    const netEmissionsBalance = Math.max(0, residualEmissions - carbonRemovalsSequestration);

    const carbonIntensityTco2ePerTonne = op.coalExtractedTonnes > 0
      ? totalGrossEmissions / op.coalExtractedTonnes
      : 0;

    return {
      scope1: {
        dieselMachinery: round(dieselMachineryCo2e, 1),
        dieselGenerators: round(dieselGeneratorsCo2e, 1),
        fugitiveMethane: round(fugitiveMethaneCo2e, 1),
        explosives: round(explosivesCo2e, 1),
        captiveCoal: round(captiveCoalCo2e, 1),
        total: round(scope1Total, 1),
      },
      scope2: {
        gridElectricity: round(gridElectricityCo2e, 1),
        total: round(scope2Total, 1),
      },
      scope3: {
        coalTransport: round(coalTransportCo2e, 1),
        waterTreatmentPumping: round(waterCo2e, 1),
        total: round(scope3Total, 1),
      },
      totalGrossEmissions: round(totalGrossEmissions, 1),
      emissionReductionsAchieved: round(emissionReductionsAchieved, 1),
      residualEmissions: round(residualEmissions, 1),
      carbonRemovalsSequestration: round(carbonRemovalsSequestration, 1),
      netEmissionsBalance: round(netEmissionsBalance, 1),
      carbonIntensityTco2ePerTonne: round(carbonIntensityTco2ePerTonne, 4),
    };
  }
}

function round(val: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

export const calculationEngine = new CalculationEngine();
