import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Sun, 
  Wind, 
  Droplets, 
  Activity, 
  Calendar, 
  Send, 
  AlertCircle, 
  HeartHandshake, 
  Zap,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { WardDetailsResponse, HourlyPoint } from '../types';

interface WardInspectorProps {
  wardDetails: WardDetailsResponse | null;
  loading: boolean;
  onTriggerAlert: (wardId: string) => void;
  onOpenHAPReport: (wardId: string) => void;
}

export const WardInspector: React.FC<WardInspectorProps> = ({
  wardDetails,
  loading,
  onTriggerAlert,
  onOpenHAPReport
}) => {
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Computing physiological heat balance & ward vulnerability indices...
        </p>
      </div>
    );
  }

  if (!wardDetails) {
    return (
      <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <AlertCircle size={36} color="var(--accent-amber)" style={{ margin: '0 auto 0.75rem auto' }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>No Ward Selected</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.25rem' }}>
          Click any ward marker on the GIS map or choose from the list to inspect deep physiological stress and 5-day lead time.
        </p>
      </div>
    );
  }

  const { ward, city, current_evaluation, forecast_5days } = wardDetails;
  const metrics = current_evaluation?.metrics || {} as any;
  const vuln = current_evaluation?.vulnerability || {} as any;
  const currentForecastDay = forecast_5days?.[selectedDayIdx] || forecast_5days?.[0] || {} as any;

  // Safe Fallback Helpers
  const hospitalsCount = ward?.infrastructure?.hospitals_count ?? (ward as any)?.hospitals_count ?? 4;
  const coolingCentersCount = ward?.infrastructure?.cooling_centers_count ?? (ward as any)?.cooling_centers_count ?? 6;
  const powerGridZone = ward?.infrastructure?.power_grid_zone ?? (ward as any)?.power_grid_zone ?? 'City Grid Feeder';

  const outdoorWorkerPct = ward?.demographics?.outdoor_worker_pct ?? (ward as any)?.outdoor_worker_pct ?? 35;
  const informalHousingPct = ward?.demographics?.informal_housing_pct ?? (ward as any)?.informal_housing_pct ?? 30;
  const elderlyPct = ward?.demographics?.elderly_pct ?? (ward as any)?.elderly_pct ?? 12;
  const childrenPct = ward?.demographics?.children_pct ?? (ward as any)?.children_pct ?? 10;
  const ndviVegetation = ward?.demographics?.ndvi_vegetation ?? (ward as any)?.ndvi_vegetation ?? 0.15;

  // SVG Chart calculation for diurnal curve
  const hourlyData = currentForecastDay?.hourly_profile || [];
  const maxTemp = Math.max(...hourlyData.map((h: any) => h.temp_c), 45);
  const minTemp = Math.min(...hourlyData.map((h: any) => h.wbgt_c), 20);
  const chartHeight = 160;
  const chartWidth = 600;

  const getSvgY = (val: number) => {
    return chartHeight - ((val - minTemp) / (maxTemp - minTemp || 1)) * (chartHeight - 30) - 15;
  };

  const tempPoints = hourlyData.map((h: any, i: number) => `${(i / Math.max(1, hourlyData.length - 1)) * chartWidth},${getSvgY(h.temp_c)}`).join(' ');
  const wbgtPoints = hourlyData.map((h: any, i: number) => `${(i / Math.max(1, hourlyData.length - 1)) * chartWidth},${getSvgY(h.wbgt_c)}`).join(' ');

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      {/* Ward Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '1.25rem',
        marginBottom: '1.25rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
              {ward?.name || 'Selected Ward'}
            </h2>
            <span style={{
              background: current_evaluation?.tier_color || '#ef4444',
              color: '#fff',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '0.2rem 0.65rem',
              borderRadius: '999px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              {current_evaluation?.tier || 'ALERT'} ALERT
            </span>
            <span style={{
              background: 'rgba(255,255,255,0.08)',
              color: '#e2e8f0',
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '0.2rem 0.6rem',
              borderRadius: '6px'
            }}>
              {city} ({wardDetails?.region_type || 'plains'})
            </span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span>Pop Density: <strong style={{ color: '#fff' }}>{ward?.pop_density_sqkm?.toLocaleString() || '15,000'} /km²</strong></span>
            <span>•</span>
            <span>Hospitals: <strong style={{ color: '#fff' }}>{hospitalsCount}</strong></span>
            <span>•</span>
            <span>Cooling Centers: <strong style={{ color: '#fff' }}>{coolingCentersCount} Active</strong></span>
            <span>•</span>
            <span>Power Grid: <strong style={{ color: '#cbd5e1' }}>{powerGridZone}</strong></span>
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onOpenHAPReport(ward.id)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.2s ease'
            }}
            title="Generate official NDMA Municipal Heat Action Plan Executive Brief"
          >
            <FileText size={15} />
            Municipal HAP Brief
          </button>

          {/* Trigger Alert Dispatch Button */}
          <button
            onClick={() => onTriggerAlert(ward.id)}
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
              color: '#fff',
              border: 'none',
              padding: '0.55rem 1.15rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            <Send size={15} />
            Dispatch Ward Alerts
          </button>
        </div>
      </div>

      {/* Grid: Physiological Indices vs Ward Socioeconomic Vulnerability */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1.5rem'
      }}>
        {/* Physiological Multi-Index Panel */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '1.15rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Sun size={17} color="var(--accent-amber)" />
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                Physiological Thermal Stress Metrics
              </h3>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>IMD & ECMWF Standard</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.12)', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
              <span style={{ fontSize: '0.68rem', color: '#fca5a5', display: 'block' }}>Outdoor WBGT</span>
              <strong style={{ fontSize: '1.25rem', color: '#f87171' }}>{metrics.wbgt_outdoor_c}°C</strong>
              <span style={{ fontSize: '0.62rem', color: '#f87171', display: 'block', marginTop: '2px' }}>0.7Tw+0.2Tg+0.1Td</span>
            </div>

            <div style={{ background: 'rgba(249, 115, 22, 0.12)', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(249, 115, 22, 0.25)' }}>
              <span style={{ fontSize: '0.68rem', color: '#fed7aa', display: 'block' }}>UTCI Stress</span>
              <strong style={{ fontSize: '1.25rem', color: '#fb923c' }}>{metrics.utci_c}°C</strong>
              <span style={{ fontSize: '0.62rem', color: '#fb923c', display: 'block', marginTop: '2px' }}>ECMWF Multi-Node</span>
            </div>

            <div style={{ background: 'rgba(245, 158, 11, 0.12)', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
              <span style={{ fontSize: '0.68rem', color: '#fef08a', display: 'block' }}>NOAA Heat Index</span>
              <strong style={{ fontSize: '1.25rem', color: '#fbbf24' }}>{metrics.heat_index_c}°C</strong>
              <span style={{ fontSize: '0.62rem', color: '#fbbf24', display: 'block', marginTop: '2px' }}>Rothfusz Eq.</span>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '0.6rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Stull Wet-Bulb (Tw)</span>
              <strong style={{ fontSize: '1.05rem', color: '#fff' }}>{metrics.wet_bulb_tw}°C</strong>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '0.6rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Globe Temp (Tg)</span>
              <strong style={{ fontSize: '1.05rem', color: '#fff' }}>{metrics.globe_temp_tg}°C</strong>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '0.6rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Excess Heat Factor</span>
              <strong style={{ fontSize: '1.05rem', color: '#fff' }}>{metrics.ehf_index}</strong>
            </div>
          </div>

          <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#94a3b8', background: 'rgba(0,0,0,0.25)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
            <strong>IMD Criteria Evaluation:</strong> {metrics.imd_category} (Max: {metrics.temp_max_c}°C, Departure: {metrics.imd_departure_c > 0 ? `+${metrics.imd_departure_c}` : metrics.imd_departure_c}°C vs normal {city})
          </div>
        </div>

        {/* Socioeconomic Vulnerability Matrix */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '1.15rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Users size={17} color="#a855f7" />
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                Ward Vulnerability & Health Risk
              </h3>
            </div>
            <span style={{
              background: 'rgba(168, 85, 247, 0.18)',
              color: '#c084fc',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: '4px'
            }}>
              Vuln Index: {vuln.vulnerability_score}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {/* Outdoor Workers */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '3px' }}>
                <span style={{ color: '#cbd5e1' }}>Outdoor Labor & Gig Workforce:</span>
                <strong style={{ color: '#f87171' }}>{outdoorWorkerPct}%</strong>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${outdoorWorkerPct}%`, height: '100%', background: '#ef4444', borderRadius: '3px' }} />
              </div>
            </div>

            {/* Informal Housing / Heat Traps */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '3px' }}>
                <span style={{ color: '#cbd5e1' }}>Informal Slum / Tin-Roof Housing:</span>
                <strong style={{ color: '#fb923c' }}>{informalHousingPct}%</strong>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${informalHousingPct}%`, height: '100%', background: '#f97316', borderRadius: '3px' }} />
              </div>
            </div>

            {/* Elderly & Children */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '3px' }}>
                <span style={{ color: '#cbd5e1' }}>High-Risk Age Groups (&gt;65 &amp; &lt;5 yrs):</span>
                <strong style={{ color: '#eab308' }}>{(elderlyPct + childrenPct).toFixed(1)}%</strong>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${(elderlyPct + childrenPct) * 2}%`, height: '100%', background: '#eab308', borderRadius: '3px' }} />
              </div>
            </div>

            {/* NDVI Deficiency */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '3px' }}>
                <span style={{ color: '#cbd5e1' }}>NDVI Green Canopy Deficiency:</span>
                <strong style={{ color: '#06b6d4' }}>{(1.0 - ndviVegetation).toFixed(2)} (NDVI: {ndviVegetation})</strong>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${(1.0 - ndviVegetation) * 100}%`, height: '100%', background: '#06b6d4', borderRadius: '3px' }} />
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '0.75rem',
            background: 'rgba(236, 72, 153, 0.12)',
            border: '1px solid rgba(236, 72, 153, 0.25)',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '0.74rem', color: '#fbcfe8' }}>
              Projected Emergency Room Admissions Surge:
            </span>
            <strong style={{ fontSize: '1.05rem', color: '#f472b6' }}>
              +{current_evaluation.expected_hospital_surge_pct}%
            </strong>
          </div>
        </div>
      </div>

      {/* 5-Day Lead Time Forecast Bar (As promised in Innovation Section) */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
              5-Day Ward-Level Lead Time & Diurnal Heat Curve
            </h3>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Empowering 3-5 days lead-time preventive action before heat peaks
          </span>
        </div>

        {/* 5-Day Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '0.6rem',
          marginBottom: '1.25rem'
        }}>
          {forecast_5days.map((day, idx) => {
            const isSelected = selectedDayIdx === idx;
            const dayEval = day.risk_eval;
            return (
              <button
                key={day.day_index}
                onClick={() => setSelectedDayIdx(idx)}
                style={{
                  background: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: isSelected ? `2px solid ${dayEval.tier_color}` : '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '0.6rem 0.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                  {idx === 0 ? 'Today' : day.day_name.slice(0, 3)} ({day.date.slice(5)})
                </span>
                <strong style={{ fontSize: '1rem', color: dayEval.tier_color, display: 'block', margin: '2px 0' }}>
                  {dayEval.tier}
                </strong>
                <span style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>
                  WBGT: {dayEval.metrics.wbgt_outdoor_c}°C
                </span>
              </button>
            );
          })}
        </div>

        {/* 24-Hour Diurnal Profile SVG Chart */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.72rem', color: '#94a3b8' }}>
            <span>Hourly Diurnal Trajectory for {currentForecastDay.day_name} ({currentForecastDay.date})</span>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '12px', height: '3px', backgroundColor: '#f87171' }} /> Air Temp (°C)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '12px', height: '3px', backgroundColor: '#38bdf8' }} /> WBGT Outdoor (°C)
              </span>
            </div>
          </div>

          <div style={{ width: '100%', overflowX: 'auto', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0.75rem' }}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '140px', overflow: 'visible' }}>
              {/* Reference Grid lines */}
              <line x1="0" y1={getSvgY(32)} x2={chartWidth} y2={getSvgY(32)} stroke="rgba(239,68,68,0.35)" strokeDasharray="4 4" />
              <text x="5" y={getSvgY(32) - 4} fill="#f87171" fontSize="10">ISO 7243 WBGT Extreme Risk (32°C)</text>

              <line x1="0" y1={getSvgY(28)} x2={chartWidth} y2={getSvgY(28)} stroke="rgba(245,158,11,0.25)" strokeDasharray="4 4" />
              <text x="5" y={getSvgY(28) - 4} fill="#fbbf24" fontSize="10">WBGT Caution (28°C)</text>

              {/* Temperature Line */}
              <polyline
                fill="none"
                stroke="#f87171"
                strokeWidth="2.5"
                points={tempPoints}
              />

              {/* WBGT Line */}
              <polyline
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                points={wbgtPoints}
              />

              {/* Data point dots and hour markers */}
              {hourlyData.filter((_, i) => i % 3 === 0).map((h, i) => {
                const x = ((i * 3) / (hourlyData.length - 1)) * chartWidth;
                return (
                  <g key={i}>
                    <line x1={x} y1="0" x2={x} y2={chartHeight - 15} stroke="rgba(255,255,255,0.06)" />
                    <text x={x} y={chartHeight} fill="#64748b" fontSize="9" textAnchor="middle">{h.hour}</text>
                    <circle cx={x} cy={getSvgY(h.temp_c)} r="3" fill="#f87171" />
                    <circle cx={x} cy={getSvgY(h.wbgt_c)} r="3" fill="#38bdf8" />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
