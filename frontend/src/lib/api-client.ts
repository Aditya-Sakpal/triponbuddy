import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_BASE_URL } from '../constants';


// Base API configuration
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
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
        console.log('🔍 API Response Raw:', response.data);
        
        // Check if response has the ApiResponse wrapper format
        if (response.data && typeof response.data === 'object' && 'success' in response.data) {
          console.log('📦 API Response has wrapper format');
          if (response.data.success) {
            // For trip generation, return the whole response since it contains trip_id at root level
            // For other endpoints, return the data field if it exists, otherwise return the whole response
            const result = response.data.data || response.data;
            console.log('✅ API Success, returning:', result);
            // Update the response data and return the response object
            response.data = result;
            return response;
          } else {
            // Throw error if not successful
            const error = response.data.error || {
              code: 'API_ERROR',
              message: 'API request failed',
              details: response.data
            };
            console.log('❌ API Error:', error);
            throw new Error(error.message || 'API request failed');
          }
        }
        // If no wrapper, return response directly (for endpoints that don't use wrapper)
        console.log('🔄 API Response no wrapper, returning response directly');
        return response;
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
  async get<T>(url: string, params?: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
    const response = await this.client.get(url, { params, signal });
    return response.data;
  }

  async post<T>(url: string, data?: unknown, params?: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
    const response = await this.client.post(url, data, { params, signal });
    return response.data;
  }

  async put<T>(url: string, data?: unknown, params?: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
    const response = await this.client.put(url, data, { params, signal });
    return response.data;
  }

  async delete<T>(url: string, params?: Record<string, unknown>, data?: unknown, signal?: AbortSignal): Promise<T> {
    const response = await this.client.delete(url, { params, data, signal });
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
