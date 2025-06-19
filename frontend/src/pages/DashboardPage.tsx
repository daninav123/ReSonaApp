import React from 'react';
import '../styles/layout.css';
import Badge from '../components/common/Badge';

interface CardData {
  title: string;
  count: number;
  variant: 'pending' | 'active' | 'warning';
  label: string;
}

const cards: CardData[] = [
  { title: 'Próximos Eventos', count: 5, variant: 'pending', label: 'Pendiente' },
  { title: 'Presupuestos Pendientes', count: 8, variant: 'pending', label: 'Pendiente' },
  { title: 'Clientes Activos', count: 12, variant: 'active', label: 'Activo' },
  { title: 'Stock Bajo', count: 2, variant: 'warning', label: 'Por reparar' },
];

const DashboardPage: React.FC = () => {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
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
