import { useState, useEffect, useCallback, useMemo } from "react";
import { Mountain, Building, Umbrella, Music, ShoppingBag, Utensils } from "lucide-react";
import { useGenerateTrip } from "@/hooks/api-hooks";
import { geminiService } from "@/services/geminiService";
import { fetchModalImages } from "@/components/landing/tripPlanning/tripPlanningHelpers";
import type { TripDB, TripPreferences, Itinerary, ImageData } from "@/constants";

interface UseEditTripProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripDB;
  onTripUpdated: (newTripId: string) => void;
  initialDestination?: string;
}

export const useEditTrip = ({ 
  isOpen, 
  onClose, 
  trip, 
  onTripUpdated, 
  initialDestination 
}: UseEditTripProps) => {
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(['Relaxation']);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [startLocation, setStartLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [durationDays, setDurationDays] = useState<number>(3);
  const [isInternational, setIsInternational] = useState(false);
  const [budget, setBudget] = useState<number | undefined>(undefined);
  const [minimumBudget, setMinimumBudget] = useState<number | undefined>(undefined);
  const [isEstimatingBudget, setIsEstimatingBudget] = useState(false);
  const [transportationMode, setTransportationMode] = useState<'default' | 'road' | 'train' | 'flight'>('default');
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [modalImages, setModalImages] = useState<ImageData[]>([]);
  
  const generateTripMutation = useGenerateTrip();
  
  const preferenceOptions = useMemo(() => [
    { icon: Mountain, label: "Adventure" },
    { icon: Building, label: "Culture" },
    { icon: Umbrella, label: "Relaxation" },
    { icon: Music, label: "Classical" },
    { icon: ShoppingBag, label: "Shopping" },
    { icon: Utensils, label: "Food" },
  ], []);

  // Initialize form with trip data when modal opens
  useEffect(() => {
    if (isOpen && trip) {
      // Initialize destinations array
      const tripDestinations = trip.destinations && trip.destinations.length > 0 
        ? trip.destinations 
        : (initialDestination || trip.destination ? [initialDestination || trip.destination] : []);
      setDestinations(tripDestinations);
      
      setStartLocation(trip.start_location || "");
      setStartDate(trip.start_date || "");
      setDurationDays(trip.duration_days || 3);
      setIsInternational(trip.is_international || false);
      setBudget(trip.budget);
      setTransportationMode((trip.transportation_mode as 'default' | 'road' | 'train' | 'flight') || 'default');
      
      // Extract preferences from trip data
      const preferences: string[] = [];
      
      // Try to infer preferences from trip tags or set defaults
      if (trip.tags && trip.tags.length > 0) {
        trip.tags.forEach(tag => {
          const matchingPref = preferenceOptions.find(
            opt => opt.label.toLowerCase() === tag.toLowerCase()
          );
          if (matchingPref) {
            preferences.push(matchingPref.label);
          }
        });
      }
      
      // If no preferences found, set default
      if (preferences.length === 0) {
        preferences.push('Relaxation');
      }
      
      setSelectedPreferences(preferences);
    }
  }, [isOpen, trip, initialDestination, preferenceOptions]);

  // Handle trip generation success
  useEffect(() => {
    if (generateTripMutation.isSuccess && generateTripMutation.data?.trip_id) {
      setIsGenerating(false);
      onTripUpdated(generateTripMutation.data.trip_id);
      onClose();
      // Reset mutation state
      generateTripMutation.reset();
    }
  }, [generateTripMutation.isSuccess, generateTripMutation.data, generateTripMutation, onTripUpdated, onClose]);

  // Handle errors
  useEffect(() => {
    if (generateTripMutation.isError) {
      console.error('Trip update failed:', generateTripMutation.error);
      setIsGenerating(false);
      alert(`Failed to update trip: ${generateTripMutation.error?.message || 'Unknown error'}`);
    }
  }, [generateTripMutation.isError, generateTripMutation.error]);

  // Estimate minimum budget when trip parameters change
  const estimateBudget = useCallback(async () => {
    if (destinations.length === 0 || !startDate || !durationDays || durationDays < 1) {
      return;
    }

    setIsEstimatingBudget(true);
    try {
      const response = await geminiService.estimateBudget({
        destinations: destinations,
        duration_days: durationDays,
        start_date: startDate,
      });

      if (response.success && response.minimum_budget) {
        setMinimumBudget(response.minimum_budget);
        // Auto-populate budget if not set or if current budget is less than minimum
        if (!budget || budget < response.minimum_budget) {
          setBudget(response.minimum_budget);
        }
      }
    } catch (error) {
      console.error("Failed to estimate budget:", error);
    } finally {
      setIsEstimatingBudget(false);
    }
  }, [destinations, startDate, durationDays, budget]);

  // Trigger budget estimation when relevant parameters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      estimateBudget();
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timeoutId);
  }, [estimateBudget]);

  const handleToggle = (label: string) => {
    if (selectedPreferences.includes(label)) {
      setSelectedPreferences(selectedPreferences.filter(p => p !== label));
    } else {
      setSelectedPreferences([...selectedPreferences, label]);
    }
  };

  const handleUpdateTrip = async () => {
    if (!destinations || destinations.length === 0 || !startDate || !durationDays) {
      alert('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);

    // Fetch images first
    await fetchModalImages(
      destinations,
      setModalImages,
      () => {
        // Build preferences object
        const userPreferences: TripPreferences = {
          adventure: selectedPreferences.includes('Adventure'),
          culture: selectedPreferences.includes('Culture'),
          relaxation: selectedPreferences.includes('Relaxation'),
          classical: selectedPreferences.includes('Classical'),
          shopping: selectedPreferences.includes('Shopping'),
          food: selectedPreferences.includes('Food'),
        };

        // Create a new AbortController for this request
        const controller = new AbortController();
        setAbortController(controller);

        generateTripMutation.mutate({
          request: {
            user_id: trip.user_id,
            destinations: destinations,
            start_location: startLocation || undefined,
            start_date: startDate,
            duration_days: durationDays,
            budget: budget,
            preferences: userPreferences,
            is_international: isInternational,
            transportation_mode: transportationMode,
          },
          signal: controller.signal,
        });
      }
    );
  };

  const handleCancelGeneration = () => {
    // Abort the ongoing request
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    // Reset the mutation state
    generateTripMutation.reset();
    setIsGenerating(false);
    setModalImages([]);
  };

  const handleClose = () => {
    if (!generateTripMutation.isPending) {
      onClose();
    }
  };

  // Check if any field has changed
  const hasChanges = () => {
    const originalPrefs: string[] = [];
    if (trip.tags && trip.tags.length > 0) {
      trip.tags.forEach(tag => {
        const matchingPref = preferenceOptions.find(
          opt => opt.label.toLowerCase() === tag.toLowerCase()
        );
        if (matchingPref) {
          originalPrefs.push(matchingPref.label);
        }
      });
    }
    if (originalPrefs.length === 0) originalPrefs.push('Relaxation');

    const budgetChanged = budget !== trip.budget;
    
    // Check destinations array
    const originalDestinations = trip.destinations && trip.destinations.length > 0 
      ? trip.destinations 
      : (trip.destination ? [trip.destination] : []);
    const destinationsChanged = JSON.stringify(destinations.sort()) !== JSON.stringify(originalDestinations.sort());

    const transportationModeChanged = transportationMode !== (trip.transportation_mode || 'default');

    return (
      destinationsChanged ||
      startLocation !== (trip.start_location || "") ||
      startDate !== (trip.start_date || "") ||
      durationDays !== (trip.duration_days || 3) ||
      isInternational !== (trip.is_international || false) ||
      budgetChanged ||
      transportationModeChanged ||
      JSON.stringify(selectedPreferences.sort()) !== JSON.stringify(originalPrefs.sort())
    );
  };

  return {
    // State
    selectedPreferences,
    destinations,
    startLocation,
    startDate,
    durationDays,
    isInternational,
    budget,
    minimumBudget,
    isEstimatingBudget,
    transportationMode,
    isGenerating,
    modalImages,
    preferenceOptions,
    isPending: generateTripMutation.isPending,

    // Setters
    setDestinations,
    setStartLocation,
    setStartDate,
    setDurationDays,
    setIsInternational,
    setBudget,
    setTransportationMode,

    // Handlers
    handleToggle,
    handleUpdateTrip,
    handleCancelGeneration,
    handleClose,
    hasChanges,
  };
};
