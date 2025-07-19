import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRoles, deleteRole, selectRoles, selectRolesLoading } from '../../store/slices/roleSlice';
import { FiEdit2, FiTrash2, FiPlus, FiRefreshCw } from 'react-icons/fi';
import Button from '../common/Button';
import type { AppDispatch } from '../../store/store';
import type { IRole } from '../../types/role';
import useApiError from '../../hooks/useApiError';
import { useNotification } from '../../contexts/NotificationContext';
import Alert from '../common/Alert/Alert';
import { ConfirmationDialog } from '../feedback/ConfirmationDialog';

interface RolesListProps {
  onEdit: (role: IRole) => void;
  onAdd: () => void;
}

const RolesList: React.FC<RolesListProps> = ({ onEdit, onAdd }) => {
  const dispatch = useDispatch<AppDispatch>();
  const roles = useSelector(selectRoles);
  const isLoading = useSelector(selectRolesLoading);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<IRole | null>(null);
  
  // Hooks para manejo de errores y notificaciones
  const { error, handleError, clearError } = useApiError();
  const { showError, showSuccess } = useNotification();

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      await dispatch(fetchRoles()).unwrap();
      clearError();
    } catch (err: any) {
      handleError(err);
      showError('Error al cargar los roles');
    }
  };

  const openDeleteDialog = (role: IRole) => {
    if (role.isSystemRole) {
      showError('No se pueden eliminar roles del sistema');
      return;
    }
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    
    try {
      await dispatch(deleteRole(roleToDelete._id)).unwrap();
      showSuccess(`Rol ${roleToDelete.name} eliminado correctamente`);
      clearError();
    } catch (err: any) {
      handleError(err);
      showError(`Error al eliminar el rol ${roleToDelete.name}`);
    } finally {
      setRoleToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="roles-list">
      <h2 className="text-xl font-bold mb-4">Gestión de Roles</h2>
      
      <div className="mb-4 flex items-center justify-between">
        <div className="flex">
          <input
            type="text"
            placeholder="Buscar roles..."
            className="border rounded px-3 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button 
            onClick={loadRoles} 
            className="mr-2" 
            disabled={isLoading} 
            variant="secondary"
          >
            <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
          </Button>
        </div>
        <Button onClick={onAdd} className="flex items-center">
          <FiPlus className="mr-1" /> Nuevo Rol
        </Button>
      </div>
      
      {error && (
        <Alert 
          color="red" 
          title="Error" 
          withCloseButton
          onClose={clearError}
        >
          {error.message}
        </Alert>
      )}
      
      <div className="bg-white shadow rounded">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permisos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">Cargando roles...</td>
              </tr>
            ) : filteredRoles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">No se encontraron roles</td>
              </tr>
            ) : (
              filteredRoles.map((role) => (
                <tr key={role._id} className={role.isSystemRole ? "bg-gray-50" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap">{role.name}</td>
                  <td className="px-6 py-4">{role.description}</td>
                  <td className="px-6 py-4">
                    {role.isSystemRole ? (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Sistema</span>
                    ) : (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Personalizado</span>
                    )}
                  </td>
                  <td className="px-6 py-4">{role.permissions.length}</td>
                  <td className="px-6 py-4 flex">
                    <button
                      onClick={() => onEdit(role)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Editar rol"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => openDeleteDialog(role)}
                      className={`${role.isSystemRole ? "text-gray-400 cursor-not-allowed" : "text-red-600 hover:text-red-900"}`}
                      title={role.isSystemRole ? "No se pueden eliminar roles del sistema" : "Eliminar rol"}
                      disabled={role.isSystemRole}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>

    {/* Diálogo de confirmación para eliminar rol */}
    {roleToDelete ? (
      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que quieres eliminar el rol "${roleToDelete?.name || ''}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmColor="error"
        onConfirm={handleDeleteRole}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setRoleToDelete(null);
        }}
      />
    ) : null}
  );
};

export default RolesList;
