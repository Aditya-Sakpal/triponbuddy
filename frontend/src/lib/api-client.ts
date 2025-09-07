import axios, { AxiosInstance, AxiosResponse } from 'axios';


// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for adding auth headers
    this.client.interceptors.request.use(
      (config) => {
        // Add user_id as query parameter if available
        // This would typically come from your auth context
        const userId = this.getCurrentUserId();
        if (userId && config.method === 'get') {
          config.params = { ...config.params, user_id: userId };
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Check if response has the ApiResponse wrapper format
        if (response.data && typeof response.data === 'object' && 'success' in response.data) {
          if (response.data.success) {
            // Return the data directly if success
            return response.data.data || response.data;
          } else {
            // Throw error if not successful
            const error = response.data.error || {
              code: 'API_ERROR',
              message: 'API request failed',
              details: response.data
            };
            throw new Error(error.message || 'API request failed');
          }
        }
        // If no wrapper, return data directly (for endpoints that don't use wrapper)
        return response.data;
      },
      (error) => {
        if (error.response?.data) {
          // Handle wrapped error responses
          if (error.response.data && typeof error.response.data === 'object' && 'success' in error.response.data) {
            const apiError = error.response.data.error || {
              code: 'API_ERROR',
              message: 'API request failed',
              details: error.response.data
            };
            throw new Error(apiError.message || 'API request failed');
          }
          // Handle direct error responses
          throw new Error(error.response.data.message || error.response.data.detail || 'API request failed');
        }
        throw new Error(error.message || 'Network error occurred');
      }
    );
  }

  private getCurrentUserId(): string | null {
    // This should be replaced with your actual auth logic
    // For now, return null - user_id should be passed explicitly
    return null;
  }

  // Generic request methods
  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.client.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: unknown, params?: Record<string, unknown>): Promise<T> {
    const response = await this.client.post(url, data, { params });
    return response.data;
  }

  async put<T>(url: string, data?: unknown, params?: Record<string, unknown>): Promise<T> {
    const response = await this.client.put(url, data, { params });
    return response.data;
  }

  async delete<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.client.delete(url, { params });
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
