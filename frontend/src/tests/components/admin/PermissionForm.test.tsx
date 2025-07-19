import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import PermissionForm from '../../../components/admin/PermissionForm';
import { createPermission, updatePermission } from '../../../store/slices/permissionSlice';

// Mock de redux-thunk
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Mock de las acciones
jest.mock('../../../store/slices/permissionSlice', () => ({
  createPermission: jest.fn(),
  updatePermission: jest.fn(),
}));

describe('PermissionForm Component', () => {
  const mockOnSubmitComplete = jest.fn();
  const mockOnCancel = jest.fn();
  
  const initialState = {
    permissions: {
      permissions: [],
      loading: false,
      error: null,
    },
  };
  
  let store: any;
  
  beforeEach(() => {
    store = mockStore(initialState);
    (createPermission as jest.Mock).mockReturnValue({ type: 'permissions/createPermission' });
    (updatePermission as jest.Mock).mockReturnValue({ type: 'permissions/updatePermission' });
    
    // Espía en las acciones del store
    store.dispatch = jest.fn().mockResolvedValue({});
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza el formulario de creación correctamente', () => {
    render(
      <Provider store={store}>
        <PermissionForm onSubmitComplete={mockOnSubmitComplete} onCancel={mockOnCancel} />
      </Provider>
    );
    
    // Verificar que el título está presente
    expect(screen.getByText('Crear Permiso')).toBeInTheDocument();
    
    // Verificar que los campos están presentes
    expect(screen.getByLabelText('Recurso:')).toBeInTheDocument();
    expect(screen.getByLabelText('Acción:')).toBeInTheDocument();
    expect(screen.getByLabelText('Descripción:')).toBeInTheDocument();
    
    // Verificar que los botones están presentes
    expect(screen.getByText('Guardar')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });
  
  it('renderiza el formulario de edición correctamente', () => {
    const permissionToEdit = {
      _id: 'perm1',
      name: 'user:read',
      resource: 'user',
      action: 'read',
      description: 'Ver usuarios',
    };
    
    render(
      <Provider store={store}>
        <PermissionForm 
          onSubmitComplete={mockOnSubmitComplete} 
          onCancel={mockOnCancel} 
          permissionToEdit={permissionToEdit}
        />
      </Provider>
    );
    
    // Verificar que el título está presente
    expect(screen.getByText('Editar Permiso')).toBeInTheDocument();
    
    // Verificar que los campos tienen los valores correctos
    const resourceInput = screen.getByLabelText('Recurso:') as HTMLInputElement;
    expect(resourceInput.value).toBe('user');
    
    const actionInput = screen.getByLabelText('Acción:') as HTMLInputElement;
    expect(actionInput.value).toBe('read');
    
    const descriptionInput = screen.getByLabelText('Descripción:') as HTMLInputElement;
    expect(descriptionInput.value).toBe('Ver usuarios');
  });
  
  it('construye el nombre del permiso automáticamente', () => {
    render(
      <Provider store={store}>
        <PermissionForm onSubmitComplete={mockOnSubmitComplete} onCancel={mockOnCancel} />
      </Provider>
    );
    
    // Rellenar el formulario
    const resourceInput = screen.getByLabelText('Recurso:');
    fireEvent.change(resourceInput, { target: { value: 'budget' } });
    
    const actionInput = screen.getByLabelText('Acción:');
    fireEvent.change(actionInput, { target: { value: 'create' } });
    
    // Verificar que el nombre se construye correctamente
    const nameDisplay = screen.getByText('budget:create');
    expect(nameDisplay).toBeInTheDocument();
  });
  
  it('llama a createPermission cuando se envía el formulario de creación', async () => {
    render(
      <Provider store={store}>
        <PermissionForm onSubmitComplete={mockOnSubmitComplete} onCancel={mockOnCancel} />
      </Provider>
    );
    
    // Rellenar el formulario
    const resourceInput = screen.getByLabelText('Recurso:');
    fireEvent.change(resourceInput, { target: { value: 'budget' } });
    
    const actionInput = screen.getByLabelText('Acción:');
    fireEvent.change(actionInput, { target: { value: 'create' } });
    
    const descriptionInput = screen.getByLabelText('Descripción:');
    fireEvent.change(descriptionInput, { target: { value: 'Crear presupuestos' } });
    
    // Enviar el formulario
    const submitButton = screen.getByText('Guardar');
    fireEvent.click(submitButton);
    
    // Verificar que se llama a createPermission con los datos correctos
    expect(store.dispatch).toHaveBeenCalled();
    expect(createPermission).toHaveBeenCalledWith({
      resource: 'budget',
      action: 'create',
      description: 'Crear presupuestos',
      name: 'budget:create',
    });
    
    // Verificar que se llama a onSubmitComplete después de crear
    await waitFor(() => {
      expect(mockOnSubmitComplete).toHaveBeenCalled();
    });
  });
  
  it('llama a updatePermission cuando se envía el formulario de edición', async () => {
    const permissionToEdit = {
      _id: 'perm1',
      name: 'user:read',
      resource: 'user',
      action: 'read',
      description: 'Ver usuarios',
    };
    
    render(
      <Provider store={store}>
        <PermissionForm 
          onSubmitComplete={mockOnSubmitComplete} 
          onCancel={mockOnCancel} 
          permissionToEdit={permissionToEdit}
        />
      </Provider>
    );
    
    // Modificar el formulario
    const descriptionInput = screen.getByLabelText('Descripción:');
    fireEvent.change(descriptionInput, { target: { value: 'Leer información de usuarios' } });
    
    // Enviar el formulario
    const submitButton = screen.getByText('Guardar');
    fireEvent.click(submitButton);
    
    // Verificar que se llama a updatePermission con los datos correctos
    expect(store.dispatch).toHaveBeenCalled();
    expect(updatePermission).toHaveBeenCalledWith({
      _id: 'perm1',
      name: 'user:read',
      resource: 'user',
      action: 'read',
      description: 'Leer información de usuarios',
    });
    
    // Verificar que se llama a onSubmitComplete después de actualizar
    await waitFor(() => {
      expect(mockOnSubmitComplete).toHaveBeenCalled();
    });
  });
  
  it('llama a onCancel cuando se hace clic en el botón cancelar', () => {
    render(
      <Provider store={store}>
        <PermissionForm onSubmitComplete={mockOnSubmitComplete} onCancel={mockOnCancel} />
      </Provider>
    );
    
    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });
  
  it('muestra mensajes de error cuando los campos están vacíos', async () => {
    render(
      <Provider store={store}>
        <PermissionForm onSubmitComplete={mockOnSubmitComplete} onCancel={mockOnCancel} />
      </Provider>
    );
    
    // Enviar el formulario sin rellenar campos
    const submitButton = screen.getByText('Guardar');
    fireEvent.click(submitButton);
    
    // Verificar que se muestran los mensajes de error
    await waitFor(() => {
      expect(screen.getByText('El recurso es obligatorio')).toBeInTheDocument();
      expect(screen.getByText('La acción es obligatoria')).toBeInTheDocument();
      expect(screen.getByText('La descripción es obligatoria')).toBeInTheDocument();
    });
    
    // Verificar que no se llama a createPermission
    expect(createPermission).not.toHaveBeenCalled();
  });
  
  it('desactiva los campos de recurso y acción en modo edición', () => {
    const permissionToEdit = {
      _id: 'perm1',
      name: 'user:read',
      resource: 'user',
      action: 'read',
      description: 'Ver usuarios',
    };
    
    render(
      <Provider store={store}>
        <PermissionForm 
          onSubmitComplete={mockOnSubmitComplete} 
          onCancel={mockOnCancel} 
          permissionToEdit={permissionToEdit}
        />
      </Provider>
    );
    
    const resourceInput = screen.getByLabelText('Recurso:') as HTMLInputElement;
    expect(resourceInput.disabled).toBeTruthy();
    
    const actionInput = screen.getByLabelText('Acción:') as HTMLInputElement;
    expect(actionInput.disabled).toBeTruthy();
  });
});
