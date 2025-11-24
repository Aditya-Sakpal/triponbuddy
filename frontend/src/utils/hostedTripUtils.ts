import { TripDB } from "@/constants";

/**
 * Calculate if a trip is joinable by the current user
 */
export const isJoinable = (
  tripData: TripDB,
  userId?: string
): boolean => {
  if (!tripData.max_passengers) {
    return false;
  }
  
  // Can't join your own trip
  if (userId && tripData.user_id === userId) {
    return false;
  }
  
  // Check if user has already joined
  if (userId && tripData.joined_users && tripData.joined_users.includes(userId)) {
    return false;
  }
  
  const currentTravelers = (tripData.travelers || []).length;
  const joinedUsers = (tripData.joined_users || []).length;
  const currentPassengers = 1 + currentTravelers + joinedUsers; // +1 for owner
  
  const hasSlots = currentPassengers < tripData.max_passengers;
  
  return hasSlots;
};

/**
 * Get the number of available slots for a trip
 */
export const getAvailableSlots = (tripData: TripDB): number => {
  if (!tripData.max_passengers) return 0;
  
  const currentTravelers = (tripData.travelers || []).length;
  const joinedUsers = (tripData.joined_users || []).length;
  const currentPassengers = 1 + currentTravelers + joinedUsers;
  
  return tripData.max_passengers - currentPassengers;
};

/**
 * Check if user is on this trip (either owner or has joined)
 */
export const isUserOnTrip = (
  tripData: TripDB,
  userId?: string
): boolean => {
  if (!userId) return false;
  
  // Check if user is the owner
  if (tripData.user_id === userId) {
    return true;
  }
  
  // Check if user has joined
  if (tripData.joined_users && tripData.joined_users.includes(userId)) {
    return true;
  }
  
  return false;
};

/**
 * Traveler demographic data
 */
export interface TravelerDemographic {
  id: string;
  age: number;
  gender: string;
  type: 'original' | 'joined';
}

/**
 * Get all traveler demographics (original travelers + joined users)
 */
export const getAllTravelerDemographics = (tripData: TripDB): TravelerDemographic[] => {
  const travelers = tripData.travelers || [];
  const joinedDemographics = tripData.joined_users_demographics || [];
  
  const allDemographics = [
    ...travelers.map((traveler, idx) => ({
      id: `traveler-${idx}`,
      age: traveler.age,
      gender: traveler.gender,
      type: 'original' as const,
    })),
    ...joinedDemographics.map((joined: { user_id: string; age: number; gender: string }) => ({
      id: `joined-${joined.user_id}`,
      age: joined.age,
      gender: joined.gender,
      type: 'joined' as const,
    }))
  ];
  
  return allDemographics;
};

/**
 * Format trip title with optional username
 */
export const formatTripTitle = (destination: string, username?: string): string => {
  return username 
    ? `${username}'s trip to ${destination}`
    : `Trip to ${destination}`;
};
