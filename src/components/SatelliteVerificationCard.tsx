import React from 'react';
import { MineRecord } from '../types';
import { 
  TreePine, 
  Satellite, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Calendar, 
  Layers, 
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';

interface SatelliteVerificationCardProps {
  mine: MineRecord;
}

export const SatelliteVerificationCard: React.FC<SatelliteVerificationCardProps> = ({ mine }) => {
  const sat = mine.satelliteData;
  const isVerified = sat.status === 'verified';
  const isReviewRequired = sat.status === 'review_required';
  const isCritical = sat.status === 'discrepancy_flagged';

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-5">
      {/* Header with Demo Satellite Verification tag */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Satellite className="w-5 h-5 text-cyan-600" />
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Satellite Land Reclamation & Bio-Restoration Verification
            </h4>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Independent multispectral NDVI audit of self-reported vegetative cover and afforestation over de-coaled benches and dumps
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2 py-0.5 rounded font-mono font-medium bg-cyan-50 text-cyan-800 border border-cyan-200">
            Demo satellite verification
          </span>
          <span className={`text-xs px-2.5 py-1 rounded font-bold flex items-center gap-1.5 ${
            isVerified
              ? 'bg-emerald-100 text-emerald-800'
              : isReviewRequired
              ? 'bg-amber-100 text-amber-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {isVerified ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>VERIFIED CONGRUENT</span>
              </>
            ) : isReviewRequired ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>REVIEW REQUIRED</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>DISCREPANCY FLAGGED</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Primary Data Comparison: Self-Reported vs Satellite-Observed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Self Reported Area */}
        <div className="p-3.5 bg-slate-50 rounded border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
            SELF-REPORTED RECLAIMED AREA
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 font-tabular">
              {sat.selfReportedReclaimedHa}
            </span>
            <span className="text-xs text-slate-500 font-medium">hectares (ha)</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Submitted in quarterly colliery compliance returns
          </span>
        </div>

        {/* Metric 2: Satellite-Observed Green Area */}
        <div className="p-3.5 bg-slate-50 rounded border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
            SATELLITE-OBSERVED VEGETATION STATUS
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-tabular ${
              isVerified ? 'text-emerald-700' : 'text-amber-700'
            }`}>
              {sat.satelliteObservedHa}
            </span>
            <span className="text-xs text-slate-500 font-medium">ha equivalent verified area</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1 font-mono">
            Sensor: {sat.sensor}
          </span>
        </div>

        {/* Metric 3: Discrepancy & Canopy Index */}
        <div className={`p-3.5 rounded border ${
          isVerified
            ? 'bg-emerald-50/50 border-emerald-200'
            : 'bg-red-50/50 border-red-200'
        }`}>
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
            VARIANCE & CANOPY DENSITY
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`text-xl font-bold font-tabular ${
              isVerified ? 'text-emerald-800' : 'text-red-700'
            }`}>
              {sat.discrepancyHa > 0 ? `-${sat.discrepancyHa} ha` : 'Aligned'}
            </span>
            <span className="text-xs text-slate-600 font-medium font-tabular">
              ({sat.discrepancyPct.toFixed(1)}% variance)
            </span>
          </div>
          <span className="text-[11px] text-slate-600 block mt-1 font-mono">
            Mean NDVI: {sat.meanNdviScore.toFixed(2)} (High Bio-activity &gt; 0.60)
          </span>
        </div>
      </div>

      {/* Explanatory Policy Callout */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-800">Regulatory Verification Principle: </strong>
          Satellite-based vegetation analysis (Sentinel-2 & Landsat-9 high-resolution imagery) is used as an independent, non-tamperable check of reported reclamation and afforestation before carbon removals are certified toward net-neutrality claims.
        </div>
      </div>

      {/* Observation Notes & Sensor Metadata */}
      <div className="p-3.5 bg-white border border-slate-200 rounded text-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between text-slate-500 text-[11px] border-b border-slate-100 pb-2">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Last Satellite Pass: <strong className="text-slate-700">{sat.satellitePassDate}</strong>
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            Vegetation Growth Trend since {sat.ndviBaselineYear}:{' '}
            <strong className={`font-tabular ${sat.historicalTrendPct >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              {sat.historicalTrendPct >= 0 ? `+${sat.historicalTrendPct}%` : `${sat.historicalTrendPct}%`}
            </strong>
          </span>
        </div>

        <p className="text-slate-700 leading-relaxed">
          <strong className="text-slate-900">Remote Sensing Auditor Commentary:</strong> {sat.notes}
        </p>
      </div>
    </div>
  );
};
