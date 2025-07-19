import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import { api } from '../../api';
import type { IPermission } from '../../types/role';

interface PermissionState {
  permissions: IPermission[];
  selectedPermission: IPermission | null;
  resources: string[];
  actions: string[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PermissionState = {
  permissions: [],
  selectedPermission: null,
  resources: [],
  actions: [],
  isLoading: false,
  error: null,
};

// Thunks
export const fetchPermissions = createAsyncThunk(
  'permissions/fetchPermissions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/permissions');
      return response.data.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      if (!axiosError.response) {
        throw axiosError;
      }
      return rejectWithValue(axiosError.response?.data || { message: 'Error al cargar los permisos' });
    }
  }
);

export const fetchPermissionById = createAsyncThunk(
  'permissions/fetchPermissionById',
  async (permissionId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/permissions/${permissionId}`);
      return response.data.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      if (!axiosError.response) {
        throw axiosError;
      }
      return rejectWithValue(axiosError.response?.data || { message: 'Error al cargar el permiso' });
    }
  }
);

export const fetchResourcesAndActions = createAsyncThunk(
  'permissions/fetchResourcesAndActions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/permissions/metadata/available');
      return response.data.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      if (!axiosError.response) {
        throw axiosError;
      }
      return rejectWithValue(axiosError.response?.data || { message: 'Error al cargar los recursos y acciones disponibles' });
    }
  }
);

export const createPermission = createAsyncThunk(
  'permissions/createPermission',
  async (permissionData: Partial<IPermission>, { rejectWithValue }) => {
    try {
      const response = await api.post('/permissions', permissionData);
      return response.data.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      if (!axiosError.response) {
        throw axiosError;
      }
      return rejectWithValue(axiosError.response?.data || { message: 'Error al crear el permiso' });
    }
  }
);

export const updatePermission = createAsyncThunk(
  'permissions/updatePermission',
  async ({ permissionId, permissionData }: { permissionId: string; permissionData: Partial<IPermission> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/permissions/${permissionId}`, permissionData);
      return response.data.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      if (!axiosError.response) {
        throw axiosError;
      }
      return rejectWithValue(axiosError.response?.data || { message: 'Error al actualizar el permiso' });
    }
  }
);

export const deletePermission = createAsyncThunk(
  'permissions/deletePermission',
  async (permissionId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/permissions/${permissionId}`);
      return permissionId;
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      if (!axiosError.response) {
        throw axiosError;
      }
      return rejectWithValue(axiosError.response?.data || { message: 'Error al eliminar el permiso' });
    }
  }
);

// Slice
const permissionSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    setSelectedPermission: (state, action) => {
      state.selectedPermission = action.payload;
    },
    clearSelectedPermission: (state) => {
      state.selectedPermission = null;
    },
    clearPermissionError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch permissions
      .addCase(fetchPermissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.permissions = action.payload;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al cargar los permisos';
      })
      
      // Fetch permission by ID
      .addCase(fetchPermissionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPermissionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedPermission = action.payload;
      })
      .addCase(fetchPermissionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al cargar el permiso';
      })
      
      // Fetch resources and actions
      .addCase(fetchResourcesAndActions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchResourcesAndActions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resources = action.payload.resources;
        state.actions = action.payload.actions;
      })
      .addCase(fetchResourcesAndActions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al cargar los recursos y acciones disponibles';
      })
      
      // Create permission
      .addCase(createPermission.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPermission.fulfilled, (state, action) => {
        state.isLoading = false;
        state.permissions.push(action.payload);
      })
      .addCase(createPermission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al crear el permiso';
      })
      
      // Update permission
      .addCase(updatePermission.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePermission.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.permissions.findIndex(permission => permission._id === action.payload._id);
        if (index !== -1) {
          state.permissions[index] = action.payload;
        }
        if (state.selectedPermission && state.selectedPermission._id === action.payload._id) {
          state.selectedPermission = action.payload;
        }
      })
      .addCase(updatePermission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al actualizar el permiso';
      })
      
      // Delete permission
      .addCase(deletePermission.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePermission.fulfilled, (state, action) => {
        state.isLoading = false;
        state.permissions = state.permissions.filter(permission => permission._id !== action.payload);
        if (state.selectedPermission && state.selectedPermission._id === action.payload) {
          state.selectedPermission = null;
        }
      })
      .addCase(deletePermission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al eliminar el permiso';
      });
  },
});

export const { setSelectedPermission, clearSelectedPermission, clearPermissionError } = permissionSlice.actions;
export default permissionSlice.reducer;

// Selectors
export const selectPermissions = (state: { permissions: PermissionState }) => state.permissions.permissions;
export const selectSelectedPermission = (state: { permissions: PermissionState }) => state.permissions.selectedPermission;
export const selectResources = (state: { permissions: PermissionState }) => state.permissions.resources;
export const selectActions = (state: { permissions: PermissionState }) => state.permissions.actions;
export const selectPermissionsLoading = (state: { permissions: PermissionState }) => state.permissions.isLoading;
export const selectPermissionsError = (state: { permissions: PermissionState }) => state.permissions.error;
