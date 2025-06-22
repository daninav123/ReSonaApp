import React, { useEffect, useState } from 'react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { FiPlus, FiTrash2, FiEdit2, FiCheck, FiX } from 'react-icons/fi';

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

  const fetchTasks = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('http://localhost:5000/api/tasks', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Error al cargar tareas');
      const data = await res.json();
      setTasks(data.data);
    } catch (err) { setError((err as Error).message); }
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

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
    <div className="tasks-page page-container">
      <h1>Tareas</h1>
      <Button onClick={() => setShowModal(true)}><FiPlus /> Nueva tarea</Button>
      {loading && <p>Cargando...</p>}
      {error && <div className="error">{error}</div>}
      <ul className="tasks-list">
        {tasks.map(t => (
          <li key={t._id} className="task-card">
            {editingId === t._id ? (
              <form onSubmit={handleSaveEdit} className="form-vertical">
                <input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Título" required />
                <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} placeholder="Descripción" />
                <input type="date" value={editDueDate} onChange={e => setEditDueDate(e.target.value)} />
                <select value={editStatus} onChange={e => setEditStatus(e.target.value as any)}>
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
                <div className="task-header">
                  <strong>{t.title}</strong>
                  <Badge variant={statusVariant[t.status]}>{statusLabel[t.status]}</Badge>
                  {t.dueDate && <span className="text-muted">Vence: {new Date(t.dueDate).toLocaleDateString()}</span>}
                </div>
                <p className="text-muted">{t.description}</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button onClick={() => handleEditClick(t)}><FiEdit2 /></Button>
                  <Button onClick={() => handleDelete(t._id)}><FiTrash2 /></Button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      {showModal && (
        <div className="modal">
          <form className="modal-content form-vertical" onSubmit={handleCreate}>
            <h2>Nueva tarea</h2>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Título" required />
            <textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Descripción" />
            <input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} />
            <div className="modal-actions">
              <Button type="submit"><FiCheck /> Crear</Button>
              <Button type="button" onClick={() => setShowModal(false)}><FiX /> Cancelar</Button>
            </div>
          </form>
        </div>
      )}
      {tasks.length === 0 && !loading && <p className="text-muted">No hay tareas.</p>}
    </div>
  );
};

export default TasksPage;
