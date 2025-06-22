import React, { useEffect, useState } from 'react';
import Badge from '../components/common/Badge';

interface AuditLog {
  _id: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: any;
  ip?: string;
  createdAt: string;
}

const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/auditlogs?limit=50', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Error al cargar logs');
        const data = await res.json();
        setLogs(data.data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="auditlogs-page page-container">
      <h1>Historial de auditoría</h1>
      {loading && <p>Cargando...</p>}
      {error && <div className="error">{error}</div>}
      <table className="auditlogs-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Usuario</th>
            <th>Acción</th>
            <th>Entidad</th>
            <th>ID Entidad</th>
            <th>IP</th>
            <th>Detalles</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log._id}>
              <td>{new Date(log.createdAt).toLocaleString()}</td>
              <td>{log.userId || <span className="text-muted">-</span>}</td>
              <td><Badge variant={log.action === 'delete' ? 'warning' : log.action === 'update' ? 'pending' : 'active'}>{log.action}</Badge></td>
              <td>{log.entity}</td>
              <td>{log.entityId || '-'}</td>
              <td>{log.ip || '-'}</td>
              <td><pre className="pre-wrap">{JSON.stringify(log.details, null, 2)}</pre></td>
            </tr>
          ))}
        </tbody>
      </table>
      {logs.length === 0 && !loading && <p>No hay registros de auditoría.</p>}
    </div>
  );
};

export default AuditLogsPage;
