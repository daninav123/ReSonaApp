import axios from 'axios';
import { axiosInstance } from './axiosInstance';

const API_URL = '/api/providers';

export interface Provider {
  _id?: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  taxId: string;
  category: string[];
  rating: number;
  status: 'active' | 'inactive' | 'pending';
  paymentTerms: string;
  notes: string;
  products: Array<{
    _id?: string;
    name: string;
    code: string;
    price: number;
    description?: string;
    category?: string;
  }>;
  documents: Array<{
    _id?: string;
    name: string;
    type: string;
    url: string;
    uploadDate: Date | string;
  }>;
  history: Array<{
    _id?: string;
    date: Date | string;
    action: string;
    description: string;
    user: string;
  }>;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ProviderFilters {
  search?: string;
  category?: string;
  status?: 'active' | 'inactive' | 'pending';
  sortBy?: string;
  order?: 'asc' | 'desc';
  limit?: number;
  skip?: number;
}

export interface ProviderProduct {
  name: string;
  code: string;
  price: number;
  description?: string;
  category?: string;
}

export interface ProviderDocument {
  name: string;
  type: string;
  file: File;
}

const providersApi = {
  /**
   * Get all providers with optional filtering
   */
  getProviders: async (filters?: ProviderFilters): Promise<{ data: Provider[], pagination: any }> => {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        if (filters.search) params.append('search', filters.search);
        if (filters.category) params.append('category', filters.category);
        if (filters.status) params.append('status', filters.status);
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        if (filters.order) params.append('order', filters.order);
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.skip) params.append('skip', filters.skip.toString());
      }
      
      const queryString = params.toString();
      const url = queryString ? `${API_URL}?${queryString}` : API_URL;
      
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching providers:', error);
      throw error;
    }
  },

  /**
   * Get a provider by ID
   */
  getProviderById: async (providerId: string): Promise<Provider> => {
    try {
      const response = await axiosInstance.get(`${API_URL}/${providerId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching provider ${providerId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new provider
   */
  createProvider: async (providerData: Omit<Provider, '_id' | 'createdAt' | 'updatedAt'>): Promise<Provider> => {
    try {
      const response = await axiosInstance.post(API_URL, providerData);
      return response.data.provider;
    } catch (error) {
      console.error('Error creating provider:', error);
      throw error;
    }
  },

  /**
   * Update an existing provider
   */
  updateProvider: async (providerId: string, providerData: Partial<Provider>): Promise<Provider> => {
    try {
      const response = await axiosInstance.put(`${API_URL}/${providerId}`, providerData);
      return response.data.provider;
    } catch (error) {
      console.error(`Error updating provider ${providerId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a provider
   */
  deleteProvider: async (providerId: string): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.delete(`${API_URL}/${providerId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting provider ${providerId}:`, error);
      throw error;
    }
  },

  /**
   * Add a product to a provider
   */
  addProduct: async (providerId: string, product: ProviderProduct): Promise<{ message: string; product: ProviderProduct }> => {
    try {
      const response = await axiosInstance.post(`${API_URL}/${providerId}/products`, product);
      return response.data;
    } catch (error) {
      console.error(`Error adding product to provider ${providerId}:`, error);
      throw error;
    }
  },

  /**
   * Update a product of a provider
   */
  updateProduct: async (providerId: string, productId: string, product: Partial<ProviderProduct>): Promise<{ message: string; product: ProviderProduct }> => {
    try {
      const response = await axiosInstance.put(`${API_URL}/${providerId}/products/${productId}`, product);
      return response.data;
    } catch (error) {
      console.error(`Error updating product ${productId} of provider ${providerId}:`, error);
      throw error;
    }
  },

  /**
   * Remove a product from a provider
   */
  deleteProduct: async (providerId: string, productId: string): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.delete(`${API_URL}/${providerId}/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting product ${productId} from provider ${providerId}:`, error);
      throw error;
    }
  },

  /**
   * Upload a document for a provider
   */
  uploadDocument: async (providerId: string, document: ProviderDocument): Promise<{ message: string; document: any }> => {
    try {
      const formData = new FormData();
      formData.append('document', document.file);
      formData.append('name', document.name);
      formData.append('type', document.type);

      const response = await axiosInstance.post(`${API_URL}/${providerId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error uploading document for provider ${providerId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a document from a provider
   */
  deleteDocument: async (providerId: string, documentId: string): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.delete(`${API_URL}/${providerId}/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting document ${documentId} from provider ${providerId}:`, error);
      throw error;
    }
  },

  /**
   * Get providers by category
   */
  getProvidersByCategory: async (category: string): Promise<Provider[]> => {
    try {
      const response = await axiosInstance.get(`${API_URL}?category=${category}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching providers by category ${category}:`, error);
      throw error;
    }
  },

  /**
   * Get providers by status
   */
  getProvidersByStatus: async (status: 'active' | 'inactive' | 'pending'): Promise<Provider[]> => {
    try {
      const response = await axiosInstance.get(`${API_URL}?status=${status}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching providers by status ${status}:`, error);
      throw error;
    }
  }
};

export default providersApi;
