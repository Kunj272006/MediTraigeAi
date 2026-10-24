import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { JeevanNavbar } from './components/jeevan/JeevanNavbar';
import type { JeevanPortalRole } from './components/jeevan/JeevanNavbar';
import { CitizenEmergencyPage } from './pages/CitizenEmergencyPage';
import { LiveIncidentTrackingPage } from './pages/LiveIncidentTrackingPage';
import { DispatcherDashboardPage } from './pages/DispatcherDashboardPage';
import { AmbulanceOperatorPage } from './pages/AmbulanceOperatorPage';
import { GovtHospitalPage } from './pages/GovtHospitalPage';
import { AdminPortalPage } from './pages/AdminPortalPage';

// Preserved existing modules
import { LandingPage } from './pages/LandingPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { ResultPage } from './pages/ResultPage';
import { HospitalDashboardPage } from './pages/HospitalDashboardPage';
import { PatientDetailPage } from './pages/PatientDetailPage';
import { HospitalLoginPage } from './pages/HospitalLoginPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { jeevanApi } from './lib/jeevanApi';

// Unified Jeevan Container
const JeevanMainContainer: React.FC<{ initialRole?: JeevanPortalRole }> = ({ initialRole = 'citizen' }) => {
  const [activeRole, setActiveRole] = useState<JeevanPortalRole>(initialRole);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [activeTrackingId, setActiveTrackingId] = useState<string | null>(null);
  const [activeIncidentsCount, setActiveIncidentsCount] = useState<number>(0);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    setActiveRole(initialRole);
  }, [initialRole]);

  useEffect(() => {
    const roleParam = searchParams.get('role') as JeevanPortalRole;
    if (roleParam && ['citizen', 'dispatcher', 'operator', 'hospital', 'admin'].includes(roleParam)) {
      setActiveRole(roleParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const checkActive = async () => {
      try {
        const res = await jeevanApi.getAdminStats();
        if (res.success) {
          setActiveIncidentsCount(res.stats.activeEmergencies);
        }
      } catch (e) {
        // quiet
      }
    };
    checkActive();
    const interval = setInterval(checkActive, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleChange = (role: JeevanPortalRole) => {
    setActiveTrackingId(null);
    setActiveRole(role);
    navigate(role === 'citizen' ? '/jeevan' : '/' + role);
  };

  const handleViewTracking = (incidentId: string) => {
    setActiveTrackingId(incidentId);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      <JeevanNavbar
        activeRole={activeRole}
        onSelectRole={handleRoleChange}
        language={language}
        onLanguageChange={setLanguage}
        activeIncidentCount={activeIncidentsCount}
      />

      <main className="flex-1">
        {activeTrackingId ? (
          <LiveIncidentTrackingPage
            incidentId={activeTrackingId}
            onBack={() => setActiveTrackingId(null)}
          />
        ) : (
          <>
            {activeRole === 'citizen' && (
              <CitizenEmergencyPage
                language={language}
                onViewTracking={handleViewTracking}
              />
            )}
            {activeRole === 'dispatcher' && (
              <DispatcherDashboardPage
                onSelectIncident={(id) => handleViewTracking(id)}
              />
            )}
            {activeRole === 'operator' && <AmbulanceOperatorPage />}
            {activeRole === 'hospital' && <GovtHospitalPage />}
            {activeRole === 'admin' && <AdminPortalPage />}
          </>
        )}
      </main>
    </div>
  );
};

// Direct tracking URL wrapper
const TrackingPageWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  if (!id) return <Navigate to="/" replace />;
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800">
      <JeevanNavbar
        activeRole="citizen"
        onSelectRole={(r) => navigate(`/${r === 'citizen' ? 'jeevan' : r}`)}
        language="en"
        onLanguageChange={() => {}}
      />
      <LiveIncidentTrackingPage incidentId={id} onBack={() => navigate('/jeevan')} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main MediTriage Landing Page at root (/) */}
        <Route path="/" element={<LandingPage />} />

        {/* Core Jeevan AI Emergency Response Routes */}
        <Route path="/jeevan" element={<JeevanMainContainer initialRole="citizen" />} />
        <Route path="/emergency" element={<Navigate to="/jeevan" replace />} />
        <Route path="/dispatcher" element={<JeevanMainContainer initialRole="dispatcher" />} />
        <Route path="/operator" element={<JeevanMainContainer initialRole="operator" />} />
        <Route path="/ambulance" element={<Navigate to="/operator" replace />} />
        <Route path="/hospital" element={<JeevanMainContainer initialRole="hospital" />} />
        <Route path="/admin" element={<JeevanMainContainer initialRole="admin" />} />
        <Route path="/track/:id" element={<TrackingPageWrapper />} />

        {/* Preserved Hospital Clinical Triage & Encounters Routes */}
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<HospitalLoginPage />} />
        <Route path="/staff/subscription" element={<SubscriptionPage />} />
        <Route path="/pricing" element={<SubscriptionPage />} />
        <Route path="/assess" element={<AssessmentPage />} />
        <Route path="/result/:id" element={<ResultPage />} />
        <Route path="/staff/dashboard" element={<HospitalDashboardPage />} />
        <Route path="/staff/encounter/:id" element={<PatientDetailPage />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
