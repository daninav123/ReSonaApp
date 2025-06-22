import React, { useState } from 'react';
import '../styles/layout.css';
import '../styles/dashboard.css';
import Badge from '../components/common/Badge';

interface CardData {
  title: string;
  count: number;
  variant: 'pending' | 'active' | 'warning';
  label: string;
}

const cardsByRole: Record<string, CardData[]> = {
  CEO: [
    { title: 'Próximos Eventos', count: 5, variant: 'pending', label: 'Pendiente' },
    { title: 'Presupuestos Pendientes', count: 8, variant: 'pending', label: 'Pendiente' },
    { title: 'Clientes Activos', count: 12, variant: 'active', label: 'Activo' },
    { title: 'Stock Bajo', count: 2, variant: 'warning', label: 'Por reparar' },
  ],
  comercial: [
    { title: 'Clientes Activos', count: 12, variant: 'active', label: 'Activo' },
    { title: 'Presupuestos Pendientes', count: 8, variant: 'pending', label: 'Pendiente' },
    { title: 'Nuevos Leads', count: 3, variant: 'pending', label: 'Nuevo' },
  ],
  tecnico: [
    { title: 'Eventos Asignados', count: 4, variant: 'active', label: 'Asignado' },
    { title: 'Stock Bajo', count: 2, variant: 'warning', label: 'Por reparar' },
    { title: 'Tareas Pendientes', count: 7, variant: 'pending', label: 'Pendiente' },
  ],
  "jefe de almacen": [],
  "jefe de equipo": [],
  "montador": [],
  "tecnico auxiliar": [],
  "tecnico audiovisual": [],
  "dj": [],
};

const getUserRole = () => {
  // TODO: Sustituir por fetch a /api/me o decodificar JWT
  return localStorage.getItem('role') || 'CEO'; // mock
};

const DashboardPage: React.FC = () => {
  const [activeRole, setActiveRole] = useState<string>(getUserRole());
  const cards = cardsByRole[activeRole] || [];  



  return (
    <div className="dashboard-page page-container">
      <h1>Dashboard</h1>
      <div className="tabs page-controls">
          {Object.keys(cardsByRole).map(r => (
            <button
              key={r}
              className={`tab${activeRole === r ? ' active' : ''}`}
              onClick={() => setActiveRole(r)}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="dashboard-cards">
        {cards.map(({ title, count, variant, label }) => (
          <div key={title} className="card">
            <h3>{title}</h3>
            <p className="count">{count}</p>
            <Badge variant={variant}>{label}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
