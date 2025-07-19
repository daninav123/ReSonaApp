import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import { api } from '../../api';

interface UserState {
  user: {
    id: string | null;
    name: string | null;
    email: string | null;
    roles: string[];
    preferences: {
      theme: 'light' | 'dark';
      notifications: boolean;
      language: 'es' | 'en';
    };
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: {
    id: null,
    name: null,
    email: null,
    roles: [],
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'es',
    },
  },
  isLoading: false,
  error: null,
};

export const fetchUser = createAsyncThunk(
  'user/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      if (!axiosError.response) {
        throw axiosError;
      }
      return rejectWithValue(axiosError.response?.data || { message: 'Error al cargar el usuario' });
    }
  }
);

export const updateUser = createAsyncThunk(
  'user/update',
  async (userData: Partial<UserState['user']>, { rejectWithValue }) => {
    try {
      const response = await api.patch('/users/me', userData);
      return response.data;
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      if (!axiosError.response) {
        throw axiosError;
      }
      return rejectWithValue(axiosError.response?.data || { message: 'Error al actualizar el usuario' });
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateUserState: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    updatePreferences: (state, action) => {
      state.user.preferences = { ...state.user.preferences, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch user';
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { updateUserState, updatePreferences } = userSlice.actions;
export default userSlice.reducer;
