import { useMemo } from "react";
import { TripDB } from "@/constants";

type SortOption = "date-newest" | "date-oldest" | "name-asc" | "name-desc";
type TripTypeOption = "all" | "domestic" | "international";

export const useTripFilters = (
  trips: TripDB[],
  searchQuery: string,
  sortBy: SortOption,
  tripType: TripTypeOption,
  currentUserId?: string
) => {
  // Separate joined trips (trips with is_joined flag or where user is in joined_users but not the owner)
  const joinedTrips = useMemo(() =>
    trips.filter(trip => {
      // Primary check: is_joined flag (for trip copies)
      if ((trip as any).is_joined === true) {
        return true;
      }
      // Legacy check: user is in joined_users array but not the owner
      return currentUserId && 
        trip.joined_users && 
        trip.joined_users.includes(currentUserId) &&
        trip.user_id !== currentUserId;
    }), [trips, currentUserId]
  );

  // Separate saved trips (excluding joined trips)
  // Note: Explicitly exclude trips with is_joined flag or where user is in joined_users array
  const savedTrips = useMemo(() =>
    trips.filter(trip => {
      // Exclude trips with is_joined flag
      if ((trip as any).is_joined === true) {
        return false;
      }
      // Exclude legacy joined trips
      if (currentUserId && trip.joined_users && trip.joined_users.includes(currentUserId) && trip.user_id !== currentUserId) {
        return false;
      }
      return trip.is_saved === true;
    }), [trips, currentUserId]
  );

  // History trips (unsaved, not joined)
  const historyTrips = useMemo(() =>
    trips.filter(trip => {
      // Exclude trips with is_joined flag
      if ((trip as any).is_joined === true) {
        return false;
      }
      // Exclude legacy joined trips
      if (currentUserId && trip.joined_users && trip.joined_users.includes(currentUserId) && trip.user_id !== currentUserId) {
        return false;
      }
      return trip.is_saved === false;
    }), [trips, currentUserId]
  );

  // Filter and sort function
  const filterAndSortTrips = (tripList: TripDB[]) => {
    let filtered = tripList;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(trip =>
        trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.destination.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by trip type
    if (tripType !== "all") {
      filtered = filtered.filter(trip =>
        tripType === "domestic" ? !trip.is_international : trip.is_international
      );
    }

    // Sort trips
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "date-oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "name-asc":
          return a.title.localeCompare(b.title);
        case "name-desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
  };

  return {
    savedTrips,
    historyTrips,
    joinedTrips,
    filterAndSortTrips,
  };
};
