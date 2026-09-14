import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { AuthPage } from './pages/AuthPage';
import { ContactPage } from './pages/ContactPage';
import { DashboardPage } from './pages/DashboardPage';
import { LandingPage } from './pages/LandingPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { PropertyPage } from './pages/PropertyPage';
import { ResidentsPage } from './pages/ResidentsPage';
import { SettingsPage } from './pages/SettingsPage';
import { TechniciansPage } from './pages/TechniciansPage';
import { ThankYouPage } from './pages/ThankYouPage';
import { TicketDetailsPage } from './pages/TicketDetailsPage';
import { TicketsPage } from './pages/TicketsPage';

function App() {
  return (
    <Routes>
      {/* Public Marketing Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/thank-you" element={<ThankYouPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />

      {/* Public Authentication */}
      <Route path="/login" element={<AuthPage register={false} />} />
      <Route path="/register" element={<AuthPage register={true} />} />

      {/* Authenticated Workspace */}
      <Route
        path="/app/*"
        element={
          <AppShell>
            <Routes>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="tickets" element={<TicketsPage />} />
              <Route path="tickets/:ticketId" element={<TicketDetailsPage />} />
              <Route path="residents" element={<ResidentsPage />} />
              <Route path="technicians" element={<TechniciansPage />} />
              <Route path="property" element={<PropertyPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </AppShell>
        }
      />

      {/* Custom 404 Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
