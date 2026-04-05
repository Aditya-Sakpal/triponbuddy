/**
 * Google Places API Service
 * 
 * Main service class that coordinates all Google Places functionality.
 * Uses the new Place class API instead of the legacy PlacesService.
 */

import { googleMapsLoader } from '@/lib/google-maps-loader';
import { NearbyPlace, GeolocationCoordinates, PhotoDimensions } from './places/types';
import { getCurrentLocation, isLocationInIndia, reverseGeocodeToCity } from './places/locationHelper';
import { searchNearbyPlaces } from './places/nearbySearchHelper';
import { searchPlacesByName } from './places/textSearchHelper';
import {
  getActivityPhoto,
  getLocationPhotos,
  getPhotosForLocations,
  getDestinationPhotos,
} from './places/photoHelper';

export interface PlaceDetails {
  name: string;
  address: string;
  rating?: number;
  photoUrls: string[];
  mapsUrl: string;
}

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

  /**
   * Reverse geocode coordinates to get city, state, country
   */
  async reverseGeocodeToCity(latitude: number, longitude: number): Promise<string | null> {
    await this.ensureInitialized();
    return reverseGeocodeToCity(latitude, longitude);
  }

  /**
   * Get user's current city location (city, state, country format)
   * Returns null if location permissions are denied or unavailable
   */
  async getCurrentCityLocation(): Promise<string | null> {
    try {
      const coords = await getCurrentLocation();
      await this.ensureInitialized();
      return reverseGeocodeToCity(coords.latitude, coords.longitude);
    } catch {
      // Location permissions denied or unavailable - return null silently
      return null;
    }
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

  /**
   * Fetch rich place details (rating + photos) for itinerary place cards.
   */
  async getPlaceDetails(
    query: string,
    maxPhotos: number = 6
  ): Promise<PlaceDetails | null> {
    await this.ensureInitialized();

    const { Place } = await google.maps.importLibrary("places") as google.maps.places.PlacesLibrary;
    const response = await Place.searchByText({
      textQuery: query,
      fields: ["id", "displayName", "formattedAddress", "rating", "photos"],
      maxResultCount: 1,
    });

    const place = response.places?.[0];
    if (!place) return null;

    const name = place.displayName || query;
    const address = place.formattedAddress || "";
    const rating = place.rating;
    const photoUrls = (place.photos || [])
      .slice(0, maxPhotos)
      .map((photo) => photo.getURI({ maxWidth: 1200, maxHeight: 900 }));
    const mapsUrl = place.id
      ? `https://www.google.com/maps/place/?q=place_id:${place.id}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

    return { name, address, rating, photoUrls, mapsUrl };
  }
}

// Export singleton instance
export const googlePlacesService = new GooglePlacesService();
export default googlePlacesService;

// Re-export types for convenience
export type { NearbyPlace, GeolocationCoordinates, PhotoDimensions, GenerativeSummary } from './places/types';
