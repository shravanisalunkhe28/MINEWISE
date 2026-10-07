import { AnomalyEvent, MineRecord, MineType, OperationalData } from '../types';

export interface AnomalyCheckResult {
  hasAnomaly: boolean;
  anomalies: Array<{
    metric: string;
    observedValue: number;
    expectedRange: string;
    deviationPct: number;
    message: string;
    severity: 'warning' | 'high' | 'critical';
  }>;
}

export class AnomalyDetectionService {
  /**
   * Evaluates operational data against standard CMPDI/DGMS mining engineering metrics
   * and historical statistical ranges for Indian coal mines.
   */
  public validateOperationalData(
    data: OperationalData,
    mineType: MineType,
    strippingRatio: number = 3.5,
    historicalAvgDieselPerTonne?: number
  ): AnomalyCheckResult {
    const anomalies: AnomalyCheckResult['anomalies'] = [];

    const coalTonnes = data.coalExtractedTonnes;
    if (coalTonnes <= 0) {
      anomalies.push({
        metric: 'Coal Production',
        observedValue: coalTonnes,
        expectedRange: '> 0 Tonnes',
        deviationPct: 100,
        message: 'Reported coal extraction is zero or negative while operating heavy machinery.',
        severity: 'critical',
      });
      return { hasAnomaly: true, anomalies };
    }

    // 1. Diesel Consumption vs Coal Production (Specific Fuel Consumption L/tonne)
    const totalDiesel = data.dieselMachineryLiters + data.dieselGeneratorsLiters;
    const dieselPerTonne = totalDiesel / coalTonnes;

    // Expected benchmark ranges for Indian mines:
    // Opencast: typically 1.2 to 2.8 Liters/tonne depending on Stripping Ratio (OB:Coal)
    // High stripping ratio (>5:1) can be up to 3.8 L/tonne
    // Underground: typically 0.2 to 0.8 L/tonne (mostly electric/conveyors)
    if (mineType === 'opencast') {
      const maxExpectedDiesel = Math.min(4.5, 1.8 + (strippingRatio * 0.45));
      const minExpectedDiesel = 0.8;

      if (dieselPerTonne > maxExpectedDiesel * 1.35) {
        const deviation = Math.round(((dieselPerTonne - maxExpectedDiesel) / maxExpectedDiesel) * 100);
        anomalies.push({
          metric: 'Diesel Fuel Intensity',
          observedValue: round(dieselPerTonne, 2),
          expectedRange: `${minExpectedDiesel.toFixed(1)} – ${maxExpectedDiesel.toFixed(1)} L/t`,
          deviationPct: deviation,
          message: `Diesel consumption (${round(dieselPerTonne, 2)} L/t) is +${deviation}% higher than expected for an opencast mine with stripping ratio ${strippingRatio}:1. Potential fuel leakage, uncalibrated flowmeters, or haul road inefficiencies.`,
          severity: deviation > 60 ? 'critical' : 'high',
        });
      } else if (dieselPerTonne < minExpectedDiesel * 0.5 && data.overburdenRemovedM3 > 50000) {
        anomalies.push({
          metric: 'Diesel Fuel Intensity',
          observedValue: round(dieselPerTonne, 2),
          expectedRange: `${minExpectedDiesel.toFixed(1)} – ${maxExpectedDiesel.toFixed(1)} L/t`,
          deviationPct: -50,
          message: `Diesel consumption (${round(dieselPerTonne, 2)} L/t) is implausibly low given ${data.overburdenRemovedM3.toLocaleString()} m³ of overburden removal reported. Possible missing contractor diesel logs.`,
          severity: 'warning',
        });
      }
    } else if (mineType === 'underground') {
      if (dieselPerTonne > 1.8) {
        const deviation = Math.round(((dieselPerTonne - 1.2) / 1.2) * 100);
        anomalies.push({
          metric: 'Underground Diesel Consumption',
          observedValue: round(dieselPerTonne, 2),
          expectedRange: '0.1 – 1.0 L/t',
          deviationPct: deviation,
          message: `Unusual heavy diesel consumption (${round(dieselPerTonne, 2)} L/t) in an underground colliery. Surface haulage or generator runs require audit.`,
          severity: 'high',
        });
      }
    }

    // 2. Electricity Specific Consumption (kWh / tonne)
    const totalPowerKWh = data.gridElectricityKWh + data.captivePowerKWh;
    const powerPerTonne = totalPowerKWh / coalTonnes;

    if (mineType === 'underground') {
      // Underground mines typically consume 18 – 40 kWh/t due to continuous ventilation, dewatering, and winding
      if (powerPerTonne > 65) {
        const deviation = Math.round(((powerPerTonne - 45) / 45) * 100);
        anomalies.push({
          metric: 'Specific Power Consumption',
          observedValue: round(powerPerTonne, 1),
          expectedRange: '18 – 45 kWh/t',
          deviationPct: deviation,
          message: `Underground power consumption (${round(powerPerTonne, 1)} kWh/t) exceeds standard colliery benchmarks by ${deviation}%. Check high ingress water pumping or auxiliary ventilation leakages.`,
          severity: 'warning',
        });
      }
    } else if (mineType === 'opencast') {
      if (powerPerTonne > 22) {
        const deviation = Math.round(((powerPerTonne - 15) / 15) * 100);
        anomalies.push({
          metric: 'Opencast Power Consumption',
          observedValue: round(powerPerTonne, 1),
          expectedRange: '4 – 15 kWh/t',
          deviationPct: deviation,
          message: `Opencast power intensity (${round(powerPerTonne, 1)} kWh/t) is +${deviation}% above peer average. Check major electrical dragline/shovel load factor or CHP idle runs.`,
          severity: 'warning',
        });
      }
    }

    // 3. Explosives (Blasting powder factor)
    if (mineType === 'opencast' && data.overburdenRemovedM3 > 10000) {
      const powderFactorKgPerM3 = data.explosivesKg / data.overburdenRemovedM3;
      if (powderFactorKgPerM3 > 0.85) {
        anomalies.push({
          metric: 'Blasting Powder Factor',
          observedValue: round(powderFactorKgPerM3, 3),
          expectedRange: '0.25 – 0.60 kg/m³',
          deviationPct: Math.round(((powderFactorKgPerM3 - 0.6) / 0.6) * 100),
          message: `Explosive consumption (${round(powderFactorKgPerM3, 3)} kg/m³ OB) is significantly above standard blast design patterns.`,
          severity: 'warning',
        });
      }
    }

    // 4. Historical Variance check (if historical baseline exists)
    if (historicalAvgDieselPerTonne && historicalAvgDieselPerTonne > 0) {
      const histDiffPct = Math.round(((dieselPerTonne - historicalAvgDieselPerTonne) / historicalAvgDieselPerTonne) * 100);
      if (histDiffPct > 35) {
        // Only add if not already captured
        const alreadyHasDiesel = anomalies.some(a => a.metric.includes('Diesel'));
        if (!alreadyHasDiesel) {
          anomalies.push({
            metric: 'Historical Diesel Trend',
            observedValue: round(dieselPerTonne, 2),
            expectedRange: `~${round(historicalAvgDieselPerTonne, 2)} L/t (hist)`,
            deviationPct: histDiffPct,
            message: `Diesel intensity is ${histDiffPct}% higher than this mine's historical 12-month rolling average.`,
            severity: histDiffPct > 50 ? 'high' : 'warning',
          });
        }
      }
    }

    return {
      hasAnomaly: anomalies.length > 0,
      anomalies,
    };
  }

  /**
   * Assesses satellite land reclamation discrepancies
   */
  public checkLandSatelliteDiscrepancy(
    reportedHa: number,
    satelliteObservedHa: number
  ): { hasMismatch: boolean; discrepancyPct: number; status: 'verified' | 'review_required' | 'discrepancy_flagged'; message: string } {
    if (reportedHa <= 0) {
      return {
        hasMismatch: false,
        discrepancyPct: 0,
        status: 'verified',
        message: 'No reclaimed land reported for period.',
      };
    }

    const diff = reportedHa - satelliteObservedHa;
    const discrepancyPct = Math.round((Math.abs(diff) / reportedHa) * 100);

    if (diff > 0 && discrepancyPct > 20) {
      return {
        hasMismatch: true,
        discrepancyPct,
        status: 'discrepancy_flagged',
        message: `Self-reported reclaimed land (${reportedHa} ha) exceeds Sentinel-2/Landsat-9 satellite verified canopy coverage (${satelliteObservedHa} ha) by ${discrepancyPct}%. Field ground-truthing required.`,
      };
    } else if (diff > 0 && discrepancyPct > 10) {
      return {
        hasMismatch: true,
        discrepancyPct,
        status: 'review_required',
        message: `Moderate discrepancy (${discrepancyPct}%) between self-reported reclamation (${reportedHa} ha) and satellite-observed green index (${satelliteObservedHa} ha).`,
      };
    }

    return {
      hasMismatch: false,
      discrepancyPct,
      status: 'verified',
      message: 'Self-reported land reclamation matches satellite NDVI vegetation density threshold within acceptable tolerance (±10%).',
    };
  }

  /**
   * Evaluates repeating anomaly frequency for Regional Officer audit triggers
   */
  public evaluateAuditTrigger(mine: MineRecord): { requiresAudit: boolean; repeatedCount: number; message: string } {
    const recentAnomalies = mine.anomalies.filter(a => a.status !== 'resolved');
    const highOrCriticalCount = recentAnomalies.filter(a => a.severity === 'high' || a.severity === 'critical').length;

    if (highOrCriticalCount >= 3) {
      return {
        requiresAudit: true,
        repeatedCount: highOrCriticalCount,
        message: `${mine.name} has triggered ${highOrCriticalCount} severe anomalies across recent reporting cycles. Mandated DGMS / CMPDI Regional Carbon Audit recommended.`,
      };
    }

    return {
      requiresAudit: false,
      repeatedCount: recentAnomalies.length,
      message: 'Anomaly count within standard monitoring limits.',
    };
  }
}

function round(val: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

export const anomalyDetectionService = new AnomalyDetectionService();
