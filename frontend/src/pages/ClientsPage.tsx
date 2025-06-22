import React, { useState, useEffect } from 'react';
import '../styles/clients.css';
import '../styles/badge.css';
import Button from '../components/common/Button';
import { FiPlus, FiRefreshCw, FiTrash2, FiEdit2, FiDownload } from 'react-icons/fi';
import ClientModal from '../components/ClientModal';

interface Client {
  _id: string;
  name: string;
  status?: string;
  tags?: string[];
}

const ClientsPage: React.FC = () => {
  const token = localStorage.getItem('token') || '';
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  const [showModal, setShowModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingId, setEditingId] = useState<string>('');
  const [editingName, setEditingName] = useState<string>('');
  const [total, setTotal] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [tagsFilter, setTagsFilter] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [statuses, setStatuses] = useState<string[]>([]);

  const startIndex = (currentPage - 1) * itemsPerPage;
    const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const pagedClients = filteredClients.slice(startIndex, startIndex + itemsPerPage);

  const loadClients = async () => {
    setError('');
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (tagsFilter) params.append('tags', tagsFilter);
      const res = await fetch(`/api/clients?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }
      const { data, page, limit, total } = await res.json();
      setClients(data);
      setCurrentPage(page);
      setTotal(total);
      if (!statusFilter) {
        const uniqueStatuses = Array.from(new Set(data.map((c: any) => c.status).filter(Boolean)));
        setStatuses(uniqueStatuses as string[]);
      }
    } catch (err) {
      console.error(err);
      setError((err as Error).message || 'Error fetching clients');
    }
  };


  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    try {
      const res = await fetch('http://localhost:5000/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }
      setShowModal(false);
      setNewName('');
      loadClients();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar cliente?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/clients/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }
      loadClients();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleEditClick = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleCancelEdit = () => {
    setEditingId('');
    setEditingName('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingName) return;
    try {
      const res = await fetch(`http://localhost:5000/api/clients/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editingName }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }
      setEditingId('');
      setEditingName('');
      loadClients();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleExport = () => {
  const rows = clients.map(c => ({ Name: c.name, Status: c.status || '', Tags: (c.tags || []).join(',') }));
  if (rows.length === 0) return;
  const header = Object.keys(rows[0]).join(',');
  const csv = [header, ...rows.map(r => Object.values(r).map(v => `"${v}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'clientes.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

useEffect(() => { loadClients(); }, [currentPage, searchTerm, statusFilter, tagsFilter]);

  return (
    <div className="clients-page">
      <h1>Clientes</h1>
            <div className="clients-controls">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
          <option value="">Todos estados</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input
          type="text"
          className="tags-input"
          placeholder="Tags (coma)"
          value={tagsFilter}
          onChange={e => { setTagsFilter(e.target.value); setCurrentPage(1); }}
        />
        <Button onClick={handleExport}><FiDownload /> Exportar CSV</Button>
        <Button onClick={loadClients}><FiRefreshCw /></Button>
        <Button onClick={() => { setSelectedClient(null); setShowModal(true); }}><FiPlus /> Nuevo cliente</Button>
      </div>
      {error && <div className="error">{error}</div>}
      <ul className="clients-list">
        {pagedClients.map(c => (
          <li key={c._id} className="client-card">
            {editingId === c._id ? (
              <form onSubmit={handleSaveEdit} className="form-inline">
                <input
                  type="text"
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  style={{ flex: 1 }}
                />
                <Button type="submit">Guardar</Button>
                <Button type="button" onClick={handleCancelEdit}>Cancelar</Button>
              </form>
            ) : (
              <>
                <span>{c.name}</span>
                <div className="client-actions">
                  <Button onClick={() => { setSelectedClient(c); setShowModal(true); }}><FiEdit2 /></Button>
                  <Button onClick={() => handleDelete(c._id)}><FiTrash2 /></Button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="pagination">
        <Button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>Anterior</Button>
        <span>Página {currentPage} de {Math.ceil(total / itemsPerPage)}</span>
        <Button disabled={currentPage * itemsPerPage >= clients.length} onClick={() => setCurrentPage(p => p + 1)}>Siguiente</Button>
      </div>
      {showModal && (
        <ClientModal
          token={token}
          client={selectedClient}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); loadClients(); }}
        />
      )}
    </div>
  );
};

export default ClientsPage;

