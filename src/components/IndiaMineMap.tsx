import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MineRecord } from '../types';
import { MineSatelliteView } from './MineSatelliteView';
import {
  Compass,
  Layers,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  MapPin,
  X,
  ChevronRight,
  ZoomIn,
  Building2,
  TrendingDown,
  RefreshCw,
  Info
} from 'lucide-react';

// Avoid Leaflet missing asset 404s
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '',
  iconUrl: '',
  shadowUrl: '',
});

export interface IndiaMineMapProps {
  mines: MineRecord[];
  selectedMineId?: string | null;
  onSelectMine?: (mineId: string) => void;
  onOpenFullProfile?: (mineId: string) => void;
  userRole?: 'mine_manager' | 'regional_officer' | 'ministry_official';
  assignedRegion?: string;
  initialFilters?: {
    state?: string;
    psu?: string;
    mineType?: string;
    targetStatus?: string;
  };
}

// Major Indian Coalfields
export interface CoalfieldInfo {
  id: string;
  name: string;
  center: [number, number]; // [lat, lng]
  state: string;
  majorPsu: string;
  radiusMeters: number;
  description: string;
}

export const MAJOR_COALFIELDS: CoalfieldInfo[] = [
  { id: 'jharia', name: 'Jharia Coalfield', center: [23.75, 86.42], state: 'Jharkhand', majorPsu: 'BCCL', radiusMeters: 38000, description: 'Prime coking coal basin' },
  { id: 'raniganj', name: 'Raniganj Coalfield', center: [23.62, 87.13], state: 'West Bengal', majorPsu: 'ECL', radiusMeters: 40000, description: 'Birthplace of Indian coal mining' },
  { id: 'talcher', name: 'Talcher Coalfield', center: [20.95, 85.22], state: 'Odisha', majorPsu: 'MCL', radiusMeters: 44000, description: 'Mega power coal basin' },
  { id: 'ib_valley', name: 'IB Valley Coalfield', center: [21.85, 83.95], state: 'Odisha', majorPsu: 'MCL', radiusMeters: 38000, description: 'High-capacity opencast mines' },
  { id: 'korba', name: 'Korba Coalfield', center: [22.35, 82.68], state: 'Chhattisgarh', majorPsu: 'SECL', radiusMeters: 45000, description: 'Heart of SECL operations' },
  { id: 'singrauli', name: 'Singrauli Coalfield', center: [24.20, 82.67], state: 'Madhya Pradesh', majorPsu: 'NCL', radiusMeters: 42000, description: 'Northern Grid pithead power hub' },
  { id: 'godavari_valley', name: 'Godavari Valley Coalfield', center: [18.90, 79.50], state: 'Telangana', majorPsu: 'SCCL', radiusMeters: 48000, description: 'Pranhita-Godavari basin' },
  { id: 'wardha_valley', name: 'Wardha Valley Coalfield', center: [20.00, 79.20], state: 'Maharashtra', majorPsu: 'WCL', radiusMeters: 36000, description: 'Central India coal hub' },
];

const INDIA_CENTER: [number, number] = [22.5, 80.5];
const INDIA_MAX_BOUNDS: [[number, number], [number, number]] = [
  [6.0, 68.0],
  [37.5, 98.0],
];

function isValidCoordinates(coords?: { lat: number; lng: number }, mineName?: string): boolean {
  if (!coords) {
    if (mineName) console.warn(`[IndiaMineMap] Mine "${mineName}" missing coordinates`);
    return false;
  }
  const { lat, lng } = coords;
  const valid =
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= 6 &&
    lat <= 38 &&
    lng >= 68 &&
    lng <= 98;
  if (!valid) {
    console.warn(`[IndiaMineMap] Skipped invalid coordinates for "${mineName || 'unknown'}": [${lat}, ${lng}]`);
  }
  return valid;
}

function getMarkerRadius(emissionsTco2e: number): number {
  return Math.max(7, Math.min(22, Math.round(6 + Math.sqrt(Math.max(0, emissionsTco2e) / 180000) * 8)));
}

function getMarkerColors(mine: MineRecord) {
  if (mine.targetStatus === 'critical' || mine.anomalies.some(a => a.severity === 'critical')) {
    return { fill: '#C65353', stroke: '#8B2C2C', label: 'Critical / Flagged', badge: 'bg-red-50 text-[#C65353] border-red-200' };
  }
  if (mine.targetStatus === 'behind' || mine.anomalies.length > 0) {
    return { fill: '#D99A2B', stroke: '#9E6E16', label: 'Needs Attention', badge: 'bg-amber-50 text-[#D99A2B] border-amber-200' };
  }
  return { fill: '#3F7D58', stroke: '#255238', label: 'On Track', badge: 'bg-[#EDF5F0] text-[#3F7D58] border-[#CDE3D5]' };
}

// Invalidate size on mount, tab changes, and window resize
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);
    // Immediate and staged invalidations to account for CSS/layout stabilization
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 300);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);
  return null;
}

// Map Event Observer: Tracks zoom level for progressive clustering
function ZoomWatcher({ onZoomChange }: { onZoomChange: (z: number) => void }) {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });
  return null;
}

// Tile Error detector fallback
function TileErrorDetector({ onTileError }: { onTileError: () => void }) {
  const map = useMap();
  useEffect(() => {
    let errCount = 0;
    const handleError = () => {
      errCount++;
      if (errCount >= 3) {
        console.warn('[IndiaMineMap] Multiple OSM tile load errors detected. Activating offline vector fallback.');
        onTileError();
      }
    };
    map.on('tileerror', handleError);
    return () => {
      map.off('tileerror', handleError);
    };
  }, [map, onTileError]);
  return null;
}

// Helper: Equirectangular projection for Offline SVG Map
function projectToSvg(lat: number, lng: number): { x: number; y: number } {
  const minLat = 8.0;
  const maxLat = 37.0;
  const minLng = 68.0;
  const maxLng = 97.5;

  const clampedLat = Math.max(minLat, Math.min(maxLat, lat));
  const clampedLng = Math.max(minLng, Math.min(maxLng, lng));

  const x = ((clampedLng - minLng) / (maxLng - minLng)) * 520 + 65;
  const y = ((maxLat - clampedLat) / (maxLat - minLat)) * 430 + 55;
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

export const IndiaMineMap: React.FC<IndiaMineMapProps> = ({
  mines,
  selectedMineId: initialSelectedMineId,
  onSelectMine,
  onOpenFullProfile,
  userRole = 'ministry_official',
  assignedRegion,
  initialFilters,
}) => {
  // State variables
  const [filterState, setFilterState] = useState<string>(initialFilters?.state || 'all');
  const [filterPsu, setFilterPsu] = useState<string>(initialFilters?.psu || 'all');
  const [filterType, setFilterType] = useState<string>(initialFilters?.mineType || 'all');
  const [filterStatus, setFilterStatus] = useState<string>(initialFilters?.targetStatus || 'all');
  const [showCoalfields, setShowCoalfields] = useState<boolean>(true);
  const [useOfflineSvgFallback, setUseOfflineSvgFallback] = useState<boolean>(false);

  // Local selected mine state
  const [selectedMine, setSelectedMine] = useState<MineRecord | null>(() => {
    return initialSelectedMineId ? mines.find(m => m.id === initialSelectedMineId) || null : null;
  });
  const [hoveredSvgMine, setHoveredSvgMine] = useState<MineRecord | null>(null);

  // Sync when prop changes
  useEffect(() => {
    if (initialSelectedMineId) {
      const found = mines.find(m => m.id === initialSelectedMineId);
      if (found) setSelectedMine(found);
    }
  }, [initialSelectedMineId, mines]);

  // Filter valid coordinate mines
  const validMines = useMemo(() => {
    return mines.filter(m => isValidCoordinates(m.coordinates, m.name));
  }, [mines]);

  // Initial zoom and center calculation based on role and mines
  const defaultCenter = useMemo<[number, number]>(() => {
    if (validMines.length === 1) {
      return [validMines[0].coordinates.lat, validMines[0].coordinates.lng];
    }
    if (validMines.length > 0 && userRole === 'regional_officer') {
      const avgLat = validMines.reduce((s, m) => s + m.coordinates.lat, 0) / validMines.length;
      const avgLng = validMines.reduce((s, m) => s + m.coordinates.lng, 0) / validMines.length;
      return [avgLat, avgLng];
    }
    return INDIA_CENTER;
  }, [validMines, userRole]);

  const defaultZoom = useMemo<number>(() => {
    if (validMines.length === 1 || userRole === 'mine_manager') return 8;
    if (userRole === 'regional_officer') return 6;
    return 5;
  }, [validMines.length, userRole]);

  const [currentZoom, setCurrentZoom] = useState<number>(defaultZoom);

  // Filtered mines based on UI controls
  const filteredMines = useMemo(() => {
    return validMines.filter(m => {
      if (filterState !== 'all' && m.state !== filterState) return false;
      if (filterPsu !== 'all' && m.company !== filterPsu) return false;
      if (filterType !== 'all' && m.mineType !== filterType) return false;
      if (filterStatus !== 'all' && m.targetStatus !== filterStatus) return false;
      return true;
    });
  }, [validMines, filterState, filterPsu, filterType, filterStatus]);

  // Cluster grouping when zoomed out (zoom <= 5 and > 8 mines in national view)
  const clusters = useMemo(() => {
    if (userRole === 'mine_manager' || currentZoom > 5 || filteredMines.length <= 8) return null;

    const groupMap = new Map<string, { coalfield: string; state: string; lat: number; lng: number; mines: MineRecord[] }>();
    filteredMines.forEach(m => {
      const key = m.coalfield || m.state;
      const existing = groupMap.get(key);
      if (!existing) {
        groupMap.set(key, { coalfield: key, state: m.state, lat: m.coordinates.lat, lng: m.coordinates.lng, mines: [m] });
      } else {
        existing.mines.push(m);
        existing.lat = (existing.lat * (existing.mines.length - 1) + m.coordinates.lat) / existing.mines.length;
        existing.lng = (existing.lng * (existing.mines.length - 1) + m.coordinates.lng) / existing.mines.length;
      }
    });

    return Array.from(groupMap.values());
  }, [filteredMines, currentZoom, userRole]);

  const handleSelectMine = useCallback((mine: MineRecord) => {
    setSelectedMine(mine);
    if (onSelectMine) onSelectMine(mine.id);
  }, [onSelectMine]);

  const handleOpenProfile = useCallback((mineId: string) => {
    if (onOpenFullProfile) {
      onOpenFullProfile(mineId);
    }
  }, [onOpenFullProfile]);

  // Unique lists for dropdowns
  const stateOptions = useMemo(() => Array.from(new Set(validMines.map(m => m.state))), [validMines]);
  const psuOptions = useMemo(() => Array.from(new Set(validMines.map(m => m.company))), [validMines]);

  return (
    <div className="bg-white border border-[#E2E5E9] rounded-lg shadow-xs overflow-hidden flex flex-col w-full font-sans text-[#25282C]">
      {/* Map Header & Controls Strip */}
      <div className="p-4 md:px-5 md:py-3.5 bg-[#F8F9FA] border-b border-[#E2E5E9] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#EDF5F0] border border-[#CDE3D5] flex items-center justify-center text-[#5B8C6A] shrink-0">
            <Compass className="w-4 h-4 text-[#5B8C6A]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#25282C] tracking-tight">
                {userRole === 'mine_manager'
                  ? 'Colliery Geospatial Location & Surrounding Coalfield Basin'
                  : userRole === 'regional_officer'
                  ? `${assignedRegion || 'Regional'} Colliery Geospatial Fleet Map`
                  : 'National Coal Basin Geospatial Intelligence Map'}
              </h3>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
                useOfflineSvgFallback
                  ? 'bg-amber-50 text-[#D99A2B] border-amber-200'
                  : 'bg-[#EDF5F0] text-[#3F7D58] border-[#CDE3D5]'
              }`}>
                {useOfflineSvgFallback ? 'Offline Vector Fallback' : 'OpenStreetMap GIS'}
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              {userRole === 'mine_manager'
                ? `Positioned in ${validMines[0]?.coalfield || 'coal basin'} · Lat: ${validMines[0]?.coordinates.lat}, Lng: ${validMines[0]?.coordinates.lng}`
                : userRole === 'regional_officer'
                ? `Monitoring ${filteredMines.length} collieries within regional PSU jurisdiction`
                : `Visualizing ${filteredMines.length} verified coal mines across 8 major Indian coalfield basins`}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowCoalfields(!showCoalfields)}
            className={`px-2.5 py-1.5 rounded-md border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              showCoalfields
                ? 'bg-[#25282C] border-[#25282C] text-white'
                : 'bg-white border-[#E2E5E9] text-[#25282C] hover:bg-[#F1F3F5]'
            }`}
            title="Toggle major coalfield overlays"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Coalfield Basins</span>
          </button>

          <button
            onClick={() => setUseOfflineSvgFallback(!useOfflineSvgFallback)}
            className={`px-2.5 py-1.5 rounded-md border text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
              useOfflineSvgFallback
                ? 'bg-[#397D8A] border-[#397D8A] text-white'
                : 'bg-white border-[#E2E5E9] text-[#64748B] hover:text-[#25282C]'
            }`}
            title="Toggle between Live OSM tiles and Offline SVG fallback projection"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{useOfflineSvgFallback ? 'Switch to OSM' : 'Offline Vector'}</span>
          </button>
        </div>
      </div>

      {/* Live Compact Filters */}
      <div className="px-4 py-2 bg-white border-b border-[#E2E5E9] flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-[#64748B] flex items-center gap-1 text-[11px] uppercase tracking-wider shrink-0">
          <Filter className="w-3 h-3 text-[#5B8C6A]" /> Filters:
        </span>

        {/* State Filter */}
        <select
          value={filterState}
          onChange={e => setFilterState(e.target.value)}
          className="px-2 py-1 bg-[#F8F9FA] border border-[#E2E5E9] rounded text-xs text-[#25282C] font-medium focus:ring-1 focus:ring-[#5B8C6A] cursor-pointer"
        >
          <option value="all">All States ({validMines.length})</option>
          {stateOptions.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* PSU Filter (Only if multiple PSUs present) */}
        {psuOptions.length > 1 && (
          <select
            value={filterPsu}
            onChange={e => setFilterPsu(e.target.value)}
            className="px-2 py-1 bg-[#F8F9FA] border border-[#E2E5E9] rounded text-xs text-[#25282C] font-medium focus:ring-1 focus:ring-[#5B8C6A] cursor-pointer"
          >
            <option value="all">All PSUs</option>
            {psuOptions.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        )}

        {/* Mine Type Filter */}
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-2 py-1 bg-[#F8F9FA] border border-[#E2E5E9] rounded text-xs text-[#25282C] font-medium focus:ring-1 focus:ring-[#5B8C6A] cursor-pointer"
        >
          <option value="all">All Mine Types</option>
          <option value="opencast">Opencast</option>
          <option value="underground">Underground</option>
          <option value="mixed">Mixed</option>
        </select>

        {/* Target Status */}
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-2 py-1 bg-[#F8F9FA] border border-[#E2E5E9] rounded text-xs text-[#25282C] font-medium focus:ring-1 focus:ring-[#5B8C6A] cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="on_track">On Track</option>
          <option value="behind">Needs Attention</option>
          <option value="critical">Critical / Flagged</option>
        </select>

        {(filterState !== 'all' || filterPsu !== 'all' || filterType !== 'all' || filterStatus !== 'all') && (
          <button
            onClick={() => {
              setFilterState('all');
              setFilterPsu('all');
              setFilterType('all');
              setFilterStatus('all');
            }}
            className="text-[11px] text-[#C65353] hover:underline flex items-center gap-1 font-medium ml-auto cursor-pointer"
          >
            <X className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* Main Map Body with Side Drawer */}
      <div className="relative w-full overflow-hidden" style={{ height: '520px', minHeight: '500px' }}>
        {!useOfflineSvgFallback ? (
          <MapContainer
            center={defaultCenter}
            zoom={defaultZoom}
            minZoom={4}
            maxZoom={14}
            maxBounds={INDIA_MAX_BOUNDS}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <MapResizer />
            <ZoomWatcher onZoomChange={setCurrentZoom} />
            <TileErrorDetector onTileError={() => setUseOfflineSvgFallback(true)} />

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={18}
            />

            {/* Coalfield Overlay Circles */}
            {showCoalfields &&
              MAJOR_COALFIELDS.map(cf => (
                <Circle
                  key={cf.id}
                  center={cf.center}
                  radius={cf.radiusMeters}
                  pathOptions={{
                    color: '#397D8A',
                    fillColor: '#397D8A',
                    fillOpacity: 0.08,
                    weight: 1.5,
                    dashArray: '5, 5',
                  }}
                >
                  <Tooltip direction="top" opacity={0.9} sticky>
                    <div className="text-xs p-1">
                      <strong className="text-[#25282C] block font-bold">{cf.name}</strong>
                      <span className="text-[10px] text-[#64748B] block">
                        {cf.state} · Major PSU: {cf.majorPsu}
                      </span>
                    </div>
                  </Tooltip>
                </Circle>
              ))}

            {/* Clusters (When Zoomed Out in Ministry overview) */}
            {clusters &&
              clusters.map(cluster => (
                <CircleMarker
                  key={cluster.coalfield}
                  center={[cluster.lat, cluster.lng]}
                  radius={20}
                  pathOptions={{
                    fillColor: '#25282C',
                    color: '#5B8C6A',
                    weight: 3,
                    fillOpacity: 0.9,
                  }}
                  eventHandlers={{
                    click: e => {
                      const map = e.target._map;
                      if (map) map.setView([cluster.lat, cluster.lng], 7);
                    },
                  }}
                >
                  <Tooltip direction="top" permanent opacity={0.95} offset={[0, -22]}>
                    <div className="text-center font-sans text-xs">
                      <strong className="block text-[#25282C] font-bold">
                        {cluster.coalfield}
                      </strong>
                      <span className="text-[10px] text-[#5B8C6A] font-extrabold block">
                        {cluster.mines.length} Mines · Click to Zoom
                      </span>
                    </div>
                  </Tooltip>
                </CircleMarker>
              ))}

            {/* Individual Mines */}
            {!clusters &&
              filteredMines.map(mine => {
                const colors = getMarkerColors(mine);
                const radius = getMarkerRadius(mine.emissions.totalGrossEmissions);
                const isSelected = selectedMine?.id === mine.id;

                return (
                  <CircleMarker
                    key={mine.id}
                    center={[mine.coordinates.lat, mine.coordinates.lng]}
                    radius={isSelected ? radius + 4 : radius}
                    pathOptions={{
                      fillColor: colors.fill,
                      color: isSelected ? '#25282C' : colors.stroke,
                      weight: isSelected ? 3 : 2,
                      fillOpacity: 0.88,
                    }}
                    eventHandlers={{
                      click: () => handleSelectMine(mine),
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -radius]} opacity={0.95}>
                      <div className="text-xs p-1 font-sans">
                        <strong className="text-[#25282C] block font-bold">{mine.name}</strong>
                        <span className="text-[10px] text-[#64748B] block">
                          {mine.company} · {mine.coalfield || mine.district}
                        </span>
                        <span className="text-[10px] font-semibold text-[#3F7D58] block mt-0.5">
                          {Math.round(mine.emissions.totalGrossEmissions).toLocaleString()} tCO2e/yr
                        </span>
                      </div>
                    </Tooltip>
                  </CircleMarker>
                );
              })}
          </MapContainer>
        ) : (
          /* Offline Interactive SVG Map with Lat/Long Projection */
          <div className="w-full h-full bg-[#F4F6F8] relative overflow-hidden flex items-center justify-center select-none">
            {/* Top Indicator */}
            <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-md border border-[#E2E5E9] shadow-xs text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D99A2B] animate-pulse" />
              <span className="font-semibold text-[#25282C]">Offline Vector Projection (India Coal Basins)</span>
              <span className="text-[#64748B] text-[11px]">| Zero-bandwidth fallback mode</span>
            </div>

            <svg
              viewBox="0 0 650 520"
              className="w-full h-full max-h-[520px] object-contain"
              style={{ background: '#F8FAFC' }}
            >
              {/* Background Grid Pattern */}
              <defs>
                <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2E8F0" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="650" height="520" fill="url(#gridPattern)" />

              {/* Geo-accurate stylized outline of Indian Subcontinent landmass */}
              <path
                d="M 180 55 
                   C 195 45, 230 40, 245 60 
                   C 260 75, 290 85, 305 95 
                   C 325 110, 360 120, 395 125 
                   C 425 130, 480 140, 520 160 
                   C 545 175, 560 195, 545 210 
                   C 530 220, 485 220, 460 230 
                   C 440 240, 435 255, 420 270 
                   C 405 285, 390 320, 375 350 
                   C 360 380, 335 430, 305 465 
                   C 285 490, 265 510, 250 515 
                   C 240 510, 230 480, 220 445 
                   C 205 400, 190 350, 175 320 
                   C 160 295, 125 285, 95 280 
                   C 70 275, 55 260, 60 245 
                   C 70 230, 100 230, 115 220 
                   C 130 205, 135 175, 145 140 
                   C 155 105, 165 75, 180 55 Z"
                fill="#FFFFFF"
                stroke="#CBD5E1"
                strokeWidth="2"
                strokeLinejoin="round"
              />

              {/* Major Coalfield Overlays on SVG */}
              {showCoalfields &&
                MAJOR_COALFIELDS.map(cf => {
                  const pt = projectToSvg(cf.center[0], cf.center[1]);
                  return (
                    <g key={cf.id} className="cursor-pointer">
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="32"
                        fill="#397D8A"
                        fillOpacity="0.12"
                        stroke="#397D8A"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                      />
                      <text
                        x={pt.x}
                        y={pt.y - 36}
                        textAnchor="middle"
                        fill="#397D8A"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                      >
                        {cf.name.replace(' Coalfield', '')}
                      </text>
                    </g>
                  );
                })}

              {/* Render Mine Markers on SVG */}
              {filteredMines.map(mine => {
                const pt = projectToSvg(mine.coordinates.lat, mine.coordinates.lng);
                const colors = getMarkerColors(mine);
                const r = Math.max(6, Math.min(18, Math.round(5 + Math.sqrt(mine.emissions.totalGrossEmissions / 200000) * 7)));
                const isSelected = selectedMine?.id === mine.id;

                return (
                  <g
                    key={mine.id}
                    onClick={() => handleSelectMine(mine)}
                    onMouseEnter={() => setHoveredSvgMine(mine)}
                    onMouseLeave={() => setHoveredSvgMine(null)}
                    className="cursor-pointer transition-transform hover:scale-125"
                  >
                    {/* Pulsing ring for selected */}
                    {isSelected && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={r + 6}
                        fill="none"
                        stroke="#25282C"
                        strokeWidth="2"
                        strokeDasharray="3 2"
                      />
                    )}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? r + 3 : r}
                      fill={colors.fill}
                      stroke={isSelected ? '#25282C' : colors.stroke}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      fillOpacity="0.9"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip for Offline SVG */}
            {hoveredSvgMine && (
              <div
                className="absolute z-30 pointer-events-none bg-white p-2 rounded border border-[#E2E5E9] shadow-md text-xs font-sans max-w-xs"
                style={{
                  left: `${projectToSvg(hoveredSvgMine.coordinates.lat, hoveredSvgMine.coordinates.lng).x - 40}px`,
                  top: `${projectToSvg(hoveredSvgMine.coordinates.lat, hoveredSvgMine.coordinates.lng).y - 65}px`,
                }}
              >
                <strong className="block text-[#25282C] font-bold">{hoveredSvgMine.name}</strong>
                <span className="text-[10px] text-[#64748B] block">
                  {hoveredSvgMine.company} · {hoveredSvgMine.coalfield}
                </span>
                <span className="text-[10px] font-semibold text-[#3F7D58] block mt-0.5">
                  {Math.round(hoveredSvgMine.emissions.totalGrossEmissions).toLocaleString()} tCO2e/yr
                </span>
              </div>
            )}
          </div>
        )}

        {/* Compact Slide-out Side Drawer for Selected Mine (Requirement 7 & 10 & 12) */}
        {selectedMine && (
          <div className="absolute top-3 right-3 bottom-3 w-84 bg-white/95 backdrop-blur-md rounded-lg border border-[#E2E5E9] shadow-xl z-[1000] p-4 flex flex-col justify-between animate-fadeIn text-xs overflow-y-auto">
            <div className="space-y-3">
              <div className="flex items-start justify-between pb-2 border-b border-[#E2E5E9]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B8C6A] block">
                    {selectedMine.company} · {selectedMine.code}
                  </span>
                  <h4 className="font-bold text-sm text-[#25282C] leading-tight mt-0.5">
                    {selectedMine.name}
                  </h4>
                  <span className="text-[11px] text-[#64748B]">
                    {selectedMine.state} · {selectedMine.coalfield || selectedMine.district}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedMine(null)}
                  className="p-1 hover:bg-[#F1F3F5] rounded text-[#64748B] hover:text-[#25282C] cursor-pointer"
                  title="Close panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Satellite / Aerial Context Preview (Requirement 9 & 10) */}
              <MineSatelliteView mine={selectedMine} variant="compact" />

              {/* Status Badge */}
              <div className="flex items-center justify-between p-2 rounded bg-[#F8F9FA] border border-[#E2E5E9]">
                <span className="text-[#64748B]">Target Status:</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    getMarkerColors(selectedMine).badge
                  }`}
                >
                  {selectedMine.targetStatus.replace('_', ' ')}
                </span>
              </div>

              {/* Key Metrics */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#F1F3F5]">
                  <span className="text-[#64748B]">Mine Extraction:</span>
                  <strong className="text-[#25282C] capitalize">{selectedMine.mineType}</strong>
                </div>

                <div className="flex justify-between py-1 border-b border-[#F1F3F5]">
                  <span className="text-[#64748B]">Annual Production:</span>
                  <strong className="text-[#25282C] font-mono">
                    {selectedMine.operational.coalExtractedTonnes.toLocaleString('en-IN')} t
                  </strong>
                </div>

                <div className="flex justify-between py-1 border-b border-[#F1F3F5]">
                  <span className="text-[#64748B]">Gross Emissions:</span>
                  <strong className="text-[#25282C] font-mono font-bold">
                    {Math.round(selectedMine.emissions.totalGrossEmissions).toLocaleString('en-IN')} tCO2e
                  </strong>
                </div>

                <div className="flex justify-between py-1 border-b border-[#F1F3F5]">
                  <span className="text-[#64748B]">Carbon Intensity:</span>
                  <strong className="text-[#3F7D58] font-mono font-bold">
                    {selectedMine.emissions.carbonIntensityTco2ePerTonne.toFixed(4)} tCO2e/t
                  </strong>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-[#64748B]">Reduction Achieved:</span>
                  <strong className="text-[#3F7D58] font-bold">
                    -{selectedMine.currentReductionPct}%
                  </strong>
                </div>
              </div>
            </div>

            {/* View Full Profile CTA */}
            <div className="pt-3 border-t border-[#E2E5E9] space-y-2">
              <button
                onClick={() => handleOpenProfile(selectedMine.id)}
                className="w-full py-2 px-3 bg-[#5B8C6A] hover:bg-[#3F7D58] text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <span>View Colliery Full Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Map Footer & Clean Legend */}
      <div className="px-4 py-2.5 bg-[#F8F9FA] border-t border-[#E2E5E9] flex flex-wrap items-center justify-between gap-3 text-xs text-[#64748B]">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-[#25282C] text-[11px] uppercase tracking-wider">
            Status:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3F7D58]" />
            <span>On Track</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D99A2B]" />
            <span>Needs Attention</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C65353]" />
            <span>Critical / High Emissions</span>
          </div>
          <div className="flex items-center gap-1.5 pl-2 border-l border-[#E2E5E9]">
            <span className="w-3 h-3 rounded-full border border-dashed border-[#397D8A]" />
            <span>Coalfield Basin Overlay</span>
          </div>
        </div>

        <span className="text-[11px]">
          Marker size proportional to annual gross emissions (tCO2e)
        </span>
      </div>
    </div>
  );
};
