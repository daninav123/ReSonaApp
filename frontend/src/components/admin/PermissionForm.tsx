import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  createPermission, 
  updatePermission, 
  fetchResourcesAndActions,
  selectPermissionsError,
  selectResources,
  selectActions
} from '../../store/slices/permissionSlice';
import Button from '../common/Button';
import type { AppDispatch } from '../../store/store';
import type { IPermission } from '../../types/role';
import useApiError from '../../hooks/useApiError';
import { useNotification } from '../../contexts/NotificationContext';
import Alert from '../common/Alert/Alert';

interface PermissionFormProps {
  permission?: IPermission | null;
  onCancel: () => void;
  onSave: () => void;
}

const PermissionForm: React.FC<PermissionFormProps> = ({ permission, onCancel, onSave }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [resource, setResource] = useState('');
  const [action, setAction] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Hooks para manejo de errores y notificaciones
  const { error: apiError, handleError, clearError } = useApiError();
  const { showError, showSuccess } = useNotification();
  
  const resources = useSelector(selectResources);
  const actions = useSelector(selectActions);
  const reduxError = useSelector(selectPermissionsError);

  const isEditing = !!permission;

  useEffect(() => {
    try {
      dispatch(fetchResourcesAndActions());
    } catch (err) {
      handleError(err as Error);
      showError('Error al cargar recursos y acciones');
    }
  }, [dispatch, handleError, showError]);

  useEffect(() => {
    if (permission) {
      setResource(permission.resource);
      setAction(permission.action);
      setDescription(permission.description || '');
    } else {
      resetForm();
    }
  }, [permission]);

  const resetForm = () => {
    setResource('');
    setAction('');
    setDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const permissionData = {
        resource,
        action,
        description
      };

      if (isEditing && permission) {
        await dispatch(updatePermission({ 
          permissionId: permission._id, 
          permissionData: { description } // Solo se puede actualizar la descripción
        })).unwrap();
        showSuccess(`Permiso ${permission.name} actualizado correctamente`);
      } else {
        const result = await dispatch(createPermission(permissionData)).unwrap();
        showSuccess(`Permiso ${result.name || generatePermissionName()} creado correctamente`);
      }
      
      onSave();
      resetForm();
    } catch (error) {
      handleError(error as Error);
      showError(isEditing 
        ? 'Error al actualizar el permiso' 
        : 'Error al crear el permiso');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePermissionName = () => {
    if (!resource || !action) return '';
    return `${resource}_${action}`;
  };

  return (
    <div className="bg-white rounded shadow p-6 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-6">
        {isEditing ? `Editar Permiso: ${permission?.name}` : 'Crear Nuevo Permiso'}
      </h2>

      {(reduxError || apiError) && (
        <Alert 
          color="red" 
          title="Error" 
          withCloseButton
          onClose={clearError}
        >
          {reduxError || apiError?.message || 'Ha ocurrido un error'}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="resource" className="block text-gray-700 mb-1">
            Recurso <span className="text-red-500">*</span>
          </label>
          <select
            id="resource"
            value={resource}
            onChange={(e) => setResource(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isEditing} // No se puede editar en modo edición
          >
            <option value="">Seleccionar recurso</option>
            {resources.map((res) => (
              <option key={res} value={res}>
                {res}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="action" className="block text-gray-700 mb-1">
            Acción <span className="text-red-500">*</span>
          </label>
          <select
            id="action"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isEditing} // No se puede editar en modo edición
          >
            <option value="">Seleccionar acción</option>
            {actions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>

        {!isEditing && (
          <div className="mb-4">
            <label htmlFor="permissionName" className="block text-gray-700 mb-1">
              Nombre del Permiso
            </label>
            <input
              id="permissionName"
              type="text"
              value={generatePermissionName()}
              className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">
              El nombre del permiso se genera automáticamente a partir del recurso y la acción
            </p>
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="description" className="block text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Descripción del permiso"
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" onClick={onCancel} variant="secondary">
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={(isEditing ? false : !resource || !action) || isSubmitting}
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
            {isEditing ? 'Actualizar' : 'Crear'} Permiso
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PermissionForm;
