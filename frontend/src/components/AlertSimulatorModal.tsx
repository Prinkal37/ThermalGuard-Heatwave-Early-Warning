import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Smartphone, 
  MessageSquare, 
  FileCode, 
  CheckCheck, 
  Download, 
  Radio, 
  PhoneCall,
  ExternalLink 
} from 'lucide-react';
import { WardSummary } from '../types';
import { API_BASE, apiFetch } from '../api';

interface AlertSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  wards: WardSummary[];
  defaultWardId?: string;
}

export const AlertSimulatorModal: React.FC<AlertSimulatorModalProps> = ({
  isOpen,
  onClose,
  wards,
  defaultWardId
}) => {
  const [selectedWardId, setSelectedWardId] = useState<string>(
    defaultWardId || (wards.length > 0 ? wards[0].id : '')
  );
  const [phoneNumber, setPhoneNumber] = useState<string>('+91 98234 56789');
  const [channel, setChannel] = useState<'whatsapp' | 'sms' | 'fast2sms' | 'sachet'>('whatsapp');
  const [loading, setLoading] = useState<boolean>(false);
  const [simulatedResult, setSimulatedResult] = useState<any>(null);
  const [sachetXml, setSachetXml] = useState<string>('');

  if (!isOpen) return null;

  const currentWard = wards.find(w => w.id === selectedWardId) || wards[0];

  const handleSimulate = async () => {
    if (!currentWard) return;
    setLoading(true);
    try {
      if (channel === 'sachet') {
        const res = await apiFetch(`${API_BASE}/alerts/sachet-xml/${currentWard.id}`);
        const data = await res.json();
        setSachetXml(data.xml);
        setSimulatedResult({
          status: 'XML_GENERATED',
          channel: 'NDMA SACHET CAP v1.2',
          timestamp: new Date().toLocaleTimeString()
        });
      } else {
        const res = await apiFetch(`${API_BASE}/alerts/simulate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ward_id: currentWard.id,
            phone_number: phoneNumber,
            channel: channel
          })
        });
        const data = await res.json();
        setSimulatedResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
        maxWidth: '900px',
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
            background: 'rgba(14, 165, 233, 0.2)',
            padding: '0.6rem',
            borderRadius: '10px',
            border: '1px solid rgba(14, 165, 233, 0.35)'
          }}>
            <Send size={24} color="#38bdf8" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
              Multi-Channel Alert Dispatcher & SACHET Gateway
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Test targeted ward-level early warning alerts across WhatsApp Business API, Twilio SMS, Fast2SMS, & NDMA CAP
            </p>
          </div>
        </div>

        <div className="modal-grid">
          {/* Dispatch Controls */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {/* Select Ward */}
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Target Monitored Ward:
                </label>
                <select
                  value={selectedWardId}
                  onChange={(e) => setSelectedWardId(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(30, 41, 59, 0.85)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    padding: '0.55rem 0.75rem',
                    color: '#fff',
                    fontSize: '0.82rem',
                    fontWeight: 600
                  }}
                >
                  {wards.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.city}) — Tier: {w.risk.tier}
                    </option>
                  ))}
                </select>
              </div>

              {/* Delivery Channel */}
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Early Warning Dispatch Channel:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {[
                    { id: 'whatsapp', label: 'WhatsApp Business', icon: MessageSquare, desc: 'Meta Template API' },
                    { id: 'sms', label: 'Twilio SMS', icon: Smartphone, desc: 'Global carrier SMS' },
                    { id: 'fast2sms', label: 'Fast2SMS India', icon: PhoneCall, desc: 'TRAI DLT Route' },
                    { id: 'sachet', label: 'NDMA SACHET', icon: FileCode, desc: 'OASIS CAP 1.2 XML' },
                  ].map(ch => {
                    const Icon = ch.icon;
                    const isSelected = channel === ch.id;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setChannel(ch.id as any)}
                        style={{
                          background: isSelected ? 'rgba(14, 165, 233, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                          border: isSelected ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
                          borderRadius: '8px',
                          padding: '0.65rem',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <Icon size={18} color={isSelected ? '#38bdf8' : 'var(--text-dim)'} />
                        <div>
                          <strong style={{ fontSize: '0.78rem', color: '#fff', display: 'block' }}>{ch.label}</strong>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{ch.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recipient Phone (if not sachet) */}
              {channel !== 'sachet' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: 600 }}>
                    Recipient Mobile Number (E.164 format):
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(30, 41, 59, 0.85)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      padding: '0.55rem 0.75rem',
                      color: '#fff',
                      fontSize: '0.82rem'
                    }}
                  />
                </div>
              )}

              {/* Ward Summary Pill */}
              {currentWard && (
                <div style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: `1px solid ${currentWard.risk.tier_color}`,
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontSize: '0.75rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Current Status:</span>
                    <strong style={{ color: currentWard.risk.tier_color }}>{currentWard.risk.tier} WARNING</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>WBGT / UTCI:</span>
                    <strong style={{ color: '#fff' }}>{currentWard.risk.metrics.wbgt_outdoor_c}°C / {currentWard.risk.metrics.utci_c}°C</strong>
                  </div>
                  <p style={{ color: '#cbd5e1', fontSize: '0.72rem', marginTop: '0.35rem' }}>
                    Action: {currentWard.risk.immediate_actions[0]}
                  </p>
                </div>
              )}

              {/* Dispatch Action Button */}
              <button
                onClick={handleSimulate}
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 15px rgba(14, 165, 233, 0.35)',
                  marginTop: '0.25rem',
                  opacity: loading ? 0.7 : 1
                }}
              >
                <Send size={16} />
                {loading ? 'Transmitting to Gateway...' : `Simulate ${channel.toUpperCase()} Dispatch`}
              </button>
            </div>
          </div>

          {/* Handset Mockup / XML Preview */}
          <div>
            <span style={{ display: 'block', fontSize: '0.74rem', color: '#cbd5e1', marginBottom: '0.35rem', fontWeight: 600 }}>
              Device / Gateway Preview:
            </span>

            {channel === 'sachet' ? (
              <div style={{
                background: '#090d16',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '0.85rem',
                height: '380px',
                overflowY: 'auto'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700 }}>CAP v1.2 XML Feed</span>
                  {sachetXml && (
                    <button
                      onClick={() => {
                        const blob = new Blob([sachetXml], { type: 'text/xml' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `sachet-alert-${currentWard.id}.xml`;
                        a.click();
                      }}
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        color: '#fff',
                        border: 'none',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <Download size={12} /> Download XML
                    </button>
                  )}
                </div>
                <pre style={{
                  fontSize: '0.68rem',
                  color: '#94a3b8',
                  fontFamily: 'var(--font-mono)',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.4
                }}>
                  {sachetXml || 'Click "Simulate SACHET Dispatch" to generate the full OASIS CAP 1.2 XML document...'}
                </pre>
              </div>
            ) : (
              /* Simulated Smartphone */
              <div style={{
                background: '#0f172a',
                border: '4px solid #334155',
                borderRadius: '24px',
                padding: '1rem',
                height: '380px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
              }}>
                {/* Phone Speaker & Camera notch */}
                <div style={{ width: '40px', height: '4px', background: '#475569', borderRadius: '2px', margin: '0 auto 0.85rem auto' }} />

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                  {/* WhatsApp or SMS Message Bubble */}
                  <div style={{
                    background: channel === 'whatsapp' ? '#075e54' : '#1e293b',
                    color: '#fff',
                    borderRadius: '12px',
                    padding: '0.85rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <strong style={{ fontSize: '0.78rem', color: currentWard.risk.tier_color }}>
                        🚨 {currentWard.risk.tier} HEAT ALERT
                      </strong>
                      <span style={{ fontSize: '0.62rem', color: '#cbd5e1' }}>Now</span>
                    </div>

                    <p style={{ fontSize: '0.74rem', lineHeight: 1.4, color: '#f1f5f9' }}>
                      <strong>ThermalGuard NDMA:</strong> High human thermal stress in <strong>{currentWard.name}</strong>.<br />
                      Outdoor WBGT: <strong>{currentWard.risk.metrics.wbgt_outdoor_c}°C</strong> | UTCI: <strong>{currentWard.risk.metrics.utci_c}°C</strong>.<br />
                      <strong>Action:</strong> {currentWard.risk.immediate_actions[0]}
                    </p>

                    {channel === 'whatsapp' && (
                      <div style={{
                        marginTop: '0.65rem',
                        background: 'rgba(255,255,255,0.15)',
                        padding: '0.4rem',
                        borderRadius: '6px',
                        textAlign: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#38bdf8',
                        cursor: 'pointer'
                      }}>
                        📍 View Nearest Cooling Centers
                      </div>
                    )}
                  </div>

                  {/* Delivery Status Receipt */}
                  {simulatedResult && (
                    <div style={{
                      marginTop: 'auto',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '8px',
                      padding: '0.5rem',
                      fontSize: '0.7rem',
                      color: '#34d399',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}>
                      <CheckCheck size={16} />
                      <div>
                        <strong>Dispatched via {channel.toUpperCase()}:</strong> Handset Ack Received ({simulatedResult.delivery_receipt?.latency_ms || 142}ms)
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
