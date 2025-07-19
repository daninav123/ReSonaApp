import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import LoginPage from '../pages/LoginPage';
import ClientsPage from '../pages/ClientsPage';
import DashboardPage from '../pages/DashboardPage';
import AuditLogsPage from '../pages/AuditLogsPage';
import ProvidersPage from '../pages/ProvidersPage';
import BudgetsPage from '../pages/BudgetsPage';
import InvoiceList from '../pages/invoices/InvoiceList';
import QuoteList from '../pages/quotes/QuoteList';
import RbacAdminPage from '../pages/RbacAdminPage';

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/" element={<Layout />}>
      <Route index element={<Navigate to="/dashboard" />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="clients" element={<ClientsPage />} />
      <Route path="budgets" element={localStorage.getItem('token') ? <BudgetsPage /> : <Navigate to="/login" replace />} />
      <Route path="auditlogs" element={<AuditLogsPage />} />
      <Route path="providers" element={<ProvidersPage />} />
      
      {/* Módulo de Facturación y Presupuestos */}
      <Route path="invoices" element={<InvoiceList />} />
      <Route path="invoices/new" element={<Navigate to="/invoices" replace />} />
      <Route path="invoices/edit/:id" element={<Navigate to="/invoices" replace />} />
      <Route path="invoices/:id" element={<Navigate to="/invoices" replace />} />
      
      <Route path="quotes" element={<QuoteList />} />
      <Route path="quotes/new" element={<Navigate to="/quotes" replace />} />
      <Route path="quotes/edit/:id" element={<Navigate to="/quotes" replace />} />
      <Route path="quotes/:id" element={<Navigate to="/quotes" replace />} />
      
      {/* Administración de Roles y Permisos */}
      <Route path="admin/rbac" element={<RbacAdminPage />} />
      
      {/* Otras rutas hijas aquí */}
    </Route>
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default AppRoutes;
