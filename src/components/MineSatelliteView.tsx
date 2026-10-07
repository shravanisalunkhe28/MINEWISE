import React, { useState } from 'react';
import { MineRecord } from '../types';
import { ASSET_IMAGES } from '../assets/images';
import {
  Satellite,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Calendar,
  Maximize2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Eye
} from 'lucide-react';

interface MineSatelliteViewProps {
  mine: MineRecord;
  variant?: 'compact' | 'full' | 'card';
  onInspectVerification?: () => void;
  className?: string;
}

export const MineSatelliteView: React.FC<MineSatelliteViewProps> = ({
  mine,
  variant = 'card',
  onInspectVerification,
  className = '',
}) => {
  const [showBoundaryOverlay, setShowBoundaryOverlay] = useState<boolean>(true);
  const [imageMode, setImageMode] = useState<'rgb' | 'ndvi'>('rgb');

  const sat = mine.satelliteData;
  const isVerified = sat?.status === 'verified';
  const isReclaimed = (mine.reclaimedLandHa || mine.operational?.reclaimedLandHa || 0) > 300;

  // Select appropriate satellite asset
  const satelliteImageSrc = isReclaimed
    ? ASSET_IMAGES.satelliteReclaimed
    : ASSET_IMAGES.satelliteOpencast;

  const disturbedHa = mine.disturbedLandHa || mine.operational?.disturbedLandHa || 0;
  const reclaimedHa = mine.reclaimedLandHa || mine.operational?.reclaimedLandHa || 0;
  const verifiedHa = sat?.satelliteObservedHa || reclaimedHa;

  if (variant === 'compact') {
    return (
      <div className={`space-y-2 font-sans ${className}`}>
        <div className="relative rounded-md overflow-hidden border border-[#E2E5E9] bg-[#1E2024] aspect-[16/9] group">
          <img
            src={satelliteImageSrc}
            alt={`${mine.name} Satellite View`}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Coordinate & Sensor Watermark */}
          <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-mono text-white/90">
            {sat?.sensor ? sat.sensor.split(' ')[0] : 'Sentinel-2 MSI'} · {mine.coordinates.lat.toFixed(3)}°N
          </div>

          {/* Overlay Boundary Indicator */}
          <div className="absolute inset-2 border border-dashed border-[#5B8C6A]/70 pointer-events-none rounded-xs" />

          {/* Verification Badge */}
          <div className="absolute bottom-1.5 right-1.5">
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase flex items-center gap-1 backdrop-blur-xs ${
                isVerified
                  ? 'bg-[#EDF5F0]/90 text-[#3F7D58] border border-[#CDE3D5]'
                  : 'bg-amber-50/90 text-[#D99A2B] border border-amber-200'
              }`}
            >
              {isVerified ? (
                <>
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>Land Verified</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-2.5 h-2.5" />
                  <span>Audit Flagged</span>
                </>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#64748B]">
          <span>
            {mine.state} · {mine.coalfield || mine.district}
          </span>
          <span className="font-mono text-[#25282C] font-semibold">
            NDVI {sat?.meanNdviScore ? sat.meanNdviScore.toFixed(2) : '0.64'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-[#E2E5E9] rounded-lg shadow-xs overflow-hidden font-sans ${className}`}>
      {/* Header */}
      <div className="p-3.5 bg-[#F8F9FA] border-b border-[#E2E5E9] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#EDF5F0] border border-[#CDE3D5] flex items-center justify-center text-[#5B8C6A]">
            <Satellite className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#25282C] tracking-tight">
              Satellite Earth Observation & Land Boundary
            </h4>
            <span className="text-[10px] text-[#64748B]">
              CMPDI · Sentinel-2 MSI Multi-Spectral Verification ({sat?.satellitePassDate || 'Recent Pass'})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowBoundaryOverlay(!showBoundaryOverlay)}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold border cursor-pointer transition-colors ${
              showBoundaryOverlay
                ? 'bg-[#25282C] text-white border-[#25282C]'
                : 'bg-white text-[#64748B] border-[#E2E5E9] hover:bg-[#F1F3F5]'
            }`}
          >
            Boundary
          </button>
        </div>
      </div>

      {/* Satellite Imagery Frame */}
      <div className="relative aspect-[16/9] w-full bg-[#1E2024] overflow-hidden group">
        <img
          src={satelliteImageSrc}
          alt={`${mine.name} Aerial Orthophoto`}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
        />

        {/* Boundary Vector Overlay */}
        {showBoundaryOverlay && (
          <div className="absolute inset-4 border-2 border-dashed border-[#5B8C6A] rounded pointer-events-none shadow-sm">
            <div className="absolute top-2 left-2 bg-[#25282C]/80 backdrop-blur-xs text-white text-[9px] px-2 py-0.5 rounded font-mono">
              Leasehold: {mine.totalLeasedLandHa.toLocaleString()} ha
            </div>
            <div className="absolute bottom-2 right-2 bg-[#3F7D58]/90 text-white text-[9px] px-2 py-0.5 rounded font-mono font-bold">
              Bio-Reclamation Belt
            </div>
          </div>
        )}

        {/* Sensor & Date HUD */}
        <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white px-2.5 py-1 rounded text-[10px] font-mono flex items-center gap-2">
          <span>10m Spatial Res</span>
          <span>·</span>
          <span>{mine.coordinates.lat.toFixed(4)}°N, {mine.coordinates.lng.toFixed(4)}°E</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-[#F8F9FA] rounded border border-[#E2E5E9]">
            <span className="text-[10px] text-[#64748B] uppercase font-bold block">Disturbed</span>
            <span className="text-sm font-extrabold text-[#25282C] font-mono">
              {disturbedHa.toLocaleString()} ha
            </span>
          </div>

          <div className="p-2 bg-[#F8F9FA] rounded border border-[#E2E5E9]">
            <span className="text-[10px] text-[#64748B] uppercase font-bold block">Reclaimed</span>
            <span className="text-sm font-extrabold text-[#3F7D58] font-mono">
              {reclaimedHa.toLocaleString()} ha
            </span>
          </div>

          <div className="p-2 bg-[#F8F9FA] rounded border border-[#E2E5E9]">
            <span className="text-[10px] text-[#64748B] uppercase font-bold block">Observed Area</span>
            <span className="text-sm font-extrabold text-[#397D8A] font-mono">
              {verifiedHa.toLocaleString()} ha
            </span>
          </div>
        </div>

        {/* Verification Status & Action */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <div className="flex items-center gap-1.5">
            {isVerified ? (
              <span className="text-[11px] font-semibold text-[#3F7D58] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Land status officially verified
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-[#D99A2B] flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Audit discrepancy flagged (±{sat?.discrepancyPct || 3.1}%)
              </span>
            )}
          </div>

          {onInspectVerification && (
            <button
              onClick={onInspectVerification}
              className="text-[11px] font-bold text-[#5B8C6A] hover:text-[#3F7D58] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View Verification Audit</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
