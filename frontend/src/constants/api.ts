// API-related constants

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Query Keys for React Query
export const queryKeys = {
  trips: ['trips'] as const,
  trip: (tripId: string) => ['trips', tripId] as const,
  userStats: ['user', 'stats'] as const,
  images: (query: string) => ['images', query] as const,
};