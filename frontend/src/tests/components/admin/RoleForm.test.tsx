import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import RoleForm from '../../../components/admin/RoleForm';
import { createRole, updateRole } from '../../../store/slices/roleSlice';
import { fetchPermissions } from '../../../store/slices/permissionSlice';

// Mock de redux-thunk
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Mock de las acciones
jest.mock('../../../store/slices/roleSlice', () => ({
  createRole: jest.fn(),
  updateRole: jest.fn(),
}));

jest.mock('../../../store/slices/permissionSlice', () => ({
  fetchPermissions: jest.fn(),
  selectPermissions: (state: any) => state.permissions.permissions,
  selectPermissionsLoading: (state: any) => state.permissions.loading,
}));

describe('RoleForm Component', () => {
  const mockOnSubmitComplete = jest.fn();
  const mockOnCancel = jest.fn();
  
  const initialState = {
    permissions: {
      permissions: [
        { _id: 'perm1', name: 'user:read', resource: 'user', action: 'read', description: 'Ver usuarios' },
        { _id: 'perm2', name: 'user:write', resource: 'user', action: 'write', description: 'Editar usuarios' },
        { _id: 'perm3', name: 'role:read', resource: 'role', action: 'read', description: 'Ver roles' },
      ],
      loading: false,
      error: null,
    },
    roles: {
      roles: [],
      loading: false,
      error: null,
    },
  };
  
  let store: any;
  
  beforeEach(() => {
    store = mockStore(initialState);
    (createRole as jest.Mock).mockReturnValue({ type: 'roles/createRole' });
    (updateRole as jest.Mock).mockReturnValue({ type: 'roles/updateRole' });
    (fetchPermissions as jest.Mock).mockReturnValue({ type: 'permissions/fetchPermissions' });
    
    // Espía en las acciones del store
    store.dispatch = jest.fn();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza el formulario de creación correctamente', () => {
    render(
      <Provider store={store}>
        <RoleForm onSubmitComplete={mockOnSubmitComplete} onCancel={mockOnCancel} />
      </Provider>
    );
    
    // Verificar que el título está presente
    expect(screen.getByText('Crear Rol')).toBeInTheDocument();
    
    // Verificar que los campos están presentes
    expect(screen.getByLabelText('Nombre:')).toBeInTheDocument();
    expect(screen.getByLabelText('Descripción:')).toBeInTheDocument();
    
    // Verificar que los botones están presentes
    expect(screen.getByText('Guardar')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });
  
  it('renderiza el formulario de edición correctamente', () => {
    const roleToEdit = {
      _id: 'role1',
      name: 'editor',
      description: 'Editor de contenido',
      permissions: ['perm1', 'perm2'],
      isSystemRole: false,
    };
    
    render(
      <Provider store={store}>
        <RoleForm 
          onSubmitComplete={mockOnSubmitComplete} 
          onCancel={mockOnCancel} 
          roleToEdit={roleToEdit}
        />
      </Provider>
    );
    
    // Verificar que el título está presente
    expect(screen.getByText('Editar Rol')).toBeInTheDocument();
    
    // Verificar que los campos tienen los valores correctos
    const nameInput = screen.getByLabelText('Nombre:') as HTMLInputElement;
    expect(nameInput.value).toBe('editor');
    
    const descriptionInput = screen.getByLabelText('Descripción:') as HTMLInputElement;
    expect(descriptionInput.value).toBe('Editor de contenido');
  });
  
  it('llama a fetchPermissions al montarse', () => {
    render(
      <Provider store={store}>
        <RoleForm onSubmitComplete={mockOnSubmitComplete} onCancel={mockOnCancel} />
      </Provider>
    );
    
    expect(store.dispatch).toHaveBeenCalledWith({ type: 'permissions/fetchPermissions' });
  });
  
  it('llama a createRole cuando se envía el formulario de creación', async () => {
    render(
      <Provider store={store}>
        <RoleForm onSubmitComplete={mockOnSubmitComplete} onCancel={mockOnCancel} />
      </Provider>
    );
    
    // Rellenar el formulario
    const nameInput = screen.getByLabelText('Nombre:');
    fireEvent.change(nameInput, { target: { value: 'new-role' } });
    
    const descriptionInput = screen.getByLabelText('Descripción:');
    fireEvent.change(descriptionInput, { target: { value: 'Nueva descripción' } });
    
    // Seleccionar permisos
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // Seleccionar el primer permiso
    
    // Enviar el formulario
    const submitButton = screen.getByText('Guardar');
    fireEvent.click(submitButton);
    
    // Verificar que se llama a createRole con los datos correctos
    expect(store.dispatch).toHaveBeenCalled();
    expect(createRole).toHaveBeenCalledWith({
      name: 'new-role',
      description: 'Nueva descripción',
      permissions: ['perm1'],
    });
    
    // Verificar que se llama a onSubmitComplete después de crear
    await waitFor(() => {
      expect(mockOnSubmitComplete).toHaveBeenCalled();
    });
  });
  
  it('llama a updateRole cuando se envía el formulario de edición', async () => {
    const roleToEdit = {
      _id: 'role1',
      name: 'editor',
      description: 'Editor de contenido',
      permissions: ['perm1'],
      isSystemRole: false,
    };
    
    render(
      <Provider store={store}>
        <RoleForm 
          onSubmitComplete={mockOnSubmitComplete} 
          onCancel={mockOnCancel} 
          roleToEdit={roleToEdit}
        />
      </Provider>
    );
    
    // Modificar el formulario
    const descriptionInput = screen.getByLabelText('Descripción:');
    fireEvent.change(descriptionInput, { target: { value: 'Descripción actualizada' } });
    
    // Seleccionar un permiso adicional
    const checkboxes = screen.getAllByRole('checkbox');
    // El primer permiso ya debería estar seleccionado
    fireEvent.click(checkboxes[1]); // Seleccionar el segundo permiso
    
    // Enviar el formulario
    const submitButton = screen.getByText('Guardar');
    fireEvent.click(submitButton);
    
    // Verificar que se llama a updateRole con los datos correctos
    expect(store.dispatch).toHaveBeenCalled();
    expect(updateRole).toHaveBeenCalledWith({
      _id: 'role1',
      name: 'editor',
      description: 'Descripción actualizada',
      permissions: ['perm1', 'perm2'],
      isSystemRole: false,
    });
    
    // Verificar que se llama a onSubmitComplete después de actualizar
    await waitFor(() => {
      expect(mockOnSubmitComplete).toHaveBeenCalled();
    });
  });
  
  it('llama a onCancel cuando se hace clic en el botón cancelar', () => {
    render(
      <Provider store={store}>
        <RoleForm onSubmitComplete={mockOnSubmitComplete} onCancel={mockOnCancel} />
      </Provider>
    );
    
    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });
  
  it('filtra permisos cuando se busca', () => {
    render(
      <Provider store={store}>
        <RoleForm onSubmitComplete={mockOnSubmitComplete} onCancel={mockOnCancel} />
      </Provider>
    );
    
    // Buscar permisos
    const searchInput = screen.getByPlaceholderText('Buscar permisos...');
    fireEvent.change(searchInput, { target: { value: 'user' } });
    
    // Verificar que solo se muestran los permisos de usuario
    expect(screen.getByText('user:read')).toBeInTheDocument();
    expect(screen.getByText('user:write')).toBeInTheDocument();
    expect(screen.queryByText('role:read')).not.toBeInTheDocument();
  });
  
  it('muestra mensaje cuando no hay permisos', () => {
    const emptyStore = mockStore({
      permissions: {
        permissions: [],
        loading: false,
        error: null,
      },
      roles: {
        roles: [],
        loading: false,
        error: null,
      },
    });
    
    render(
      <Provider store={emptyStore}>
        <RoleForm onSubmitComplete={mockOnSubmitComplete} onCancel={mockOnCancel} />
      </Provider>
    );
    
    expect(screen.getByText('No hay permisos disponibles')).toBeInTheDocument();
  });
});
