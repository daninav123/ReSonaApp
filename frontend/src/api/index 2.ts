import axios from 'axios';
import { store } from '../store';
import { clearAuth } from '../store/slices/authSlice';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token en cada request
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    if (state.auth.token) {
      config.headers.Authorization = `Bearer ${state.auth.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const state = store.getState();
        if (!state.auth.refreshToken) {
          store.dispatch(clearAuth());
          throw new Error('No refresh token available');
        }

        const response = await api.post('/auth/refresh', {
          refreshToken: state.auth.refreshToken,
        });

        store.dispatch({
          type: 'auth/setToken',
          payload: {
            token: response.data.token,
            refreshToken: response.data.refreshToken,
          },
        });

        originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        store.dispatch(clearAuth());
        throw refreshError;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
