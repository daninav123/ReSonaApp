import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRoles, selectRoles, selectRolesLoading } from '../../store/slices/roleSlice';
import { FiCheck, FiSearch, FiAlertCircle } from 'react-icons/fi';
import type { AppDispatch } from '../../store/store';
import useApiError from '../../hooks/useApiError';
import { useNotification } from '../../contexts/NotificationContext';

interface UserRoleSelectorProps {
  selectedRoles: string[];
  onChange: (roles: string[]) => void;
  className?: string;
}

const UserRoleSelector: React.FC<UserRoleSelectorProps> = ({ 
  selectedRoles, 
  onChange,
  className = '' 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const roles = useSelector(selectRoles);
  const isLoading = useSelector(selectRolesLoading);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Hooks para manejo de errores y notificaciones
  const { error, handleError, clearError } = useApiError();
  const { showError } = useNotification();

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

  const handleToggleRole = (roleName: string) => {
    const newSelectedRoles = selectedRoles.includes(roleName)
      ? selectedRoles.filter(r => r !== roleName)
      : [...selectedRoles, roleName];
    
    onChange(newSelectedRoles);
  };

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={`relative ${className}`}>
      <div 
        className="flex items-center justify-between border rounded px-3 py-2 cursor-pointer bg-white"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div className="flex flex-wrap gap-1">
          {selectedRoles.length === 0 ? (
            <span className="text-gray-400">Seleccionar roles</span>
          ) : (
            selectedRoles.map(role => (
              <span 
                key={role}
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
              >
                {role}
              </span>
            ))
          )}
        </div>
        <FiSearch className="text-gray-400" />
      </div>
      
      {error && (
        <div className="mt-1 text-sm text-red-600 flex items-center">
          <FiAlertCircle className="mr-1" />
          Error al cargar roles: {error.message}
        </div>
      )}

      {showDropdown && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg">
          <div className="p-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded px-3 py-1 text-sm"
              placeholder="Buscar roles..."
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-3 text-center text-sm text-gray-500">
                <svg className="animate-spin h-5 w-5 mx-auto mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cargando roles...
              </div>
            ) : filteredRoles.length === 0 ? (
              <div className="p-3 text-center text-sm text-gray-500">No se encontraron roles</div>
            ) : (
              <ul>
                {filteredRoles.map((role) => (
                  <li 
                    key={role._id}
                    className={`px-3 py-2 cursor-pointer flex items-center justify-between text-sm
                      ${selectedRoles.includes(role.name) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleRole(role.name);
                    }}
                  >
                    <div>
                      <div className="font-medium">{role.name}</div>
                      {role.description && (
                        <div className="text-xs text-gray-500">{role.description}</div>
                      )}
                    </div>
                    {selectedRoles.includes(role.name) && (
                      <FiCheck className="text-blue-500" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="p-2 border-t flex justify-between">
            <button
              className="py-1 px-3 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(false);
              }}
            >
              Cerrar
            </button>
            {error && (
              <button
                className="py-1 px-3 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  loadRoles();
                }}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reintentar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRoleSelector;
