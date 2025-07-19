import React, { useState, useEffect, useCallback } from 'react';
import '../styles/materials.css';
import Button from '../components/common/Button';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import ExportButton from '../components/common/ExportButton';
import { ExportService } from '../services/export';
import AdvancedSearch from '../components/common/AdvancedSearch';
import type { FilterOption, FilterState } from '../components/common/AdvancedSearch';
import styles from './MaterialsPage.module.css';

interface Material {
  _id: string;
  name: string;
  description?: string;
  status: 'ok' | 'low' | 'out';
  quantityTotal: number;
  quantityReserved: number;
  photos: string[];
}


// No usar mock, cargar desde API


const statusLabel: Record<string, string> = {
  ok: 'Stock OK',
  low: 'Stock bajo',
  out: 'Agotado',
};
const statusColor: Record<string, string> = {
  ok: '#22c55e',
  low: '#f59e42',
  out: 'var(--color-danger)',
};

const MaterialsPage: React.FC = () => {
  const token = localStorage.getItem('token') || '';
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newStock, setNewStock] = useState(1);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [editingId, setEditingId] = useState<string>('');
  const [editName, setEditName] = useState('');
  const [editStock, setEditStock] = useState(1);
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImageUrl, setEditImageUrl] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<FilterState>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // Definición de opciones de filtro específicas para materiales
  const filterOptions: FilterOption[] = [
    {
      id: 'status',
      label: 'Estado de stock',
      type: 'select',
      options: [
        { value: 'all', label: 'Todos' },
        { value: 'ok', label: 'Stock OK' },
        { value: 'low', label: 'Stock bajo' },
        { value: 'out', label: 'Agotado' }
      ],
      defaultValue: 'all'
    },
    {
      id: 'minQuantity',
      label: 'Cantidad mínima',
      type: 'number',
      defaultValue: ''
    },
    {
      id: 'maxQuantity',
      label: 'Cantidad máxima',
      type: 'number',
      defaultValue: ''
    },
    {
      id: 'hasPhotos',
      label: 'Con fotos',
      type: 'boolean',
      defaultValue: false
    },
    {
      id: 'hasReservations',
      label: 'Con reservas',
      type: 'boolean',
      defaultValue: false
    }
  ];

  // Función para filtrar materiales según término de búsqueda y filtros
  const filterMaterialsList = useCallback((materialsList: Material[], query: string, filterValues: FilterState) => {
    // Si no hay término de búsqueda ni filtros, devolver todos los materiales
    if (!query && Object.keys(filterValues).length === 0) {
      return materialsList;
    }

    return materialsList.filter(material => {
      if (query) {
        const searchRegex = new RegExp(query, 'i');
        if (!searchRegex.test(material.name) && (!material.description || !searchRegex.test(material.description))) {
          return false;
        }
      }

      if (filterValues.status && filterValues.status !== 'all') {
        if (material.status !== filterValues.status) {
          return false;
        }
      }

      if (filterValues.minQuantity && material.quantityTotal < Number(filterValues.minQuantity)) {
        return false;
      }

      if (filterValues.maxQuantity && material.quantityTotal > Number(filterValues.maxQuantity)) {
        return false;
      }

      if (filterValues.hasPhotos && (!material.photos || material.photos.length === 0)) {
        return false;
      }

      if (filterValues.hasReservations && material.quantityReserved <= 0) {
        return false;
      }

      return true;
    });
  }, []);

  const handleAdvancedSearch = useCallback((query: string, filterValues: FilterState) => {
    setSearchTerm(query);
    setFilters(filterValues);

    const filtered = filterMaterialsList(materials, query, filterValues);
    setFilteredMaterials(filtered);
  }, [materials, filterMaterialsList]);

  // Función para manejar la exportación de materiales
  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    // Definir los campos a exportar
    const fields = [
      { key: 'name' as keyof Material, header: 'Nombre' },
      { key: 'description' as keyof Material, header: 'Descripción' },
      { key: 'status' as keyof Material, header: 'Estado', 
        formatter: (value: string) => statusLabel[value] || value },
      { key: 'quantityTotal' as keyof Material, header: 'Stock total' },
      { key: 'quantityReserved' as keyof Material, header: 'Stock reservado' },
      { key: 'photos' as keyof Material, header: 'Fotos', 
        formatter: (value: string[]) => value?.length > 0 ? `${value.length} foto(s)` : 'Sin fotos' }
    ];
    
    // Usar los materiales filtrados para la exportación
    const dataToExport = filteredMaterials.length > 0 ? filteredMaterials : materials;
    
    // Configurar opciones de exportación
    const exportOptions = {
      format,
      fileName: `materiales_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`,
      title: 'Inventario de Materiales',
      sheetName: 'Materiales'
    };
    
    // Exportar los datos
    ExportService.exportList(dataToExport, fields, exportOptions);
  };

  const loadMaterials = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/materials', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setMaterials(data.data);
      setFilteredMaterials(filterMaterialsList(data.data, searchTerm, filters));
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      console.error('Error al cargar materiales:', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const formData = new FormData();
    formData.append('name', newName);
    formData.append('quantityTotal', String(newStock));
    if (newImage) formData.append('photos', newImage);
    try {
      const res = await fetch('http://localhost:5000/api/materials', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      setShowModal(false);
      setNewName('');
      setNewStock(1);
      setNewImage(null);
      setNewImageUrl('');
      loadMaterials();
    } catch (err) {
      alert('Error al crear material: ' + (err as Error).message);
    }
  };

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setNewImageUrl(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setNewImageUrl('');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar material?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/materials/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      loadMaterials();
    } catch (err) {
      alert('Error al eliminar material: ' + (err as Error).message);
    }
  };

  const handleEditClick = (mat: Material) => {
    setEditingId(mat._id);
    setEditName(mat.name);
    setEditStock(mat.quantityTotal);
    setEditImageUrl(mat.photos[0] || '');
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setEditImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setEditImageUrl(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setEditImageUrl('');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', editName);
    formData.append('quantityTotal', String(editStock));
    if (editImage) formData.append('photos', editImage);
    try {
      const res = await fetch(`http://localhost:5000/api/materials/${editingId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      setEditingId('');
      setEditName('');
      setEditStock(1);
      setEditImage(null);
      setEditImageUrl('');
      loadMaterials();
    } catch (err) {
      alert('Error al editar material: ' + (err as Error).message);
    }
  };

  const handleCancelEdit = () => {
    setEditingId('');
    setEditName('');
    setEditStock(1);
  };

  return (
    <div className={styles.materialsPage}>
      <div className={styles.header}>
        <h1>Materiales</h1>
        <div className={styles.actions}>
          <ExportButton 
            onExport={handleExport}
            disabled={materials.length === 0}
            variant="outline"
            label="Exportar Materiales"
          />
          <Button onClick={() => setShowModal(true)}>
            <FiPlus /> Añadir material
          </Button>
        </div>
      </div>

      <div className={styles.searchSection}>
        <AdvancedSearch
          onSearch={handleAdvancedSearch}
          filterOptions={filterOptions}
          initialQuery={searchTerm}
          initialFilters={filters}
        />
      </div>

      {loading && <p className={styles.loading}>Cargando materiales...</p>}
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.materialsList}>
        {filteredMaterials.map(material => (
          <div key={material._id} className={styles.materialCard}>
            {editingId === material._id ? (
              <form onSubmit={handleSaveEdit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nombre</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Nombre"
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Stock</label>
                  <input
                    type="number"
                    value={editStock}
                    onChange={e => setEditStock(parseInt(e.target.value) || 1)}
                    min="0"
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Imagen</label>
                  <input
                    type="file"
                    onChange={handleEditImageChange}
                    accept="image/*"
                    className={styles.input}
                  />
                  {editImageUrl && <img src={editImageUrl} alt="Preview" className={styles.imagePreview} />}
                </div>
                <div className={styles.modalActions}>
                  <Button type="submit">Guardar</Button>
                  <Button type="button" onClick={handleCancelEdit}>Cancelar</Button>
                </div>
              </form>
            ) : (
              <>
                <div className={styles.materialHeader}>
                  <h3 className={styles.materialTitle}>{material.name}</h3>
                  <span
                    className={styles.materialStatus}
                    style={{ backgroundColor: statusColor[material.status] }}
                  >
                    {statusLabel[material.status]}
                  </span>
                </div>
                
                {material.description && <p className={styles.materialDescription}>{material.description}</p>}
                
                {material.photos?.length > 0 && (
                  <img
                    src={`http://localhost:5000/uploads/${material.photos[0]}`}
                    alt={material.name}
                    className={styles.materialImage}
                  />
                )}
                
                <div className={styles.materialInfo}>
                  <div className={styles.stockInfo}>
                    <span>Stock total: {material.quantityTotal}</span>
                    <span>Reservado: {material.quantityReserved}</span>
                  </div>
                  
                  <div className={styles.statusIndicator}>
                    <div
                      className={styles.statusBar}
                      style={{
                        backgroundColor: statusColor[material.status],
                        width: `${(material.quantityTotal - material.quantityReserved) / material.quantityTotal * 100}%`,
                      }}
                    />
                  </div>
                </div>
                
                <div className={styles.materialActions}>
                  <Button onClick={() => handleEditClick(material)}><FiEdit2 /></Button>
                  <Button onClick={() => handleDelete(material._id)} style={{ background: 'var(--color-danger)' }}><FiTrash2 /></Button>
                </div>
              </>
            )}
          </div>
        ))}
        {filteredMaterials.length === 0 && !loading && (
          <p className={styles.emptyState}>
            {materials.length === 0 ? 'No hay materiales en el inventario.' : 'No se encontraron materiales que coincidan con tu búsqueda.'}
          </p>
        )}
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <form className={styles.modalContent} onSubmit={handleAdd}>
            <h2>Nuevo material</h2>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nombre</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Nombre"
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Stock</label>
              <input
                type="number"
                value={newStock}
                onChange={e => setNewStock(parseInt(e.target.value) || 1)}
                min="0"
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Imagen</label>
              <input
                type="file"
                onChange={handleNewImageChange}
                accept="image/*"
                className={styles.input}
              />
              {newImageUrl && <img src={newImageUrl} alt="Preview" className={styles.imagePreview} />}
            </div>
            <div className={styles.modalActions}>
              <Button type="submit">Crear</Button>
              <Button type="button" onClick={() => setShowModal(false)}>Cancelar</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MaterialsPage;
