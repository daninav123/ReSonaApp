import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiEye } from 'react-icons/fi';
import ExportButton from '../components/common/ExportButton';
import providersApi, { type Provider } from '../api/providersApi';
import AdvancedSearch, { type FilterOption, type FilterState } from '../components/common/AdvancedSearch';
import styles from './ProvidersPage.module.css';
import { ExportService } from '../services/export';
import useApiError from '../hooks/useApiError';
import { useNotification } from '../contexts/NotificationContext';
import { Alert, CircularProgress, Box } from '@mui/material';

const statusLabel = {
  active: 'Activo',
  inactive: 'Inactivo',
  pending: 'Pendiente',
};

const statusColor = {
  active: '#22c55e',
  inactive: '#f59e42',
  pending: '#3b82f6',
};

const ProvidersPage: React.FC = () => {
  // Estados
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  // Utilizamos _currentTab para indicar que sabemos que no se está usando directamente
  const [_currentTab, setCurrentTab] = useState<'info' | 'products' | 'documents'>('info');
  
  // Estados para formulario de nuevo proveedor
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    taxId: '',
    category: [] as string[],
    rating: 0,
    status: 'pending' as 'active' | 'inactive' | 'pending',
    paymentTerms: '',
    notes: ''
  });
  
  // Estado para formulario de producto
  const [productForm, setProductForm] = useState({
    name: '',
    code: '',
    price: 0,
    description: '',
    category: ''
  });
  
  // Estado para formulario de documento
  const [documentForm, setDocumentForm] = useState({
    name: '',
    type: '',
    file: null as File | null
  });
  
  // Estado para búsqueda avanzada
  const [searchQuery, setSearchQuery] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({});
  
  // Opciones de filtro para la búsqueda avanzada
  const filterOptions: FilterOption[] = [
    {
      id: 'status',
      label: 'Estado',
      type: 'select',
      options: [
        { value: 'active', label: 'Activo' },
        { value: 'inactive', label: 'Inactivo' },
        { value: 'pending', label: 'Pendiente' }
      ]
    },
    {
      id: 'category',
      label: 'Categoría',
      type: 'select',
      options: [
        { value: 'suministros', label: 'Suministros' },
        { value: 'servicios', label: 'Servicios' },
        { value: 'materiales', label: 'Materiales' },
        { value: 'equipamiento', label: 'Equipamiento' },
        { value: 'otros', label: 'Otros' }
      ]
    },
    {
      id: 'rating',
      label: 'Calificación mínima',
      type: 'number',
      defaultValue: 0
    },
    {
      id: 'hasWebsite',
      label: 'Con sitio web',
      type: 'boolean',
      defaultValue: false
    },
    {
      id: 'dateRange',
      label: 'Fecha de registro',
      type: 'range',
      placeholder: 'Rango de fechas'
    }
  ];
  
  // Hook para manejo de errores API
  const { error, handleError, clearError } = useApiError();
  // Hook para notificaciones
  const { showSuccess, showError } = useNotification();

  // Cargar proveedores
  const loadProviders = async () => {
    try {
      setLoading(true);
      clearError(); // Limpiar errores previos
      const response = await providersApi.getProviders({});
      setProviders(response.data);
      setFilteredProviders(response.data);
    } catch (err) {
      handleError(err);
      showError('No se pudieron cargar los proveedores. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar al montar el componente
  useEffect(() => {
    loadProviders();
  }, []);
  
  // Función para aplicar búsqueda avanzada
  const handleAdvancedSearch = (query: string, filters: FilterState) => {
    setSearchQuery(query);
    
    let filtered = [...providers];
    
    // Filtrar por búsqueda de texto
    if (query.trim()) {
      const lowercaseQuery = query.toLowerCase();
      filtered = filtered.filter(provider => 
        provider.name.toLowerCase().includes(lowercaseQuery) ||
        provider.contactPerson.toLowerCase().includes(lowercaseQuery) ||
        provider.email.toLowerCase().includes(lowercaseQuery) ||
        (provider.address && provider.address.toLowerCase().includes(lowercaseQuery))
      );
    }
    
    // Aplicar filtros avanzados
    if (filters.status) {
      filtered = filtered.filter(provider => provider.status === filters.status);
    }
    
    if (filters.category) {
      filtered = filtered.filter(provider => 
        provider.category.includes(filters.category)
      );
    }
    
    if (filters.rating && typeof filters.rating === 'number') {
      filtered = filtered.filter(provider => provider.rating >= filters.rating);
    }
    
    if (filters.hasWebsite) {
      filtered = filtered.filter(provider => 
        provider.website && provider.website.trim() !== ''
      );
    }
    
    if (filters.dateRange && (filters.dateRange.min || filters.dateRange.max)) {
      filtered = filtered.filter(provider => {
        const providerDate = provider.createdAt ? new Date(provider.createdAt).getTime() : 0;
        const minDate = filters.dateRange.min ? new Date(filters.dateRange.min).getTime() : 0;
        const maxDate = filters.dateRange.max ? new Date(filters.dateRange.max).getTime() : Infinity;
        
        return providerDate >= minDate && providerDate <= maxDate;
      });
    }
    
    setFilteredProviders(filtered);
    setAdvancedFilters(filters);
  };
  
  // Función para manejar la exportación de datos de proveedores
  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    // Definir los campos a exportar
    const fields = [
      { key: 'name' as keyof Provider, header: 'Nombre' },
      { key: 'contactPerson' as keyof Provider, header: 'Contacto' },
      { key: 'email' as keyof Provider, header: 'Email' },
      { key: 'phone' as keyof Provider, header: 'Teléfono' },
      { key: 'category' as keyof Provider, header: 'Categoría' },
      { key: 'status' as keyof Provider, header: 'Estado' },
      { key: 'rating' as keyof Provider, header: 'Calificación' },
      { key: 'address' as keyof Provider, header: 'Dirección' },
    ];
    
    // Usar los proveedores filtrados para la exportación
    const dataToExport = filteredProviders;
    
    // Configurar opciones de exportación
    const exportOptions = {
      format,
      fileName: `proveedores_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`,
      title: 'Listado de Proveedores',
      sheetName: 'Proveedores',
      orientation: 'landscape' as 'portrait' | 'landscape'
    };
    
    // Exportar los datos
    ExportService.exportList(dataToExport, fields, exportOptions);
  };
  
  // Manejadores de formulario (prefijo con guion bajo para indicar que son utilizados en la plantilla JSX)
  const _handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const _handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const categories = e.target.value.split(',').map(cat => cat.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, category: categories }));
  };
  
  const _handleProductInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductForm(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) || 0 : value }));
  };
  
  const _handleDocumentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    
    if (name === 'file' && files && files.length > 0) {
      setDocumentForm(prev => ({ ...prev, file: files[0] }));
    } else {
      setDocumentForm(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Manejadores de acciones CRUD
  const handleCreateProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      clearError();
      await providersApi.createProvider({
        ...formData,
        products: [],
        documents: [],
        history: []
      });
      setShowModal(false);
      resetForm();
      loadProviders();
      showSuccess('Proveedor creado correctamente');
    } catch (err) {
      handleError(err);
      showError('Error al crear el proveedor. Por favor, inténtelo de nuevo.');
    }
  };
  
  const handleUpdateProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider?._id) return;
    
    try {
      clearError();
      await providersApi.updateProvider(selectedProvider._id, formData);
      setShowModal(false);
      resetForm();
      loadProviders();
      showSuccess('Proveedor actualizado correctamente');
    } catch (err) {
      handleError(err);
      showError('Error al actualizar el proveedor. Por favor, inténtelo de nuevo.');
    }
  };
  
  const handleDeleteProvider = async (id: string) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este proveedor?')) return;
    
    try {
      clearError();
      await providersApi.deleteProvider(id);
      loadProviders();
      showSuccess('Proveedor eliminado correctamente');
    } catch (err) {
      handleError(err);
      showError('Error al eliminar el proveedor. Por favor, inténtelo de nuevo.');
    }
  };
  
  const _handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider?._id) return;
    
    try {
      clearError();
      await providersApi.addProduct(selectedProvider._id, productForm);
      
      // Actualizar el proveedor seleccionado
      const updatedProvider = await providersApi.getProviderById(selectedProvider._id);
      setSelectedProvider(updatedProvider);
      
      // Resetear formulario
      setProductForm({
        name: '',
        code: '',
        price: 0,
        description: '',
        category: ''
      });
      
      showSuccess('Producto añadido correctamente');
    } catch (err) {
      handleError(err);
      showError('Error al añadir el producto. Por favor, inténtelo de nuevo.');
    }
  };
  
  const _handleDeleteProduct = async (providerId: string, productId: string) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este producto?')) return;
    
    try {
      clearError();
      await providersApi.deleteProduct(providerId, productId);
      
      // Actualizar el proveedor seleccionado
      const updatedProvider = await providersApi.getProviderById(providerId);
      setSelectedProvider(updatedProvider);
      
      showSuccess('Producto eliminado correctamente');
    } catch (err) {
      handleError(err);
      showError('Error al eliminar el producto. Por favor, inténtelo de nuevo.');
    }
  };
  
  const _handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider?._id || !documentForm.file) return;
    
    try {
      clearError();
      await providersApi.uploadDocument(selectedProvider._id, {
        name: documentForm.name,
        type: documentForm.type,
        file: documentForm.file
      });
      
      // Actualizar el proveedor seleccionado
      const updatedProvider = await providersApi.getProviderById(selectedProvider._id);
      setSelectedProvider(updatedProvider);
      
      // Resetear formulario
      setDocumentForm({
        name: '',
        type: '',
        file: null
      });
      
      showSuccess('Documento subido correctamente');
    } catch (err) {
      handleError(err);
      showError('Error al subir el documento. Por favor, inténtelo de nuevo.');
    }
  };
  
  const _handleDeleteDocument = async (providerId: string, documentId: string) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este documento?')) return;
    
    try {
      clearError();
      await providersApi.deleteDocument(providerId, documentId);
      
      // Actualizar el proveedor seleccionado
      const updatedProvider = await providersApi.getProviderById(providerId);
      setSelectedProvider(updatedProvider);
      
      showSuccess('Documento eliminado correctamente');
    } catch (err) {
      handleError(err);
      showError('Error al eliminar el documento. Por favor, inténtelo de nuevo.');
    }
  };
  
  // Funciones auxiliares
  const resetForm = () => {
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      taxId: '',
      category: [],
      rating: 0,
      status: 'pending',
      paymentTerms: '',
      notes: ''
    });
  };
  
  const _openEditModal = (provider: Provider) => {
    setSelectedProvider(provider);
    setFormData({
      name: provider.name,
      contactPerson: provider.contactPerson,
      email: provider.email,
      phone: provider.phone,
      address: provider.address,
      website: provider.website || '',
      taxId: provider.taxId,
      category: provider.category,
      rating: provider.rating,
      status: provider.status,
      paymentTerms: provider.paymentTerms,
      notes: provider.notes
    });
    setShowModal(true);
  };
  
  const _openDetailModal = async (providerId: string) => {
    try {
      clearError();
      const provider = await providersApi.getProviderById(providerId);
      setSelectedProvider(provider);
      setShowDetailModal(true);
    } catch (err) {
      handleError(err);
      showError('Error al obtener detalles del proveedor. Por favor, inténtelo de nuevo.');
    }
  };
  
  const handleViewProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setCurrentTab('info');
    setShowDetailModal(true);
  };
  
  const handleEditProvider = (provider: Provider) => {
    setFormData({
      ...provider,
      website: provider.website || '',
      category: provider.category || [],
      paymentTerms: provider.paymentTerms || '',
      notes: provider.notes || ''
    });
    setSelectedProvider(provider);
    setShowModal(true);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Gestión de Proveedores</h1>
          <p>Administra tus proveedores, productos y documentos asociados</p>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.addButton}
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <FiPlus /> Nuevo Proveedor
          </button>
          <ExportButton
            onExport={handleExport}
          />
        </div>
      </header>
      
      {/* Mostrar errores si existen */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }} 
          onClose={clearError}
        >
          {error.message}
        </Alert>
      )}
      <div className={styles.searchSection}>
        <AdvancedSearch
          onSearch={handleAdvancedSearch}
          filterOptions={filterOptions}
          placeholder="Buscar proveedores por nombre, contacto, email..."
          initialQuery={searchQuery}
          initialFilters={advancedFilters}
        />
        
        {/* Indicador de carga */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        )}
      </div>
      
      <div className={styles.providersList}>
        {loading && <p className={styles.loading}>Cargando proveedores...</p>}
        
        {!loading && providers.length === 0 && (
          <p className={styles.emptyState}>No hay proveedores registrados. ¡Añade uno nuevo!</p>
        )}
        
        {!loading && filteredProviders.length === 0 && providers.length > 0 && (
          <p className={styles.emptyState}>No se encontraron proveedores que coincidan con tu búsqueda.</p>
        )}
        
        {!loading && filteredProviders.map(provider => (
          <div key={provider._id} className={styles.providerCard}>
            <div className={styles.providerHeader}>
              <h3 className={styles.providerTitle}>{provider.name}</h3>
              <span 
                className={styles.providerStatus}
                style={{ backgroundColor: statusColor[provider.status] }}
              >
                {statusLabel[provider.status]}
              </span>
            </div>
            <div className={styles.providerInfo}>
              <p className={styles.providerContact}>
                <strong>Contacto:</strong> {provider.contactPerson}
              </p>
              <p className={styles.providerContact}>
                <strong>Email:</strong> {provider.email}
              </p>
              {provider.phone && (
                <p className={styles.providerContact}>
                  <strong>Teléfono:</strong> {provider.phone}
                </p>
              )}
              
              {provider.category.length > 0 && (
                <div className={styles.categories}>
                  {provider.category.map(cat => (
                    <span key={cat} className={styles.category}>{cat}</span>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.providerActions}>
              <button 
                onClick={() => handleViewProvider(provider)}
                className={`${styles.actionButton} ${styles.viewButton}`}
              >
                <FiEye /> Ver detalles
              </button>
              <button 
                onClick={() => handleEditProvider(provider)}
                className={`${styles.actionButton} ${styles.editButton}`}
              >
                <FiEdit2 />
              </button>
              <button 
                onClick={() => provider._id && handleDeleteProvider(provider._id)} 
                className={`${styles.actionButton} ${styles.deleteButton}`}
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Modal para crear/editar proveedor */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{selectedProvider ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
            <form onSubmit={selectedProvider ? handleUpdateProvider : handleCreateProvider}>
              {/* ... */}
            </form>
          </div>
        </div>
      )}
      
      {/* Modal de detalles del proveedor */}
      {showDetailModal && selectedProvider && (
        <div className="modal-overlay">
          <div className="modal-content modal-detail">
            <h2>{selectedProvider.name}</h2>
            <div className="provider-detail-header">
              <span className="status-badge" style={{ backgroundColor: statusColor[selectedProvider.status] }}>
                {statusLabel[selectedProvider.status]}
              </span>
            </div>
            
            {/* ... */}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProvidersPage;
