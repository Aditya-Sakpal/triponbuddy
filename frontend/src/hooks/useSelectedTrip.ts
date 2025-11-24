import { useState, useEffect, useMemo } from "react";
import { TripDB } from "@/constants";
import { getCalculatedBudget } from "@/utils/tripUtils";

/**
 * Hook to manage selected trip state and derived data
 */
export const useSelectedTrip = (trips: TripDB[]) => {
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [customBudget, setCustomBudget] = useState<string>("");

  const selectedTrip = useMemo(
    () => trips.find((trip) => trip.trip_id === selectedTripId),
    [trips, selectedTripId]
  );

  const calculatedBudget = useMemo(
    () => (selectedTrip ? getCalculatedBudget(selectedTrip) : "₹0"),
    [selectedTrip]
  );

  const minBudgetValue = useMemo(
    () => parseFloat(calculatedBudget.replace(/[₹,]/g, "")) || 0,
    [calculatedBudget]
  );

  // Update custom budget when trip is selected
  useEffect(() => {
    if (selectedTrip) {
      setCustomBudget(minBudgetValue.toString());
    }
  }, [selectedTripId, minBudgetValue, selectedTrip]);

  return {
    selectedTripId,
    setSelectedTripId,
    selectedTrip,
    calculatedBudget,
    minBudgetValue,
    customBudget,
    setCustomBudget,
  };
};
