import { apiClient } from './axiosInstance';
import type { TokenResponse } from './axiosInstance';
import { store } from '../store';
import { clearAuth, setToken } from '../store/slices/authSlice';

// Function to setup API interceptors after store is available
export const setupApiInterceptors = () => {
  // Set up the refresh token callback
  apiClient.setOnRefreshToken(async () => {
    const state = store.getState();
    if (!state.auth.refreshToken) {
      store.dispatch(clearAuth());
      throw new Error('No refresh token available');
    }

    try {
      const response = await apiClient.getInstance().post<TokenResponse>('/auth/refresh', {
        refreshToken: state.auth.refreshToken,
      });

      // Update the store with the new tokens
      store.dispatch(setToken({
        token: response.data.token,
        refreshToken: response.data.refreshToken,
      }));

      return response.data;
    } catch (error) {
      store.dispatch(clearAuth());
      throw error;
    }
  });

  // Set up the unauthorized callback
  apiClient.setOnUnauthorized(() => {
    store.dispatch(clearAuth());
    // Optionally redirect to login page
    window.location.href = '/login';
  });
};

// Export the Axios instance
export const api = apiClient.getInstance();
