import React, { useState } from 'react';
import { 
  Users, 
  HeartHandshake, 
  Briefcase, 
  Hospital, 
  Building, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  Droplet, 
  AlertTriangle 
} from 'lucide-react';
import { RoleAdvisories, WardRisk } from '../types';

interface RoleAdvisoryPortalProps {
  advisories: RoleAdvisories | null;
  risk: WardRisk;
  wardName: string;
}

export const RoleAdvisoryPortal: React.FC<RoleAdvisoryPortalProps> = ({
  advisories,
  risk,
  wardName
}) => {
  const [activeRole, setActiveRole] = useState<'citizens' | 'asha' | 'workers' | 'hospitals' | 'utilities'>('citizens');

  if (!advisories) return null;

  const roleConfigs = [
    {
      id: 'citizens',
      label: 'General Citizens',
      icon: Users,
      data: advisories.citizens,
      color: '#38bdf8'
    },
    {
      id: 'asha',
      label: 'ASHA Healthcare Workers',
      icon: HeartHandshake,
      data: advisories.asha_workers,
      color: '#c084fc'
    },
    {
      id: 'workers',
      label: 'Employers & Outdoor Labor',
      icon: Briefcase,
      data: advisories.outdoor_workers,
      color: '#f59e0b'
    },
    {
      id: 'hospitals',
      label: 'Hospitals & Emergency Care',
      icon: Hospital,
      data: advisories.hospitals,
      color: '#ec4899'
    },
    {
      id: 'utilities',
      label: 'Municipal & Power Utilities',
      icon: Building,
      data: advisories.municipal_utilities,
      color: '#10b981'
    }
  ];

  const currentRoleConfig = roleConfigs.find(r => r.id === activeRole) || roleConfigs[0];
  const roleData = currentRoleConfig.data;

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={20} color={risk.tier_color} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
              Targeted Role-Specific Action Portals
            </h3>
            <span style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#94a3b8',
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '0.15rem 0.5rem',
              borderRadius: '4px'
            }}>
              Innovation & Guideline-Based Prevention
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Actionable protocols calibrated for <strong>{wardName}</strong> under <strong>{risk.tier}</strong> warning conditions.
          </p>
        </div>

        <div style={{
          background: risk.tier === 'EXTREME' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(249, 115, 22, 0.2)',
          border: `1px solid ${risk.tier_color}`,
          color: risk.tier_color,
          padding: '0.35rem 0.75rem',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem'
        }}>
          <Clock size={14} />
          Lead Time: T - 72 Hours Preventive Action
        </div>
      </div>

      {/* Role Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '0.75rem',
        overflowX: 'auto',
        marginBottom: '1.25rem'
      }}>
        {roleConfigs.map(role => {
          const Icon = role.icon;
          const isActive = activeRole === role.id;
          return (
            <button
              key={role.id}
              onClick={() => setActiveRole(role.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-muted)',
                border: isActive ? `1px solid ${role.color}` : '1px solid transparent',
                padding: '0.5rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} color={isActive ? role.color : 'var(--text-dim)'} />
              {role.label}
            </button>
          );
        })}
      </div>

      {/* Selected Role Content View */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
              {roleData.title}
            </h4>
            <span style={{ fontSize: '0.74rem', color: currentRoleConfig.color }}>
              Designated Role: {currentRoleConfig.label}
            </span>
          </div>
          <span style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: `1px solid ${currentRoleConfig.color}`,
            color: currentRoleConfig.color,
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '0.2rem 0.65rem',
            borderRadius: '999px'
          }}>
            {roleData.badge}
          </span>
        </div>

        {/* Action Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {roleData.actions.map((act, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                background: 'rgba(30, 41, 59, 0.55)',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                borderLeft: `3px solid ${currentRoleConfig.color}`
              }}
            >
              <CheckCircle2 size={18} color={currentRoleConfig.color} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ fontSize: '0.82rem', color: '#f1f5f9', lineHeight: 1.5 }}>
                  {act}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Specialized Guidelines Box for Outdoor Workers if active */}
        {activeRole === 'workers' && (
          <div style={{
            marginTop: '1.25rem',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            padding: '0.9rem',
            borderRadius: '8px'
          }}>
            <h5 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fbbf24', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangle size={15} />
              ISO 7243 WBGT Work-Rest Standard Matrix:
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', fontSize: '0.72rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.45rem', borderRadius: '4px' }}>
                <span style={{ color: '#94a3b8' }}>WBGT &lt; 29°C:</span>
                <strong style={{ display: 'block', color: '#34d399' }}>Standard 100% Shift</strong>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.45rem', borderRadius: '4px' }}>
                <span style={{ color: '#94a3b8' }}>WBGT 29°C - 31°C:</span>
                <strong style={{ display: 'block', color: '#fbbf24' }}>45m Work / 15m Rest</strong>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.45rem', borderRadius: '4px' }}>
                <span style={{ color: '#94a3b8' }}>WBGT 31°C - 32°C:</span>
                <strong style={{ display: 'block', color: '#fb923c' }}>15m Work / 45m Rest</strong>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.45rem', borderRadius: '4px' }}>
                <span style={{ color: '#94a3b8' }}>WBGT &gt; 32°C:</span>
                <strong style={{ display: 'block', color: '#f87171' }}>FULL WORK STOPPAGE</strong>
              </div>
            </div>
          </div>
        )}

        {/* Specialized Rapid Immersion Guide for Hospitals if active */}
        {activeRole === 'hospitals' && (
          <div style={{
            marginTop: '1.25rem',
            background: 'rgba(236, 72, 153, 0.12)',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            padding: '0.9rem',
            borderRadius: '8px'
          }}>
            <h5 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f472b6', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Droplet size={15} />
              Heat Stroke Clinical Triage Protocol:
            </h5>
            <p style={{ fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.4 }}>
              For core body temp &gt; 40°C (104°F) with central nervous system dysfunction: Initiate <strong>Cold Water Immersion (CWI)</strong> within 30 minutes of collapse. Target cooling rate: 0.15°C/min until core temp reaches 38.6°C. Avoid antipyretics (paracetamol/aspirin ineffective in exertional hyperthermia).
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
