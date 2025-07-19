import type { ErrorInfo, ReactNode } from 'react';
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiFileText, 
  FiCalendar, 
  FiBox, 
  FiCheckSquare, 
  FiBell,
  FiKey
} from 'react-icons/fi';
import '../../styles/layout.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Sidebar error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="sidebar-error">Error loading navigation</div>;
    }
    return this.props.children;
  }
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const role = localStorage.getItem('role')?.toLowerCase() || 'admin';
  
  console.log('Sidebar rendering, current path:', location.pathname);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>, path: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.location.href = path;
    }
  };

  interface NavItem {
    path: string;
    icon: React.ReactNode;
    label: string;
    roles: string[];
  }

  const navItems: NavItem[] = [
    { path: '/dashboard', icon: <FiHome />, label: 'Dashboard', roles: ['admin', 'user'] },
    { path: '/clients', icon: <FiUsers />, label: 'Clientes', roles: ['admin', 'comercial'] },
    { path: '/budgets', icon: <FiFileText />, label: 'Presupuestos', roles: ['admin', 'comercial'] },
    { path: '/events', icon: <FiCalendar />, label: 'Calendario', roles: ['admin', 'jefe de equipo'] },
    { path: '/materials', icon: <FiBox />, label: 'Almacén', roles: ['admin', 'jefe de almacen'] },
    { path: '/tasks', icon: <FiCheckSquare />, label: 'Tareas', roles: ['admin', 'tecnico'] },
    { path: '/notifications', icon: <FiBell />, label: 'Notificaciones', roles: ['admin', 'user'] },
    { path: '/admin/rbac', icon: <FiKey />, label: 'Roles y Permisos', roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    item.roles.some(r => r.toLowerCase() === role.toLowerCase())
  );
  
  const renderNavLink = (item: NavItem) => {
    const isActive = location.pathname === item.path;
    const isMobile = window.innerWidth <= 768;
    
    return (
      <li key={item.path} role="none">
        <NavLink 
          to={item.path}
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          role="menuitem"
          tabIndex={0}
          onClick={() => {
            if (isMobile && onClose) {
              onClose();
            }
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLAnchorElement>) => handleKeyDown(e, item.path)}
          aria-current={isActive ? 'page' : undefined}
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      </li>
    );
  };

  return (
    <ErrorBoundary>
      <aside 
        className={`sidebar ${isOpen ? 'open' : ''}`}
        role="navigation"
        aria-label="Menú principal"
      >
        <div className="sidebar-header">
          <img 
            src="/logo.png" 
            alt="Resona Events" 
            className="sidebar-logo"
            aria-hidden="true"
          />
          <h2 className="sidebar-title">Resona</h2>
        </div>
        
        <nav aria-label="Navegación principal">
          <ul role="menu">
            {filteredNavItems.map(renderNavLink)}
            {role === 'admin' && (
              <li key="settings" role="none">
                <NavLink 
                  to="/settings" 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  role="menuitem"
                  tabIndex={0}
                  onKeyDown={(e: React.KeyboardEvent<HTMLAnchorElement>) => handleKeyDown(e, "/settings")}
                  aria-current={location.pathname === "/settings" ? "page" : undefined}
                >
                  <span>Configuración</span>
                </NavLink>
              </li>
            )}
            <li role="none">
              <button 
                className="nav-link"
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('role');
                  window.location.href = '/login';
                  if (onClose) onClose();
                }}
                role="menuitem"
                tabIndex={0}
              >
                <span>Cerrar sesión</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </ErrorBoundary>
  );
}

export default Sidebar;
