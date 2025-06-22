import React, { useState, useEffect } from 'react';
import '../styles/budgets.css';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { FiPlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import { FiDownload } from 'react-icons/fi';

interface Budget {
  id: string;
  title: string;
  amount: number;
  status: 'pending' | 'active' | 'warning';
  id: string;
  title: string;
  amount: number;
}

const BudgetsPage: React.FC = () => {
  const token = localStorage.getItem('token') || '';
  const [budgets, setBudgets] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'warning'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;
  const [showModal, setShowModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newAmount, setNewAmount] = useState<number>(0);
  const [editingId, setEditingId] = useState<string>('');
  const [editTitle, setEditTitle] = useState<string>('');
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<'pending' | 'active' | 'warning'>('pending');

  const statusLabel: Record<string, string> = {
    pending: 'Pendiente',
    active: 'Activo',
    warning: 'Warning',
  };
  const statusVariant: Record<string, string> = {
    pending: 'pending',
    active: 'active',
    warning: 'warning',
  };

  // Cargar presupuestos desde backend
  const loadBudgets = async () => {
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/budgets', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Error al cargar presupuestos');
      const data = await res.json();
      setBudgets(data.data);
      setCurrentPage(1);
    } catch (err) { setError((err as Error).message); }
  };
  useEffect(() => { loadBudgets(); }, []);

  // Filtros y paginación
  const filtered = budgets.filter(b =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === 'all' || b.status === statusFilter)
  );
  const paged = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const statusCounts = budgets.reduce(
    (acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    },
    { pending: 0, active: 0, warning: 0 } as Record<'pending' | 'active' | 'warning', number>
  );

  // Crear presupuesto
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || newAmount <= 0) return;
    try {
      const res = await fetch('http://localhost:5000/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: newTitle, amount: newAmount, status: 'pending', client: budgets[0]?.client?._id || null }) // mock client
      });
      if (!res.ok) throw new Error('Error al crear presupuesto');
      setShowModal(false);
      setNewTitle('');
      setNewAmount(0);
      loadBudgets();
    } catch (err) { setError((err as Error).message); }
  };

  // Editar presupuesto
  const handleEditClick = (b: any) => {
    setEditingId(b._id);
    setEditTitle(b.title);
    setEditAmount(b.amount);
    setEditStatus(b.status);
  };
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/budgets/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: editTitle, amount: editAmount, status: editStatus })
      });
      if (!res.ok) throw new Error('Error al editar presupuesto');
      setEditingId('');
      loadBudgets();
    } catch (err) { setError((err as Error).message); }
  };

  // Borrar presupuesto
  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar presupuesto?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/budgets/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al borrar presupuesto');
      loadBudgets();
    } catch (err) { setError((err as Error).message); }
  };

  // Exportar PDF (dummy)
  const handleExportPDF = () => {
    alert('Funcionalidad de exportar a PDF próximamente.');
  };

  return (
    <div className="budgets-page">
      <h1>Presupuestos</h1>
      <div className="budgets-controls">
        <div className="form-inline">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="form-control">
            <option value="all">Todos</option>
            <option value="pending">Pendiente ({statusCounts.pending})</option>
            <option value="active">Activo ({statusCounts.active})</option>
            <option value="warning">Warning ({statusCounts.warning})</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button onClick={loadBudgets}><FiRefreshCw /></Button>
          <Button onClick={handleExportPDF}><FiDownload /> Exportar PDF</Button>
          <Button onClick={() => setShowModal(true)}><FiPlus /> Nuevo presupuesto</Button>
        </div>
      </div>
      {error && <div className="error">{error}</div>}
      <ul className="budgets-list">
        {paged.map(b => (
          <li key={b.id} className="budget-card">
            {editingId === b.id ? (
              <form onSubmit={handleSaveEdit} className="form-vertical">
                <select value={editStatus} onChange={e => setEditStatus(e.target.value as 'pending' | 'active' | 'warning')}>
                  <option value="pending">Pendiente</option>
                  <option value="active">Activo</option>
                  <option value="warning">Warning</option>
                </select>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                />
                <input
                  type="number"
                  value={editAmount}
                  onChange={e => setEditAmount(Number(e.target.value))}
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button type="submit">Guardar</Button>
                  <Button type="button" onClick={handleCancelEdit}>Cancelar</Button>
                </div>
              </form>
            ) : (
              <>
                <Badge variant={b.status}>{b.status}</Badge>
                <h3>{b.title}</h3>
                <p>${b.amount}</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <Button onClick={() => handleEditClick(b)}>Editar</Button>
                  <Button onClick={() => handleDelete(b.id)}><FiTrash2 /></Button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="pagination">
        <Button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>Anterior</Button>
        <span>Página {currentPage} de {Math.ceil(filtered.length / itemsPerPage)}</span>
        <Button disabled={currentPage * itemsPerPage >= filtered.length} onClick={() => setCurrentPage(p => p + 1)}>Siguiente</Button>
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Nuevo Presupuesto</h2>
            <form onSubmit={handleCreate}>
              <input
                type="text"
                placeholder="Título"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
              <input
                type="number"
                placeholder="Monto"
                value={newAmount}
                onChange={e => setNewAmount(parseFloat(e.target.value))}
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <Button type="submit">Crear</Button>
                <Button type="button" onClick={() => setShowModal(false)}>Cancelar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetsPage;
