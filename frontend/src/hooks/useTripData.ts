import { useState, useEffect } from "react";
import { TripDB } from "@/constants";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Hook to fetch full trip data including demographics and joined users
 */
export const useTripData = (trip: TripDB, userId?: string) => {
  const [fullTripData, setFullTripData] = useState<TripDB | null>(null);

  useEffect(() => {
    const fetchTripData = async () => {
      if (!userId) {
        // If no user, just use the trip prop data
        return;
      }
      
      try {
        // If this is a joined trip copy, we need to fetch the ORIGINAL trip to get demographics
        // Check if trip has original_trip_id (means it's a copy)
        const tripIdToFetch = (trip as TripDB & { original_trip_id?: string }).original_trip_id || trip.trip_id;
        
        const response = await fetch(
          `${API_BASE_URL}/api/trips/${tripIdToFetch}?user_id=${userId}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setFullTripData(data.trip);
          }
        }
      } catch (error) {
        console.error("Error fetching trip data:", error);
      }
    };

    fetchTripData();
  }, [trip.trip_id, trip, userId]);

  const resetTripData = () => setFullTripData(null);

  return { fullTripData, resetTripData };
};
