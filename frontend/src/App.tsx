import React from 'react';
import ErrorBoundary from './components/feedback/ErrorBoundary';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import BudgetsPage from './pages/BudgetsPage';
import EventsPage from './pages/EventsPage';
import CalendarPage from './pages/CalendarPage';
import MaterialsPage from './pages/MaterialsPage';
import TasksPage from './pages/TasksPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage';
import ProvidersPage from './pages/ProvidersPage';
import InvoiceList from './pages/invoices/InvoiceList';
import QuoteList from './pages/quotes/QuoteList';

// Layout wrapper for protected routes
const ProtectedLayout = () => (
  <ProtectedRoute>
    <Layout>
      <Outlet />
    </Layout>
  </ProtectedRoute>
);

const App: React.FC = () => {
  const { token } = useAuth();
  
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Aquí podríamos implementar un servicio de reporte de errores
    console.error('Error capturado en App.tsx:', error);
    console.error('Información del componente:', errorInfo);
  };
  
  return (
    <ErrorBoundary onError={handleError}>
      <Routes>
        <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* All protected routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/materials" element={<MaterialsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/providers" element={<ProvidersPage />} />
          <Route path="/auditlogs" element={<AuditLogsPage />} />
          <Route path="/invoices" element={<InvoiceList />} />
          <Route path="/quotes" element={<QuoteList />} />
        </Route>
        
        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
