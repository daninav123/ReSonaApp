import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import { api } from '../../api';
import type { IRole } from '../../types/role';

interface RoleState {
  roles: IRole[];
  selectedRole: IRole | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: RoleState = {
  roles: [],
  selectedRole: null,
  isLoading: false,
  error: null,
};

// Thunks
export const fetchRoles = createAsyncThunk(
  'roles/fetchRoles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/roles');
      return response.data.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      if (!axiosError.response) {
        throw axiosError;
      }
      return rejectWithValue(axiosError.response?.data || { message: 'Error al cargar los roles' });
    }
  }
);

export const fetchRoleById = createAsyncThunk(
  'roles/fetchRoleById',
  async (roleId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/roles/${roleId}`);
      return response.data.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      if (!axiosError.response) {
        throw axiosError;
      }
      return rejectWithValue(axiosError.response?.data || { message: 'Error al cargar el rol' });
    }
  }
);

export const createRole = createAsyncThunk(
  'roles/createRole',
  async (roleData: Partial<IRole>, { rejectWithValue }) => {
    try {
      const response = await api.post('/roles', roleData);
      return response.data.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      if (!axiosError.response) {
        throw axiosError;
      }
      return rejectWithValue(axiosError.response?.data || { message: 'Error al crear el rol' });
    }
  }
);

export const updateRole = createAsyncThunk(
  'roles/updateRole',
  async ({ roleId, roleData }: { roleId: string; roleData: Partial<IRole> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/roles/${roleId}`, roleData);
      return response.data.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      if (!axiosError.response) {
        throw axiosError;
      }
      return rejectWithValue(axiosError.response?.data || { message: 'Error al actualizar el rol' });
    }
  }
);

export const deleteRole = createAsyncThunk(
  'roles/deleteRole',
  async (roleId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/roles/${roleId}`);
      return roleId;
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      if (!axiosError.response) {
        throw axiosError;
      }
      return rejectWithValue(axiosError.response?.data || { message: 'Error al eliminar el rol' });
    }
  }
);

// Slice
const roleSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    setSelectedRole: (state, action) => {
      state.selectedRole = action.payload;
    },
    clearSelectedRole: (state) => {
      state.selectedRole = null;
    },
    clearRoleError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch roles
      .addCase(fetchRoles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al cargar los roles';
      })
      
      // Fetch role by ID
      .addCase(fetchRoleById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoleById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedRole = action.payload;
      })
      .addCase(fetchRoleById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al cargar el rol';
      })
      
      // Create role
      .addCase(createRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roles.push(action.payload);
      })
      .addCase(createRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al crear el rol';
      })
      
      // Update role
      .addCase(updateRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.roles.findIndex(role => role._id === action.payload._id);
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
        if (state.selectedRole && state.selectedRole._id === action.payload._id) {
          state.selectedRole = action.payload;
        }
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al actualizar el rol';
      })
      
      // Delete role
      .addCase(deleteRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roles = state.roles.filter(role => role._id !== action.payload);
        if (state.selectedRole && state.selectedRole._id === action.payload) {
          state.selectedRole = null;
        }
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al eliminar el rol';
      });
  },
});

export const { setSelectedRole, clearSelectedRole, clearRoleError } = roleSlice.actions;
export default roleSlice.reducer;

// Selectors
export const selectRoles = (state: { roles: RoleState }) => state.roles.roles;
export const selectSelectedRole = (state: { roles: RoleState }) => state.roles.selectedRole;
export const selectRolesLoading = (state: { roles: RoleState }) => state.roles.isLoading;
export const selectRolesError = (state: { roles: RoleState }) => state.roles.error;
