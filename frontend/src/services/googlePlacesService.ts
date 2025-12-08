/**
 * Google Places API Service
 * 
 * Main service class that coordinates all Google Places functionality.
 * Uses the new Place class API instead of the legacy PlacesService.
 */

import { googleMapsLoader } from '@/lib/google-maps-loader';
import { NearbyPlace, GeolocationCoordinates, PhotoDimensions } from './places/types';
import { getCurrentLocation, isLocationInIndia } from './places/locationHelper';
import { searchNearbyPlaces } from './places/nearbySearchHelper';
import { searchPlacesByName } from './places/textSearchHelper';
import {
  getActivityPhoto,
  getLocationPhotos,
  getPhotosForLocations,
  getDestinationPhotos,
} from './places/photoHelper';

class GooglePlacesService {
  private initialized: boolean = false;
  
  constructor() {
    // Initialize will be called when needed
  }

  /**
   * Initialize the Google Maps API
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await googleMapsLoader.load({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: ['places'],
      });
      this.initialized = true;
    }
  }

  // ===== Location Methods =====

  /**
   * Check if a location is within India using geocoding
   */
  async isLocationInIndia(locationName: string): Promise<boolean> {
    await this.ensureInitialized();
    return isLocationInIndia(locationName);
  }

  /**
   * Get user's current location using browser geolocation API
   */
  async getCurrentLocation(): Promise<GeolocationCoordinates> {
    return getCurrentLocation();
  }

  // ===== Nearby Search Methods =====

  /**
   * Search for nearby interesting places
   */
  async searchNearbyPlaces(
    latitude: number,
    longitude: number,
    radius: number = 50000,
    limit: number = 10
  ): Promise<NearbyPlace[]> {
    await this.ensureInitialized();
    return searchNearbyPlaces(latitude, longitude, radius, limit);
  }

  /**
   * Get nearby places with automatic location detection
   */
  async getNearbyPlacesFromCurrentLocation(
    radius: number = 50000,
    limit: number = 10
  ): Promise<NearbyPlace[]> {
    const location = await getCurrentLocation();
    await this.ensureInitialized();
    return searchNearbyPlaces(location.latitude, location.longitude, radius, limit);
  }

  // ===== Text Search Methods =====

  /**
   * Search for places by name using Text Search
   */
  async searchPlacesByName(locationName: string, retryCount: number = 2): Promise<NearbyPlace[]> {
    await this.ensureInitialized();
    return searchPlacesByName(locationName, retryCount);
  }

  // ===== Photo Methods =====

  /**
   * Get a single photo for an activity/location
   */
  async getActivityPhoto(
    locationName: string,
    activityName?: string
  ): Promise<string | undefined> {
    await this.ensureInitialized();
    return getActivityPhoto(locationName, activityName);
  }

  /**
   * Get multiple photos for a single location
   */
  async getLocationPhotos(
    locationName: string,
    maxPhotos: number = 5,
    dimensions: PhotoDimensions = { maxWidth: 1200, maxHeight: 800 }
  ): Promise<string[]> {
    await this.ensureInitialized();
    return getLocationPhotos(locationName, maxPhotos, dimensions);
  }

  /**
   * Get photos for multiple locations
   */
  async getPhotosForLocations(
    locations: string[],
    maxPhotosPerLocation: number = 3
  ): Promise<string[]> {
    await this.ensureInitialized();
    return getPhotosForLocations(locations, maxPhotosPerLocation);
  }

  /**
   * Get photos for destinations to display in trip generation modal
   */
  async getDestinationPhotos(
    destinations: string | string[],
    maxPhotos: number = 10
  ): Promise<string[]> {
    await this.ensureInitialized();
    return getDestinationPhotos(destinations, maxPhotos);
  }
}

// Export singleton instance
export const googlePlacesService = new GooglePlacesService();
export default googlePlacesService;

// Re-export types for convenience
export type { NearbyPlace, GeolocationCoordinates, PhotoDimensions, GenerativeSummary } from './places/types';
