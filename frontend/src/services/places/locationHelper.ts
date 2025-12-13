/**
 * Helper for geolocation and location-related utilities
 */

import { GeolocationCoordinates } from './types';

/**
 * Get user's current location using browser geolocation API
 */
export async function getCurrentLocation(): Promise<GeolocationCoordinates> {
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
      (error: GeolocationPositionError) => {
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
 * Check if a location is within India using geocoding
 * @param locationName Name of the location to check
 * @returns true if location is in India, false otherwise
 */
export async function isLocationInIndia(locationName: string): Promise<boolean> {
  try {
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
 * Reverse geocode coordinates to get city, state, country
 * @param latitude Latitude coordinate
 * @param longitude Longitude coordinate
 * @returns Formatted location string (City, State, Country) or null if unavailable
 */
export async function reverseGeocodeToCity(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(window.google?.maps as any)?.Geocoder) {
      throw new Error('Google Geocoder not available');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const geocoder = new (window.google.maps as any).Geocoder();

    return new Promise((resolve) => {
      geocoder.geocode(
        { location: { lat: latitude, lng: longitude } },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (results: any, status: any) => {
          if (status === 'OK' && results && results.length > 0) {
            // Find the best result for city-level information
            // Priority: locality > administrative_area_level_2 > administrative_area_level_1
            let city = '';
            let state = '';
            let country = '';

            // Use the first result which typically has the most complete address
            const result = results[0];
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            result.address_components?.forEach((component: any) => {
              const types = component.types;
              
              if (types.includes('locality')) {
                city = component.long_name;
              } else if (types.includes('administrative_area_level_2') && !city) {
                // Fallback to district if city not found
                city = component.long_name;
              }
              
              if (types.includes('administrative_area_level_1')) {
                state = component.long_name;
              }
              
              if (types.includes('country')) {
                country = component.long_name;
              }
            });

            // Build location string with available components
            const parts = [city, state, country].filter(Boolean);
            if (parts.length > 0) {
              resolve(parts.join(', '));
            } else {
              resolve(null);
            }
          } else {
            resolve(null);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
}
