/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../api';
import type { AxiosError } from 'axios';

export interface User {
  id: string | null;
  name: string | null;
  email: string | null;
  roles: string[];
}

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  refreshToken: null,
  user: {
    id: null,
    name: null,
    email: null,
    roles: [],
  },
  status: 'idle',
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      if (!error.response) {
        throw error;
      }
      return rejectWithValue(error.response.data);
    }
  }
);

export const refreshTokens = createAsyncThunk(
  'auth/refresh',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      if (!state.auth.refreshToken) {
        throw new Error('No refresh token available');
      }
      const response = await api.post('/auth/refresh', {
        refreshToken: state.auth.refreshToken,
      });
      return response.data;
    } catch (error: any) {
      if (!error.response) {
        throw error;
      }
      return rejectWithValue(error.response.data);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout');
    return null;
  } catch (error: any) {
    if (!error.response) {
      throw error;
    }
    return rejectWithValue(error.response.data || { message: 'Error al cerrar sesión' });
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<{ token: string; refreshToken: string }>) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      localStorage.setItem('token', action.payload.token);
    },
    clearAuth: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = {
        id: null,
        name: null,
        email: null,
        roles: [],
      };
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.error = null;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as { message: string })?.message || 'Login failed';
      })
      
      // Refresh Tokens
      .addCase(refreshTokens.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(refreshTokens.rejected, (state) => {
        state.token = null;
        state.refreshToken = null;
        state.user = {
          id: null,
          name: null,
          email: null,
          roles: [],
        };
        localStorage.removeItem('token');
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.refreshToken = null;
        state.user = {
          id: null,
          name: null,
          email: null,
          roles: [],
        };
        state.status = 'idle';
        state.error = null;
        localStorage.removeItem('token');
      });
  },
});

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectCurrentToken = (state: { auth: AuthState }) => state.auth.token;
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => !!state.auth.token;
export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

export const selectUserRoles = createSelector(
  [selectCurrentUser],
  (user) => user.roles
);

export const selectHasRole = (role: string) => 
  createSelector(
    [selectUserRoles],
    (roles) => roles.includes(role)
  );

export const { clearError, clearAuth, setToken } = authSlice.actions;
export default authSlice.reducer;
