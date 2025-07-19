import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import PermissionsList from '../../../components/admin/PermissionsList';
import { fetchPermissions, deletePermission } from '../../../store/slices/permissionSlice';

// Mock de redux-thunk
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Mock de las acciones
jest.mock('../../../store/slices/permissionSlice', () => ({
  fetchPermissions: jest.fn(),
  deletePermission: jest.fn(),
  selectPermissions: (state: any) => state.permissions.permissions,
  selectPermissionsLoading: (state: any) => state.permissions.loading,
}));

describe('PermissionsList Component', () => {
  const mockOnEdit = jest.fn();
  const mockOnAdd = jest.fn();
  
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
  };
  
  let store: any;
  
  beforeEach(() => {
    store = mockStore(initialState);
    (fetchPermissions as jest.Mock).mockReturnValue({ type: 'permissions/fetchPermissions' });
    (deletePermission as jest.Mock).mockReturnValue({ type: 'permissions/deletePermission' });
    
    // Espía en las acciones del store
    store.dispatch = jest.fn();
    
    // Mock de window.confirm
    window.confirm = jest.fn().mockImplementation(() => true);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza correctamente la lista de permisos', () => {
    render(
      <Provider store={store}>
        <PermissionsList onEdit={mockOnEdit} onAdd={mockOnAdd} />
      </Provider>
    );
    
    // Verificar que el título está presente
    expect(screen.getByText('Gestión de Permisos')).toBeInTheDocument();
    
    // Verificar que los permisos se muestran
    expect(screen.getByText('user:read')).toBeInTheDocument();
    expect(screen.getByText('user:write')).toBeInTheDocument();
    expect(screen.getByText('role:read')).toBeInTheDocument();
    
    // Verificar que hay botones de acción
    const editButtons = screen.getAllByTitle('Editar permiso');
    expect(editButtons.length).toBe(3);
    
    const deleteButtons = screen.getAllByTitle('Eliminar permiso');
    expect(deleteButtons.length).toBe(3);
  });
  
  it('llama a fetchPermissions al montarse', () => {
    render(
      <Provider store={store}>
        <PermissionsList onEdit={mockOnEdit} onAdd={mockOnAdd} />
      </Provider>
    );
    
    expect(store.dispatch).toHaveBeenCalledWith({ type: 'permissions/fetchPermissions' });
  });
  
  it('llama a onEdit cuando se hace clic en el botón de editar', () => {
    render(
      <Provider store={store}>
        <PermissionsList onEdit={mockOnEdit} onAdd={mockOnAdd} />
      </Provider>
    );
    
    const editButtons = screen.getAllByTitle('Editar permiso');
    fireEvent.click(editButtons[1]); // Clic en editar el segundo permiso
    
    expect(mockOnEdit).toHaveBeenCalledWith(initialState.permissions.permissions[1]);
  });
  
  it('llama a onAdd cuando se hace clic en el botón de nuevo permiso', () => {
    render(
      <Provider store={store}>
        <PermissionsList onEdit={mockOnEdit} onAdd={mockOnAdd} />
      </Provider>
    );
    
    const addButton = screen.getByText('Nuevo Permiso');
    fireEvent.click(addButton);
    
    expect(mockOnAdd).toHaveBeenCalled();
  });
  
  it('llama a deletePermission cuando se confirma la eliminación', () => {
    render(
      <Provider store={store}>
        <PermissionsList onEdit={mockOnEdit} onAdd={mockOnAdd} />
      </Provider>
    );
    
    const deleteButtons = screen.getAllByTitle('Eliminar permiso');
    fireEvent.click(deleteButtons[1]); // Clic en eliminar el segundo permiso
    
    // Verificar que se muestra la confirmación
    expect(window.confirm).toHaveBeenCalledWith('¿Estás seguro de que quieres eliminar el permiso "user:write"?');
    
    // Verificar que se llama a deletePermission con el ID correcto
    expect(store.dispatch).toHaveBeenCalledWith({ type: 'permissions/deletePermission' });
  });
  
  it('muestra mensaje cuando no hay permisos', () => {
    const emptyStore = mockStore({
      permissions: {
        permissions: [],
        loading: false,
        error: null,
      },
    });
    
    render(
      <Provider store={emptyStore}>
        <PermissionsList onEdit={mockOnEdit} onAdd={mockOnAdd} />
      </Provider>
    );
    
    expect(screen.getByText('No se encontraron permisos')).toBeInTheDocument();
  });
  
  it('muestra spinner de carga cuando está cargando', () => {
    const loadingStore = mockStore({
      permissions: {
        permissions: [],
        loading: true,
        error: null,
      },
    });
    
    render(
      <Provider store={loadingStore}>
        <PermissionsList onEdit={mockOnEdit} onAdd={mockOnAdd} />
      </Provider>
    );
    
    expect(screen.getByText('Cargando permisos...')).toBeInTheDocument();
  });
  
  it('filtra permisos cuando se busca por nombre, recurso o acción', () => {
    render(
      <Provider store={store}>
        <PermissionsList onEdit={mockOnEdit} onAdd={mockOnAdd} />
      </Provider>
    );
    
    const searchInput = screen.getByPlaceholderText('Buscar permisos...');
    
    // Buscar por nombre
    fireEvent.change(searchInput, { target: { value: 'user:read' } });
    expect(screen.getByText('user:read')).toBeInTheDocument();
    expect(screen.queryByText('user:write')).not.toBeInTheDocument();
    
    // Buscar por recurso
    fireEvent.change(searchInput, { target: { value: 'user' } });
    expect(screen.getByText('user:read')).toBeInTheDocument();
    expect(screen.getByText('user:write')).toBeInTheDocument();
    expect(screen.queryByText('role:read')).not.toBeInTheDocument();
    
    // Buscar por acción
    fireEvent.change(searchInput, { target: { value: 'read' } });
    expect(screen.getByText('user:read')).toBeInTheDocument();
    expect(screen.getByText('role:read')).toBeInTheDocument();
    expect(screen.queryByText('user:write')).not.toBeInTheDocument();
  });
});
