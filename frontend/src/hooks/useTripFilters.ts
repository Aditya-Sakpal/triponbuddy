import { useMemo } from "react";
import { TripDB } from "@/constants";

type SortOption = "date-newest" | "date-oldest" | "name-asc" | "name-desc";

export const useTripFilters = (
  trips: TripDB[],
  searchQuery: string,
  sortBy: SortOption
) => {
  // Separate saved and unsaved trips
  const savedTrips = useMemo(() =>
    trips.filter(trip => trip.is_saved), [trips]
  );

  const historyTrips = useMemo(() =>
    trips.filter(trip => !trip.is_saved), [trips]
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
    filterAndSortTrips,
  };
};
