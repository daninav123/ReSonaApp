import axios from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Create axios instance with base URL from environment or default to current origin
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Interface for the refresh token response
export interface TokenResponse {
  token: string;
  refreshToken: string;
}

// Type for the onRefreshToken callback
type OnRefreshToken = () => Promise<TokenResponse | null>;

// Type for the onUnauthorized callback
type OnUnauthorized = () => void;

// Create a class to manage the axios instance and its interceptors
class ApiClient {
  private instance: AxiosInstance;
  private onRefreshToken: OnRefreshToken | null = null;
  private onUnauthorized: OnUnauthorized | null = null;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
  }> = [];

  constructor() {
    this.instance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: true,
      timeout: 10000,
    });

    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }

  // Set the refresh token callback
  public setOnRefreshToken(callback: OnRefreshToken): void {
    this.onRefreshToken = callback;
  }

  // Set the unauthorized callback
  public setOnUnauthorized(callback: OnUnauthorized): void {
    this.onUnauthorized = callback;
  }

  // Get the axios instance
  public getInstance(): AxiosInstance {
    return this.instance;
  }

  // Setup request interceptor
  private setupRequestInterceptor(): void {
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Skip for refresh token request to avoid infinite loop
        if (config.url?.includes('/auth/refresh')) {
          return config;
        }

        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Ensure we don't have double slashes in the URL
        if (config.url) {
          config.url = config.url.replace(/([^:]\/)\/+/g, '$1');
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  // Process the queue of failed requests
  private processQueue(error: unknown, token: string | null = null): void {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(token || '');
      }
    });
    this.failedQueue = [];
  }

  // Setup response interceptor
  private setupResponseInterceptor(): void {
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is not 401 or it's a refresh token request, reject
        if (error.response?.status !== 401 || originalRequest._retry) {
          if (error.response?.status === 401 && this.onUnauthorized) {
            this.onUnauthorized();
          }
          return Promise.reject(error);
        }

        // Mark the request as retried
        originalRequest._retry = true;

        // If we're already refreshing the token, add the request to the queue
        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.instance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        // Start token refresh process
        this.isRefreshing = true;

        try {
          if (!this.onRefreshToken) {
            throw new Error('No refresh token callback provided');
          }

          const tokens = await this.onRefreshToken();
          if (!tokens) {
            throw new Error('Failed to refresh token');
          }

          // Update the token in localStorage
          localStorage.setItem('token', tokens.token);

          // Update the Authorization header
          this.instance.defaults.headers.common['Authorization'] = `Bearer ${tokens.token}`;
          originalRequest.headers.Authorization = `Bearer ${tokens.token}`;

          // Process the queue with the new token
          this.processQueue(null, tokens.token);

          // Retry the original request
          return this.instance(originalRequest);
        } catch (error) {
          // If refresh token fails, clear the token and redirect to login
          localStorage.removeItem('token');
          if (this.onUnauthorized) {
            this.onUnauthorized();
          }
          this.processQueue(error);
          return Promise.reject(error);
        } finally {
          this.isRefreshing = false;
        }
      }
    );
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();

// Default export for backward compatibility
export const api = apiClient.getInstance();
// Alias export to maintain compatibility with older imports
export { api as axiosInstance };
// Default export for modules that expect it
export default api;
