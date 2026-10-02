import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  Building2, 
  ShieldAlert, 
  PhoneCall,
  CheckCircle,
  Clock
} from 'lucide-react';
import { API_BASE, apiFetch } from '../api';

interface HAPReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  wardId: string;
}

export const HAPReportModal: React.FC<HAPReportModalProps> = ({
  isOpen,
  onClose,
  wardId
}) => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen && wardId) {
      setLoading(true);
      apiFetch(`${API_BASE}/reports/hap/${wardId}`)
        .then(res => res.json())
        .then(data => setReport(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, wardId]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 8, 16, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '850px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        padding: '2rem',
        border: '1px solid rgba(255,255,255,0.14)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
        backgroundColor: '#0b1120'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            color: '#94a3b8',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Compiling Municipal Heat Action Plan Executive Brief...
            </p>
          </div>
        ) : report ? (
          <div>
            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} color="var(--accent-amber)" />
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                  CONFIDENTIAL • MUNICIPAL EXECUTIVE BRIEFING
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#fff',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Printer size={14} /> Print Brief
                </button>
              </div>
            </div>

            {/* Official Report Document Body */}
            <div style={{
              background: '#0f172a',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px',
              padding: '1.75rem',
              color: '#f8fafc'
            }}>
              {/* Seal & Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid rgba(255,255,255,0.15)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8' }}>
                  GOVERNMENT DISASTER MANAGEMENT AUTHORITY & METEOROLOGICAL NETWORK
                </span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: '0.35rem 0' }}>
                  MUNICIPAL HEAT ACTION PLAN (HAP) EXECUTIVE DIRECTIVE
                </h2>
                <span style={{ fontSize: '0.78rem', color: 'var(--accent-amber)', fontWeight: 600 }}>
                  {report.standard} • Generated: {report.generated_at}
                </span>
              </div>

              {/* Target Location & Warning Tier */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.75rem',
                background: 'rgba(0,0,0,0.3)',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.25rem'
              }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Target Ward & City:</span>
                  <strong style={{ display: 'block', fontSize: '1rem', color: '#fff' }}>
                    {report.ward.name}, {report.city}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Assigned Warning Tier:</span>
                  <strong style={{
                    display: 'inline-block',
                    fontSize: '0.95rem',
                    color: report.heat_stress_evaluation.tier_color,
                    fontWeight: 800
                  }}>
                    {report.heat_stress_evaluation.tier} ALERT ({report.heat_stress_evaluation.metrics.imd_category})
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Outdoor WBGT / UTCI:</span>
                  <strong style={{ display: 'block', fontSize: '1rem', color: '#f87171' }}>
                    {report.heat_stress_evaluation.metrics.wbgt_outdoor_c}°C / {report.heat_stress_evaluation.metrics.utci_c}°C
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Expected Hospital ER Surge:</span>
                  <strong style={{ display: 'block', fontSize: '1rem', color: '#f472b6' }}>
                    +{report.heat_stress_evaluation.expected_hospital_surge_pct}% Admissions
                  </strong>
                </div>
              </div>

              {/* Departmental Action Directives */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Mandatory Inter-Agency Action Directives:
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid #ef4444' }}>
                    <strong style={{ fontSize: '0.8rem', color: '#fca5a5' }}>1. Health Department & Tertiary Hospitals:</strong>
                    <p style={{ fontSize: '0.74rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                      {report.action_directives.hospitals.actions.join(' ')}
                    </p>
                  </div>

                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid #10b981' }}>
                    <strong style={{ fontSize: '0.8rem', color: '#86efac' }}>2. Municipal Water Supply & Cooling Center Infrastructure:</strong>
                    <p style={{ fontSize: '0.74rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                      {report.action_directives.municipal_utilities.actions.join(' ')}
                    </p>
                  </div>

                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid #f59e0b' }}>
                    <strong style={{ fontSize: '0.8rem', color: '#fde047' }}>3. Labor Inspectorate & Gig Platforms:</strong>
                    <p style={{ fontSize: '0.74rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                      {report.action_directives.outdoor_workers.actions.join(' ')}
                    </p>
                  </div>

                  <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid #c084fc' }}>
                    <strong style={{ fontSize: '0.8rem', color: '#d8b4fe' }}>4. Community Healthcare & ASHA Workers:</strong>
                    <p style={{ fontSize: '0.74rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                      {report.action_directives.asha_workers.actions.join(' ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Emergency Helplines */}
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
                fontSize: '0.75rem'
              }}>
                <div>
                  <span style={{ color: '#94a3b8' }}>Disaster Emergency: </span>
                  <strong style={{ color: '#fff' }}>1077</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>Heat Stroke Ambulance: </span>
                  <strong style={{ color: '#f87171' }}>108</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>Water Tanker Helpline: </span>
                  <strong style={{ color: '#38bdf8' }}>1916</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>Electricity Grievance: </span>
                  <strong style={{ color: '#fbbf24' }}>1912</strong>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
