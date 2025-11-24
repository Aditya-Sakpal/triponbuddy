/**
 * Google Places API Service
 * 
 * Handles interactions with Google Places API for:
 * - Nearby search for interesting places
 * - Place photo retrieval
 * 
 * Uses Google Maps JavaScript SDK to avoid CORS issues
 */

import { googleMapsLoader } from '@/lib/google-maps-loader';

export interface NearbyPlace {
  id: string;
  name: string;
  photos?: string[]; // Photo URLs
  rating?: number;
  vicinity?: string;
  types: string[];
  location: {
    lat: number;
    lng: number;
  };
}

interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
}

class GooglePlacesService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private placesService: any | null = null;
  private serviceContainer: HTMLDivElement | null = null;
  
  constructor() {
    // Initialize will be called when needed
  }

  /**
   * Initialize the Places Service using Google Maps JavaScript SDK
   */
  private async initializePlacesService(): Promise<void> {
    // Ensure Google Maps API is loaded
    await googleMapsLoader.load({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      libraries: ['places'],
    });

    // Create a container for the PlacesService
    if (!this.serviceContainer) {
      this.serviceContainer = document.createElement('div');
      this.serviceContainer.style.display = 'none';
      document.body.appendChild(this.serviceContainer);
    }

    // Initialize PlacesService
    if (window.google?.maps?.places?.PlacesService) {
      this.placesService = new window.google.maps.places.PlacesService(this.serviceContainer);
    } else {
      throw new Error('Google Places Service not available');
    }
  }

  /**
   * Ensure Places Service is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.placesService) {
      await this.initializePlacesService();
    }
  }

  /**
   * Check if a location is within India using geocoding
   * @param locationName Name of the location to check
   * @returns true if location is in India, false otherwise
   */
  async isLocationInIndia(locationName: string): Promise<boolean> {
    try {
      await this.ensureInitialized();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(window.google?.maps as any)?.Geocoder) {
        throw new Error('Google Geocoder not available');
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const geocoder = new (window.google.maps as any).Geocoder();

      return new Promise((resolve, reject) => {
        geocoder.geocode(
          { address: locationName },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (results: any, status: any) => {
            if (status === 'OK' && results && results.length > 0) {
              const result = results[0];
              
              // Check if any address component contains "India"
              const isInIndia = result.address_components?.some(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (component: any) => 
                  component.types.includes('country') && 
                  (component.short_name === 'IN' || component.long_name === 'India')
              ) || false;

              resolve(isInIndia);
            } else if (status === 'ZERO_RESULTS') {
              // Location not found, assume it could be anywhere
              resolve(false);
            } else {
              reject(new Error(`Geocoding error: ${status}`));
            }
          }
        );
      });
    } catch (error) {
      console.error('Error checking location:', error);
      // If there's an error, assume it might be international to be safe
      return false;
    }
  }

  /**
   * Get user's current location using browser geolocation API
   */
  async getCurrentLocation(): Promise<GeolocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          let errorMessage = 'Failed to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 300000,
        }
      );
    });
  }

  /**
   * Search for nearby interesting places using Google Places API JavaScript SDK
   * 
   * @param latitude User's latitude
   * @param longitude User's longitude
   * @param radius Search radius in meters (default: 100000 = 100km)
   * @param limit Maximum number of results (default: 10)
   */
  async searchNearbyPlaces(
    latitude: number,
    longitude: number,
    radius: number = 100000,
    limit: number = 10
  ): Promise<NearbyPlace[]> {
    // Ensure Places Service is initialized
    await this.ensureInitialized();

    if (!this.placesService) {
      throw new Error('Places Service not initialized');
    }

    // Types that represent interesting places to visit
    const interestingTypes = [
      'tourist_attraction',
      'park',
      'museum',
      'natural_feature',
      'point_of_interest',
      'amusement_park',
      'aquarium',
      'art_gallery',
      'campground',
      'church',
      'hindu_temple',
      'mosque',
      'zoo',
    ];

    // Create location object
    const location = new window.google.maps.LatLng(latitude, longitude);

    // Perform multiple searches with different types to get diverse results
    const allPlaces: NearbyPlace[] = [];
    const seenPlaceIds = new Set<string>();

    // Search for each type to get diverse results
    for (const type of interestingTypes.slice(0, 3)) {
      try {
        const places = await this.searchByType(location, radius, type);
        
        // Add unique places
        for (const place of places) {
          if (!seenPlaceIds.has(place.id) && allPlaces.length < limit) {
            seenPlaceIds.add(place.id);
            allPlaces.push(place);
          }
        }

        // Break if we have enough places
        if (allPlaces.length >= limit) {
          break;
        }
      } catch (error) {
        // Continue with other types
      }
    }

    // If we still don't have enough places, do a general search
    if (allPlaces.length < limit) {
      try {
        const generalPlaces = await this.searchByType(location, radius);
        for (const place of generalPlaces) {
          if (!seenPlaceIds.has(place.id) && allPlaces.length < limit) {
            seenPlaceIds.add(place.id);
            allPlaces.push(place);
          }
        }
      } catch (error) {
        // Silently continue
      }
    }

    return allPlaces.slice(0, limit);
  }

  /**
   * Search for places by type
   * @private
   */
  private searchByType(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    location: any,
    radius: number,
    type?: string
  ): Promise<NearbyPlace[]> {
    return new Promise((resolve, reject) => {
      if (!this.placesService) {
        reject(new Error('Places Service not initialized'));
        return;
      }

      const request = {
        location,
        radius,
        ...(type && { type }),
      };

      this.placesService.nearbySearch(
        request,
        (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            const places: NearbyPlace[] = results
              .filter((place) => place.name && place.place_id && place.geometry?.location)
              .map((place) => ({
                id: place.place_id!,
                name: place.name!,
                photos: place.photos
                  ? place.photos.slice(0, 3).map((photo) => 
                      photo.getUrl({ maxWidth: 800 })
                    )
                  : undefined,
                rating: place.rating,
                vicinity: place.vicinity,
                types: place.types || [],
                location: {
                  lat: place.geometry!.location!.lat(),
                  lng: place.geometry!.location!.lng(),
                },
              }));

            resolve(places);
          } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            resolve([]);
          } else {
            reject(new Error(`Places API error: ${status}`));
          }
        }
      );
    });
  }

  /**
   * Get nearby places with automatic location detection
   * This is the main method to use for the nearby places feature
   */
  async getNearbyPlacesFromCurrentLocation(
    radius: number = 100000,
    limit: number = 10
  ): Promise<NearbyPlace[]> {
    // Get user's current location
    const location = await this.getCurrentLocation();
    
    // Search for nearby places
    const places = await this.searchNearbyPlaces(
      location.latitude,
      location.longitude,
      radius,
      limit
    );

    return places;
  }
}

// Export singleton instance
export const googlePlacesService = new GooglePlacesService();
export default googlePlacesService;
