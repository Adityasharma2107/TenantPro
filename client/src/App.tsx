import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { PropertyPage } from './pages/PropertyPage';
import { ResidentsPage } from './pages/ResidentsPage';
import { SettingsPage } from './pages/SettingsPage';
import { TechniciansPage } from './pages/TechniciansPage';
import { TicketDetailsPage } from './pages/TicketDetailsPage';
import { TicketsPage } from './pages/TicketsPage';

function App() {
  return (
    <Routes>
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

      {/* Root & Catch-all redirects */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
