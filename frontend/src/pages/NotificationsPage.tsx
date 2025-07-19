import React, { useState } from 'react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { FiArchive, FiCheckCircle, FiBell } from 'react-icons/fi';

interface Notification {
  id: string;
  category: 'general' | 'alert' | 'recordatorio' | 'sistema';
  message: string;
  read: boolean;
  date: string;
}

const categoryLabel: Record<string, string> = {
  general: 'General',
  alert: 'Alerta',
  recordatorio: 'Recordatorio',
  sistema: 'Sistema',
};
const categoryColor: Record<string, string> = {
  general: '#2563eb',
  alert: 'var(--color-danger)',
  recordatorio: '#f59e42',
  sistema: '#6366f1',
};

const mockNotifications: Notification[] = [
  { id: '1', category: 'alert', message: 'Stock bajo en Altavoz JBL', read: false, date: '2025-06-20T09:30:00' },
  { id: '2', category: 'recordatorio', message: 'Reunión con cliente García mañana', read: true, date: '2025-06-19T17:00:00' },
  { id: '3', category: 'general', message: 'Nuevo presupuesto creado', read: false, date: '2025-06-18T13:12:00' },
  { id: '4', category: 'sistema', message: 'Actualización de sistema aplicada', read: true, date: '2025-06-15T08:05:00' },
];

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | Notification['category']>('all');

  const handleMarkRead = (id: string, read: boolean) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read } : n));
  };
  const handleArchive = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };
  const filtered = notifications.filter(n => filter === 'all' || n.category === filter);

  return (
    <div className="notifications-page page-container">
      <h1><FiBell className="icon-inline" /> Notificaciones</h1>
      <div className="page-controls">
        <select value={filter} onChange={e => setFilter(e.target.value as any)} style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc' }}>
          <option value="all">Todas las categorías</option>
          <option value="general">General</option>
          <option value="alert">Alerta</option>
          <option value="recordatorio">Recordatorio</option>
          <option value="sistema">Sistema</option>
        </select>
      </div>
      <ul className="list-vertical">
        {filtered.map(n => (
          <li key={n.id} className={`notification-card${n.read ? ' read' : ''}`}>
            <Badge style={{ background: categoryColor[n.category], color: '#fff', minWidth: 80, textAlign: 'center' }}>{categoryLabel[n.category]}</Badge>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500 }}>{n.message}</div>
              <div style={{ fontSize: 13, color: '#888' }}>{new Date(n.date).toLocaleString()}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {!n.read && <Button onClick={() => handleMarkRead(n.id, true)} title="Marcar como leído"><FiCheckCircle /></Button>}
              {n.read && <Button onClick={() => handleMarkRead(n.id, false)} title="Marcar como no leído" style={{ background: '#2563eb' }}><FiBell /></Button>}
              <Button onClick={() => handleArchive(n.id)} title="Archivar" style={{ background: 'var(--color-danger)' }}><FiArchive /></Button>
            </div>
          </li>
        ))}
        {filtered.length === 0 && <li style={{ color: '#888', fontStyle: 'italic', padding: '1rem' }}>No hay notificaciones.</li>}
      </ul>
    </div>
  );
};

export default NotificationsPage;
