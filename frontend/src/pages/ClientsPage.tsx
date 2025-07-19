import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiRefreshCw, FiTrash2, FiEdit2 } from 'react-icons/fi';
import AdvancedSearch from '../components/common/AdvancedSearch';
import type { FilterOption, FilterState } from '../components/common/AdvancedSearch';
import Button from '../components/common/Button';
import ExportButton from '../components/common/ExportButton';
import ClientModal from '../components/ClientModal';
import styles from './ClientsPage.module.css';
import '../styles/clients.css';
import '../styles/badge.css';
import { ExportService } from '../services/export';

interface Client {
  _id: string;
  name: string;
  status?: string;
  tags?: string[];
  createdAt?: string;
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
  const [filters, setFilters] = useState<FilterState>({});

  // Definición de opciones de filtro para la búsqueda avanzada
  const filterOptions: FilterOption[] = [
    {
      id: 'status',
      label: 'Estado',
      type: 'select',
      options: [
        { value: 'active', label: 'Activo' },
        { value: 'inactive', label: 'Inactivo' },
        { value: 'pending', label: 'Pendiente' }
      ],
      defaultValue: ''
    },
    {
      id: 'tags',
      label: 'Etiquetas',
      type: 'text',
      placeholder: 'Buscar por etiquetas (ej: importante, nuevo)',
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

  // Maneja la búsqueda con filtros avanzados
  const handleAdvancedSearch = useCallback((query: string, filterValues: FilterState) => {
    setSearchTerm(query);
    setFilters(filterValues);
    setCurrentPage(1); // Reset page when search changes
    
    // Aplicar filtros
    if (filterValues.status) {
      setStatusFilter(filterValues.status as string);
    } else {
      setStatusFilter('');
    }
    
    if (filterValues.tags) {
      setTagsFilter(filterValues.tags as string);
    } else {
      setTagsFilter('');
    }
    
    // Recargar clientes con los nuevos filtros
    loadClients();
  }, []);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Este es el conjunto completo de clientes filtrados para exportación
  // La exportación debe incluir todos los datos filtrados, no solo la página actual

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
      const { data, page, total } = await res.json();
      setClients(data);
      setCurrentPage(page);
      setTotal(total);
    } catch (err) {
      console.error(err);
      setError((err as Error).message || 'Error fetching clients');
    }
  };


  // Este método será usado por el modal para crear nuevos clientes

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar cliente?')) return;
    try {
      const res = await fetch(`/api/clients/${id}`, {
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

  const handleModalClose = () => {
    setShowModal(false);
    setNewName('');
    setEditingId('');
    setEditingName('');
  };

  // Función para manejar la exportación de datos
  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    // Definir los campos a exportar
    const fields = [
      { key: 'name' as keyof Client, header: 'Nombre' },
      { key: 'status' as keyof Client, header: 'Estado' },
      { key: 'tags' as keyof Client, header: 'Etiquetas' },
      { key: 'createdAt' as keyof Client, header: 'Fecha de Creación' }
    ];
    
    // Filtrar los clientes según la búsqueda y filtros aplicados
    const dataToExport = filteredClients;
    
    // Configurar opciones de exportación
    const exportOptions = {
      format,
      fileName: `clientes_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`,
      title: 'Listado de Clientes',
      sheetName: 'Clientes'
    };
    
    // Exportar los datos
    ExportService.exportList(dataToExport, fields, exportOptions);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingName) return;
    try {
      const res = await fetch(`/api/clients/${editingId}`, {
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

  const handleCancelEdit = () => {
    setEditingId('');
    setEditingName('');
  };

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadClients();
  }, [currentPage]);

  return (
    <div className={styles.clientsPageContainer}>
      <div className={styles.pageHeader}>
        <h1>Clientes</h1>
      </div>
      
      <div className={styles.searchContainer}>
        <AdvancedSearch 
          onSearch={handleAdvancedSearch}
          filterOptions={filterOptions}
          initialQuery={searchTerm}
          initialFilters={filters}
        />
        
        <div className={styles.clientsTools}>
          <Button
            onClick={() => { setSelectedClient(null); setShowModal(true); }}
            variant="primary"
          >
            <FiPlus /> Añadir Cliente
          </Button>

          <div className={styles.refreshContainer}>
            <Button onClick={loadClients} variant="outline">
              <FiRefreshCw />
            </Button>

            <ExportButton
              onExport={handleExport}
              variant="outline"
              label="Exportar Clientes"
              disabled={filteredClients.length === 0}
            />
          </div>
        </div>
      </div>
      
      {error && <div className={styles.error}>{error}</div>}
      
      <ul className={styles.clientsList}>
        {paginatedClients.map(c => (
          <li key={c._id} className={styles.clientCard}>
            {editingId === c._id ? (
              <form onSubmit={handleSaveEdit} className={styles.formInline}>
                <input
                  type="text"
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  className={styles.editInput}
                />
                <Button type="submit">Guardar</Button>
                <Button type="button" onClick={handleCancelEdit}>Cancelar</Button>
              </form>
            ) : (
              <>
                <div className={styles.clientInfo}>
                  <span className={styles.clientName}>{c.name}</span>
                  {c.status && <span className={`badge ${c.status}`}>{c.status}</span>}
                  {c.tags && c.tags.map(tag => (
                    <span key={tag} className="badge tag">{tag}</span>
                  ))}
                </div>
                <div className={styles.clientActions}>
                  <Button onClick={() => handleEditClick(c._id, c.name)}>
                    <FiEdit2 />
                  </Button>
                  <Button onClick={() => handleDelete(c._id)}>
                    <FiTrash2 />
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
        <span>Página {currentPage} de {Math.ceil(total / itemsPerPage)}</span>
        <Button 
          disabled={currentPage * itemsPerPage >= total} 
          onClick={() => setCurrentPage(p => p + 1)}
        >
          Siguiente
        </Button>
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
