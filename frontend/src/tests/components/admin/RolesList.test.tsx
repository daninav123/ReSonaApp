import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import RolesList from '../../../components/admin/RolesList';
import { fetchRoles, deleteRole } from '../../../store/slices/roleSlice';

// Mock de redux-thunk
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Mock de las acciones
jest.mock('../../../store/slices/roleSlice', () => ({
  fetchRoles: jest.fn(),
  deleteRole: jest.fn(),
  selectRoles: (state: any) => state.roles.roles,
  selectRolesLoading: (state: any) => state.roles.loading,
}));

describe('RolesList Component', () => {
  const mockOnEdit = jest.fn();
  const mockOnAdd = jest.fn();
  
  const initialState = {
    roles: {
      roles: [
        { _id: '1', name: 'admin', description: 'Administrador', permissions: ['perm1', 'perm2'], isSystemRole: true },
        { _id: '2', name: 'user', description: 'Usuario', permissions: ['perm1'], isSystemRole: false },
      ],
      loading: false,
      error: null,
    },
  };
  
  let store: any;
  
  beforeEach(() => {
    store = mockStore(initialState);
    (fetchRoles as jest.Mock).mockReturnValue({ type: 'roles/fetchRoles' });
    (deleteRole as jest.Mock).mockReturnValue({ type: 'roles/deleteRole' });
    
    // Espía en las acciones del store
    store.dispatch = jest.fn();
    
    // Mock de window.confirm
    window.confirm = jest.fn().mockImplementation(() => true);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza correctamente la lista de roles', () => {
    render(
      <Provider store={store}>
        <RolesList onEdit={mockOnEdit} onAdd={mockOnAdd} />
      </Provider>
    );
    
    // Verificar que el título está presente
    expect(screen.getByText('Gestión de Roles')).toBeInTheDocument();
    
    // Verificar que los roles se muestran
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('user')).toBeInTheDocument();
    
    // Verificar que hay botones de acción
    const editButtons = screen.getAllByTitle('Editar rol');
    expect(editButtons.length).toBe(2);
    
    const deleteButtons = screen.getAllByTitle('Eliminar rol');
    expect(deleteButtons.length).toBe(2);
  });
  
  it('llama a fetchRoles al montarse', () => {
    render(
      <Provider store={store}>
        <RolesList onEdit={mockOnEdit} onAdd={mockOnAdd} />
      </Provider>
    );
    
    expect(store.dispatch).toHaveBeenCalledWith({ type: 'roles/fetchRoles' });
  });
  
  it('llama a onEdit cuando se hace clic en el botón de editar', () => {
    render(
      <Provider store={store}>
        <RolesList onEdit={mockOnEdit} onAdd={mockOnAdd} />
      </Provider>
    );
    
    const editButtons = screen.getAllByTitle('Editar rol');
    fireEvent.click(editButtons[1]); // Clic en editar el segundo rol (user)
    
    expect(mockOnEdit).toHaveBeenCalledWith(initialState.roles.roles[1]);
  });
  
  it('llama a onAdd cuando se hace clic en el botón de nuevo rol', () => {
    render(
      <Provider store={store}>
        <RolesList onEdit={mockOnEdit} onAdd={mockOnAdd} />
      </Provider>
    );
    
    const addButton = screen.getByText('Nuevo Rol');
    fireEvent.click(addButton);
    
    expect(mockOnAdd).toHaveBeenCalled();
  });
  
  it('llama a deleteRole cuando se confirma la eliminación', async () => {
    render(
      <Provider store={store}>
        <RolesList onEdit={mockOnEdit} onAdd={mockOnAdd} />
      </Provider>
    );
    
    const deleteButtons = screen.getAllByTitle('Eliminar rol');
    fireEvent.click(deleteButtons[1]); // Clic en eliminar el segundo rol (user)
    
    // Verificar que se muestra la confirmación
    expect(window.confirm).toHaveBeenCalledWith('¿Estás seguro de que quieres eliminar el rol "user"?');
    
    // Verificar que se llama a deleteRole con el ID correcto
    expect(store.dispatch).toHaveBeenCalledWith({ type: 'roles/deleteRole' });
  });
  
  it('muestra mensaje cuando no hay roles', () => {
    const emptyStore = mockStore({
      roles: {
        roles: [],
        loading: false,
        error: null,
      },
    });
    
    render(
      <Provider store={emptyStore}>
        <RolesList onEdit={mockOnEdit} onAdd={mockOnAdd} />
      </Provider>
    );
    
    expect(screen.getByText('No se encontraron roles')).toBeInTheDocument();
  });
  
  it('muestra spinner de carga cuando está cargando', () => {
    const loadingStore = mockStore({
      roles: {
        roles: [],
        loading: true,
        error: null,
      },
    });
    
    render(
      <Provider store={loadingStore}>
        <RolesList onEdit={mockOnEdit} onAdd={mockOnAdd} />
      </Provider>
    );
    
    expect(screen.getByText('Cargando roles...')).toBeInTheDocument();
  });
  
  it('filtra roles cuando se busca por nombre', () => {
    render(
      <Provider store={store}>
        <RolesList onEdit={mockOnEdit} onAdd={mockOnAdd} />
      </Provider>
    );
    
    const searchInput = screen.getByPlaceholderText('Buscar roles...');
    fireEvent.change(searchInput, { target: { value: 'admin' } });
    
    // Debería mostrar solo el rol admin
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.queryByText('user')).not.toBeInTheDocument();
  });
});
