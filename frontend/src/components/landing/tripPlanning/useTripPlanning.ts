import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useGenerateTrip, useSingleImage } from "@/hooks/api-hooks";
import { useAuthStore } from "@/lib/stores";
import type { TripPreferences, ImageData } from "@/constants";
import { 
  generateDemoTripData, 
  buildTripPreferences, 
  fetchModalImages 
} from "./tripPlanningHelpers";

export const useTripPlanning = () => {
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(['Relaxation']);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [pendingDestination, setPendingDestination] = useState("");
  const [startLocation, setStartLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [durationDays, setDurationDays] = useState<number>(3);
  const [isInternational, setIsInternational] = useState(false);
  const [budget, setBudget] = useState<number | undefined>(undefined);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [modalImages, setModalImages] = useState<ImageData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const { user, isSignedIn, isLoaded } = useUser();
  const { setUser: setAuthUser } = useAuthStore();
  
  const generateTripMutation = useGenerateTrip();
  const singleImageMutation = useSingleImage();
  
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
        // max_passengers removed - can only be set when hosting a trip
      },
      signal: controller.signal,
    });
  };

  const handleDemo = () => {
    const { destination, startLocation, startDate } = generateDemoTripData(isInternational);
    
    // Set demo values in form
    setDestinations([destination]);
    setStartLocation(startLocation);
    setStartDate(startDate);
    setDurationDays(3);
    setSelectedPreferences(['Relaxation', 'Food']);
    
    // Trigger trip generation after a brief delay
    setTimeout(() => {
      const userId = getCurrentUserId();
      setIsGenerating(true);
      
      fetchModalImages(
        singleImageMutation,
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

  const handlePlanTrip = () => {
    const userId = getCurrentUserId();

    // Use pending destination if destinations array is empty but there's a typed destination
    const effectiveDestinations = destinations.length > 0 
      ? destinations 
      : (pendingDestination.trim() ? [pendingDestination.trim()] : []);

    if (effectiveDestinations.length === 0 || !startDate || !durationDays || durationDays < 1) {
      alert('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);

    // Use the final destination for modal images
    const finalDestination = effectiveDestinations[effectiveDestinations.length - 1];

    fetchModalImages(
      singleImageMutation,
      finalDestination,
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
    startLocation,
    startDate,
    durationDays,
    isInternational,
    modalImages,
    isGenerating,
    isSignedIn,
    isLoaded,
    budget,
    
    // Setters
    setDestinations,
    setPendingDestination,
    setStartLocation,
    setStartDate,
    setDurationDays,
    setIsInternational,
    setBudget,
    
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
