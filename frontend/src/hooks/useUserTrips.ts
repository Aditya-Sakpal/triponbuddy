import { useState, useEffect } from "react";
import { TripDB } from "@/constants";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Hook to fetch user's trips
 */
export const useUserTrips = (userId?: string) => {
  const [trips, setTrips] = useState<TripDB[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      if (!userId) {
        setTrips([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/trips?user_id=${userId}&page=1&limit=100`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setTrips(data.trips);
          } else {
            setError("Failed to load trips");
          }
        } else {
          setError("Failed to load trips");
        }
      } catch (err) {
        console.error("Error fetching trips:", err);
        setError("Failed to load your trips");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, [userId]);

  return { trips, isLoading, error };
};
