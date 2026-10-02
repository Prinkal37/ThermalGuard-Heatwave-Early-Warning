import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { KPISummary } from './components/KPISummary';
import { GisMap } from './components/GisMap';
import { WardInspector } from './components/WardInspector';
import { RoleAdvisoryPortal } from './components/RoleAdvisoryPortal';
import { RiskAnalystModal } from './components/RiskAnalystModal';
import { AlertSimulatorModal } from './components/AlertSimulatorModal';
import { MethodologyModal } from './components/MethodologyModal';
import { SettingsModal } from './components/SettingsModal';
import { HAPReportModal } from './components/HAPReportModal';
import { 
  SystemStatus, 
  WardSummary, 
  WardDetailsResponse, 
  AnalystReviewItem, 
  ApprovedBroadcastItem 
} from './types';
import { ShieldAlert, AlertTriangle, Layers, Radio, HeartPulse, RefreshCw } from 'lucide-react';
import { API_BASE, apiFetch } from './api';

export const App: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [wards, setWards] = useState<WardSummary[]>([]);
  const [selectedWardId, setSelectedWardId] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [activeScenario, setActiveScenario] = useState<string>('MAY_2024_EXTREME_HEATWAVE');
  const [wardDetails, setWardDetails] = useState<WardDetailsResponse | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [dispatchMode, setDispatchMode] = useState<string>('SIMULATION');

  // Modals
  const [isAnalystOpen, setIsAnalystOpen] = useState<boolean>(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHAPReportOpen, setIsHAPReportOpen] = useState<boolean>(false);
  const [hapWardId, setHapWardId] = useState<string>('');
  const [simulatorDefaultWard, setSimulatorDefaultWard] = useState<string>('');

  // Analyst reviews
  const [pendingReviews, setPendingReviews] = useState<AnalystReviewItem[]>([]);
  const [approvedBroadcasts, setApprovedBroadcasts] = useState<ApprovedBroadcastItem[]>([]);

  // Initial load
  const fetchData = async () => {
    setRefreshing(true);
    try {
      // 1. Status
      const statusRes = await apiFetch(`${API_BASE}/status`);
      const statusData = await statusRes.json();
      setStatus(statusData);

      // 2. Settings & Dispatch Mode
      const settRes = await apiFetch(`${API_BASE}/settings`);
      const settData = await settRes.json();
      if (settData.dispatch_mode) setDispatchMode(settData.dispatch_mode);

      // 3. Wards
      const wardsRes = await apiFetch(`${API_BASE}/wards`);
      const wardsData: WardSummary[] = await wardsRes.json();
      setWards(wardsData);

      // Pick the highest risk ward if none selected
      if (!selectedWardId && wardsData.length > 0) {
        const sorted = [...wardsData].sort((a, b) => b.risk.composite_risk_score - a.risk.composite_risk_score);
        setSelectedWardId(sorted[0].id);
      }

      // 4. Analyst queues
      const pendingRes = await apiFetch(`${API_BASE}/analyst/pending`);
      const pendingData = await pendingRes.json();
      setPendingReviews(pendingData);

      const approvedRes = await apiFetch(`${API_BASE}/analyst/approved`);
      const approvedData = await approvedRes.json();
      setApprovedBroadcasts(approvedData);
    } catch (err) {
      console.error('Error fetching data from API:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch single ward details when selectedWardId changes
  useEffect(() => {
    if (!selectedWardId) return;
    setLoadingDetails(true);
    apiFetch(`${API_BASE}/ward/${selectedWardId}`)
      .then(res => res.json())
      .then(data => setWardDetails(data))
      .catch(console.error)
      .finally(() => setLoadingDetails(false));
  }, [selectedWardId, activeScenario]);

  // Scenario Change Handler
  const handleScenarioChange = async (scenario: string) => {
    setActiveScenario(scenario);
    try {
      await apiFetch(`${API_BASE}/scenario/set`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      await fetchData();
    } catch (err) {
      console.error('Error switching scenario:', err);
    }
  };

  // Human-in-the-loop analyst action
  const handleApproveReview = async (reviewId: string, analystName: string, calibratedTier?: string, notes?: string) => {
    try {
      const res = await apiFetch(`${API_BASE}/analyst/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review_id: reviewId,
          analyst_name: analystName,
          calibrated_tier: calibratedTier,
          notes: notes
        })
      });
      const data = await res.json();
      setApprovedBroadcasts(prev => [data.broadcast, ...prev]);
      setPendingReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (err) {
      console.error(err);
    }
  };

  const openSimulatorForWard = (wardId: string) => {
    setSimulatorDefaultWard(wardId);
    setIsSimulatorOpen(true);
  };

  const openHAPReportForWard = (wardId: string) => {
    setHapWardId(wardId);
    setIsHAPReportOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <Header
        status={status}
        activeScenario={activeScenario}
        onScenarioChange={handleScenarioChange}
        pendingReviewsCount={pendingReviews.length}
        dispatchMode={dispatchMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAnalyst={() => setIsAnalystOpen(true)}
        onOpenSimulator={() => {
          setSimulatorDefaultWard(selectedWardId || '');
          setIsSimulatorOpen(true);
        }}
        onOpenMethodology={() => setIsMethodologyOpen(true)}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* KPI Analytics Strip */}
        <KPISummary wards={wards} />

        {/* GIS Map & Selected Ward Details Section */}
        <div className="dashboard-grid">
          {/* Left: GIS Early Warning Map */}
          <div>
            <GisMap
              wards={wards}
              selectedWardId={selectedWardId}
              onSelectWard={(id) => setSelectedWardId(id)}
              selectedCity={selectedCity}
              onSelectCity={(city) => setSelectedCity(city)}
            />
          </div>

          {/* Right: Ward Inspector with 5-Day Lead Time & Diurnal Heat Curve */}
          <div>
            <WardInspector
              wardDetails={wardDetails}
              loading={loadingDetails}
              onTriggerAlert={openSimulatorForWard}
              onOpenHAPReport={openHAPReportForWard}
            />
          </div>
        </div>

        {/* Targeted Role-Specific Action Portals (Citizens, ASHA, Workers, Hospitals, Utilities) */}
        {wardDetails && (
          <RoleAdvisoryPortal
            advisories={wardDetails.role_advisories}
            risk={wardDetails.current_evaluation}
            wardName={wardDetails.ward.name}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        background: 'rgba(10, 15, 29, 0.95)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '1.5rem 1.25rem',
        marginTop: 'auto',
        fontSize: '0.75rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{
          maxWidth: '1600px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <strong style={{ color: '#fff', fontSize: '0.85rem' }}>ThermalGuard Platform</strong> — Extreme Heatwave Early Warning & Human Thermal Stress Index
            <p style={{ marginTop: '0.2rem' }}>
              Standard Compliance: IMD Heatwave Standards • ERA5 Climatological Baseline • Open-Meteo Real-time NWP • NCMRWF 4km Model • NCDC Heat Illness Surveillance
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              FastAPI + PostGIS Core Connected
            </span>
            <span>•</span>
            <button
              onClick={() => setIsMethodologyOpen(true)}
              style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
            >
              Methodology Architecture Flowchart
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RiskAnalystModal
        isOpen={isAnalystOpen}
        onClose={() => setIsAnalystOpen(false)}
        pendingReviews={pendingReviews}
        approvedBroadcasts={approvedBroadcasts}
        onApproveReview={handleApproveReview}
      />

      <AlertSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        wards={wards}
        defaultWardId={simulatorDefaultWard}
      />

      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsUpdated={fetchData}
      />

      <HAPReportModal
        isOpen={isHAPReportOpen}
        onClose={() => setIsHAPReportOpen(false)}
        wardId={hapWardId || selectedWardId || ''}
      />
    </div>
  );
};
export default App;
