import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store';
import { ROLES } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  allowedRoles,
}) => {
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si se especifica un rol requerido y el usuario no lo tiene, redirigir al dashboard
  if (requiredRole && !user.roles.includes(requiredRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Si se especifican roles permitidos y el usuario no tiene ninguno de ellos, redirigir al dashboard
  if (allowedRoles && !user.roles.some(role => allowedRoles.includes(role))) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Componentes de rutas protegidas por rol
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole={ROLES.ADMIN}>{children}</ProtectedRoute>
);

export const ManagerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>{children}</ProtectedRoute>
);

export const UserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.USER]}>{children}</ProtectedRoute>
);

export default ProtectedRoute;
