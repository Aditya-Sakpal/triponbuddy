import { apiClient } from './api-client';
import type {
  TripGenerationRequest,
  TripGenerationResponse,
  TripListResponse,
  TripResponse,
  TripUpdateRequest,
  TripListParams,
  UserStatsResponse,
  FeedbackCreate,
  FeedbackResponse,
  BulkImageResponse,
  SingleImageResponse,
  ImageBulkParams,
  ImageSingleParams,
} from '../constants';

// Trips API Service
export class TripsApiService {
  static async generateTrip(request: TripGenerationRequest): Promise<TripGenerationResponse> {
    return apiClient.post<TripGenerationResponse>('/api/trips/generate', request);
  }

  static async getUserTrips(params: TripListParams): Promise<TripListResponse> {
    return apiClient.get<TripListResponse>('/api/trips', params);
  }

  static async getTrip(tripId: string, userId: string): Promise<TripResponse> {
    return apiClient.get<TripResponse>(`/api/trips/${tripId}`, { user_id: userId });
  }

  static async updateTrip(
    tripId: string,
    updates: TripUpdateRequest,
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.put(`/api/trips/${tripId}`, updates, { user_id: userId });
  }

  static async deleteTrip(tripId: string, userId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`/api/trips/${tripId}`, { user_id: userId });
  }

  static async saveTrip(tripId: string, userId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.put(`/api/trips/${tripId}/save`, {}, { user_id: userId });
  }

  static async unsaveTrip(tripId: string, userId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.put(`/api/trips/${tripId}/unsave`, {}, { user_id: userId });
  }
}

// Users API Service
export class UsersApiService {
  static async getUserStats(userId: string): Promise<UserStatsResponse> {
    return apiClient.get<UserStatsResponse>('/api/users/stats', { user_id: userId });
  }
}

// Images API Service
export class ImagesApiService {
  static async fetchBulkImages(params: ImageBulkParams): Promise<BulkImageResponse> {
    return apiClient.post<BulkImageResponse>('/api/images/bulk', params.locations);
  }

  static async fetchSingleImage(params: ImageSingleParams): Promise<SingleImageResponse> {
    const queryParams = {
      location: params.location,
      ...(params.max_images && { max_images: params.max_images }),
      ...(params.min_width && { min_width: params.min_width }),
      ...(params.min_height && { min_height: params.min_height }),
    };
    return apiClient.post<SingleImageResponse>('/api/images/single', {}, queryParams);
  }
}

// Feedback API Service
export class FeedbackApiService {
  static async submitFeedback(
    feedback: FeedbackCreate,
    userId: string
  ): Promise<FeedbackResponse> {
    return apiClient.post<FeedbackResponse>('/api/feedback', feedback, { user_id: userId });
  }
}

// Health check
export class HealthApiService {
  static async checkHealth(): Promise<{ status: string; [key: string]: unknown }> {
    return apiClient.get('/health');
  }
}
