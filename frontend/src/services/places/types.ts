/**
 * Type definitions for Google Places Service
 */

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

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface PhotoDimensions {
  maxWidth?: number;
  maxHeight?: number;
}
