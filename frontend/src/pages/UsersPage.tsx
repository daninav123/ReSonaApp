import React, { useState, useEffect, useCallback } from 'react';
import '../styles/users.css';
import Button from '../components/common/Button';
import UserRoleSelector from '../components/admin/UserRoleSelector';
import { FiPlus, FiTrash2, FiEdit2, FiRefreshCw, FiUserCheck } from 'react-icons/fi';
import { Link } from 'react-router-dom';

interface User {
  _id: string;
  name: string;
  email: string;
  roles: string[];
  createdAt?: string;
  lastLogin?: string;
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
  const [newRoles, setNewRoles] = useState<string[]>([]);
  const [editingId, setEditingId] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRoles, setEditRoles] = useState<string[]>([]);

  const loadUsers = useCallback(async () => {
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
  }, [token]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.roles.some(role => role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = {
        name: newName,
        email: newEmail,
        password: newPassword,
        roles: newRoles
      };
      const res = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(await res.text());
      setShowModal(false);
      setNewName(''); setNewEmail(''); setNewPassword(''); setNewRoles([]);
      loadUsers();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleEditClick = (user: User) => {
    setEditingId(user._id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRoles(user.roles);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body: Record<string, unknown> = { name: editName, email: editEmail, roles: editRoles };
      if (editPassword) body.password = editPassword;
      const res = await fetch(`http://localhost:5000/api/users/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(await res.text());
      setShowModal(false);
      setEditingId(''); setEditName(''); setEditEmail(''); setEditPassword(''); setEditRoles([]);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <div className="flex items-center space-x-3">
          <Link to="/admin/rbac" className="flex items-center text-blue-600 hover:text-blue-800">
            <FiUserCheck className="mr-1" /> Admin Roles y Permisos
          </Link>
          <Button onClick={() => setShowModal(true)} variant="primary" className="flex items-center">
            <FiPlus className="mr-1" /> Nuevo Usuario
          </Button>
        </div>
      </div>

      <div className="mb-6 flex items-center">
        <input
          type="text"
          placeholder="Buscar por nombre, email o rol..."
          className="border p-2 rounded mr-2 flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button 
          onClick={loadUsers} 
          variant="secondary" 
          className="px-3 py-2"
          title="Recargar usuarios"
        >
          <FiRefreshCw className={""} />
        </Button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
              <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-500">No se encontraron usuarios</td>
              </tr>
            ) : filteredUsers.map(user => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="font-medium">{user.name}</div>
                  {user.createdAt && (
                    <div className="text-xs text-gray-500">
                      Creado: {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div>{user.email}</div>
                  {user.lastLogin && (
                    <div className="text-xs text-gray-500">
                      Último acceso: {new Date(user.lastLogin).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map(role => (
                      <span key={role} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {role}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4 text-right space-x-1">
                  <button
                    onClick={() => handleEditClick(user)}
                    className="text-blue-600 hover:text-blue-900 p-1"
                    title="Editar usuario"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="text-red-600 hover:text-red-900 p-1"
                    title="Eliminar usuario"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingId ? 'Editar usuario' : 'Nuevo usuario'}</h2>
            <form onSubmit={editingId ? handleSaveEdit : handleCreate}>
              <input type="text" placeholder="Nombre" value={editingId ? editName : newName} onChange={e => editingId ? setEditName(e.target.value) : setNewName(e.target.value)} required />
              <input type="email" placeholder="Email" value={editingId ? editEmail : newEmail} onChange={e => editingId ? setEditEmail(e.target.value) : setNewEmail(e.target.value)} required />
              <input type="password" placeholder="Contraseña" value={editingId ? editPassword : newPassword} onChange={e => editingId ? setEditPassword(e.target.value) : setNewPassword(e.target.value)} required={!editingId} />
              <UserRoleSelector 
                selectedRoles={editingId ? editRoles : newRoles} 
                onChange={editingId ? setEditRoles : setNewRoles} 
              />
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
