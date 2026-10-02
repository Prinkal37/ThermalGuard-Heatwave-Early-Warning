import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import { Layers, MapPin, Eye, Zap, Flame, HeartPulse } from 'lucide-react';
import { WardSummary } from '../types';

interface GisMapProps {
  wards: WardSummary[];
  selectedWardId: string | null;
  onSelectWard: (wardId: string) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
}

// Controller to smoothly pan to selected city or ward
const MapViewController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

export const GisMap: React.FC<GisMapProps> = ({
  wards,
  selectedWardId,
  onSelectWard,
  selectedCity,
  onSelectCity
}) => {
  const [activeLayer, setActiveLayer] = useState<'tier' | 'wbgt' | 'utci' | 'vuln' | 'surge'>('tier');
  const [baseMapType, setBaseMapType] = useState<'dark' | 'satellite' | 'osm'>('dark');

  // Determine center based on selection or city
  let centerLat = 24.5;
  let centerLon = 78.5;
  let zoomLevel = 5;

  const cityCoordinates: { [key: string]: { lat: number; lon: number; zoom: number } } = {
    'Delhi NCR': { lat: 28.62, lon: 77.18, zoom: 11 },
    'Mumbai': { lat: 19.06, lon: 72.86, zoom: 11 },
    'Ahmedabad': { lat: 23.02, lon: 72.58, zoom: 12 },
    'Kolkata': { lat: 22.56, lon: 88.38, zoom: 12 },
    'Nagpur (Vidarbha)': { lat: 21.14, lon: 79.08, zoom: 12 },
    'Lucknow': { lat: 26.86, lon: 80.95, zoom: 12 },
    'Jaipur': { lat: 26.88, lon: 75.80, zoom: 12 },
    'Hyderabad': { lat: 17.40, lon: 78.42, zoom: 12 },
    'Chennai': { lat: 13.08, lon: 80.26, zoom: 12 },
    'Bhubaneswar': { lat: 20.29, lon: 85.82, zoom: 12 },
    'Bhopal': { lat: 23.26, lon: 77.41, zoom: 12 }
  };

  if (cityCoordinates[selectedCity]) {
    centerLat = cityCoordinates[selectedCity].lat;
    centerLon = cityCoordinates[selectedCity].lon;
    zoomLevel = cityCoordinates[selectedCity].zoom;
  }

  // Helper to color circles based on selected layer
  const getMarkerColor = (ward: WardSummary) => {
    if (activeLayer === 'tier') {
      return ward.risk.tier_color;
    } else if (activeLayer === 'wbgt') {
      const wbgt = ward.risk.metrics.wbgt_outdoor_c;
      if (wbgt >= 32.0) return '#ef4444';
      if (wbgt >= 29.0) return '#f97316';
      if (wbgt >= 26.0) return '#eab308';
      return '#22c55e';
    } else if (activeLayer === 'utci') {
      const utci = ward.risk.metrics.utci_c;
      if (utci >= 42.0) return '#ef4444';
      if (utci >= 38.0) return '#f97316';
      if (utci >= 32.0) return '#eab308';
      return '#22c55e';
    } else if (activeLayer === 'vuln') {
      const v = ward.risk.vulnerability.vulnerability_score;
      if (v >= 0.65) return '#a855f7';
      if (v >= 0.45) return '#ec4899';
      if (v >= 0.3) return '#3b82f6';
      return '#06b6d4';
    } else if (activeLayer === 'surge') {
      const s = ward.risk.expected_hospital_surge_pct;
      if (s >= 75) return '#ef4444';
      if (s >= 40) return '#f97316';
      if (s >= 20) return '#eab308';
      return '#22c55e';
    }
    return ward.risk.tier_color;
  };

  const filteredWards = selectedCity === 'ALL' 
    ? wards 
    : wards.filter(w => w.city.toLowerCase() === selectedCity.toLowerCase());

  return (
    <div className="glass-panel" style={{
      position: 'relative',
      minHeight: '500px',
      height: '75vh',
      maxHeight: '800px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Map Bar with Layer Switcher & City Selector */}
      <div style={{
        padding: '0.75rem 1rem',
        background: 'rgba(15, 23, 42, 0.92)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        zIndex: 500
      }}>
        {/* City Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '0.2rem' }}>
            REGIONS:
          </span>
          {['ALL', 'Delhi NCR', 'Mumbai', 'Ahmedabad', 'Kolkata', 'Nagpur (Vidarbha)', 'Lucknow', 'Jaipur', 'Hyderabad', 'Chennai', 'Bhubaneswar', 'Bhopal'].map(city => (
            <button
              key={city}
              onClick={() => onSelectCity(city)}
              style={{
                background: selectedCity === city ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                color: selectedCity === city ? '#60a5fa' : '#94a3b8',
                border: selectedCity === city ? '1px solid #3b82f6' : '1px solid var(--border-subtle)',
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {city === 'ALL' ? 'Pan-India Overview' : city}
            </button>
          ))}
        </div>

        {/* GIS Metric Layer Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginRight: '0.3rem' }}>
            <Layers size={13} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              GIS LAYER:
            </span>
          </div>
          {[
            { id: 'tier', label: 'Alert Tier (IMD)', icon: Flame },
            { id: 'wbgt', label: 'WBGT (°C)', icon: Zap },
            { id: 'utci', label: 'UTCI (°C)', icon: Flame },
            { id: 'vuln', label: 'Socio Vulnerability', icon: HeartPulse },
            { id: 'surge', label: 'Hospital Surge %', icon: HeartPulse }
          ].map(l => (
            <button
              key={l.id}
              onClick={() => setActiveLayer(l.id as any)}
              style={{
                background: activeLayer === l.id ? 'rgba(249, 115, 22, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                color: activeLayer === l.id ? '#fdba74' : '#94a3b8',
                border: activeLayer === l.id ? '1px solid #f97316' : '1px solid var(--border-subtle)',
                padding: '0.22rem 0.55rem',
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Basemap Switcher (Free GIS Base, No API Key Required) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: 'auto' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            BASEMAP:
          </span>
          {[
            { id: 'dark', label: 'Dark Canvas' },
            { id: 'satellite', label: 'Satellite' },
            { id: 'osm', label: 'Street Map' }
          ].map(bm => (
            <button
              key={bm.id}
              onClick={() => setBaseMapType(bm.id as any)}
              style={{
                background: baseMapType === bm.id ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                color: baseMapType === bm.id ? '#38bdf8' : '#94a3b8',
                border: baseMapType === bm.id ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.68rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {bm.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Leaflet Container */}
      <div style={{ flex: 1, width: '100%', position: 'relative' }}>
        <MapContainer
          center={[centerLat, centerLon]}
          zoom={zoomLevel}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          <MapViewController center={[centerLat, centerLon]} zoom={zoomLevel} />
          
          {baseMapType === 'dark' && (
            <>
              {/* Esri World Dark Gray Canvas (Standard No-Key Dark GIS Tile) */}
              <TileLayer
                attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, DeLorme, NAVTEQ'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                maxNativeZoom={16}
                maxZoom={19}
              />
              <TileLayer
                attribution=""
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
                maxNativeZoom={16}
                maxZoom={19}
                opacity={0.9}
              />
            </>
          )}

          {baseMapType === 'satellite' && (
            <>
              {/* Esri World Imagery (Standard No-Key Satellite) */}
              <TileLayer
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxNativeZoom={18}
                maxZoom={19}
              />
              <TileLayer
                attribution=""
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                maxNativeZoom={16}
                maxZoom={19}
                opacity={0.8}
              />
            </>
          )}

          {baseMapType === 'osm' && (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          )}

          {filteredWards.map(ward => {
            const isSelected = selectedWardId === ward.id;
            const color = getMarkerColor(ward);
            const isExtreme = ward.risk.tier === 'EXTREME';

            return (
              <CircleMarker
                key={ward.id}
                center={[ward.lat, ward.lon]}
                radius={isSelected ? 18 : isExtreme ? 15 : 11}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: isSelected ? 0.95 : 0.75,
                  color: isSelected ? '#ffffff' : color,
                  weight: isSelected ? 3 : 1.5
                }}
                eventHandlers={{
                  click: () => onSelectWard(ward.id)
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    <strong>{ward.name}</strong> ({ward.city})<br />
                    Tier: <span style={{ color }}>{ward.risk.tier}</span> | WBGT: {ward.risk.metrics.wbgt_outdoor_c}°C<br />
                    ER Surge: +{ward.risk.expected_hospital_surge_pct}%
                  </div>
                </Tooltip>
                
                <Popup>
                  <div style={{ minWidth: '220px', padding: '0.25rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#fff' }}>
                      {ward.name}
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 0.5rem 0' }}>
                      {ward.city} • Pop. Density: {ward.pop_density_sqkm.toLocaleString()}/km²
                    </p>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.4rem',
                      background: 'rgba(0,0,0,0.3)',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      marginBottom: '0.6rem'
                    }}>
                      <div>
                        <span style={{ color: '#94a3b8' }}>WBGT Outdoor:</span>
                        <strong style={{ display: 'block', color: '#f87171' }}>{ward.risk.metrics.wbgt_outdoor_c}°C</strong>
                      </div>
                      <div>
                        <span style={{ color: '#94a3b8' }}>UTCI Stress:</span>
                        <strong style={{ display: 'block', color: '#fb923c' }}>{ward.risk.metrics.utci_c}°C</strong>
                      </div>
                      <div>
                        <span style={{ color: '#94a3b8' }}>Heat Index:</span>
                        <strong style={{ display: 'block', color: '#eab308' }}>{ward.risk.metrics.heat_index_c}°C</strong>
                      </div>
                      <div>
                        <span style={{ color: '#94a3b8' }}>ER Surge:</span>
                        <strong style={{ display: 'block', color: '#ec4899' }}>+{ward.risk.expected_hospital_surge_pct}%</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectWard(ward.id)}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                        color: '#fff',
                        border: 'none',
                        padding: '0.4rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Inspect Ward & 5-Day Lead Time →
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Floating Map Legend */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '0.6rem 0.85rem',
          zIndex: 600,
          fontSize: '0.72rem',
          color: '#cbd5e1',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
        }}>
          <strong style={{ display: 'block', marginBottom: '0.35rem', color: '#fff' }}>
            {activeLayer === 'tier' ? 'IMD Early Warning Tier' :
             activeLayer === 'wbgt' ? 'WBGT Heat Risk (ISO 7243)' :
             activeLayer === 'utci' ? 'UTCI Thermal Strain' :
             activeLayer === 'vuln' ? 'Vulnerability Index' : 'ER Hospital Surge'}
          </strong>
          {activeLayer === 'tier' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                <span>Extreme Action (Red)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f97316' }} />
                <span>Severe Advisory (Orange)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#eab308' }} />
                <span>Moderate Caution (Yellow)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                <span>Safe Advisory (Green)</span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                <span>High / Critical Danger</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f97316' }} />
                <span>Elevated Caution</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                <span>Normal / Baseline</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
