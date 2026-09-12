import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
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
              <Route path="residents" element={<PlaceholderPage />} />
              <Route path="technicians" element={<PlaceholderPage />} />
              <Route path="property" element={<PlaceholderPage />} />
              <Route path="settings" element={<PlaceholderPage />} />
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
