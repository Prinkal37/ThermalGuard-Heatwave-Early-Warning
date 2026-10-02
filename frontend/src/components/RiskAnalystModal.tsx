import React, { useState } from 'react';
import { 
  X, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Flame, 
  Send, 
  Radio, 
  History 
} from 'lucide-react';
import { AnalystReviewItem, ApprovedBroadcastItem } from '../types';

interface RiskAnalystModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingReviews: AnalystReviewItem[];
  approvedBroadcasts: ApprovedBroadcastItem[];
  onApproveReview: (reviewId: string, analystName: string, calibratedTier?: string, notes?: string) => Promise<void>;
}

export const RiskAnalystModal: React.FC<RiskAnalystModalProps> = ({
  isOpen,
  onClose,
  pendingReviews,
  approvedBroadcasts,
  onApproveReview
}) => {
  const [selectedReviewId, setSelectedReviewId] = useState<string>(
    pendingReviews.length > 0 ? pendingReviews[0].id : ''
  );
  const [analystName, setAnalystName] = useState<string>('Dr. V. K. Nair (Senior Agrometeorologist)');
  const [calibratedTier, setCalibratedTier] = useState<string>('');
  const [analystNotes, setAnalystNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  if (!isOpen) return null;

  const currentReview = pendingReviews.find(r => r.id === selectedReviewId) || pendingReviews[0];

  const handleApprove = async () => {
    if (!currentReview) return;
    setSubmitting(true);
    try {
      await onApproveReview(
        currentReview.id,
        analystName,
        calibratedTier || currentReview.ai_tier,
        analystNotes
      );
      setCalibratedTier('');
      setAnalystNotes('');
      // If there are more pending, select next
      const remaining = pendingReviews.filter(r => r.id !== currentReview.id);
      if (remaining.length > 0) {
        setSelectedReviewId(remaining[0].id);
      }
    } finally {
      setSubmitting(false);
    }
  };

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
        maxWidth: '920px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        padding: '1.75rem',
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

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <div style={{
            background: 'rgba(59, 130, 246, 0.2)',
            padding: '0.6rem',
            borderRadius: '10px',
            border: '1px solid rgba(59, 130, 246, 0.35)'
          }}>
            <UserCheck size={24} color="#60a5fa" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
              Risk Analyst Approval Portal (Human-in-the-Loop)
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Direct implementation of AI Risk Engine workflow: Output for Review → Analyst Verification → Dispatched Warnings
            </p>
          </div>
        </div>

        {/* Tabs: Pending Queue vs Broadcast History */}
        <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
          <button
            onClick={() => setActiveTab('pending')}
            style={{
              background: activeTab === 'pending' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
              color: activeTab === 'pending' ? '#f87171' : 'var(--text-muted)',
              border: activeTab === 'pending' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid transparent',
              padding: '0.4rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <AlertTriangle size={15} />
            Pending AI Risk Forecasts ({pendingReviews.length})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            style={{
              background: activeTab === 'history' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: activeTab === 'history' ? '#34d399' : 'var(--text-muted)',
              border: activeTab === 'history' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
              padding: '0.4rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <History size={15} />
            Dispatched Broadcast History ({approvedBroadcasts.length})
          </button>
        </div>

        {activeTab === 'pending' ? (
          <div>
            {pendingReviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                <CheckCircle2 size={42} color="#10b981" style={{ margin: '0 auto 0.75rem auto' }} />
                <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>All AI Forecasts Approved!</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  No high-risk warnings are currently pending human-in-the-loop review.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.25rem' }}>
                {/* List of items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '420px', overflowY: 'auto' }}>
                  {pendingReviews.map(item => {
                    const isSelected = item.id === (currentReview?.id || '');
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedReviewId(item.id)}
                        style={{
                          background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(30, 41, 59, 0.5)',
                          border: isSelected ? '1px solid #3b82f6' : '1px solid var(--border-subtle)',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <strong style={{ fontSize: '0.85rem', color: '#fff' }}>{item.ward_name}</strong>
                          <span style={{
                            background: item.ai_tier === 'EXTREME' ? '#ef4444' : item.ai_tier === 'SEVERE' ? '#f97316' : '#f59e0b',
                            color: '#fff',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            padding: '0.1rem 0.45rem',
                            borderRadius: '999px'
                          }}>
                            {item.ai_tier}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {item.city} • AI Score: <strong style={{ color: '#f87171' }}>{item.ai_risk_score}/100</strong>
                        </p>
                        <p style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                          Surge: +{item.predicted_surge_pct}% • {item.created_at}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Inspector & Approval Form for Selected Item */}
                {currentReview && (
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                      <div>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Review ID: {currentReview.id}</span>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                          {currentReview.ward_name} ({currentReview.city})
                        </h3>
                      </div>
                      <span style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        color: '#f87171',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px'
                      }}>
                        AI Proposed: {currentReview.ai_tier}
                      </span>
                    </div>

                    {/* Meteorological Breakdown */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.5rem',
                      background: 'rgba(0,0,0,0.3)',
                      padding: '0.65rem',
                      borderRadius: '8px',
                      fontSize: '0.72rem',
                      marginBottom: '1rem'
                    }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>WBGT Outdoor:</span>
                        <strong style={{ display: 'block', color: '#f87171', fontSize: '0.95rem' }}>{currentReview.metrics.wbgt_outdoor_c}°C</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>UTCI Stress:</span>
                        <strong style={{ display: 'block', color: '#fb923c', fontSize: '0.95rem' }}>{currentReview.metrics.utci_c}°C</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Air Max Temp:</span>
                        <strong style={{ display: 'block', color: '#fbbf24', fontSize: '0.95rem' }}>{currentReview.metrics.temp_max_c}°C</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Heat Index:</span>
                        <strong style={{ display: 'block', color: '#fff' }}>{currentReview.metrics.heat_index_c}°C</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Relative Humidity:</span>
                        <strong style={{ display: 'block', color: '#fff' }}>{currentReview.metrics.rel_humidity_pct}%</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Projected Surge:</span>
                        <strong style={{ display: 'block', color: '#f472b6' }}>+{currentReview.predicted_surge_pct}%</strong>
                      </div>
                    </div>

                    {/* Analyst Form Controls */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '0.25rem', fontWeight: 600 }}>
                          Analyst Name & Title:
                        </label>
                        <input
                          type="text"
                          value={analystName}
                          onChange={(e) => setAnalystName(e.target.value)}
                          style={{
                            width: '100%',
                            background: 'rgba(30, 41, 59, 0.7)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '6px',
                            padding: '0.45rem 0.65rem',
                            color: '#fff',
                            fontSize: '0.78rem'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '0.25rem', fontWeight: 600 }}>
                          Calibrate Warning Level (Optional Override):
                        </label>
                        <select
                          value={calibratedTier || currentReview.ai_tier}
                          onChange={(e) => setCalibratedTier(e.target.value)}
                          style={{
                            width: '100%',
                            background: 'rgba(30, 41, 59, 0.7)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '6px',
                            padding: '0.45rem 0.65rem',
                            color: '#fff',
                            fontSize: '0.78rem'
                          }}
                        >
                          <option value="EXTREME">EXTREME (Red Alert - Life Threatening)</option>
                          <option value="SEVERE">SEVERE (Orange Alert - High Precaution)</option>
                          <option value="MODERATE">MODERATE (Yellow Alert - Caution)</option>
                          <option value="SAFE">SAFE (Green - Normal Routine)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '0.25rem', fontWeight: 600 }}>
                          Meteorologist Advisory Notes:
                        </label>
                        <textarea
                          rows={3}
                          value={analystNotes}
                          placeholder={currentReview.analyst_notes || "Add ground verification or demographic notes..."}
                          onChange={(e) => setAnalystNotes(e.target.value)}
                          style={{
                            width: '100%',
                            background: 'rgba(30, 41, 59, 0.7)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '6px',
                            padding: '0.45rem 0.65rem',
                            color: '#fff',
                            fontSize: '0.78rem',
                            resize: 'vertical'
                          }}
                        />
                      </div>

                      <button
                        onClick={handleApprove}
                        disabled={submitting}
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#fff',
                          border: 'none',
                          padding: '0.65rem 1.25rem',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
                          marginTop: '0.5rem',
                          opacity: submitting ? 0.7 : 1
                        }}
                      >
                        <ShieldCheck size={18} />
                        {submitting ? 'Broadcasting Alerts...' : 'Approve & Dispatch Public Broadcast'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* History View */
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {approvedBroadcasts.map((b, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(30, 41, 59, 0.6)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{b.ward_name}</strong>
                      <span style={{
                        background: b.tier === 'EXTREME' ? '#ef4444' : b.tier === 'SEVERE' ? '#f97316' : '#f59e0b',
                        color: '#fff',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '0.1rem 0.45rem',
                        borderRadius: '999px'
                      }}>
                        {b.tier}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Approved by: <strong style={{ color: '#cbd5e1' }}>{b.approved_by}</strong> at {b.approved_at}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      {b.channels_used.map((ch, idx) => (
                        <span key={idx} style={{
                          background: 'rgba(255,255,255,0.08)',
                          fontSize: '0.68rem',
                          color: '#38bdf8',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px'
                        }}>
                          {ch}
                        </span>
                      ))}
                    </div>
                    <span style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#34d399',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.6rem',
                      borderRadius: '999px'
                    }}>
                      ✓ DISPATCHED
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
