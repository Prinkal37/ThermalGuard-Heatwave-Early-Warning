import React from 'react';
import { 
  Flame, 
  Activity, 
  Database, 
  Send, 
  UserCheck, 
  BookOpen, 
  Radio, 
  CloudSun,
  ShieldAlert,
  Key
} from 'lucide-react';
import { SystemStatus } from '../types';

interface HeaderProps {
  status: SystemStatus | null;
  activeScenario: string;
  onScenarioChange: (scenario: string) => void;
  pendingReviewsCount: number;
  dispatchMode: string;
  onOpenSettings: () => void;
  onOpenAnalyst: () => void;
  onOpenSimulator: () => void;
  onOpenMethodology: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  activeScenario,
  onScenarioChange,
  pendingReviewsCount,
  dispatchMode,
  onOpenSettings,
  onOpenAnalyst,
  onOpenSimulator,
  onOpenMethodology
}) => {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        {/* Logo and Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            position: 'relative',
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.45)'
          }}>
            <Flame size={24} color="#fff" />
            <span style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px #10b981'
            }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(90deg, #ffffff 40%, #fb923c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.2
              }}>
                ThermalGuard
              </h1>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                padding: '0.15rem 0.5rem',
                borderRadius: '999px',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Early Warning GIS
              </span>
            </div>
            <p style={{
              fontSize: '0.74rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginTop: '1px'
            }}>
              Extreme Heatwave Surveillance & Human Thermal Stress Index (WBGT / UTCI / EHF)
            </p>
          </div>
        </div>

        {/* Data Pipelines Pill Status Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          flexWrap: 'wrap',
          background: 'rgba(15, 23, 42, 0.7)',
          padding: '0.35rem 0.75rem',
          borderRadius: '999px',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.72rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#cbd5e1' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <strong style={{ color: '#fff' }}>IMD</strong> Standards
          </div>
          <span style={{ color: 'var(--border-subtle)' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#cbd5e1' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
            <strong style={{ color: '#fff' }}>ERA5</strong> 1991-2020 Normals
          </div>
          <span style={{ color: 'var(--border-subtle)' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#cbd5e1' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#06b6d4' }} />
            <strong style={{ color: '#fff' }}>Open-Meteo</strong> NWP Hourly
          </div>
          <span style={{ color: 'var(--border-subtle)' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#cbd5e1' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#a855f7' }} />
            <strong style={{ color: '#fff' }}>NCMRWF</strong> 4km NWP
          </div>
          <span style={{ color: 'var(--border-subtle)' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#cbd5e1' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
            <strong style={{ color: '#fff' }}>NCDC</strong> HRI Surveillance
          </div>
        </div>

        {/* Action Controls & Modal Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Scenario Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CloudSun size={15} color="var(--accent-amber)" />
            <select
              value={activeScenario}
              onChange={(e) => onScenarioChange(e.target.value)}
              style={{
                background: 'rgba(30, 41, 59, 0.85)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="MAY_2024_EXTREME_HEATWAVE">Scenario: May 2024 Severe Heatwave (49.2°C Anomaly)</option>
              <option value="COASTAL_HUMID_HEAT">Scenario: Coastal Sultry Wet-Bulb Surge (78% RH)</option>
              <option value="LIVE_SYNC">Scenario: Live Real-Time Open-Meteo Stream</option>
            </select>
          </div>

          {/* Methodology Workflow Button */}
          <button
            onClick={onOpenMethodology}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              color: '#e2e8f0',
              border: '1px solid var(--border-subtle)',
              padding: '0.42rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease'
            }}
            title="View full Methodology and System Architecture Flowchart"
          >
            <BookOpen size={14} color="#38bdf8" />
            Methodology & Flowchart
          </button>

          {/* Risk Analyst Review Queue (Human-in-the-loop from Image 1) */}
          <button
            onClick={onOpenAnalyst}
            style={{
              position: 'relative',
              background: pendingReviewsCount > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.06)',
              color: pendingReviewsCount > 0 ? '#fca5a5' : '#e2e8f0',
              border: pendingReviewsCount > 0 ? '1px solid rgba(239, 68, 68, 0.45)' : '1px solid var(--border-subtle)',
              padding: '0.42rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.2s ease'
            }}
            title="Human-in-the-loop Risk Analyst Review & Approval"
          >
            <UserCheck size={15} color={pendingReviewsCount > 0 ? '#ef4444' : '#94a3b8'} />
            Analyst Review
            {pendingReviewsCount > 0 && (
              <span style={{
                background: '#ef4444',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '0.1rem 0.45rem',
                borderRadius: '999px',
                marginLeft: '0.2rem'
              }}>
                {pendingReviewsCount} PENDING
              </span>
            )}
          </button>

          {/* API Settings Button */}
          <button
            onClick={onOpenSettings}
            style={{
              background: dispatchMode === 'LIVE_PRODUCTION' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.06)',
              color: dispatchMode === 'LIVE_PRODUCTION' ? '#fca5a5' : '#e2e8f0',
              border: dispatchMode === 'LIVE_PRODUCTION' ? '1px solid rgba(239, 68, 68, 0.45)' : '1px solid var(--border-subtle)',
              padding: '0.42rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease'
            }}
            title="Configure Live Twilio, WhatsApp, and Fast2SMS API keys"
          >
            <Key size={14} color={dispatchMode === 'LIVE_PRODUCTION' ? '#f87171' : '#34d399'} />
            API Keys
            {dispatchMode === 'LIVE_PRODUCTION' && (
              <span style={{
                background: '#ef4444',
                color: '#fff',
                fontSize: '0.62rem',
                fontWeight: 800,
                padding: '0.1rem 0.35rem',
                borderRadius: '4px'
              }}>
                LIVE
              </span>
            )}
          </button>

          {/* Alert Simulator Button */}
          <button
            onClick={onOpenSimulator}
            style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
              color: '#fff',
              border: 'none',
              padding: '0.42rem 0.95rem',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 2px 10px rgba(37, 99, 235, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            <Send size={14} />
            Alert Dispatcher
          </button>
        </div>
      </div>
    </header>
  );
};
