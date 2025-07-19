import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchPermissions, 
  deletePermission, 
  selectPermissions, 
  selectPermissionsLoading 
} from '../../store/slices/permissionSlice';
import { FiEdit2, FiTrash2, FiPlus, FiRefreshCw } from 'react-icons/fi';
import Button from '../common/Button';
import type { AppDispatch } from '../../store/store';
import type { IPermission } from '../../types/role';
import useApiError from '../../hooks/useApiError';
import { useNotification } from '../../contexts/NotificationContext';
import Alert from '../common/Alert/Alert';
import { ConfirmationDialog } from '../feedback/ConfirmationDialog';

interface PermissionsListProps {
  onEdit: (permission: IPermission) => void;
  onAdd: () => void;
}

const PermissionsList: React.FC<PermissionsListProps> = ({ onEdit, onAdd }) => {
  const dispatch = useDispatch<AppDispatch>();
  const permissions = useSelector(selectPermissions);
  const isLoading = useSelector(selectPermissionsLoading);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<IPermission | null>(null);
  
  // Hooks para manejo de errores y notificaciones
  const { error, handleError, clearError } = useApiError();
  const { showError, showSuccess } = useNotification();

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      await dispatch(fetchPermissions()).unwrap();
      clearError();
    } catch (err: any) {
      handleError(err);
      showError('Error al cargar los permisos');
    }
  };

  const openDeleteDialog = (permission: IPermission) => {
    setPermissionToDelete(permission);
    setDeleteDialogOpen(true);
  };

  const handleDeletePermission = async () => {
    if (!permissionToDelete) return;
    
    try {
      await dispatch(deletePermission(permissionToDelete._id)).unwrap();
      showSuccess(`Permiso ${permissionToDelete.name} eliminado correctamente`);
      clearError();
    } catch (err: any) {
      handleError(err);
      showError(`Error al eliminar el permiso ${permissionToDelete.name}`);
    } finally {
      setPermissionToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const filteredPermissions = permissions.filter((permission) =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="permissions-list">
      <h2 className="text-xl font-bold mb-4">Gestión de Permisos</h2>
      
      <div className="mb-4 flex items-center justify-between">
        <div className="flex">
          <input
            type="text"
            placeholder="Buscar permisos..."
            className="border rounded px-3 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button 
            onClick={loadPermissions} 
            className="mr-2" 
            disabled={isLoading} 
            variant="secondary"
          >
            <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
          </Button>
        </div>
        <Button onClick={onAdd} className="flex items-center">
          <FiPlus className="mr-1" /> Nuevo Permiso
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
      
      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recurso</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">Cargando permisos...</td>
              </tr>
            ) : filteredPermissions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">No se encontraron permisos</td>
              </tr>
            ) : (
              filteredPermissions.map((permission) => (
                <tr key={permission._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm">{permission.name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{permission.resource}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">{permission.action}</span>
                  </td>
                  <td className="px-6 py-4">{permission.description || '-'}</td>
                  <td className="px-6 py-4 flex">
                    <button
                      onClick={() => onEdit(permission)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Editar permiso"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => openDeleteDialog(permission)}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar permiso"
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

    {/* Diálogo de confirmación para eliminar permiso */}
    {permissionToDelete ? (
      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que quieres eliminar el permiso "${permissionToDelete?.name || ''}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmColor="error"
        onConfirm={handleDeletePermission}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setPermissionToDelete(null);
        }}
      />
    ) : null}
  );
};

export default PermissionsList;
