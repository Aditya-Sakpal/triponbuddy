const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export interface RoadRouteResponse {
  success: boolean;
  route?: {
    distance_meters: number;
    duration: string;
    polyline: string;
    waypoints: Array<{
      name: string;
      address: string;
      location: {
        latitude: number;
        longitude: number;
      };
      rating?: number;
      category: string;
      photo_ref?: string;
      distance_from_prev_km?: number;
    }>;
    origin: {
      lat: number;
      lng: number;
    };
    destination: {
      lat: number;
      lng: number;
    };
  };
  error?: string;
}

export const roadRouteApi = {
  async getRoadRoute(tripId: string, userId: string): Promise<RoadRouteResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/trips/${tripId}/road-route?user_id=${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch road route');
      }
      
      return await response.json();
    } catch (error: unknown) {
      console.error('Error fetching road route:', error);
      throw error;
    }
  }
};
