import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Mountain, Building, Umbrella, Music, ShoppingBag, Utensils } from "lucide-react";
import { useGenerateTrip } from "@/hooks/api-hooks";
import { geminiService } from "@/services/geminiService";
import { fetchModalImages } from "@/components/landing/tripPlanning/tripPlanningHelpers";
import { googleMapsLoader } from "@/lib/google-maps-loader";
import type { TripDB, TripPreferences, Itinerary, ImageData } from "@/constants";

interface DistanceMatrixElement {
  status: string;
  distance?: { value: number };
}
interface DistanceMatrixRow {
  elements: DistanceMatrixElement[];
}
interface DistanceMatrixResponse {
  rows: DistanceMatrixRow[];
}
interface GoogleMapsDistanceAPI {
  maps: {
    DistanceMatrixService: new () => {
      getDistanceMatrix: (
        request: { origins: string[]; destinations: string[]; travelMode: string; unitSystem: string },
        callback: (response: DistanceMatrixResponse, status: string) => void
      ) => void;
    };
    TravelMode: { DRIVING: string };
    UnitSystem: { METRIC: string };
  };
}

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
  const [isBudgetManuallySet, setIsBudgetManuallySet] = useState(false);
  const [minimumBudget, setMinimumBudget] = useState<number | undefined>(undefined);
  const [isEstimatingBudget, setIsEstimatingBudget] = useState(false);
  const [transportationMode, setTransportationMode] = useState<'default' | 'road' | 'train' | 'flight'>('default');
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [modalImages, setModalImages] = useState<ImageData[]>([]);

  const wasOpenRef = useRef(false);
  const estimateRequestIdRef = useRef(0);
  
  const generateTripMutation = useGenerateTrip();
  
  const preferenceOptions = useMemo(() => [
    { icon: Mountain, label: "Adventure" },
    { icon: Building, label: "Culture" },
    { icon: Umbrella, label: "Relaxation" },
    { icon: Music, label: "Classical" },
    { icon: ShoppingBag, label: "Shopping" },
    { icon: Utensils, label: "Food" },
  ], []);

  const normalizeTransportationMode = useCallback((mode?: string) => {
    if (mode === 'road' || mode === 'train' || mode === 'flight' || mode === 'default') return mode;
    return 'default';
  }, []);

  // Initialize form with trip data only when modal first opens
  useEffect(() => {
    if (isOpen && !wasOpenRef.current && trip) {
      wasOpenRef.current = true;

      const tripDestinations = initialDestination
        ? [initialDestination]
        : (trip.destinations && trip.destinations.length > 0
          ? trip.destinations
          : (trip.destination ? [trip.destination] : []));
      setDestinations(tripDestinations);

      setStartLocation(trip.start_location || "");
      setStartDate(trip.start_date || "");
      setDurationDays(trip.duration_days || 3);
      setIsInternational(trip.is_international || false);
      setBudget(trip.budget);
      setIsBudgetManuallySet(false);
      setTransportationMode(normalizeTransportationMode(trip.transportation_mode));

      const preferences: string[] = [];
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
      if (preferences.length === 0) {
        preferences.push('Relaxation');
      }
      setSelectedPreferences(preferences);
    }

    if (!isOpen) {
      wasOpenRef.current = false;
    }
  }, [isOpen, trip, initialDestination, preferenceOptions, normalizeTransportationMode]);

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

  const getApproxRouteDistanceKm = useCallback(async (
    origin: string,
    tripDestinations: string[]
  ): Promise<number | undefined> => {
    if (!origin || tripDestinations.length === 0) return undefined;

    try {
      await googleMapsLoader.load({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: ["places"],
      });

      const google = (window as unknown as { google?: GoogleMapsDistanceAPI }).google;
      if (!google?.maps?.DistanceMatrixService) return undefined;

      const stops = [origin, ...tripDestinations];
      const service = new google.maps.DistanceMatrixService();
      let totalMeters = 0;

      for (let i = 0; i < stops.length - 1; i++) {
        const legDistance = await new Promise<number>((resolve, reject) => {
          service.getDistanceMatrix(
            {
              origins: [stops[i]],
              destinations: [stops[i + 1]],
              travelMode: google.maps.TravelMode.DRIVING,
              unitSystem: google.maps.UnitSystem.METRIC,
            },
            (response: DistanceMatrixResponse, status: string) => {
              if (status !== "OK" || !response?.rows?.[0]?.elements?.[0]) {
                reject(new Error(`Distance matrix failed: ${status}`));
                return;
              }
              const element = response.rows[0].elements[0];
              if (element.status !== "OK" || !element.distance?.value) {
                resolve(0);
                return;
              }
              resolve(element.distance.value);
            }
          );
        });
        totalMeters += legDistance;
      }

      return totalMeters > 0 ? Math.round(totalMeters / 1000) : undefined;
    } catch (error) {
      console.warn("Distance calculation unavailable for budget estimate:", error);
      return undefined;
    }
  }, []);

  // Estimate minimum budget when trip parameters change
  const estimateBudget = useCallback(async () => {
    if (destinations.length === 0 || !startDate || !durationDays || durationDays < 1) {
      return;
    }

    const currentRequestId = ++estimateRequestIdRef.current;
    setIsEstimatingBudget(true);
    try {
      const routeDistanceKm = await getApproxRouteDistanceKm(startLocation, destinations);

      if (currentRequestId !== estimateRequestIdRef.current) return;

      const response = await geminiService.estimateBudget({
        destinations,
        duration_days: durationDays,
        start_date: startDate,
        start_location: startLocation || undefined,
        route_distance_km: routeDistanceKm,
      });

      if (currentRequestId !== estimateRequestIdRef.current) return;

      if (response.success && response.minimum_budget !== undefined) {
        setMinimumBudget(response.minimum_budget);
        if (!isBudgetManuallySet) {
          setBudget(response.minimum_budget);
        }
      }
    } catch (error) {
      if (currentRequestId !== estimateRequestIdRef.current) return;
      console.error("Failed to estimate budget:", error);
    } finally {
      if (currentRequestId === estimateRequestIdRef.current) {
        setIsEstimatingBudget(false);
      }
    }
  }, [destinations, startDate, durationDays, startLocation, isBudgetManuallySet, getApproxRouteDistanceKm]);

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
    const sortedCurrentDestinations = [...destinations].sort();
    const sortedOriginalDestinations = [...originalDestinations].sort();
    const destinationsChanged =
      JSON.stringify(sortedCurrentDestinations) !== JSON.stringify(sortedOriginalDestinations);

    const transportationModeChanged = transportationMode !== normalizeTransportationMode(trip.transportation_mode);

    return (
      destinationsChanged ||
      startLocation !== (trip.start_location || "") ||
      startDate !== (trip.start_date || "") ||
      durationDays !== (trip.duration_days || 3) ||
      isInternational !== (trip.is_international || false) ||
      budgetChanged ||
      transportationModeChanged ||
      JSON.stringify([...selectedPreferences].sort()) !== JSON.stringify([...originalPrefs].sort())
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
    setBudget: (nextBudget: number | undefined) => {
      setIsBudgetManuallySet(true);
      setBudget(nextBudget);
    },
    setTransportationMode,

    // Handlers
    handleToggle,
    handleUpdateTrip,
    handleCancelGeneration,
    handleClose,
    hasChanges,
  };
};
