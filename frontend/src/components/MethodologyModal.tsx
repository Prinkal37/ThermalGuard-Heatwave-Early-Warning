import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  Cpu, 
  Calculator, 
  BrainCircuit, 
  Radio, 
  RefreshCw, 
  ArrowRight, 
  CheckCircle,
  Sparkles,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { API_BASE, apiFetch } from '../api';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  const [feedbackLogs, setFeedbackLogs] = useState<any[]>([]);
  const [wardName, setWardName] = useState<string>('Danilimda / Ahmedabad');
  const [predictedSurge, setPredictedSurge] = useState<number>(75.0);
  const [actualSurge, setActualSurge] = useState<number>(78.2);
  const [feedbackNotes, setFeedbackNotes] = useState<string>('Surge peaked between 14:00 and 17:00 at municipal civil hospital.');
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      apiFetch(`${API_BASE}/feedback/logs`)
        .then(res => res.json())
        .then(data => setFeedbackLogs(data))
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      const res = await apiFetch(`${API_BASE}/feedback/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ward_name: wardName,
          predicted_surge_pct: Number(predictedSurge),
          actual_hospital_surge_pct: Number(actualSurge),
          notes: feedbackNotes
        })
      });
      const data = await res.json();
      setFeedbackLogs(prev => [data.entry, ...prev]);
      setFeedbackSuccess(true);
      setTimeout(() => setFeedbackSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'DATA ACQUISITION',
      subtitle: 'Weather, Demography, Population & Public Health',
      icon: Database,
      color: '#38bdf8',
      desc: 'Ingests IMD official station standards, ERA5 30-year climate reanalysis baseline (1991-2020), Open-Meteo live hourly NWP stream, NCMRWF 4km ensemble NWP predictions, and IMD-NCDC Heat-Related Illness surveillance registers.'
    },
    {
      num: 2,
      title: 'PRE PROCESSING',
      subtitle: 'Clean, Align & Scale Data',
      icon: Cpu,
      color: '#818cf8',
      desc: 'Normalizes asynchronous sensor intervals, fills missing psychrometric parameters via Magnus-Tetens dewpoint derivation, performs spatial interpolation across ward centroids, and standardizes demographic census tracts.'
    },
    {
      num: 3,
      title: 'COMPUTATION',
      subtitle: 'WBGT, UTCI, Heat Index & Risk Assessment',
      icon: Calculator,
      color: '#f59e0b',
      desc: 'Computes physiological human heat stress: Stull (2011) Wet Bulb (Tw), Liljegren black globe equilibrium (Tg), Outdoor WBGT (0.7Tw+0.2Tg+0.1Td), Universal Thermal Climate Index (UTCI), Rothfusz Heat Index, and Excess Heat Factor (EHF).'
    },
    {
      num: 4,
      title: 'MODEL PREDICTION',
      subtitle: 'Heatwave Prediction, Location-Based Risk',
      icon: BrainCircuit,
      color: '#ec4899',
      desc: 'AI Risk Engine combines physiological indices with ward-level vulnerability weights (Elderly & Children %, Outdoor Labor %, Informal Tin-Roof Housing %, and NDVI canopy deficiency) to forecast hospital admission surge 3-5 days ahead.'
    },
    {
      num: 5,
      title: 'ALERTS & ACTIONS',
      subtitle: 'GIS Alerts, Automated Advisories',
      icon: Radio,
      color: '#ef4444',
      desc: 'Dispatches 4-tier actions (Safe, Moderate, Severe, Extreme) tailored across 5 roles: Citizens, ASHA health workers, employers/gig workers, emergency hospitals, and power utilities via Twilio SMS, WhatsApp Business, Fast2SMS & SACHET CAP XML.'
    },
    {
      num: 6,
      title: 'SYSTEM FEEDBACK & IMPROVEMENT',
      subtitle: 'Closed-Loop Calibration Back to Pre-Processing',
      icon: RefreshCw,
      color: '#10b981',
      desc: 'Post-event verification compares predicted hospital admissions with actual ground-truth health registers, updating surrogate model loss and refining ward vulnerability weights.'
    }
  ];

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
        maxWidth: '1000px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        padding: '2rem',
        border: '1px solid rgba(255,255,255,0.14)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)'
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

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            padding: '0.65rem',
            borderRadius: '10px'
          }}>
            <Sparkles size={24} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
              ThermalGuard Methodology & Architectural Workflow
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Directly aligned with the proposed system architecture and innovation standards
            </p>
          </div>
        </div>

        {/* 6 Methodology Steps Flowchart */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {steps.map(s => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: `1px solid ${s.color}33`,
                  borderLeft: `4px solid ${s.color}`,
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{
                      background: s.color,
                      color: '#fff',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {s.num}
                    </span>
                    <strong style={{ fontSize: '0.85rem', color: '#fff' }}>{s.title}</strong>
                  </div>
                  <Icon size={18} color={s.color} />
                </div>
                <span style={{ fontSize: '0.72rem', color: s.color, fontWeight: 600 }}>
                  ({s.subtitle})
                </span>
                <p style={{ fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.45, marginTop: '2px' }}>
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Closed-Loop System Feedback & Improvement Interactive Section */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <RefreshCw size={18} color="#10b981" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
              Step 6: System Feedback & Improvement Loop
            </h3>
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: '4px'
            }}>
              Active Machine Learning Calibration
            </span>
          </div>

          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.4 }}>
            In accordance with the feedback arrow in the workflow diagram, ground-truth hospital admission registers from the NCDC surveillance network are compared against pre-event AI surge predictions to recalculate loss residuals and fine-tune model parameters.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmitFeedback} style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.85rem',
            background: 'rgba(0,0,0,0.25)',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '0.2rem' }}>
                Event Ward:
              </label>
              <input
                type="text"
                value={wardName}
                onChange={(e) => setWardName(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '6px',
                  padding: '0.4rem 0.6rem',
                  color: '#fff',
                  fontSize: '0.78rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '0.2rem' }}>
                AI Predicted Surge (%):
              </label>
              <input
                type="number"
                step="0.1"
                value={predictedSurge}
                onChange={(e) => setPredictedSurge(Number(e.target.value))}
                style={{
                  width: '100%',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '6px',
                  padding: '0.4rem 0.6rem',
                  color: '#fff',
                  fontSize: '0.78rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '0.2rem' }}>
                Actual Hospital Surge (%):
              </label>
              <input
                type="number"
                step="0.1"
                value={actualSurge}
                onChange={(e) => setActualSurge(Number(e.target.value))}
                style={{
                  width: '100%',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '6px',
                  padding: '0.4rem 0.6rem',
                  color: '#fff',
                  fontSize: '0.78rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type="submit"
                disabled={submittingFeedback}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
              >
                <RefreshCw size={14} />
                {submittingFeedback ? 'Calibrating...' : 'Log & Recalibrate Model'}
              </button>
            </div>
          </form>

          {feedbackSuccess && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              color: '#34d399',
              fontSize: '0.74rem',
              padding: '0.45rem 0.75rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginBottom: '1rem'
            }}>
              <CheckCircle size={15} />
              Hospital admissions ground-truth registered! AI loss recalculated and weights updated into surrogate pipeline.
            </div>
          )}

          {/* Historical Calibration Log Table */}
          <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '0.4rem' }}>Date</th>
                  <th style={{ padding: '0.4rem' }}>Ward</th>
                  <th style={{ padding: '0.4rem' }}>AI Predicted</th>
                  <th style={{ padding: '0.4rem' }}>Actual Surge</th>
                  <th style={{ padding: '0.4rem' }}>Accuracy</th>
                  <th style={{ padding: '0.4rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {feedbackLogs.map((log, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.4rem', color: '#94a3b8' }}>{log.event_date}</td>
                    <td style={{ padding: '0.4rem', color: '#fff', fontWeight: 600 }}>{log.ward_name}</td>
                    <td style={{ padding: '0.4rem', color: '#f87171' }}>+{log.predicted_surge_pct}%</td>
                    <td style={{ padding: '0.4rem', color: '#fb923c' }}>+{log.actual_hospital_surge_pct}%</td>
                    <td style={{ padding: '0.4rem', color: '#34d399', fontWeight: 700 }}>{log.accuracy_pct}%</td>
                    <td style={{ padding: '0.4rem' }}>
                      <span style={{
                        background: 'rgba(16, 185, 129, 0.12)',
                        color: '#34d399',
                        padding: '0.1rem 0.35rem',
                        borderRadius: '4px',
                        fontSize: '0.65rem'
                      }}>
                        {log.calibrated_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
