/**
 * Type definitions for Google Places Service
 */

export interface GenerativeSummary {
  overview?: string;
  overviewFlagContentUri?: string;
  disclaimerText?: string;
}

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
  generativeSummary?: GenerativeSummary;
}

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface PhotoDimensions {
  maxWidth?: number;
  maxHeight?: number;
}
