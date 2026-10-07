import React, { useState, useRef, useMemo } from 'react';
import { MineRecord } from '../types';
import { ASSET_IMAGES } from '../assets/images';
import {
  Satellite,
  AlertTriangle,
  CheckCircle2,
  Info,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  Layers,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Eye,
  Check,
  FileCheck2
} from 'lucide-react';

interface SatelliteHotspotAnalysisProps {
  mine: MineRecord;
  className?: string;
  onOpenAuditModal?: (hotspotId: string) => void;
}

export interface HotspotItem {
  id: string;
  name: string;
  type: string;
  xPct: number; // Percentage position inside satellite view
  yPct: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  reportedStatus: string;
  observedIndicator: string;
  verificationStatus: 'REQUIRES REVIEW' | 'IN PROGRESS' | 'VERIFIED CONGRUENT';
  description: string;
  ndviDelta: string;
  discrepancyHa: number;
  lastPassDate: string;
}

export const SatelliteHotspotAnalysis: React.FC<SatelliteHotspotAnalysisProps> = ({
  mine,
  className = '',
  onOpenAuditModal,
}) => {
  // Zoom & Pan state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Interactive Boundary Box (coordinates as percentages: x, y, width, height)
  const [boundaryBox, setBoundaryBox] = useState<{ x: number; y: number; w: number; h: number }>({
    x: 22,
    y: 18,
    w: 56,
    h: 62,
  });
  const [isDraggingBoundary, setIsDraggingBoundary] = useState<boolean>(false);
  const [boundaryDragStart, setBoundaryDragStart] = useState<{ mouseX: number; mouseY: number; boxX: number; boxY: number }>({
    mouseX: 0,
    mouseY: 0,
    boxX: 22,
    boxY: 18,
  });

  // Selected Hotspot
  const [selectedHotspotId, setSelectedHotspotId] = useState<string>('hotspot-01');
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [auditFlagSuccess, setAuditFlagSuccess] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic Hotspot definitions calibrated to the colliery
  const hotspots: HotspotItem[] = useMemo(() => [
    {
      id: 'hotspot-01',
      name: 'Hotspot 01: North OB Dump Slope',
      type: 'Reclamation Verification',
      xPct: 38,
      yPct: 32,
      priority: 'HIGH',
      reportedStatus: 'Reclaimed (Afforested Bio-Canopy)',
      observedIndicator: 'Low vegetation coverage · NDVI 0.28 vs 0.65 statutory baseline',
      verificationStatus: 'REQUIRES REVIEW',
      description: 'Recent Sentinel-2 multispectral pass indicates sparse vegetation density on active overburden bench 3. Visual signs of un-stabilized slope erosion.',
      ndviDelta: '-57% vs Baseline',
      discrepancyHa: 24,
      lastPassDate: mine.satelliteData?.satellitePassDate || '18 Feb 2026',
    },
    {
      id: 'hotspot-02',
      name: 'Hotspot 02: Western Buffer Corridor',
      type: 'Boundary & Disturbance Verification',
      xPct: 62,
      yPct: 48,
      priority: 'MEDIUM',
      reportedStatus: 'Undisturbed Statutory Buffer (50m)',
      observedIndicator: 'Excavation track signatures detected beyond permitted boundary',
      verificationStatus: 'IN PROGRESS',
      description: 'Heavy dumper track encroachment identified on outer western perimeter near agrarian boundary. Disturbance exceeds self-reported lease envelope.',
      ndviDelta: 'Soil Disturbance Alert',
      discrepancyHa: 3.2,
      lastPassDate: mine.satelliteData?.satellitePassDate || '18 Feb 2026',
    },
    {
      id: 'hotspot-03',
      name: 'Verified Area: South Pit Decoled Bench',
      type: 'Bio-Restoration Alignment',
      xPct: 50,
      yPct: 68,
      priority: 'LOW',
      reportedStatus: 'Bio-Reclamation Belt (96 ha)',
      observedIndicator: 'Consistent dense canopy closure · Mean NDVI 0.71',
      verificationStatus: 'VERIFIED CONGRUENT',
      description: 'Vegetative growth aligns with CMPDI biological reclamation standards. Carbon sequestration credits validated toward certified net removals.',
      ndviDelta: '+18% Biomass Growth',
      discrepancyHa: 0,
      lastPassDate: mine.satelliteData?.satellitePassDate || '18 Feb 2026',
    },
  ], [mine]);

  const activeHotspot = hotspots.find(h => h.id === selectedHotspotId) || hotspots[0];

  // Dynamic calculation based on boundary dimensions
  const liveObservationAreaHa = Math.round((boundaryBox.w * boundaryBox.h * 12.5));
  const liveMineBoundaryHa = mine.totalLeasedLandHa ? Math.round(mine.totalLeasedLandHa * 0.42) : 180;
  const liveReclaimedHa = mine.reclaimedLandHa || mine.satelliteData?.selfReportedReclaimedHa || 96;
  const liveVegCoverage = Math.max(35, Math.min(88, Math.round(62 + (boundaryBox.w - 50) * 0.3)));

  // Pan interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan if not dragging boundary box
    if ((e.target as HTMLElement).closest('.boundary-box')) return;
    setIsPanning(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    } else if (isDraggingBoundary) {
      const deltaX = ((e.clientX - boundaryDragStart.mouseX) / (containerRef.current?.clientWidth || 600)) * 100;
      const deltaY = ((e.clientY - boundaryDragStart.mouseY) / (containerRef.current?.clientHeight || 400)) * 100;

      setBoundaryBox(prev => ({
        ...prev,
        x: Math.max(5, Math.min(100 - prev.w - 5, boundaryDragStart.boxX + deltaX)),
        y: Math.max(5, Math.min(100 - prev.h - 5, boundaryDragStart.boxY + deltaY)),
      }));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setIsDraggingBoundary(false);
  };

  const startBoundaryDrag = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingBoundary(true);
    setBoundaryDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      boxX: boundaryBox.x,
      boxY: boundaryBox.y,
    });
  };

  const expandBoundary = () => {
    setBoundaryBox(prev => ({
      x: Math.max(5, prev.x - 6),
      y: Math.max(5, prev.y - 6),
      w: Math.min(90, prev.w + 12),
      h: Math.min(88, prev.h + 12),
    }));
  };

  const resetBoundary = () => {
    setBoundaryBox({ x: 22, y: 18, w: 56, h: 62 });
    setPanOffset({ x: 0, y: 0 });
    setZoomLevel(1);
  };

  const handleFlagAudit = (hotspot: HotspotItem) => {
    setAuditFlagSuccess(`Hotspot "${hotspot.name}" flagged for statutory DGMS field verification.`);
    setTimeout(() => setAuditFlagSuccess(null), 4000);
    if (onOpenAuditModal) onOpenAuditModal(hotspot.id);
  };

  return (
    <div className={`space-y-6 font-sans ${className}`}>
      {/* ==============================================================
          1. SECTION HEADER WITH MANDATORY PROTOTYPE DISCLAIMER
          ============================================================== */}
      <div className="bg-white p-5 rounded-lg border border-[#E2E5E9] shadow-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#EDF5F0] border border-[#CDE3D5] flex items-center justify-center text-[#5B8C6A] shrink-0">
              <Satellite className="w-4 h-4 text-[#5B8C6A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-[#25282C] tracking-tight uppercase">
                  SATELLITE HOTSPOT ANALYSIS
                </h3>
                {/* Mandatory Prototype Label (Section 3) */}
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-amber-50 text-[#D99A2B] border border-amber-200">
                  DEMO / PROTOTYPE DATA
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-[#EBF4F6] text-[#397D8A] border border-[#C5DFE3]">
                  Sentinel-2 MSI (10m)
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                "Identify areas requiring verification or intervention."
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#64748B] text-[11px] hidden sm:inline">
              Colliery: <strong className="text-[#25282C]">{mine.name}</strong> ({mine.state})
            </span>
            <button
              onClick={resetBoundary}
              className="px-2.5 py-1 text-xs font-semibold bg-[#F8F9FA] hover:bg-[#E2E5E9] border border-[#E2E5E9] rounded text-[#25282C] flex items-center gap-1 cursor-pointer transition-colors"
              title="Reset observation window and zoom"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset View</span>
            </button>
          </div>
        </div>

        {/* Hotspot Core Explanation Paragraph (Section 7) */}
        <div className="p-3 bg-[#F8F9FA] border border-[#E2E5E9] rounded-md text-xs text-[#343A40] leading-relaxed">
          <strong className="text-[#25282C]">Verification Purpose: </strong>
          MineWise compares reported land-use information with satellite-derived indicators to identify areas that may require verification. The observation view captures the colliery leasehold in relation to its surrounding forest reserves and agricultural buffer zones.
        </div>
      </div>

      {/* ==============================================================
          2. MAIN GEOSPATIAL OBSERVATION WORKSPACE & INFORMATION PANEL
          ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center: Interactive Large Satellite Canvas (Section 1, 2, 5, 6) */}
        <div className="lg:col-span-8 bg-[#1A1C1E] rounded-lg border border-[#343A40] overflow-hidden shadow-md flex flex-col">
          {/* Canvas Top Bar Controls */}
          <div className="px-4 py-2 bg-[#25282C] border-b border-[#343A40] flex items-center justify-between text-xs text-white">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#5B8C6A] animate-pulse" />
              <span className="font-semibold text-xs text-white">
                Satellite-Based Land Verification — Prototype
              </span>
              <span className="text-[#94A3B8] text-[11px] hidden md:inline">
                | Draggable Observation Boundary Active
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setZoomLevel(prev => Math.min(1.8, prev + 0.2))}
                className="p-1.5 bg-[#343A40] hover:bg-[#4E555E] rounded text-[#E2E5E9] cursor-pointer"
                title="Zoom in satellite view"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.2))}
                className="p-1.5 bg-[#343A40] hover:bg-[#4E555E] rounded text-[#E2E5E9] cursor-pointer"
                title="Zoom out satellite view"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowOverlays(!showOverlays)}
                className={`px-2 py-1 rounded text-[11px] font-semibold border cursor-pointer transition-colors ${
                  showOverlays
                    ? 'bg-[#5B8C6A] text-white border-[#5B8C6A]'
                    : 'bg-[#343A40] text-[#CBD5E1] border-[#4E555E]'
                }`}
              >
                Hotspot Overlays
              </button>
            </div>
          </div>

          {/* Satellite Image Viewport with Pan, Zoom & Draggable Boundary */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`relative aspect-[16/10] w-full overflow-hidden select-none bg-[#0D0E10] ${
              isPanning ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            {/* Satellite Image Layer (Showing wider surrounding terrain) */}
            <div
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: isPanning ? 'none' : 'transform 0.15s ease-out',
              }}
              className="w-full h-full relative"
            >
              <img
                src={ASSET_IMAGES.satelliteOpencast}
                alt="Colliery Regional Satellite Observation"
                className="w-full h-full object-cover pointer-events-none brightness-95 contrast-105"
              />

              {/* Surrounding Landscape Annotations */}
              <div className="absolute top-3 left-4 bg-black/60 backdrop-blur-xs text-white/90 text-[10px] px-2 py-0.5 rounded font-mono pointer-events-none">
                North Forest Buffer (Dense Sal Canopy)
              </div>
              <div className="absolute bottom-3 right-4 bg-black/60 backdrop-blur-xs text-white/90 text-[10px] px-2 py-0.5 rounded font-mono pointer-events-none">
                Agrarian Regional Periphery (50m Buffer)
              </div>

              {/* Surrounding Context Vector Boundary */}
              <div className="absolute inset-8 border border-dashed border-[#64748B]/50 pointer-events-none rounded">
                <span className="absolute top-1 left-2 text-[9px] font-mono text-[#94A3B8]">
                  Statutory Leasehold Envelope: {mine.totalLeasedLandHa.toLocaleString()} ha
                </span>
              </div>

              {/* Interactive Draggable / Resizable Observation Boundary (Section 2) */}
              <div
                style={{
                  left: `${boundaryBox.x}%`,
                  top: `${boundaryBox.y}%`,
                  width: `${boundaryBox.w}%`,
                  height: `${boundaryBox.h}%`,
                }}
                onMouseDown={startBoundaryDrag}
                className="boundary-box absolute border-2 border-[#5B8C6A] bg-[#5B8C6A]/10 rounded shadow-lg cursor-move transition-colors group z-20"
              >
                {/* Boundary HUD Header */}
                <div className="absolute top-1 left-1.5 bg-[#25282C]/90 backdrop-blur-xs text-white text-[9px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1 pointer-events-none">
                  <Move className="w-2.5 h-2.5 text-[#5B8C6A]" />
                  <span>Observation Area: {liveObservationAreaHa} ha</span>
                </div>

                {/* Corner Resizing Grips Visual */}
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#5B8C6A] border border-white rounded-xs shadow-xs" />
                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#5B8C6A] border border-white rounded-xs shadow-xs" />
                <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#5B8C6A] border border-white rounded-xs shadow-xs" />
                <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#5B8C6A] border border-white rounded-xs shadow-xs" />

                <div className="absolute bottom-1 right-1.5 bg-black/70 text-[#A3D0B0] text-[8px] font-mono px-1 py-0.5 rounded pointer-events-none">
                  DRAG TO RE-CENTER
                </div>
              </div>

              {/* OVERLAID SATELLITE HOTSPOT MARKERS (Section 5 & 6) */}
              {showOverlays &&
                hotspots.map(spot => {
                  const isSelected = selectedHotspotId === spot.id;

                  return (
                    <div
                      key={spot.id}
                      style={{
                        left: `${spot.xPct}%`,
                        top: `${spot.yPct}%`,
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedHotspotId(spot.id);
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer group"
                    >
                      {/* Pulsing indicator ring */}
                      <span
                        className={`absolute -inset-2 rounded-full animate-ping opacity-75 ${
                          spot.priority === 'HIGH'
                            ? 'bg-red-500'
                            : spot.priority === 'MEDIUM'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      />

                      {/* Center pin badge */}
                      <div
                        className={`relative px-2 py-1 rounded-md text-[10px] font-bold shadow-md flex items-center gap-1.5 border transition-transform duration-200 group-hover:scale-110 ${
                          isSelected ? 'ring-2 ring-white scale-105' : ''
                        } ${
                          spot.priority === 'HIGH'
                            ? 'bg-[#C65353] text-white border-red-300'
                            : spot.priority === 'MEDIUM'
                            ? 'bg-[#D99A2B] text-white border-amber-300'
                            : 'bg-[#3F7D58] text-white border-emerald-300'
                        }`}
                      >
                        {spot.priority === 'HIGH' ? (
                          <span className="w-2 h-2 rounded-full bg-white" />
                        ) : spot.priority === 'MEDIUM' ? (
                          <span className="w-2 h-2 rounded-full bg-white" />
                        ) : (
                          <Check className="w-2.5 h-2.5 text-white" />
                        )}
                        <span className="font-mono whitespace-nowrap">
                          {spot.priority === 'HIGH'
                            ? '🔴 Hotspot 01'
                            : spot.priority === 'MEDIUM'
                            ? '⚠ Hotspot 02'
                            : '🟢 Verified Area'}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Bottom HUD Bar */}
            <div className="absolute bottom-2 left-2 z-10 bg-black/75 backdrop-blur-xs text-white px-2.5 py-1 rounded text-[10px] font-mono flex items-center gap-3">
              <span>Sensor: Sentinel-2 MSI (10m)</span>
              <span>·</span>
              <span>Coordinates: {mine.coordinates.lat.toFixed(4)}°N, {mine.coordinates.lng.toFixed(4)}°E</span>
              <span>·</span>
              <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
            </div>
          </div>

          {/* Hotspot Map Legend (Section 5) */}
          <div className="px-4 py-2.5 bg-[#25282C] border-t border-[#343A40] flex flex-wrap items-center justify-between gap-3 text-xs text-[#CBD5E1]">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-bold text-white uppercase text-[10px] tracking-wider">
                Hotspot Legend:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C65353]" />
                <span className="text-[11px]">🔴 High Priority (Possible Disturbance)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D99A2B]" />
                <span className="text-[11px]">⚠ Review Required (Vegetation Mismatch)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3F7D58]" />
                <span className="text-[11px]">🟢 Verified Area (NDVI Aligned)</span>
              </div>
            </div>

            <span className="text-[10px] text-[#94A3B8]">
              Click markers to view audit telemetry
            </span>
          </div>
        </div>

        {/* Right: SATELLITE OBSERVATION INFORMATION PANEL (Section 4 & 6 & 9) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Observation Information Panel Card */}
          <div className="bg-white p-5 rounded-lg border border-[#E2E5E9] shadow-xs space-y-4">
            <div className="pb-2 border-b border-[#E2E5E9] flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#25282C] uppercase tracking-wider">
                SATELLITE OBSERVATION
              </span>
              <span className="text-[10px] font-mono text-[#5B8C6A] font-bold">
                PROTOTYPE VIEW
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-[#F1F3F5]">
                <span className="text-[#64748B]">Colliery Mine:</span>
                <strong className="text-[#25282C] font-semibold">{mine.name}</strong>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#F1F3F5]">
                <span className="text-[#64748B]">Observation Area:</span>
                <strong className="text-[#25282C] font-mono font-bold text-sm">
                  {liveObservationAreaHa.toLocaleString()} ha
                </strong>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#F1F3F5]">
                <span className="text-[#64748B]">Mine Boundary:</span>
                <strong className="text-[#25282C] font-mono">{liveMineBoundaryHa.toLocaleString()} ha</strong>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#F1F3F5]">
                <span className="text-[#64748B]">Reclaimed Area:</span>
                <strong className="text-[#3F7D58] font-mono">{liveReclaimedHa.toLocaleString()} ha</strong>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#F1F3F5]">
                <span className="text-[#64748B]">Vegetation Coverage:</span>
                <strong className="text-[#397D8A] font-mono font-bold">{liveVegCoverage}%</strong>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-[#64748B]">Verification Status:</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                  activeHotspot.priority === 'HIGH'
                    ? 'bg-red-50 text-[#C65353] border border-red-200'
                    : activeHotspot.priority === 'MEDIUM'
                    ? 'bg-amber-50 text-[#D99A2B] border border-amber-200'
                    : 'bg-[#EDF5F0] text-[#3F7D58] border border-[#CDE3D5]'
                }`}>
                  {activeHotspot.verificationStatus}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons (Section 4) */}
            <div className="pt-2 border-t border-[#E2E5E9] space-y-2">
              <button
                onClick={expandBoundary}
                className="w-full py-2 px-3 bg-[#25282C] hover:bg-[#343A40] text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Expand Observation Area</span>
              </button>

              <button
                onClick={resetBoundary}
                className="w-full py-2 px-3 bg-white hover:bg-[#F8F9FA] text-[#25282C] border border-[#E2E5E9] rounded text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-[#5B8C6A]" />
                <span>Compare Land Status vs Baseline</span>
              </button>
            </div>
          </div>

          {/* ACTIVE HOTSPOT DETAIL CARD (Section 6 & 9) */}
          <div className="bg-white p-5 rounded-lg border border-[#E2E5E9] shadow-xs space-y-3">
            <div className="flex items-start justify-between pb-2 border-b border-[#E2E5E9]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B8C6A] block">
                  INSPECTED SATELLITE HOTSPOT
                </span>
                <h4 className="font-bold text-sm text-[#25282C] mt-0.5">
                  {activeHotspot.name}
                </h4>
              </div>

              <div className="text-right">
                <span className="text-[9px] uppercase text-[#64748B] block font-semibold">Priority</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase ${
                    activeHotspot.priority === 'HIGH'
                      ? 'bg-red-100 text-red-800'
                      : activeHotspot.priority === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {activeHotspot.priority} PRIORITY
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[#64748B] block text-[11px]">Hotspot Type:</span>
                <strong className="text-[#25282C]">{activeHotspot.type}</strong>
              </div>

              <div className="p-2.5 rounded bg-[#F8F9FA] border border-[#E2E5E9] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#64748B] text-[11px]">Reported Colliery Status:</span>
                  <strong className="text-[#25282C]">{activeHotspot.reportedStatus}</strong>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#E2E5E9]">
                  <span className="text-[#64748B] text-[11px]">Observed Sensor Indicator:</span>
                  <strong className={activeHotspot.priority === 'HIGH' ? 'text-[#C65353]' : 'text-[#397D8A]'}>
                    {activeHotspot.observedIndicator}
                  </strong>
                </div>
              </div>

              <p className="text-[#64748B] text-xs leading-relaxed pt-1">
                {activeHotspot.description}
              </p>

              {auditFlagSuccess && (
                <div className="p-2.5 bg-[#EDF5F0] border border-[#CDE3D5] rounded text-xs text-[#255238] font-medium flex items-center gap-1.5 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-[#3F7D58] shrink-0" />
                  <span>{auditFlagSuccess}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#E2E5E9] flex items-center gap-2">
              <button
                onClick={() => handleFlagAudit(activeHotspot)}
                className="flex-1 py-2 px-3 bg-[#5B8C6A] hover:bg-[#3F7D58] text-white rounded text-xs font-semibold cursor-pointer transition-colors shadow-2xs flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Flag for Field Audit</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
