import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import UserRoleSelector from '../../../components/admin/UserRoleSelector';
import { fetchRoles } from '../../../store/slices/roleSlice';

// Mock de redux-thunk
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Mock de las acciones
jest.mock('../../../store/slices/roleSlice', () => ({
  fetchRoles: jest.fn(),
  selectRoles: (state: any) => state.roles.roles,
  selectRolesLoading: (state: any) => state.roles.loading,
}));

describe('UserRoleSelector Component', () => {
  const mockOnChange = jest.fn();
  
  const initialState = {
    roles: {
      roles: [
        { _id: 'role1', name: 'admin', description: 'Administrador', permissions: ['perm1', 'perm2'], isSystemRole: true },
        { _id: 'role2', name: 'user', description: 'Usuario', permissions: ['perm1'], isSystemRole: false },
        { _id: 'role3', name: 'editor', description: 'Editor', permissions: ['perm3', 'perm4'], isSystemRole: false },
      ],
      loading: false,
      error: null,
    },
  };
  
  let store: any;
  
  beforeEach(() => {
    store = mockStore(initialState);
    (fetchRoles as jest.Mock).mockReturnValue({ type: 'roles/fetchRoles' });
    
    // Espía en las acciones del store
    store.dispatch = jest.fn();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza el selector de roles correctamente', () => {
    render(
      <Provider store={store}>
        <UserRoleSelector selectedRoles={[]} onChange={mockOnChange} />
      </Provider>
    );
    
    // Verificar que el título está presente
    expect(screen.getByText('Roles')).toBeInTheDocument();
    
    // Verificar que el campo de búsqueda está presente
    expect(screen.getByPlaceholderText('Buscar roles...')).toBeInTheDocument();
    
    // Verificar que los roles se muestran
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('user')).toBeInTheDocument();
    expect(screen.getByText('editor')).toBeInTheDocument();
  });
  
  it('muestra los roles seleccionados correctamente', () => {
    render(
      <Provider store={store}>
        <UserRoleSelector selectedRoles={['admin', 'editor']} onChange={mockOnChange} />
      </Provider>
    );
    
    // Verificar que los roles seleccionados tienen la clase correcta
    const adminRole = screen.getByText('admin').closest('li');
    const editorRole = screen.getByText('editor').closest('li');
    
    expect(adminRole).toHaveClass('selected-role');
    expect(editorRole).toHaveClass('selected-role');
  });
  
  it('llama a fetchRoles al montarse', () => {
    render(
      <Provider store={store}>
        <UserRoleSelector selectedRoles={[]} onChange={mockOnChange} />
      </Provider>
    );
    
    expect(store.dispatch).toHaveBeenCalledWith({ type: 'roles/fetchRoles' });
  });
  
  it('llama a onChange cuando se selecciona un rol', () => {
    render(
      <Provider store={store}>
        <UserRoleSelector selectedRoles={[]} onChange={mockOnChange} />
      </Provider>
    );
    
    // Hacer clic en un rol para seleccionarlo
    const userRole = screen.getByText('user');
    fireEvent.click(userRole);
    
    // Verificar que se llama a onChange con el nuevo rol seleccionado
    expect(mockOnChange).toHaveBeenCalledWith(['user']);
  });
  
  it('llama a onChange cuando se deselecciona un rol', () => {
    render(
      <Provider store={store}>
        <UserRoleSelector selectedRoles={['admin', 'user']} onChange={mockOnChange} />
      </Provider>
    );
    
    // Hacer clic en un rol para deseleccionarlo
    const userRole = screen.getByText('user');
    fireEvent.click(userRole);
    
    // Verificar que se llama a onChange con el rol eliminado
    expect(mockOnChange).toHaveBeenCalledWith(['admin']);
  });
  
  it('filtra roles cuando se busca por nombre', () => {
    render(
      <Provider store={store}>
        <UserRoleSelector selectedRoles={[]} onChange={mockOnChange} />
      </Provider>
    );
    
    const searchInput = screen.getByPlaceholderText('Buscar roles...');
    fireEvent.change(searchInput, { target: { value: 'admin' } });
    
    // Verificar que solo se muestra el rol admin
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.queryByText('user')).not.toBeInTheDocument();
    expect(screen.queryByText('editor')).not.toBeInTheDocument();
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
        <UserRoleSelector selectedRoles={[]} onChange={mockOnChange} />
      </Provider>
    );
    
    expect(screen.getByText('No hay roles disponibles')).toBeInTheDocument();
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
        <UserRoleSelector selectedRoles={[]} onChange={mockOnChange} />
      </Provider>
    );
    
    expect(screen.getByText('Cargando roles...')).toBeInTheDocument();
  });
});
