import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import RolesList from '../components/admin/RolesList';
import RoleForm from '../components/admin/RoleForm';
import PermissionsList from '../components/admin/PermissionsList';
import PermissionForm from '../components/admin/PermissionForm';
import { selectHasRole } from '../store/slices/authSlice';
import type { IRole, IPermission } from '../types/role';

const RbacAdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [showPermissionForm, setShowPermissionForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<IRole | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<IPermission | null>(null);
  
  // Verificar que el usuario tenga permisos de administrador
  const hasAdminAccess = useSelector(selectHasRole('admin'));

  const handleRoleEdit = (role: IRole) => {
    setSelectedRole(role);
    setShowRoleForm(true);
  };

  const handleRoleAdd = () => {
    setSelectedRole(null);
    setShowRoleForm(true);
  };

  const handleRoleSave = () => {
    setShowRoleForm(false);
    setSelectedRole(null);
  };

  const handlePermissionEdit = (permission: IPermission) => {
    setSelectedPermission(permission);
    setShowPermissionForm(true);
  };

  const handlePermissionAdd = () => {
    setSelectedPermission(null);
    setShowPermissionForm(true);
  };

  const handlePermissionSave = () => {
    setShowPermissionForm(false);
    setSelectedPermission(null);
  };

  if (!hasAdminAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Acceso Denegado</h2>
          <p>No tienes permiso para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Administración de Roles y Permisos</h1>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'roles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('roles')}
            >
              Roles
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'permissions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('permissions')}
            >
              Permisos
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'roles' && (
        <div>
          {showRoleForm ? (
            <RoleForm 
              role={selectedRole} 
              onCancel={() => setShowRoleForm(false)} 
              onSave={handleRoleSave} 
            />
          ) : (
            <RolesList onEdit={handleRoleEdit} onAdd={handleRoleAdd} />
          )}
        </div>
      )}

      {activeTab === 'permissions' && (
        <div>
          {showPermissionForm ? (
            <PermissionForm 
              permission={selectedPermission} 
              onCancel={() => setShowPermissionForm(false)} 
              onSave={handlePermissionSave} 
            />
          ) : (
            <PermissionsList onEdit={handlePermissionEdit} onAdd={handlePermissionAdd} />
          )}
        </div>
      )}
    </div>
  );
};

export default RbacAdminPage;
