import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useGenerateTrip } from "@/hooks/api-hooks";
import { useAuthStore } from "@/lib/stores";
import type { TripPreferences, ImageData } from "@/constants";
import { 
  generateDemoTripData, 
  buildTripPreferences, 
  fetchModalImages 
} from "./tripPlanningHelpers";
import { googlePlacesService } from "@/services/googlePlacesService";
import { geminiService } from "@/services/geminiService";
import { googleMapsLoader } from "@/lib/google-maps-loader";

interface DistanceMatrixElement {
  status: string;
  distance?: {
    value: number;
  };
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
        request: {
          origins: string[];
          destinations: string[];
          travelMode: string;
          unitSystem: string;
        },
        callback: (response: DistanceMatrixResponse, status: string) => void
      ) => void;
    };
    TravelMode: {
      DRIVING: string;
    };
    UnitSystem: {
      METRIC: string;
    };
  };
}

export const useTripPlanning = () => {
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(['Relaxation']);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [pendingDestination, setPendingDestination] = useState("");
  const [startLocation, setStartLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [durationDays, setDurationDays] = useState<number>(3);
  const [isInternational, setIsInternational] = useState(false);
  const [budget, setBudget] = useState<number | undefined>(undefined);
  const [minimumBudget, setMinimumBudget] = useState<number | undefined>(undefined);
  const [isEstimatingBudget, setIsEstimatingBudget] = useState(false);
  const [transportationMode, setTransportationMode] = useState<'default' | 'road' | 'train' | 'flight'>('default');
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [modalImages, setModalImages] = useState<ImageData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const estimateRequestIdRef = useRef(0);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const { user, isSignedIn, isLoaded } = useUser();
  const { setUser: setAuthUser } = useAuthStore();
  
  const generateTripMutation = useGenerateTrip();
  
  // Sync Clerk authentication with auth store
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      setAuthUser(user.id);
    }
  }, [isLoaded, isSignedIn, user, setAuthUser]);
  
  // Handle successful trip generation
  useEffect(() => {
    if (generateTripMutation.isSuccess && generateTripMutation.data?.trip_id) {
      setIsGenerating(false);
      setModalImages([]);
      navigate(`/trip/${generateTripMutation.data.trip_id}`);
    }
  }, [
    generateTripMutation.isSuccess, 
    generateTripMutation.data, 
    generateTripMutation.error, 
    generateTripMutation.isPending, 
    generateTripMutation.status,
    navigate
  ]);

  // Handle trip generation errors
  useEffect(() => {
    if (generateTripMutation.isError) {
      console.error('Trip generation failed:', generateTripMutation.error);
      setIsGenerating(false);
      setModalImages([]);
      alert(`Failed to generate trip: ${generateTripMutation.error?.message || 'Unknown error'}`);
    }
  }, [generateTripMutation.isError, generateTripMutation.error]);

  // Auto-fill destination from URL params
  useEffect(() => {
    const destinationParam = searchParams.get('destination');
    if (destinationParam) {
      setDestinations([destinationParam]);
    }
  }, [searchParams]);

  // Auto-populate start location from user's current location
  useEffect(() => {
    const populateStartLocation = async () => {
      // Only populate if start location is not already set
      if (startLocation) return;
      
      try {
        const cityLocation = await googlePlacesService.getCurrentCityLocation();
        if (cityLocation) {
          setStartLocation(cityLocation);
        }
      } catch {
        // Silently fail - no fallback needed per user requirement
      }
    };

    populateStartLocation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Estimate minimum budget when trip parameters change
  const getApproxRouteDistanceKm = useCallback(async (
    origin: string,
    tripDestinations: string[]
  ): Promise<number | undefined> => {
    if (!origin || tripDestinations.length === 0) {
      return undefined;
    }

    try {
      await googleMapsLoader.load({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: ["places"],
      });

      const google = (window as unknown as { google?: GoogleMapsDistanceAPI }).google;
      if (!google?.maps?.DistanceMatrixService) {
        return undefined;
      }

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

      if (totalMeters <= 0) {
        return undefined;
      }

      return Math.round(totalMeters / 1000);
    } catch (error) {
      console.warn("Distance calculation unavailable for budget estimate:", error);
      return undefined;
    }
  }, []);

  const estimateBudget = useCallback(async () => {
    const effectiveDestinations = destinations.length > 0 
      ? destinations 
      : (pendingDestination.trim() ? [pendingDestination.trim()] : []);

    if (effectiveDestinations.length === 0 || !startDate || !durationDays || durationDays < 1) {
      setMinimumBudget(undefined);
      return;
    }

    const currentRequestId = ++estimateRequestIdRef.current;
    setIsEstimatingBudget(true);
    try {
      const routeDistanceKm = await getApproxRouteDistanceKm(startLocation, effectiveDestinations);
      const response = await geminiService.estimateBudget({
        destinations: effectiveDestinations,
        duration_days: durationDays,
        start_date: startDate,
        start_location: startLocation || undefined,
        route_distance_km: routeDistanceKm,
      });

      if (currentRequestId !== estimateRequestIdRef.current) {
        return;
      }

      if (response.success && response.minimum_budget !== undefined) {
        setMinimumBudget(response.minimum_budget);
        // Keep the budget input synced with latest trip details (destination/days/date).
        setBudget(response.minimum_budget);
      }
    } catch (error) {
      if (currentRequestId !== estimateRequestIdRef.current) {
        return;
      }
      console.error("Failed to estimate budget:", error);
    } finally {
      if (currentRequestId === estimateRequestIdRef.current) {
        setIsEstimatingBudget(false);
      }
    }
  }, [destinations, pendingDestination, startDate, durationDays, startLocation, getApproxRouteDistanceKm]);

  // Trigger budget estimation when relevant parameters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      estimateBudget();
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timeoutId);
  }, [estimateBudget]);

  const getCurrentUserId = () => {
    if (isLoaded && isSignedIn && user) {
      return user.id;
    }
    return 'demo-user-' + Date.now();
  };

  const initiateTrip = (
    userId: string,
    dests: string[],
    startLoc: string,
    date: string,
    days: number,
    preferences: TripPreferences
  ) => {
    const controller = new AbortController();
    setAbortController(controller);

    generateTripMutation.mutate({
      request: {
        user_id: userId,
        destinations: dests,
        start_location: startLoc || undefined,
        start_date: date,
        duration_days: days,
        budget: budget || undefined,
        preferences,
        is_international: isInternational,
        transportation_mode: transportationMode,
        // max_passengers removed - can only be set when hosting a trip
      },
      signal: controller.signal,
    });
  };

  const handleDemo = async () => {
    const { destination, startLocation, startDate } = generateDemoTripData(isInternational);
    
    // Set demo values in form
    setDestinations([destination]);
    setStartLocation(startLocation);
    setStartDate(startDate);
    setDurationDays(3);
    setSelectedPreferences(['Relaxation', 'Food']);
    
    // Trigger trip generation after a brief delay
    setTimeout(async () => {
      const userId = getCurrentUserId();
      setIsGenerating(true);
      
      await fetchModalImages(
        destination,
        setModalImages,
        () => {
          const demoPreferences: TripPreferences = {
            adventure: false,
            culture: false,
            relaxation: true,
            classical: false,
            shopping: false,
            food: true,
          };
          initiateTrip(userId, [destination], startLocation, startDate, 3, demoPreferences);
        }
      );
    }, 100);
  };

  const handlePlanTrip = async () => {
    const userId = getCurrentUserId();

    const effectiveDestinations = destinations.length > 0 
      ? destinations 
      : (pendingDestination.trim() ? [pendingDestination.trim()] : []);

    if (effectiveDestinations.length === 0 || !startDate || !durationDays || durationDays < 1) {
      alert('Please fill in all required fields');
      return;
    }

    // Check if any destination is outside India when worldwide toggle is off
    if (!isInternational) {
      try {
        for (const destination of effectiveDestinations) {
          const isInIndia = await googlePlacesService.isLocationInIndia(destination);
          if (!isInIndia) {
            alert(
              `"${destination}" appears to be outside India. Please enable the "Worldwide" toggle to plan international trips.`
            );
            return;
          }
        }
      } catch (error) {
        console.error('Error validating destination location:', error);
        // Allow to proceed if validation fails
      }
    }

    setIsGenerating(true);

    // Pass all destinations to fetch images from all of them
    await fetchModalImages(
      effectiveDestinations,
      setModalImages,
      () => {
        const userPreferences = buildTripPreferences(selectedPreferences);
        initiateTrip(userId, effectiveDestinations, startLocation, startDate, durationDays, userPreferences);
      }
    );
  };

  const handleCancelGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    generateTripMutation.reset();
    setIsGenerating(false);
    setModalImages([]);
  };

  const handleTogglePreference = (label: string) => {
    if (selectedPreferences.includes(label)) {
      setSelectedPreferences(selectedPreferences.filter(p => p !== label));
    } else {
      setSelectedPreferences([...selectedPreferences, label]);
    }
  };

  // Check if we have at least one destination (either in array or pending)
  const hasDestination = destinations.length > 0 || pendingDestination.trim().length > 0;

  return {
    // State
    selectedPreferences,
    destinations,
    pendingDestination,
    startLocation,
    startDate,
    durationDays,
    isInternational,
    modalImages,
    isGenerating,
    isSignedIn,
    isLoaded,
    budget,
    minimumBudget,
    isEstimatingBudget,
    transportationMode,
    
    // Setters
    setDestinations,
    setPendingDestination,
    setStartLocation,
    setStartDate,
    setDurationDays,
    setIsInternational,
    setBudget,
    setTransportationMode,
    
    // Actions
    handleDemo,
    handlePlanTrip,
    handleCancelGeneration,
    handleTogglePreference,
    
    // Computed
    isPending: generateTripMutation.isPending,
    isDisabled: !hasDestination || !startDate || durationDays < 1,
  };
};
