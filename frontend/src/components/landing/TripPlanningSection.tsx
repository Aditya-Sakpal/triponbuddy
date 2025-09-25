import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useGenerateTrip } from "@/hooks/api-hooks";
import { useAuthStore } from "@/lib/stores";
import { TripGenerationModal } from "@/components/trip/TripGenerationModal";
import type { TripPreferences } from "@/constants";
import { sampleTrip } from "@/content/sampleTrip";
import { LocationInputs, DateDurationInputs, TravelPreferences, ActionButtons } from "./tripPlanning";

export const TripPlanningSection = () => {
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(['Relaxation']);
  const [destination, setDestination] = useState("");
  const [startLocation, setStartLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [durationDays, setDurationDays] = useState<number>(3);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Use Clerk's authentication hook
  const { user, isSignedIn, isLoaded } = useUser();
  const { setUser: setAuthUser } = useAuthStore();
  
  const generateTripMutation = useGenerateTrip();
  
  // Sync Clerk authentication with auth store
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      setAuthUser(user.id);
    }
  }, [isLoaded, isSignedIn, user, setAuthUser]);
  
  useEffect(() => {
    
    if (generateTripMutation.isSuccess && generateTripMutation.data?.trip_id) {
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
    } else if (selectedPreferences.length < 3) {
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

    // Build preferences object
    const userPreferences: TripPreferences = {
      adventure: selectedPreferences.includes('Adventure'),
      culture: selectedPreferences.includes('Culture'),
      relaxation: selectedPreferences.includes('Relaxation'),
      classical: selectedPreferences.includes('Classical'),
      shopping: selectedPreferences.includes('Shopping'),
      food: selectedPreferences.includes('Food'),
    };

    generateTripMutation.mutate({
      user_id: currentUserId,
      destination,
      start_location: startLocation || undefined,
      start_date: startDate,
      duration_days: durationDays,
      preferences: userPreferences,
      is_international: false,
    });
  };

  return (
    <>
      <TripGenerationModal 
        isOpen={generateTripMutation.isPending} 
        onClose={() => {}} 
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

