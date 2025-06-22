import React, { useState, useEffect } from 'react';
import '../styles/materials.css';
import Button from '../components/common/Button';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';

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


const statusLabel = {
  ok: 'Stock OK',
  low: 'Stock bajo',
  out: 'Agotado',
};
const statusColor = {
  ok: '#22c55e',
  low: '#f59e42',
  out: '#ef4444',
};

const MaterialsPage: React.FC = () => {
  const token = localStorage.getItem('token') || '';
  const [materials, setMaterials] = useState<Material[]>([]);
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

  const loadMaterials = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/materials', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setMaterials(data.data);
    } catch (err) {
      alert('Error al cargar materiales: ' + (err as Error).message);
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

  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'ok' | 'low' | 'out'>('all');

  const filteredMaterials = materials.filter(mat =>
    (filterStatus === 'all' || mat.status === filterStatus) &&
    mat.name.toLowerCase().includes(filterName.toLowerCase())
  );

  return (
    <div className="materials-page page-container">
      <h1>Materiales</h1>
      <div className="page-controls">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={filterName}
          onChange={e => setFilterName(e.target.value)}
          style={{ flex: 1, padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #ccc' }}
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as any)}
          style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #ccc' }}
        >
          <option value="all">Todos los estados</option>
          <option value="ok">Stock OK</option>
          <option value="low">Stock bajo</option>
          <option value="out">Agotado</option>
        </select>
        <Button onClick={() => setShowModal(true)}><FiPlus /> Añadir material</Button>
      </div>
      <ul className="materials-list">
        {filteredMaterials.map(mat => (
          <li key={mat._id} className="material-card">
            {editingId === mat._id ? (
              <form onSubmit={handleSaveEdit} className="form-vertical">
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  required
                  style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #ccc' }}
                />
                <input
                  type="number"
                  min={0}
                  value={editStock}
                  onChange={e => setEditStock(Number(e.target.value))}
                  required
                  style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #ccc' }}
                />
                <input type="file" accept="image/*" onChange={handleEditImageChange} />
                {editImageUrl && (
                  <img src={editImageUrl} alt="material" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />
                )}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <Button type="submit">Guardar</Button>
                  <Button type="button" onClick={handleCancelEdit}>Cancelar</Button>
                </div>
              </form>
            ) : (
              <div className="material-info">
                <span className="material-name">{mat.name}</span>
                <span className={`material-status ${mat.status}`}>{statusLabel[mat.status]}</span>
                <div className="material-stock">Stock: {mat.quantityTotal}</div>
                {mat.photos[0] && (
                  <img src={mat.photos[0]} alt="material" className="material-image" />
                )}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <Button onClick={() => handleEditClick(mat)}><FiEdit2 /></Button>
                  <Button onClick={() => handleDelete(mat._id)} style={{ background: '#ef4444' }}><FiTrash2 /></Button>
                </div>
              </div>
            )}
          </li>
        ))}
        {filteredMaterials.length === 0 && (
          <li style={{ color: '#888', fontStyle: 'italic', padding: '1rem' }}>No hay materiales que coincidan.</li>
        )}
      </ul>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Nuevo material</h2>
            <form onSubmit={handleAdd}>
              <input
                type="text"
                placeholder="Nombre del material"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                required
              />
              <input
                type="number"
                min={0}
                placeholder="Stock"
                value={newStock}
                onChange={e => setNewStock(Number(e.target.value))}
                required
              />
              <input type="file" accept="image/*" onChange={handleNewImageChange} />
              {newImageUrl && (
                <img src={newImageUrl} alt="material" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />
              )}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button type="submit">Añadir</Button>
                <Button type="button" onClick={() => setShowModal(false)}>Cancelar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialsPage;
