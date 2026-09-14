import React, { useState, useEffect } from 'react';
import {
  Waves, Fish, Droplets, MapPin, Globe2, Route as RouteIcon,
  Radio, Navigation, Plus, Eye, Layers, AlertTriangle, EyeOff, Anchor, Compass,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, Polygon, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type {
  PfzZone, Spill, Debris, Boundary, Corridor,
  WeatherPoint, Vessel, HabitatZone, Alert,
} from '../api';

const vesselIcon = L.divIcon({
  className: '',
  html: '<div class="map-vessel-icon"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const hazardIcon = L.divIcon({
  className: '',
  html: '<div class="map-hazard-icon"></div>',
  iconSize: [11, 11],
  iconAnchor: [5, 5],
});

const observationIcon = L.divIcon({
  className: '',
  html: '<div class="map-observation-icon"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const buoyIcon = (id: string) =>
  L.divIcon({
    className: '',
    html: `<div style="background:#eab308; color:#0f172a; font-size:10px; font-weight:800; border-radius:4px; padding:2px 6px; border:1px solid #ffffff; box-shadow:0 0 10px rgba(234, 179, 8, 0.7); display:flex; align-items:center; gap:3px; white-space:nowrap; cursor:pointer;">⚓ ${id}</div>`,
    iconSize: [60, 20],
    iconAnchor: [30, 10],
  });

export interface SectorInfo {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  icon: string;
  center: [number, number];
  zoom: number;
  bounds: [[number, number], [number, number]];
  sensors: string[];
  currentVelocity: string;
  currentDirection: string;
  waveHeight: string;
  surfaceTemp: string;
  buoys: {
    id: string;
    name: string;
    lat: number;
    lng: number;
    depth_m: number;
    insitu_sst: number;
    sat_sst: number;
    delta_sst: number;
    salinity: number;
    status: string;
  }[];
}

export const MAP_SECTORS: SectorInfo[] = [
  {
    id: 'gujarat_dwarka',
    name: 'Gujarat Coast (Dwarka & Saurashtra Shelf)',
    shortName: 'Dwarka / Gujarat',
    badge: 'ISRO 26176 CASE STUDY',
    icon: '🎯',
    center: [22.25, 68.60],
    zoom: 8,
    bounds: [[21.6, 68.0], [22.8, 69.8]],
    sensors: ['INSAT-3D Thermal IR', 'Oceansat-3 (OCM-3 / SSTM)', 'SCATSAT-1 Wind Vectors'],
    currentVelocity: '0.30 m/s',
    currentDirection: 'Northeast (045°)',
    waveHeight: '1.2m (Hs < 1.5m safe)',
    surfaceTemp: '26.85°C (1.45°C/deg front)',
    buoys: [
      { id: 'AD06', name: 'NIOT Arabian Sea Buoy AD06 (Dwarka Shelf)', lat: 22.15, lng: 68.65, depth_m: 55, insitu_sst: 26.9, sat_sst: 26.85, delta_sst: 0.05, salinity: 36.2, status: 'GROUND-TRUTH VERIFIED' },
      { id: 'ARGO_290192', name: 'INCOIS Argo Float 290192 (Gujarat Deep)', lat: 22.45, lng: 68.30, depth_m: 420, insitu_sst: 26.8, sat_sst: 26.85, delta_sst: -0.05, salinity: 36.4, status: 'PROFILING NOMINAL' },
    ],
  },
  {
    id: 'bob_visakhapatnam',
    name: 'Bay of Bengal (Visakhapatnam Coast)',
    shortName: 'Bay of Bengal',
    badge: 'EAST COAST BASIN',
    icon: '🌊',
    center: [18.40, 84.20],
    zoom: 8,
    bounds: [[16.5, 82.8], [18.8, 85.5]],
    sensors: ['Oceansat-3 (OCM-3 / SSTM)', 'INSAT-3DR Imager', 'SCATSAT-1'],
    currentVelocity: '0.45 m/s',
    currentDirection: 'East-Southeast (ESE)',
    waveHeight: '1.8m (Moderate Caution)',
    surfaceTemp: '27.40°C (Warm patch)',
    buoys: [
      { id: 'BD08', name: 'INCOIS-NIOT Moored Buoy BD08', lat: 17.80, lng: 84.50, depth_m: 45, insitu_sst: 27.4, sat_sst: 27.5, delta_sst: -0.10, salinity: 33.8, status: 'GROUND-TRUTH VERIFIED' },
      { id: 'CB02', name: 'Coastal Buoy Visakhapatnam CB02', lat: 17.65, lng: 83.35, depth_m: 28, insitu_sst: 27.6, sat_sst: 27.7, delta_sst: -0.10, salinity: 33.5, status: 'ACTIVE' },
    ],
  },
  {
    id: 'as_kochi',
    name: 'Arabian Sea (Malabar Coast / Kochi)',
    shortName: 'Kochi / Malabar',
    badge: 'UPWELLING CORRIDOR',
    icon: '🐟',
    center: [10.20, 75.80],
    zoom: 8,
    bounds: [[9.2, 74.8], [11.2, 76.8]],
    sensors: ['Oceansat-3 (OCM-3 / SSTM)', 'INSAT-3D', 'EOS-04 SAR'],
    currentVelocity: '0.52 m/s',
    currentDirection: 'South-Southeast (SSE)',
    waveHeight: '1.8m (Monsoon Swell)',
    surfaceTemp: '27.20°C (Coastal Upwelling)',
    buoys: [
      { id: 'AD01', name: 'NIOT Arabian Sea Deep Buoy AD01', lat: 10.50, lng: 75.30, depth_m: 60, insitu_sst: 27.8, sat_sst: 27.85, delta_sst: -0.05, salinity: 35.1, status: 'GROUND-TRUTH VERIFIED' },
      { id: 'CB05', name: 'Cochin Estuarine Buoy CB05', lat: 9.95, lng: 76.15, depth_m: 22, insitu_sst: 28.2, sat_sst: 28.1, delta_sst: 0.10, salinity: 34.2, status: 'ACTIVE' },
    ],
  },
  {
    id: 'gulf_mannar',
    name: 'Gulf of Mannar & Palk Bay Biosphere',
    shortName: 'Gulf of Mannar',
    badge: 'BIOSPHERE RESERVE',
    icon: '🪸',
    center: [9.00, 79.10],
    zoom: 8,
    bounds: [[8.3, 78.2], [9.7, 79.9]],
    sensors: ['Oceansat-3 (OCM-3)', 'Sentinel-2 Bio', 'INSAT-3DR'],
    currentVelocity: '0.28 m/s',
    currentDirection: 'East (090°)',
    waveHeight: '0.9m (Calm Protected Reef)',
    surfaceTemp: '28.10°C (Warm Coral Shelf)',
    buoys: [
      { id: 'MB04', name: 'Mannar Biosphere Monitoring Buoy MB04', lat: 8.90, lng: 78.80, depth_m: 22, insitu_sst: 28.4, sat_sst: 28.3, delta_sst: 0.10, salinity: 34.8, status: 'GROUND-TRUTH VERIFIED' },
      { id: 'PB01', name: 'Palk Strait Tidal Gauge Buoy PB01', lat: 9.45, lng: 79.25, depth_m: 14, insitu_sst: 28.6, sat_sst: 28.5, delta_sst: 0.10, salinity: 34.0, status: 'ACTIVE' },
    ],
  },
  {
    id: 'all_india',
    name: 'All-India Multi-Basin Overview',
    shortName: 'All-India Overview',
    badge: 'NATIONAL EEZ SYNOPSIS',
    icon: '🇮🇳',
    center: [15.5, 78.5],
    zoom: 5,
    bounds: [[6.5, 66.0], [24.0, 89.0]],
    sensors: ['Constellation: Oceansat-3 + INSAT-3D/3DR + EOS-04 + SCATSAT'],
    currentVelocity: 'Synoptic Field',
    currentDirection: 'Multi-Basin Circulation',
    waveHeight: '0.9m – 2.4m range',
    surfaceTemp: '26.8°C – 28.6°C',
    buoys: [
      { id: 'AD06', name: 'NIOT Buoy AD06 (Dwarka)', lat: 22.15, lng: 68.65, depth_m: 55, insitu_sst: 26.9, sat_sst: 26.85, delta_sst: 0.05, salinity: 36.2, status: 'GROUND-TRUTH VERIFIED' },
      { id: 'BD08', name: 'INCOIS Buoy BD08 (Vizag)', lat: 17.80, lng: 84.50, depth_m: 45, insitu_sst: 27.4, sat_sst: 27.5, delta_sst: -0.10, salinity: 33.8, status: 'GROUND-TRUTH VERIFIED' },
      { id: 'AD01', name: 'NIOT Deep Buoy AD01 (Kochi)', lat: 10.50, lng: 75.30, depth_m: 60, insitu_sst: 27.8, sat_sst: 27.85, delta_sst: -0.05, salinity: 35.1, status: 'GROUND-TRUTH VERIFIED' },
      { id: 'MB04', name: 'Mannar Buoy MB04', lat: 8.90, lng: 78.80, depth_m: 22, insitu_sst: 28.4, sat_sst: 28.3, delta_sst: 0.10, salinity: 34.8, status: 'GROUND-TRUTH VERIFIED' },
    ],
  },
];

function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.9 });
  }, [center, zoom, map]);
  return null;
}

interface MapClickHandlerProps {
  onMapClick: (coords: [number, number]) => void;
}

function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
  useMapEvents({
    click(e) {
      onMapClick([Number(e.latlng.lat.toFixed(4)), Number(e.latlng.lng.toFixed(4))]);
    },
  });
  return null;
}

interface UnifiedMarineMapProps {
  pfz?: PfzZone[];
  weather?: WeatherPoint[];
  spills?: Spill[];
  debris?: Debris[];
  boundaries?: Boundary[];
  corridors?: Corridor[];
  vessels?: Vessel[];
  habitats?: HabitatZone[];
  alerts?: Alert[];
  onOpenGeotagModal: (coords?: [number, number]) => void;
}

export const UnifiedMarineMap: React.FC<UnifiedMarineMapProps> = ({
  pfz = [],
  weather = [],
  spills = [],
  debris = [],
  boundaries = [],
  corridors = [],
  vessels = [],
  habitats = [],
  alerts = [],
  onOpenGeotagModal,
}) => {
  const [selectedSectorId, setSelectedSectorId] = useState<string>('gujarat_dwarka');

  const [layers, setLayers] = useState({
    vessels: true,
    pfz: true,
    weather: true,
    buoys: true,
    spills: true,
    debris: true,
    boundaries: true,
    corridors: true,
    habitats: true,
    alerts: true,
  });

  const currentSector = MAP_SECTORS.find((s) => s.id === selectedSectorId) || MAP_SECTORS[0];
  const [mouseCoords, setMouseCoords] = useState<[number, number]>(currentSector.center);

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const layerItems = [
    { key: 'vessels' as const, label: 'AIS Live Vessels', count: vessels.length, icon: <Navigation size={14} />, color: 'var(--accent-teal)' },
    { key: 'pfz' as const, label: 'PFZ Fishing Zones', count: pfz.length, icon: <Fish size={14} />, color: '#3b82f6' },
    { key: 'buoys' as const, label: 'NIOT / INCOIS Buoys', count: currentSector.buoys.length, icon: <Anchor size={14} />, color: '#eab308' },
    { key: 'weather' as const, label: 'Sea Weather & Waves', count: weather.length, icon: <Waves size={14} />, color: '#3b82f6' },
    { key: 'spills' as const, label: 'Oil Spill Hazards', count: spills.length, icon: <Droplets size={14} />, color: '#ef4444' },
    { key: 'debris' as const, label: 'Marine Debris Clusters', count: debris.length, icon: <MapPin size={14} />, color: '#f59e0b' },
    { key: 'boundaries' as const, label: 'Smart Geofences & EEZ', count: boundaries.length, icon: <Globe2 size={14} />, color: '#8b5cf6' },
    { key: 'habitats' as const, label: 'Fish Habitats & Spawning', count: habitats.length, icon: <Fish size={14} />, color: '#22d3ee' },
    { key: 'corridors' as const, label: 'Safe Corridors', count: corridors.length, icon: <RouteIcon size={14} />, color: '#3b82f6' },
    { key: 'alerts' as const, label: 'Geotagged Observations', count: alerts.length, icon: <AlertTriangle size={14} />, color: '#ec4899' },
  ];

  return (
    <div className="anim-fade" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexShrink: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 className="section-title" style={{ margin: 0 }}>Unified Interactive Marine GIS Map</h2>
            <span className="badge badge-teal" style={{ fontSize: '0.65rem' }}>{currentSector.badge}</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '3px' }}>
            Multi-sector oceanographic situational map. Switch coastal sectors below to monitor thermal fronts, buoys, and fishing zones.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn-primary" onClick={() => onOpenGeotagModal(mouseCoords)}>
            <Plus size={15} /> Log Geotagged Observation
          </button>
          <span className="badge badge-teal"><Radio size={11} /> 3s Telemetry Stream</span>
        </div>
      </div>

      {/* Multi-Sector Selector Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexShrink: 0, overflowX: 'auto', paddingBottom: '2px' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Compass size={13} color="var(--accent-teal)" /> Coastal Sectors:
        </span>
        {MAP_SECTORS.map((sec) => {
          const isSelected = sec.id === currentSector.id;
          return (
            <button
              key={sec.id}
              onClick={() => {
                setSelectedSectorId(sec.id);
                setMouseCoords(sec.center);
              }}
              className={isSelected ? 'btn-primary' : 'btn-ghost'}
              style={{
                padding: '5px 12px',
                fontSize: '0.76rem',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderColor: isSelected ? 'var(--accent-teal)' : 'var(--border-subtle)',
                background: isSelected ? undefined : 'rgba(255,255,255,0.03)',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{sec.icon}</span>
              <span style={{ fontWeight: isSelected ? 700 : 500 }}>{sec.shortName}</span>
              {sec.id === 'gujarat_dwarka' && (
                <span className="badge badge-teal" style={{ fontSize: '0.55rem', padding: '0 4px' }}>ISRO</span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: '18px', flex: 1, minHeight: 0 }}>
        {/* Layer Controls & Sector HUD */}
        <div className="surface-base" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
            <span className="label-caps"><Layers size={11} style={{ verticalAlign: '-1px', marginRight: 4 }} /> Active Layers</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{Object.values(layers).filter(Boolean).length} / {Object.keys(layers).length} ON</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
            {layerItems.map((item) => {
              const active = layers[item.key];
              return (
                <button
                  key={item.key}
                  onClick={() => toggleLayer(item.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 9px',
                    borderRadius: '6px',
                    background: active ? 'rgba(0, 212, 170, 0.08)' : 'transparent',
                    border: `1px solid ${active ? 'rgba(0, 212, 170, 0.2)' : 'transparent'}`,
                    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.76rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: active ? item.color : 'var(--text-muted)' }}>{item.icon}</span>
                    <span style={{ fontWeight: active ? 600 : 400 }}>{item.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="badge" style={{ padding: '1px 5px', fontSize: '0.6rem', background: 'rgba(0,0,0,0.25)' }}>{item.count}</span>
                    {active ? <Eye size={12} color="var(--accent-teal)" /> : <EyeOff size={12} color="var(--text-muted)" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Sector Telemetry HUD */}
          <div className="surface-inset" style={{ padding: '12px', marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="label-caps">Active Sector HUD</div>
              <span className="badge badge-teal" style={{ fontSize: '0.55rem' }}>{currentSector.badge}</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)', marginTop: '4px' }}>
              {currentSector.icon} {currentSector.shortName}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-teal)', marginTop: '3px' }}>
              {currentSector.center[0].toFixed(4)}°N · {currentSector.center[1].toFixed(4)}°E (Zoom {currentSector.zoom}x)
            </div>

            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.7rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Surface Current:</span>
                <span style={{ color: 'var(--accent-teal)', fontWeight: 700 }}>{currentSector.currentVelocity} {currentSector.currentDirection}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Sea State (Hs):</span>
                <span style={{ color: '#3b82f6', fontWeight: 700 }}>{currentSector.waveHeight}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>SST Gradient:</span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>{currentSector.surfaceTemp}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Ocean Buoys:</span>
                <span style={{ color: '#eab308', fontWeight: 700 }}>{currentSector.buoys.length} Ground-Truth</span>
              </div>
              <div style={{ marginTop: 4, color: 'var(--text-muted)', fontSize: '0.64rem', lineHeight: 1.3 }}>
                <b>Sensors:</b> {currentSector.sensors.join(' · ')}
              </div>
            </div>
          </div>
        </div>

        {/* Map Canvas */}
        <div className="surface-inset" style={{ position: 'relative', flex: 1, minHeight: 0, borderRadius: '12px', overflow: 'hidden' }}>
          <MapContainer
            center={currentSector.center}
            zoom={currentSector.zoom}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            <MapViewController center={currentSector.center} zoom={currentSector.zoom} />

            <MapClickHandler onMapClick={(coords) => {
              setMouseCoords(coords);
              onOpenGeotagModal(coords);
            }} />

            {/* Sector Monitored Bounding Boxes */}
            {MAP_SECTORS.filter((s) => s.id !== 'all_india').map((s) => {
              const isSelected = s.id === currentSector.id;
              return (
                <Polygon
                  key={s.id}
                  positions={[
                    [s.bounds[0][0], s.bounds[0][1]],
                    [s.bounds[0][0], s.bounds[1][1]],
                    [s.bounds[1][0], s.bounds[1][1]],
                    [s.bounds[1][0], s.bounds[0][1]],
                  ]}
                  pathOptions={{
                    color: isSelected ? 'var(--accent-teal)' : 'rgba(148, 163, 184, 0.4)',
                    fillColor: isSelected ? 'var(--accent-teal)' : 'rgba(148, 163, 184, 0.08)',
                    fillOpacity: isSelected ? 0.08 : 0.02,
                    weight: isSelected ? 2 : 1,
                    dashArray: isSelected ? '6, 6' : '3, 3',
                  }}
                >
                  <Popup>
                    <div style={{ fontWeight: 800, color: isSelected ? 'var(--accent-teal)' : 'inherit' }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', marginTop: 4 }}><b>Status:</b> {s.badge}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      Current: {s.currentVelocity} {s.currentDirection} · Wave: {s.waveHeight}
                    </div>
                  </Popup>
                </Polygon>
              );
            })}

            {/* Ground-Truth Ocean Buoys Layer */}
            {layers.buoys &&
              currentSector.buoys.map((b) => (
                <Marker key={b.id} position={[b.lat, b.lng]} icon={buoyIcon(b.id)}>
                  <Popup>
                    <div style={{ fontWeight: 800, color: '#eab308' }}>⚓ {b.name}</div>
                    <div style={{ fontSize: '0.75rem', marginTop: 4 }}>
                      <b>Platform Depth:</b> {b.depth_m}m
                    </div>
                    <div style={{ fontSize: '0.75rem' }}>
                      <b>In-Situ SST:</b> {b.insitu_sst}°C · <b>Satellite SST:</b> {b.sat_sst}°C
                    </div>
                    <div style={{ fontSize: '0.75rem' }}>
                      <b>Calibration Δ:</b>{' '}
                      <span style={{ color: Math.abs(b.delta_sst) <= 0.1 ? 'var(--accent-teal)' : '#f59e0b', fontWeight: 700 }}>
                        {b.delta_sst > 0 ? `+${b.delta_sst}` : b.delta_sst}°C
                      </span>{' '}
                      · <b>Salinity:</b> {b.salinity} PSU
                    </div>
                    <div style={{ fontSize: '0.68rem', marginTop: 4, color: 'var(--accent-teal)', fontWeight: 700 }}>
                      STATUS: {b.status}
                    </div>
                  </Popup>
                </Marker>
              ))}

            {/* 1. Vessels */}
            {layers.vessels &&
              vessels.map((v) => (
                <Marker key={v.id} position={[v.lat, v.lng]} icon={vesselIcon}>
                  <Popup>
                    <div style={{ fontWeight: 700, color: 'var(--accent-teal)' }}>{v.name} (AIS Live)</div>
                    <div>Status: {v.status}</div>
                    <div>Speed: {v.speed} knots · Heading: {v.heading}°</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Lat: {v.lat.toFixed(3)}N, Lng: {v.lng.toFixed(3)}E</div>
                  </Popup>
                </Marker>
              ))}

            {/* 2. PFZ Zones */}
            {layers.pfz &&
              pfz.map((z) => (
                <Circle
                  key={z.id}
                  center={[z.lat, z.lng]}
                  radius={z.radius_m}
                  pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.22, weight: 2 }}
                >
                  <Popup>
                    <div style={{ fontWeight: 700, color: '#3b82f6' }}>{z.name} (PFZ Zone)</div>
                    <div>Yield Rating: {z.yield_pct}%</div>
                    <div>SST: {z.sst_c}°C · Chlorophyll: {z.chlorophyll}</div>
                    <div>Biomass: {z.density} · Distance: {z.distance_km} km</div>
                  </Popup>
                </Circle>
              ))}

            {/* 3. Weather Cells */}
            {layers.weather &&
              weather.map((w) => (
                <Circle
                  key={w.id}
                  center={[w.lat, w.lng]}
                  radius={10000}
                  pathOptions={{
                    color: w.condition === 'HIGH WAVE' ? '#ef4444' : '#3b82f6',
                    fillColor: w.condition === 'HIGH WAVE' ? '#ef4444' : '#3b82f6',
                    fillOpacity: 0.15,
                    weight: 1.5,
                  }}
                >
                  <Popup>
                    <div style={{ fontWeight: 700 }}>{w.condition}</div>
                    <div>Wave Height: {w.wave_height_m}m · Wind: {w.wind_speed_kmh} km/h</div>
                    <div>Sea Temp: {w.sst_c}°C</div>
                  </Popup>
                </Circle>
              ))}

            {/* 4. Oil Spills */}
            {layers.spills &&
              spills.map((s) => (
                <Circle
                  key={s.id}
                  center={[s.lat, s.lng]}
                  radius={s.radius_m}
                  pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.35, weight: 2 }}
                >
                  <Popup>
                    <div style={{ fontWeight: 700, color: '#ef4444' }}>⚠️ {s.name} (Oil Spill)</div>
                    <div>Severity: {s.severity}</div>
                    <div>Radius: {(s.radius_m / 1000).toFixed(1)} km</div>
                  </Popup>
                </Circle>
              ))}

            {/* 5. Marine Debris */}
            {layers.debris &&
              debris.map((d) => (
                <Marker key={d.id} position={[d.lat, d.lng]} icon={hazardIcon}>
                  <Popup>
                    <div style={{ fontWeight: 700, color: '#f59e0b' }}>⚠️ {d.name}</div>
                    <div>Cluster Size: {d.size}</div>
                    <div>Position: {d.lat.toFixed(2)}°N, {d.lng.toFixed(2)}°E</div>
                  </Popup>
                </Marker>
              ))}

            {/* 6. Geofences & Boundaries */}
            {layers.boundaries &&
              boundaries.map((b) => (
                <Polygon
                  key={b.id}
                  positions={b.coords}
                  pathOptions={{
                    color: b.type === 'protected' ? '#f59e0b' : '#8b5cf6',
                    fillColor: b.type === 'protected' ? '#f59e0b' : '#8b5cf6',
                    fillOpacity: 0.08,
                    weight: 2,
                    dashArray: b.type === 'protected' ? '4, 4' : undefined,
                  }}
                >
                  <Popup>
                    <div style={{ fontWeight: 700 }}>{b.name}</div>
                    <div>Type: {b.type.replace('_', ' ').toUpperCase()}</div>
                    <div>Active Geofencing: Enabled</div>
                  </Popup>
                </Polygon>
              ))}

            {/* 7. Fish Reproductive Habitats */}
            {layers.habitats &&
              habitats.map((h) => (
                <Polygon
                  key={h.id}
                  positions={h.coords}
                  pathOptions={{
                    color: '#22d3ee',
                    fillColor: '#22d3ee',
                    fillOpacity: 0.12,
                    weight: 1.5,
                  }}
                >
                  <Popup>
                    <div style={{ fontWeight: 700, color: '#22d3ee' }}>🐟 {h.name}</div>
                    <div>Species: {h.species}</div>
                    <div>Status: {h.status.toUpperCase()} ({h.season})</div>
                    <div>Temp Tolerance: {h.temp_min_c}°C – {h.temp_max_c}°C (Live: {h.sst_c}°C)</div>
                    <p style={{ fontSize: '0.72rem', marginTop: 4 }}>{h.description}</p>
                  </Popup>
                </Polygon>
              ))}

            {/* 8. Safe Corridors */}
            {layers.corridors &&
              corridors.map((c) => (
                <Polyline key={c.id} positions={c.points} pathOptions={{ color: '#3b82f6', weight: 3, opacity: 0.7 }}>
                  <Popup>
                    <div style={{ fontWeight: 700, color: '#3b82f6' }}>🧭 {c.name}</div>
                    <div>Standard Navigation Corridor</div>
                  </Popup>
                </Polyline>
              ))}

            {/* 9. Alerts & Field Observations */}
            {layers.alerts &&
              alerts.filter((a) => a.lat && a.lng).map((a) => (
                <React.Fragment key={a.id}>
                  <Marker position={[a.lat!, a.lng!]} icon={observationIcon}>
                    <Popup>
                      <div style={{ fontWeight: 700, color: a.level === 'HIGH' ? '#ef4444' : a.level === 'CAUTION' ? '#f59e0b' : '#3b82f6' }}>
                        {a.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', marginTop: 3 }}>{a.message}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>
                        Source: {a.source_ref || a.source_type || 'Field Observation'}
                      </div>
                    </Popup>
                  </Marker>
                  {/* If this is the ISRO Toxic Algal Bloom alert, render hazard perimeter + NE drift vector */}
                  {a.title.includes('Algal Bloom') && (
                    <>
                      <Circle
                        center={[a.lat!, a.lng!]}
                        radius={4500}
                        pathOptions={{ color: '#d946ef', fillColor: '#d946ef', fillOpacity: 0.25, weight: 2, dashArray: '4, 4' }}
                      />
                      <Polyline
                        positions={[[a.lat!, a.lng!], [a.lat! + 0.18, a.lng! + 0.18]]}
                        pathOptions={{ color: '#a855f7', weight: 3, dashArray: '6, 6' }}
                      >
                        <Popup>
                          <div style={{ fontWeight: 700, color: '#a855f7' }}>↗ 0.3 m/s NE Current Drift</div>
                          <div>Hydrodynamic current is carrying the toxic bloom safely away from the Dwarka fishing zone.</div>
                        </Popup>
                      </Polyline>
                    </>
                  )}
                </React.Fragment>
              ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};
