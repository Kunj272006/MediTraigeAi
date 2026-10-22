import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { ResultPage } from './pages/ResultPage';
import { HospitalDashboardPage } from './pages/HospitalDashboardPage';
import { PatientDetailPage } from './pages/PatientDetailPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Patient Facing Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/assess" element={<AssessmentPage />} />
        <Route path="/result/:id" element={<ResultPage />} />

        {/* Hospital Staff Facing Routes */}
        <Route path="/staff/dashboard" element={<HospitalDashboardPage />} />
        <Route path="/staff/encounter/:id" element={<PatientDetailPage />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
