import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useGenerateTrip, useSingleImage } from "@/hooks/api-hooks";
import { useAuthStore } from "@/lib/stores";
import { TripGenerationModal } from "@/components/trip/TripGenerationModal";
import type { TripPreferences, ImageData } from "@/constants";
import { sampleTrip } from "@/content/sampleTrip";
import { LocationInputs, DateDurationInputs, TravelPreferences, ActionButtons } from "./tripPlanning";

export const TripPlanningSection = () => {
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(['Relaxation']);
  const [destination, setDestination] = useState("");
  const [startLocation, setStartLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [durationDays, setDurationDays] = useState<number>(3);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [modalImages, setModalImages] = useState<ImageData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Use Clerk's authentication hook
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
      setDestination(destinationParam);
    }
  }, [searchParams]);


  const handleToggle = (label: string) => {
    if (selectedPreferences.includes(label)) {
      setSelectedPreferences(selectedPreferences.filter(p => p !== label));
    } else {
      setSelectedPreferences([...selectedPreferences, label]);
    }
  };

  const handleDemo = () => {
    // Navigate to a demo trip page with sample data
    
    // Store demo trip data in sessionStorage for the demo trip page
    sessionStorage.setItem('demo-trip', JSON.stringify(sampleTrip));
    navigate(`/trip/demo-trip-${Date.now()}`);
  };

  const handlePlanTrip = () => {

    // For demo purposes, create a temporary user ID if not authenticated
    let currentUserId = user?.id;
    if (!isLoaded || !isSignedIn || !user) {
      currentUserId = 'demo-user-' + Date.now();
    }

    if (!destination || !startDate || !durationDays || durationDays < 1) {
      alert('Please fill in all required fields');
      return;
    }

    // Set generating state to show modal immediately
    setIsGenerating(true);

    // Step 1: Fetch images for the modal first
    singleImageMutation.mutate(
      {
        location: destination,
        max_images: 5,
        min_width: 800,
        min_height: 600,
      },
      {
        onSuccess: (data) => {
          if (data.images && data.images.length > 0) {
            setModalImages(data.images);
          } else {
            // Set placeholder images if no images found
            setModalImages([
              {
                url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
                width: 800,
                height: 600,
                source: "unsplash",
                title: destination
              },
              {
                url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
                width: 800,
                height: 600,
                source: "unsplash",
                title: destination
              },
              {
                url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop",
                width: 800,
                height: 600,
                source: "unsplash",
                title: destination
              }
            ]);
          }
          
          // Step 2: Now start trip generation
          startTripGeneration(currentUserId);
        },
        onError: () => {
          // Set placeholder images on error
          setModalImages([
            {
              url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
              width: 800,
              height: 600,
              source: "unsplash",
              title: destination
            },
            {
              url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
              width: 800,
              height: 600,
              source: "unsplash",
              title: destination
            },
            {
              url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop",
              width: 800,
              height: 600,
              source: "unsplash",
              title: destination
            }
          ]);
          
          // Step 2: Start trip generation even if images failed
          startTripGeneration(currentUserId);
        }
      }
    );
  };

  const startTripGeneration = (currentUserId: string) => {
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
        user_id: currentUserId,
        destination,
        start_location: startLocation || undefined,
        start_date: startDate,
        duration_days: durationDays,
        preferences: userPreferences,
        is_international: false,
      },
      signal: controller.signal,
    });
  };

  const handleCancelGeneration = () => {
    // Abort the ongoing request
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    // Reset the mutation state to cancel the request
    generateTripMutation.reset();
    setIsGenerating(false);
    setModalImages([]);
  };

  return (
    <>
      <TripGenerationModal 
        isOpen={isGenerating || generateTripMutation.isPending} 
        onClose={() => {}}
        destination={destination}
        onCancel={handleCancelGeneration}
        preloadedImages={modalImages}
      />
      
      <div className="relative px-6 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <Card className="rounded-2xl shadow-xl border-0 bg-white">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-4xl font-bold font-latin text-foreground">
              Start Planning Your Trip with TripOnBuddy
            </CardTitle>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <LocationInputs
              startLocation={startLocation}
              setStartLocation={setStartLocation}
              destination={destination}
              setDestination={setDestination}
            />

            <DateDurationInputs
              startDate={startDate}
              setStartDate={setStartDate}
              durationDays={durationDays}
              setDurationDays={setDurationDays}
            />

            <TravelPreferences
              selectedPreferences={selectedPreferences}
              onToggle={handleToggle}
            />

            <ActionButtons
              onPlanTrip={handlePlanTrip}
              onDemo={handleDemo}
              isGenerating={generateTripMutation.isPending}
              isDisabled={!destination || !startDate || !durationDays}
            />
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};

