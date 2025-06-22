import React, { useState, useEffect } from 'react';
import '../styles/ClientModal.css';
import { FiX } from 'react-icons/fi';

interface UserOption { _id: string; name: string; roles: string[] }
interface ClientData { 
  _id?: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  dni?: string;
  status?: string;
  tags?: string[];
  notes?: string;
  assignedCommercial?: string;
}

interface Props {
  token: string;
  onClose: () => void;
  onSuccess: () => void;
  client?: ClientData;
}

const ClientModal: React.FC<Props> = ({ token, onClose, onSuccess, client }) => {
  const [name, setName] = useState(client?.name || '');
  const [phone, setPhone] = useState(client?.phone || '');
  const [email, setEmail] = useState(client?.email || '');
  const [address, setAddress] = useState(client?.address || '');
  const [dni, setDni] = useState(client?.dni || '');
  const [status, setStatus] = useState(client?.status || '');
  const [tags, setTags] = useState((client?.tags || []).join(','));
  const [notes, setNotes] = useState(client?.notes || '');
  const [assignedCommercial, setAssignedCommercial] = useState(client?.assignedCommercial || '');
  const [users, setUsers] = useState<UserOption[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then((data: UserOption[]) => setUsers(data.filter(u => u.roles.includes('comercial'))))
      .catch(err => console.error(err));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('El nombre es obligatorio'); return; }
    try {
      const body: ClientData = { 
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        dni: dni.trim() || undefined,
        status: status.trim() || undefined,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        notes: notes.trim() || undefined,
        assignedCommercial: assignedCommercial || undefined,
      };
      const url = client && client._id ? `/api/clients/${client._id}` : '/api/clients';
      const method = client && client._id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error en el servidor');
    }
  };

  const handleDelete = async () => {
    if (!client?._id) return;
    if (!window.confirm('¿Eliminar cliente?')) return;
    try {
      const res = await fetch(`/api/clients/${client._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error eliminando cliente');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal client-modal">
        <button className="close-btn" onClick={onClose}><FiX /></button>
        <h2>{client ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre *" />
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Teléfono" />
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
          <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Dirección" />
          <input value={dni} onChange={e => setDni(e.target.value)} placeholder="DNI/NIF" />
          <select value={assignedCommercial} onChange={e => setAssignedCommercial(e.target.value)}>
            <option value="">Comercial asignado</option>
            {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
          <input value={status} onChange={e => setStatus(e.target.value)} placeholder="Estado" />
          <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (coma)" />
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notas" />
          <button type="submit">{client ? 'Guardar' : 'Crear'}</button>
            {client?._id && <button type="button" className="delete-btn" onClick={handleDelete}>Eliminar</button>}
        </form>
      </div>
    </div>
  );
};

export default ClientModal;
