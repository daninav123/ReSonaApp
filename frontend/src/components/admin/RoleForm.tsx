import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createRole, updateRole, selectRolesError } from '../../store/slices/roleSlice';
import { fetchPermissions, selectPermissions, selectPermissionsLoading } from '../../store/slices/permissionSlice';
import Button from '../common/Button';
import type { AppDispatch } from '../../store/store';
import type { IRole, IPermission } from '../../types/role';
import useApiError from '../../hooks/useApiError';
import { useNotification } from '../../contexts/NotificationContext';
import Alert from '../common/Alert/Alert';

interface RoleFormProps {
  role?: IRole | null;
  onCancel: () => void;
  onSave: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({ role, onCancel, onSave }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Hooks para manejo de errores y notificaciones
  const { error: apiError, handleError, clearError } = useApiError();
  const { showError, showSuccess } = useNotification();
  
  const permissions = useSelector(selectPermissions);
  const isLoadingPermissions = useSelector(selectPermissionsLoading);
  const roleError = useSelector(selectRolesError);

  const isEditing = !!role;
  const isSystemRole = role?.isSystemRole || false;

  useEffect(() => {
    try {
      dispatch(fetchPermissions());
    } catch (err) {
      handleError(err as Error);
      showError('Error al cargar los permisos');
    }
  }, [dispatch, handleError, showError]);

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description || '');
      setSelectedPermissions(role.permissions || []);
    } else {
      resetForm();
    }
  }, [role]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setSelectedPermissions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const roleData = {
        name,
        description,
        permissions: selectedPermissions,
      };

      if (isEditing && role) {
        await dispatch(updateRole({ roleId: role._id, roleData })).unwrap();
        showSuccess(`Rol ${name} actualizado correctamente`);
      } else {
        await dispatch(createRole(roleData)).unwrap();
        showSuccess(`Rol ${name} creado correctamente`);
      }
      
      onSave();
      resetForm();
    } catch (error) {
      handleError(error as Error);
      showError(isEditing 
        ? `Error al actualizar el rol ${name}` 
        : `Error al crear el rol ${name}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePermissionToggle = (permissionName: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionName)
        ? prev.filter(p => p !== permissionName)
        : [...prev, permissionName]
    );
  };

  const filteredPermissions = permissions.filter(permission => 
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar permisos por recurso para mejor organización
  const groupedPermissions: Record<string, IPermission[]> = {};
  filteredPermissions.forEach(permission => {
    if (!groupedPermissions[permission.resource]) {
      groupedPermissions[permission.resource] = [];
    }
    groupedPermissions[permission.resource].push(permission);
  });

  return (
    <div className="bg-white rounded shadow p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-6">
        {isEditing ? `Editar Rol: ${role?.name}` : 'Crear Nuevo Rol'}
      </h2>

      {(roleError || apiError) && (
        <Alert 
          color="red" 
          title="Error" 
          withCloseButton
          onClose={clearError}
        >
          {roleError || apiError?.message || 'Ha ocurrido un error'}
        </Alert>
      )}



      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nombre del rol"
            required
            disabled={isSystemRole}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="description" className="block text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Descripción del rol"
            rows={3}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">
            Permisos <span className="text-red-500">*</span>
          </label>
          
          <div className="mb-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Buscar permisos..."
            />
          </div>
          
          {isLoadingPermissions ? (
            <div className="text-center py-4">Cargando permisos...</div>
          ) : (
            <div className="max-h-96 overflow-y-auto border rounded p-3">
              {Object.keys(groupedPermissions).length === 0 ? (
                <div className="text-center py-4">No se encontraron permisos</div>
              ) : (
                Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
                  <div key={resource} className="mb-4">
                    <h3 className="font-medium text-gray-700 mb-2 border-b pb-1">{resource}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {resourcePermissions.map((permission) => (
                        <div key={permission._id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`permission-${permission._id}`}
                            checked={selectedPermissions.includes(permission.name)}
                            onChange={() => handlePermissionToggle(permission.name)}
                            className="mr-2"
                          />
                          <label htmlFor={`permission-${permission._id}`} className="cursor-pointer flex-1">
                            <div className="text-sm">{permission.action}</div>
                            <div className="text-xs text-gray-500">{permission.description}</div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" onClick={onCancel} variant="secondary">
            Cancelar
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting || !name} 
            className={isSubmitting ? "opacity-75 cursor-not-allowed" : ""}
          >
            {isSubmitting && (
              <span className="inline-block mr-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            )}
            {isEditing ? 'Actualizar' : 'Crear'} Rol
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RoleForm;
