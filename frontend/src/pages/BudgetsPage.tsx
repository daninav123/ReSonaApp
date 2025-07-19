import React, { useState, useEffect, useCallback } from 'react';
import '../styles/budgets.css';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { FiPlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import ExportButton from '../components/common/ExportButton';
import { ExportService } from '../services/export';
import AdvancedSearch from '../components/common/AdvancedSearch';
import type { FilterOption, FilterState } from '../components/common/AdvancedSearch';
import styles from './BudgetsPage.module.css';

interface Budget {
  id: string;
  title: string;
  amount: number;
  client: string;
  status: 'pending' | 'approved' | 'rejected';
  items: {
    description: string;
    quantity: number;
    price: number;
  }[];
  createdAt: string;
  validUntil: string;
}

interface Client {
  name: string;
  email: string;
  phone: string;
}

const BudgetsPage: React.FC = () => {
  const token = localStorage.getItem('token') || '';
  const [budgets, setBudgets] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [dateFromFilter, setDateFromFilter] = useState<string>('');
  const [dateToFilter, setDateToFilter] = useState<string>('');
  const [clientFilter, setClientFilter] = useState<string>('');
  const [filters, setFilters] = useState<FilterState>({});
  
  // Definición de opciones de filtro para la búsqueda avanzada
  const filterOptions: FilterOption[] = [
    {
      id: 'status',
      label: 'Estado',
      type: 'select',
      options: [
        { value: 'all', label: 'Todos' },
        { value: 'pending', label: 'Pendiente' },
        { value: 'approved', label: 'Aprobado' },
        { value: 'rejected', label: 'Rechazado' }
      ],
      defaultValue: 'all'
    },
    {
      id: 'client',
      label: 'Cliente',
      type: 'text',
      placeholder: 'Nombre del cliente',
      defaultValue: ''
    },
    {
      id: 'minAmount',
      label: 'Importe mínimo',
      type: 'number',
      defaultValue: ''
    },
    {
      id: 'maxAmount',
      label: 'Importe máximo',
      type: 'number',
      defaultValue: ''
    },
    {
      id: 'createdAfter',
      label: 'Creado después de',
      type: 'date',
      defaultValue: ''
    },
    {
      id: 'createdBefore',
      label: 'Creado antes de',
      type: 'date',
      defaultValue: ''
    }
  ];
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;
  const [showModal, setShowModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newAmount, setNewAmount] = useState<number>(0);
  const [editingId, setEditingId] = useState<string>('');
  const [editTitle, setEditTitle] = useState<string>('');
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');



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

  // Maneja la búsqueda con filtros avanzados
  const handleAdvancedSearch = useCallback((query: string, filterValues: FilterState) => {
    setSearchTerm(query);
    setFilters(filterValues);
    setCurrentPage(1); // Reset page when search changes
    
    // Aplicar filtros individuales
    if (filterValues.status && filterValues.status !== 'all') {
      setStatusFilter(filterValues.status as 'pending' | 'approved' | 'rejected');
    } else {
      setStatusFilter('all');
    }
    
    if (filterValues.client) {
      setClientFilter(filterValues.client as string);
    } else {
      setClientFilter('');
    }
    
    if (filterValues.createdAfter) {
      setDateFromFilter(filterValues.createdAfter as string);
    } else {
      setDateFromFilter('');
    }
    
    if (filterValues.createdBefore) {
      setDateToFilter(filterValues.createdBefore as string);
    } else {
      setDateToFilter('');
    }
  }, []);

  // Filtrar presupuestos
  const filteredBudgets = budgets
    .filter(b => 
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      b.client.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(b => statusFilter === 'all' ? true : b.status === statusFilter)
    .filter(b => {
      if (!dateFromFilter) return true;
      return new Date(b.createdAt) >= new Date(dateFromFilter);
    })
    .filter(b => {
      if (!dateToFilter) return true;
      return new Date(b.createdAt) <= new Date(dateToFilter);
    })
    .filter(b => {
      if (!clientFilter) return true;
      return b.client.toLowerCase().includes(clientFilter.toLowerCase());
    })
    .filter(b => {
      const minAmount = filters.minAmount ? parseFloat(filters.minAmount as string) : 0;
      const maxAmount = filters.maxAmount ? parseFloat(filters.maxAmount as string) : Infinity;
      return b.amount >= minAmount && b.amount <= maxAmount;
    });

  // Paginación
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paged = filteredBudgets.slice(startIndex, startIndex + itemsPerPage);

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

  // Exportar presupuestos
  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    // Definir los campos a exportar
    const fields = [
      { key: 'title' as keyof Budget, header: 'Título' },
      { key: 'client' as keyof Budget, header: 'Cliente' },
      { key: 'amount' as keyof Budget, header: 'Monto' },
      { key: 'status' as keyof Budget, header: 'Estado' },
      { key: 'createdAt' as keyof Budget, header: 'Fecha de creación' },
      { key: 'validUntil' as keyof Budget, header: 'Válido hasta' }
    ];
    
    // Usar los presupuestos filtrados para la exportación
    const dataToExport = filteredBudgets;
    
    // Configurar opciones de exportación
    const exportOptions = {
      format,
      fileName: `presupuestos_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`,
      title: 'Listado de Presupuestos',
      sheetName: 'Presupuestos'
    };
    
    // Exportar los datos
    ExportService.exportList(dataToExport, fields, exportOptions);
  };
  
  // Exportar un presupuesto individual
  const handleExportSingle = (budget: Budget, format: 'pdf' | 'excel' | 'csv') => {
    // Definir los campos para la exportación de detalle
    const fields = [
      { key: 'title' as keyof Budget, label: 'Título' },
      { key: 'client' as keyof Budget, label: 'Cliente' },
      { key: 'amount' as keyof Budget, label: 'Monto' },
      { key: 'status' as keyof Budget, label: 'Estado' },
      { key: 'createdAt' as keyof Budget, label: 'Fecha de creación' },
      { key: 'validUntil' as keyof Budget, label: 'Válido hasta' }
    ];
    
    // Opciones para exportación de detalle
    const exportOptions = {
      fileName: `presupuesto_${budget.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`,
      title: `Presupuesto: ${budget.title}`,
      orientation: 'portrait' as 'portrait' | 'landscape'
    };
    
    if (format === 'pdf') {
      // Para PDF podemos usar la función de detalle
      ExportService.exportDetailedItem(budget, fields, exportOptions);
    } else {
      // Para Excel y CSV exportamos como lista con un solo elemento
      ExportService.exportList([budget], fields.map(f => ({ key: f.key, header: f.label })), {
        ...exportOptions,
        format,
        sheetName: 'Detalle Presupuesto'
      });
    }
  };

  // Función para cancelar la edición
  const handleCancelEdit = () => {
    setEditingId('');
    setEditTitle('');
    setEditAmount(0);
    setEditStatus('pending');
  };

  return (
    <div className={styles.budgetsPageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Presupuestos</h1>
      </div>
      
      <div className={styles.searchContainer}>
        <AdvancedSearch
          onSearch={handleAdvancedSearch}
          filterOptions={filterOptions}
          initialQuery={searchTerm}
          initialFilters={filters}
        />
        
        <div className={styles.actionButtons}>
          <ExportButton 
            onExport={handleExport}
            disabled={filteredBudgets.length === 0}
            variant="outline"
            label="Exportar Presupuestos"
          />
          <Button onClick={loadBudgets}>
            <FiRefreshCw />
          </Button>
          <Button onClick={() => setShowModal(true)}>
            <FiPlus /> Nuevo presupuesto
          </Button>
        </div>
      </div>
      {error && <div className="error">{error}</div>}
      
      <ul className={styles.budgetsList}>
        {paged.map(b => (
          <li key={b.id} className={styles.budgetCard}>
            {editingId === b.id ? (
              <form onSubmit={handleSaveEdit} className="form-vertical">
                <select value={editStatus} onChange={e => setEditStatus(e.target.value as 'pending' | 'approved' | 'rejected')}>
                  <option value="pending">Pendiente</option>
                  <option value="approved">Aprobado</option>
                  <option value="rejected">Rechazado</option>
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
                <div className={styles.budgetInfo}>
                  <Badge variant={b.status}>{b.status}</Badge>
                  <h3 className={styles.budgetTitle}>{b.title}</h3>
                  <p className={styles.budgetAmount}>${b.amount}</p>
                  {b.client && typeof b.client === 'object' && b.client.name && (
                    <p className={styles.budgetClient}>Cliente: {b.client.name}</p>
                  )}
                  <p className={styles.budgetDate}>
                    Creado: {new Date(b.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className={styles.budgetActions}>
                  <Button onClick={() => handleEditClick(b)}>Editar</Button>
                  <Button onClick={() => handleDelete(b.id)}><FiTrash2 /></Button>
                  <Button 
                    onClick={() => handleExportSingle(b, 'pdf')}
                  >
                    Export PDF
                  </Button>
                  <Button 
                    onClick={() => handleExportSingle(b, 'excel')}
                  >
                    Export Excel
                  </Button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      <div className={styles.pagination}>
        <Button 
          disabled={currentPage <= 1} 
          onClick={() => setCurrentPage(p => p - 1)}
        >
          Anterior
        </Button>
        <span>Página {currentPage} de {Math.ceil(filtered.length / itemsPerPage)}</span>
        <Button 
          disabled={currentPage * itemsPerPage >= filtered.length} 
          onClick={() => setCurrentPage(p => p + 1)}
        >
          Siguiente
        </Button>
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
