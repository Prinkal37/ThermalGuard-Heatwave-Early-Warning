import React from 'react';
import { ThermometerSun, AlertTriangle, Users, Hospital, ShieldCheck } from 'lucide-react';
import { WardSummary } from '../types';

interface KPISummaryProps {
  wards: WardSummary[];
}

export const KPISummary: React.FC<KPISummaryProps> = ({ wards }) => {
  if (!wards.length) return null;

  // Compute key statistics
  let peakWbgt = -999;
  let peakUtci = -999;
  let peakWbgtWard = '';
  let totalPopAtRisk = 0;
  let maxHospitalSurge = 0;
  
  const tierCounts = {
    SAFE: 0,
    MODERATE: 0,
    SEVERE: 0,
    EXTREME: 0
  };

  wards.forEach(w => {
    const wbgt = w.risk.metrics.wbgt_outdoor_c;
    const utci = w.risk.metrics.utci_c;
    const surge = w.risk.expected_hospital_surge_pct;
    
    if (wbgt > peakWbgt) {
      peakWbgt = wbgt;
      peakWbgtWard = `${w.name} (${w.city})`;
    }
    if (utci > peakUtci) {
      peakUtci = utci;
    }
    if (surge > maxHospitalSurge) {
      maxHospitalSurge = surge;
    }
    if (w.risk.tier === 'SEVERE' || w.risk.tier === 'EXTREME') {
      totalPopAtRisk += w.pop_density_sqkm * 12; // Approx ward population
    }
    tierCounts[w.risk.tier] = (tierCounts[w.risk.tier] || 0) + 1;
  });

  return (
    <div className="kpi-container" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '1rem',
      marginBottom: '1.25rem'
    }}>
      {/* Peak WBGT Card */}
      <div className="glass-panel" style={{ padding: '1.1rem 1.25rem', borderLeft: '4px solid #ef4444' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Peak Outdoor WBGT
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.2rem' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.85rem', fontWeight: 800, color: '#f87171' }}>
                {peakWbgt.toFixed(1)}°C
              </span>
              <span style={{ fontSize: '0.75rem', color: '#fca5a5' }}>
                (ISO 7243 High Risk)
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Ward: {peakWbgtWard}
            </p>
          </div>
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            padding: '0.6rem',
            borderRadius: '10px'
          }}>
            <ThermometerSun size={22} color="#ef4444" />
          </div>
        </div>
      </div>

      {/* Peak UTCI Thermal Strain */}
      <div className="glass-panel" style={{ padding: '1.1rem 1.25rem', borderLeft: '4px solid #f97316' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Peak UTCI Thermal Strain
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.2rem' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.85rem', fontWeight: 800, color: '#fb923c' }}>
                {peakUtci.toFixed(1)}°C
              </span>
              <span style={{ fontSize: '0.75rem', color: '#fed7aa' }}>
                Very Strong Stress
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
              Multi-node physiological heat load
            </p>
          </div>
          <div style={{
            background: 'rgba(249, 115, 22, 0.15)',
            padding: '0.6rem',
            borderRadius: '10px'
          }}>
            <AlertTriangle size={22} color="#f97316" />
          </div>
        </div>
      </div>

      {/* Forecasted Hospital Surge */}
      <div className="glass-panel" style={{ padding: '1.1rem 1.25rem', borderLeft: '4px solid #ec4899' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Peak Hospital ER Surge
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.2rem' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.85rem', fontWeight: 800, color: '#f472b6' }}>
                +{maxHospitalSurge.toFixed(0)}%
              </span>
              <span style={{ fontSize: '0.75rem', color: '#fbcfe8' }}>
                Emergency Influx
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
              NCDC Heat-Related Illness projection
            </p>
          </div>
          <div style={{
            background: 'rgba(236, 72, 153, 0.15)',
            padding: '0.6rem',
            borderRadius: '10px'
          }}>
            <Hospital size={22} color="#ec4899" />
          </div>
        </div>
      </div>

      {/* Ward Alert Tier Distribution */}
      <div className="glass-panel" style={{ padding: '1.1rem 1.25rem', borderLeft: '4px solid #06b6d4' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ width: '100%' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Monitored Wards Status
            </span>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              marginTop: '0.5rem',
              alignItems: 'center'
            }}>
              <div style={{ textAlign: 'center', flex: 1, background: 'rgba(239, 68, 68, 0.15)', padding: '0.35rem 0.2rem', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f87171', display: 'block' }}>{tierCounts.EXTREME}</span>
                <span style={{ fontSize: '0.62rem', color: '#fca5a5', fontWeight: 600 }}>EXTREME</span>
              </div>
              <div style={{ textAlign: 'center', flex: 1, background: 'rgba(249, 115, 22, 0.15)', padding: '0.35rem 0.2rem', borderRadius: '6px', border: '1px solid rgba(249, 115, 22, 0.3)' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fb923c', display: 'block' }}>{tierCounts.SEVERE}</span>
                <span style={{ fontSize: '0.62rem', color: '#fed7aa', fontWeight: 600 }}>SEVERE</span>
              </div>
              <div style={{ textAlign: 'center', flex: 1, background: 'rgba(245, 158, 11, 0.15)', padding: '0.35rem 0.2rem', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fbbf24', display: 'block' }}>{tierCounts.MODERATE}</span>
                <span style={{ fontSize: '0.62rem', color: '#fef08a', fontWeight: 600 }}>MODERATE</span>
              </div>
              <div style={{ textAlign: 'center', flex: 1, background: 'rgba(16, 185, 129, 0.15)', padding: '0.35rem 0.2rem', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399', display: 'block' }}>{tierCounts.SAFE}</span>
                <span style={{ fontSize: '0.62rem', color: '#a7f3d0', fontWeight: 600 }}>SAFE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
