import React, { useEffect, useState, useCallback } from 'react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { FiPlus, FiTrash2, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import ExportButton from '../components/common/ExportButton';
import { ExportService } from '../services/export';
import AdvancedSearch from '../components/common/AdvancedSearch';
import type { FilterOption, FilterState } from '../components/common/AdvancedSearch';
import styles from './TasksPage.module.css';

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'done';
  dueDate?: string;
  assignedTo?: { _id: string; name: string };
  createdBy?: { _id: string; name: string };
}

const statusLabel: Record<string, string> = {
  pending: 'Pendiente',
  in_progress: 'En curso',
  done: 'Hecha',
};
const statusVariant: Record<string, string> = {
  pending: 'pending',
  in_progress: 'active',
  done: 'success',
};

const TasksPage: React.FC = () => {
  const token = localStorage.getItem('token') || '';
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [editingId, setEditingId] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editStatus, setEditStatus] = useState<'pending' | 'in_progress' | 'done'>('pending');
  const [searchTerm, setSearchTerm] = useState<string>('');
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
        { value: 'in_progress', label: 'En curso' },
        { value: 'done', label: 'Hecha' }
      ],
      defaultValue: 'all'
    },
    {
      id: 'dueDateFrom',
      label: 'Fecha límite desde',
      type: 'date',
      defaultValue: ''
    },
    {
      id: 'dueDateTo',
      label: 'Fecha límite hasta',
      type: 'date',
      defaultValue: ''
    },
    {
      id: 'assignedToMe',
      label: 'Asignadas a mí',
      type: 'boolean',
      defaultValue: false
    },
    {
      id: 'createdByMe',
      label: 'Creadas por mí',
      type: 'boolean',
      defaultValue: false
    }
  ];

  // Función para filtrar tareas según el término de búsqueda y filtros
  const filterTasksList = useCallback((taskList: Task[], query: string, filterValues: FilterState) => {
    // Si no hay término de búsqueda ni filtros, devolver todas las tareas
    if (!query && Object.keys(filterValues).length === 0) {
      return taskList;
    }
    
    return taskList.filter(task => {
      // Filtrar por término de búsqueda (título y descripción)
      if (query) {
        const searchRegex = new RegExp(query, 'i');
        if (!searchRegex.test(task.title) && 
            (!task.description || !searchRegex.test(task.description))) {
          return false;
        }
      }
      
      // Filtrar por estado
      if (filterValues.status && filterValues.status !== 'all') {
        if (task.status !== filterValues.status) {
          return false;
        }
      }
      
      // Filtrar por fecha límite desde
      if (filterValues.dueDateFrom && task.dueDate) {
        const fromDate = new Date(String(filterValues.dueDateFrom));
        const taskDate = new Date(task.dueDate);
        if (taskDate < fromDate) {
          return false;
        }
      }
      
      // Filtrar por fecha límite hasta
      if (filterValues.dueDateTo && task.dueDate) {
        const toDate = new Date(String(filterValues.dueDateTo));
        const taskDate = new Date(task.dueDate);
        if (taskDate > toDate) {
          return false;
        }
      }
      
      // Otros filtros se aplicarían aquí una vez implementados
      // Por ejemplo: asignadas a mí, creadas por mí, etc.
      
      // Si pasa todos los filtros, incluir esta tarea
      return true;
    });
  }, []);
  
  // Manejar la búsqueda avanzada
  const handleAdvancedSearch = useCallback((query: string, filterValues: FilterState) => {
    setSearchTerm(query);
    setFilters(filterValues);
    
    // Aplicar filtros a la lista de tareas
    const filtered = filterTasksList(tasks, query, filterValues);
    setFilteredTasks(filtered);
  }, [tasks, filterTasksList]);

  // Función para manejar la exportación de tareas
  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    // Definir los campos a exportar
    const fields = [
      { key: 'title' as keyof Task, header: 'Título' },
      { key: 'description' as keyof Task, header: 'Descripción' },
      { key: 'status' as keyof Task, header: 'Estado', 
        formatter: (value: string) => statusLabel[value] || value },
      { key: 'dueDate' as keyof Task, header: 'Fecha límite',
        formatter: (value: string | undefined) => value ? new Date(value).toLocaleDateString() : 'N/A' },
      { key: 'assignedTo' as keyof Task, header: 'Asignado a',
        formatter: (value: {name: string} | undefined) => value ? value.name : 'Sin asignar' },
      { key: 'createdBy' as keyof Task, header: 'Creado por',
        formatter: (value: {name: string} | undefined) => value ? value.name : 'Desconocido' }
    ];
    
    // Usar las tareas filtradas para la exportación
    const dataToExport = filteredTasks.length > 0 ? filteredTasks : tasks;
    
    // Configurar opciones de exportación
    const exportOptions = {
      format,
      fileName: `tareas_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`,
      title: 'Listado de Tareas',
      sheetName: 'Tareas'
    };
    
    // Exportar los datos
    ExportService.exportList(dataToExport, fields, exportOptions);
  };
  
  const fetchTasks = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('http://localhost:5000/api/tasks', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Error al cargar tareas');
      const data = await res.json();
      setTasks(data.data);
      // Aplicar filtros actuales a las tareas recién cargadas
      setFilteredTasks(filterTasksList(data.data, searchTerm, filters));
    } catch (err) { setError((err as Error).message); }
    setLoading(false);
  }, [token, filterTasksList, searchTerm, filters]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    try {
      const res = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: newTitle, description: newDescription, dueDate: newDueDate })
      });
      if (!res.ok) throw new Error('Error al crear tarea');
      setNewTitle(''); setNewDescription(''); setNewDueDate(''); setShowModal(false);
      fetchTasks();
    } catch (err) { setError((err as Error).message); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar tarea?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al borrar tarea');
      fetchTasks();
    } catch (err) { setError((err as Error).message); }
  };

  const handleEditClick = (task: Task) => {
    setEditingId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditDueDate(task.dueDate ? task.dueDate.slice(0,10) : '');
    setEditStatus(task.status);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: editTitle, description: editDescription, dueDate: editDueDate, status: editStatus })
      });
      if (!res.ok) throw new Error('Error al editar tarea');
      setEditingId('');
      fetchTasks();
    } catch (err) { setError((err as Error).message); }
  };

  const handleCancelEdit = () => setEditingId('');

  return (
    <div className={styles.tasksPage}>
      <div className={styles.header}>
        <h1>Tareas</h1>
        <div className={styles.actions}>
          <ExportButton 
            onExport={handleExport}
            disabled={tasks.length === 0}
            variant="outline"
            label="Exportar Tareas"
          />
          <Button onClick={() => setShowModal(true)}>
            <FiPlus /> Crear tarea
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
      
      {loading && <p className={styles.loading}>Cargando...</p>}
      {error && <div className={styles.error}>{error}</div>}
      <ul className={styles.tasksList}>
        {filteredTasks.map(t => (
          <li key={t._id} className={styles.taskCard}>
            {editingId === t._id ? (
              <form onSubmit={handleSaveEdit} className="form-vertical">
                <input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Título" required />
                <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} placeholder="Descripción" />
                <input type="date" value={editDueDate} onChange={e => setEditDueDate(e.target.value)} />
                <select value={editStatus} onChange={e => setEditStatus(e.target.value as 'pending' | 'in_progress' | 'done')}>
                  <option value="pending">Pendiente</option>
                  <option value="in_progress">En curso</option>
                  <option value="done">Hecha</option>
                </select>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button type="submit"><FiCheck /> Guardar</Button>
                  <Button type="button" onClick={handleCancelEdit}><FiX /> Cancelar</Button>
                </div>
              </form>
            ) : (
              <>
                <div className={styles.taskHeader}>
                  <strong>{t.title}</strong>
                  <Badge variant={statusVariant[t.status]}>{statusLabel[t.status]}</Badge>
                  {t.dueDate && <span className="text-muted">Vence: {new Date(t.dueDate).toLocaleDateString()}</span>}
                </div>
                <p className="text-muted">{t.description}</p>
                <div className={styles.taskActions}>
                  <Button onClick={() => handleEditClick(t)}><FiEdit2 /></Button>
                  <Button onClick={() => handleDelete(t._id)}><FiTrash2 /></Button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      {showModal && (
        <div className={styles.modalOverlay}>
          <form className={styles.modalContent} onSubmit={handleCreate}>
            <h2>Nueva tarea</h2>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Título" required />
            <textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Descripción" />
            <input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} />
            <div className={styles.modalActions}>
              <Button type="submit"><FiCheck /> Crear</Button>
              <Button type="button" onClick={() => setShowModal(false)}><FiX /> Cancelar</Button>
            </div>
          </form>
        </div>
      )}
      {filteredTasks.length === 0 && !loading && 
        <p className={styles.emptyState}>
          {tasks.length === 0 ? 'No hay tareas.' : 'No se encontraron tareas que coincidan con tu búsqueda.'}
        </p>
      }
    </div>
  );
};

export default TasksPage;
