import React, { useState, useEffect } from 'react';
import '../styles/users.css';
import Button from '../components/common/Button';
import { FiPlus, FiTrash2, FiEdit2, FiRefreshCw } from 'react-icons/fi';

interface User {
  _id: string;
  name: string;
  email: string;
  roles: string[];
}

const UsersPage: React.FC = () => {
  const token = localStorage.getItem('token') || '';
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRoles, setNewRoles] = useState('');
  const [newRoleField, setNewRoleField] = useState('');
  const [editingId, setEditingId] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRoles, setEditRoles] = useState('');
  const predefinedRoles = ['comercial', 'jefe de almacen', 'jefe de equipo', 'montador', 'tecnico auxiliar', 'tecnico audiovisual', 'dj'];

  const loadUsers = async () => {
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data: User[] = await res.json();
      setUsers(data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = {
        name: newName,
        email: newEmail,
        password: newPassword,
        roles: newRoles.split(',').map(r => r.trim()).filter(r => r)
      };
      const res = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(await res.text());
      setShowModal(false);
      setNewName(''); setNewEmail(''); setNewPassword(''); setNewRoles('');
      loadUsers();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleEditClick = (user: User) => {
    setEditingId(user._id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRoles(user.roles.join(', '));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body: any = { name: editName, email: editEmail, roles: editRoles.split(',').map(r => r.trim()).filter(r => r) };
      if (editPassword) body.password = editPassword;
      const res = await fetch(`http://localhost:5000/api/users/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(await res.text());
      setShowModal(false);
      setEditingId(''); setEditName(''); setEditEmail(''); setEditPassword(''); setEditRoles('');
      loadUsers();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar usuario?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(await res.text());
      loadUsers();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="users-page">
      <h1>Usuarios</h1>
      <div className="users-controls">
        <input type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <Button onClick={loadUsers}><FiRefreshCw /></Button>
        <Button onClick={() => { setShowModal(true); setEditingId(''); }}><FiPlus /> Nuevo usuario</Button>
      </div>
      {error && <div className="error">{error}</div>}
      <ul className="users-list">
        {filtered.map(u => (
          <li key={u._id} className="user-card">
            <div><strong>{u.name}</strong></div>
            <div>{u.email}</div>
            <div>Roles: {u.roles.join(', ')}</div>
            <div className="actions">
              <Button onClick={() => handleEditClick(u)}><FiEdit2 /></Button>
              <Button onClick={() => handleDelete(u._id)}><FiTrash2 /></Button>
            </div>
          </li>
        ))}
      </ul>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingId ? 'Editar usuario' : 'Nuevo usuario'}</h2>
            <form onSubmit={editingId ? handleSaveEdit : handleCreate}>
              <input type="text" placeholder="Nombre" value={editingId ? editName : newName} onChange={e => editingId ? setEditName(e.target.value) : setNewName(e.target.value)} required />
              <input type="email" placeholder="Email" value={editingId ? editEmail : newEmail} onChange={e => editingId ? setEditEmail(e.target.value) : setNewEmail(e.target.value)} required />
              <input type="password" placeholder="Contraseña" value={editingId ? editPassword : newPassword} onChange={e => editingId ? setEditPassword(e.target.value) : setNewPassword(e.target.value)} required={!editingId} />
              <div className="form-inline">
                  <input type="text" placeholder="Nuevo rol" value={newRoleField} onChange={e => setNewRoleField(e.target.value)} />
                  <Button onClick={() => { if (newRoleField.trim()) { const updated = editingId ? [...editRoles, newRoleField.trim()] : newRoles ? [...newRoles.split(','), newRoleField.trim()] : [newRoleField.trim()]; if (editingId) setEditRoles(updated); else setNewRoles(updated.join(',')); setNewRoleField(''); } }}><FiPlus /></Button>
                </div>
                <input type="text" placeholder="Roles (separar con comas)" value={editingId ? editRoles : newRoles} onChange={e => editingId ? setEditRoles(e.target.value) : setNewRoles(e.target.value)} />
              <small className="helper-text">Roles predefinidos: {predefinedRoles.join(', ')}</small>
              <div className="roles-list">
                {predefinedRoles.map(role => {
                  const arr = (editingId ? editRoles : newRoles).split(',').map(r => r.trim()).filter(r => r);
                  const has = arr.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        const updated = [...arr]; if (!has) updated.push(role);
                        if (editingId) setEditRoles(updated.join(', ')); else setNewRoles(updated.join(', '));
                      }}
                      className={has ? 'role-btn selected' : 'role-btn'}
                    >{role}</button>
                  );
                })}
              </div>
              <div className="modal-actions">
                <Button type="submit">{editingId ? 'Guardar' : 'Crear'}</Button>
                <Button type="button" onClick={() => setShowModal(false)}>Cancelar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
