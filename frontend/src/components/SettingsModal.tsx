import React, { useState, useEffect } from 'react';
import { 
  X, 
  Key, 
  ShieldCheck, 
  Smartphone, 
  MessageSquare, 
  PhoneCall, 
  CheckCircle2, 
  ToggleLeft, 
  ToggleRight,
  Save,
  Radio
} from 'lucide-react';
import { API_BASE, apiFetch } from '../api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsUpdated: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsUpdated
}) => {
  const [dispatchMode, setDispatchMode] = useState<string>('SIMULATION');
  const [twilioSid, setTwilioSid] = useState<string>('');
  const [twilioToken, setTwilioToken] = useState<string>('');
  const [twilioFrom, setTwilioFrom] = useState<string>('+1844HEATGRD');
  const [whatsappToken, setWhatsappToken] = useState<string>('');
  const [whatsappPhoneId, setWhatsappPhoneId] = useState<string>('');
  const [fast2smsKey, setFast2smsKey] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      apiFetch(`${API_BASE}/settings`)
        .then(res => res.json())
        .then(data => {
          setDispatchMode(data.dispatch_mode || 'SIMULATION');
          if (data.twilio?.from_phone) setTwilioFrom(data.twilio.from_phone);
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        dispatch_mode: dispatchMode,
        twilio_from_phone: twilioFrom
      };
      if (twilioSid) payload.twilio_account_sid = twilioSid;
      if (twilioToken) payload.twilio_auth_token = twilioToken;
      if (whatsappToken) payload.whatsapp_token = whatsappToken;
      if (whatsappPhoneId) payload.whatsapp_phone_number_id = whatsappPhoneId;
      if (fast2smsKey) payload.fast2sms_api_key = fast2smsKey;

      const res = await apiFetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setSuccessMsg('API credentials & dispatch configuration saved successfully!');
      onSettingsUpdated();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
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
        maxWidth: '800px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        padding: '1.75rem',
        border: '1px solid rgba(255,255,255,0.14)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)'
      }}>
        {/* Close */}
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

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.2)',
            padding: '0.6rem',
            borderRadius: '10px',
            border: '1px solid rgba(16, 185, 129, 0.35)'
          }}>
            <Key size={24} color="#34d399" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
              Live Telephony & Gateway API Credentials
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Configure live credentials for Twilio SMS, Meta WhatsApp Business Cloud API, and Fast2SMS India
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <strong style={{ fontSize: '0.9rem', color: '#fff', display: 'block' }}>
              Global Dispatch Mode
            </strong>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              {dispatchMode === 'SIMULATION'
                ? 'Safe Simulation: Generates realistic payloads & simulated carrier delivery receipts.'
                : 'Live Production: Transmits real HTTP requests to Twilio, Meta, or Fast2SMS gateways.'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setDispatchMode('SIMULATION')}
              style={{
                background: dispatchMode === 'SIMULATION' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255,255,255,0.05)',
                color: dispatchMode === 'SIMULATION' ? '#60a5fa' : 'var(--text-muted)',
                border: dispatchMode === 'SIMULATION' ? '1px solid #3b82f6' : '1px solid var(--border-subtle)',
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Simulation Mode
            </button>
            <button
              type="button"
              onClick={() => setDispatchMode('LIVE_PRODUCTION')}
              style={{
                background: dispatchMode === 'LIVE_PRODUCTION' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255,255,255,0.05)',
                color: dispatchMode === 'LIVE_PRODUCTION' ? '#f87171' : 'var(--text-muted)',
                border: dispatchMode === 'LIVE_PRODUCTION' ? '1px solid #ef4444' : '1px solid var(--border-subtle)',
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Live Production Gateway
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Twilio */}
          <div style={{ background: 'rgba(30, 41, 59, 0.45)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
              <Smartphone size={16} color="#38bdf8" />
              <strong style={{ fontSize: '0.85rem', color: '#fff' }}>Twilio SMS Configuration</strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '0.2rem' }}>Account SID:</label>
                <input
                  type="text"
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={twilioSid}
                  onChange={(e) => setTwilioSid(e.target.value)}
                  style={{ width: '100%', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#fff', fontSize: '0.78rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '0.2rem' }}>Auth Token:</label>
                <input
                  type="password"
                  placeholder="Enter Auth Token"
                  value={twilioToken}
                  onChange={(e) => setTwilioToken(e.target.value)}
                  style={{ width: '100%', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#fff', fontSize: '0.78rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '0.2rem' }}>From Phone Number:</label>
                <input
                  type="text"
                  value={twilioFrom}
                  onChange={(e) => setTwilioFrom(e.target.value)}
                  style={{ width: '100%', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#fff', fontSize: '0.78rem' }}
                />
              </div>
            </div>
          </div>

          {/* WhatsApp */}
          <div style={{ background: 'rgba(30, 41, 59, 0.45)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
              <MessageSquare size={16} color="#34d399" />
              <strong style={{ fontSize: '0.85rem', color: '#fff' }}>Meta WhatsApp Business Cloud API</strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '0.2rem' }}>System User Access Token:</label>
                <input
                  type="password"
                  placeholder="EAAGxxxxxxxxxxxxxxxxxxxxxxxx..."
                  value={whatsappToken}
                  onChange={(e) => setWhatsappToken(e.target.value)}
                  style={{ width: '100%', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#fff', fontSize: '0.78rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '0.2rem' }}>Phone Number ID:</label>
                <input
                  type="text"
                  placeholder="109283746591029"
                  value={whatsappPhoneId}
                  onChange={(e) => setWhatsappPhoneId(e.target.value)}
                  style={{ width: '100%', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#fff', fontSize: '0.78rem' }}
                />
              </div>
            </div>
          </div>

          {/* Fast2SMS */}
          <div style={{ background: 'rgba(30, 41, 59, 0.45)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
              <PhoneCall size={16} color="#fbbf24" />
              <strong style={{ fontSize: '0.85rem', color: '#fff' }}>Fast2SMS India (TRAI DLT Approved Gateway)</strong>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '0.2rem' }}>Fast2SMS Authorization API Key:</label>
              <input
                type="password"
                placeholder="Enter Fast2SMS API key"
                value={fast2smsKey}
                onChange={(e) => setFast2smsKey(e.target.value)}
                style={{ width: '100%', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', padding: '0.4rem 0.6rem', color: '#fff', fontSize: '0.78rem' }}
              />
            </div>
          </div>

          {successMsg && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              color: '#34d399',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.74rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <CheckCircle2 size={16} />
              {successMsg}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: '#cbd5e1',
                border: 'none',
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                border: 'none',
                padding: '0.55rem 1.35rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)'
              }}
            >
              <Save size={16} />
              {loading ? 'Saving Settings...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
