import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
import { MapPin, Calendar, Clock, Mountain, Building, Umbrella, Music, ShoppingBag, Utensils } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useGenerateTrip } from "@/hooks/api-hooks";
import { useAuthStore } from "@/lib/stores";
import { TripGenerationModal } from "@/components/trip/TripGenerationModal";
import type { TripPreferences } from "@/lib/types";
import { sampleTrip } from "@/content/sampleTrip";

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
      console.log('🔐 User authenticated:', { userId: user.id, isSignedIn });
    }
  }, [isLoaded, isSignedIn, user, setAuthUser]);
  
  useEffect(() => {
    console.log('Generation mutation state:', {
      isSuccess: generateTripMutation.isSuccess,
      data: generateTripMutation.data,
      error: generateTripMutation.error,
      isPending: generateTripMutation.isPending,
      status: generateTripMutation.status
    });
    
    if (generateTripMutation.isSuccess && generateTripMutation.data?.trip_id) {
      console.log('Trip generated successfully, navigating to:', generateTripMutation.data.trip_id);
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

  const preferenceOptions = [
    { icon: Mountain, label: "Adventure" },
    { icon: Building, label: "Culture" },
    { icon: Umbrella, label: "Relaxation" },
    { icon: Music, label: "Classical" },
    { icon: ShoppingBag, label: "Shopping" },
    { icon: Utensils, label: "Food" },
  ];

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
    console.log('Plan trip clicked', { 
      isSignedIn, 
      isLoaded, 
      userId: user?.id, 
      destination, 
      startDate, 
      durationDays 
    });
    
    // For demo purposes, create a temporary user ID if not authenticated
    let currentUserId = user?.id;
    if (!isLoaded || !isSignedIn || !user) {
      console.log('Not authenticated, using demo user');
      currentUserId = 'demo-user-' + Date.now();
    }

    if (!destination || !startDate || !durationDays) {
      console.log('Missing required fields');
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

    console.log('Generating trip with:', {
      user_id: currentUserId,
      destination,
      start_location: startLocation || undefined,
      start_date: startDate,
      duration_days: durationDays,
      preferences: userPreferences,
      is_international: false,
    });

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
        onClose={() => {}} // Can't close while generating
      />
      
      <div className="relative px-6">
      <div className="max-w-6xl mx-auto">
        <Card className="rounded-2xl shadow-xl border-0 bg-white">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-4xl font-bold font-latin text-foreground">
              Start Planning Your Trip with TripOnBuddy
            </CardTitle>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            {/* Location Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-3">
                <Label htmlFor="start-location" className="text-sm font-medium">
                  Start Location <span className="text-muted-foreground">ⓘ</span>
                </Label>
                <LocationAutocomplete
                  id="start-location"
                  value={startLocation}
                  onChange={setStartLocation}
                  placeholder="Enter your starting point"
                  icon={<MapPin className="w-4 h-4" />}
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Destination <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Switch id="worldwide" />
                    <Label htmlFor="worldwide" className="text-sm text-muted-foreground">Worldwide</Label>
                  </div>
                </div>
                <LocationAutocomplete
                  value={destination}
                  onChange={setDestination}
                  placeholder="Where do you want to go?"
                  icon={<MapPin className="w-4 h-4 text-primary" />}
                  required
                />
              </div>
            </div>

            {/* Date and Duration Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-3">
                <Label htmlFor="start-date" className="text-sm font-medium">
                  Start Date <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Number of Days <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    type="number"
                    min="1"
                    max="30"
                    value={durationDays}
                    onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
                    placeholder="How long is your trip?"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Travel Preferences */}
            <div className="mb-8">
              <Label className="text-sm font-medium mb-4 block">
                Travel Preferences <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {preferenceOptions.map((pref, index) => {
                  const Icon = pref.icon;
                  const isSelected = selectedPreferences.includes(pref.label);
                  return (
                    <button
                      key={index}
                      onClick={() => handleToggle(pref.label)}
                      disabled={selectedPreferences.length >= 3 && !isSelected}
                      className={`flex flex-col items-center space-y-2 p-4 rounded-lg border transition-all ${
                        isSelected 
                          ? 'bg-primary/10 border-primary text-primary' 
                          : 'bg-background border-border hover:border-primary/50'
                      } ${selectedPreferences.length >= 3 && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{pref.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {selectedPreferences.length}/3 selected
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="px-8 font-latin"
                onClick={handlePlanTrip}
                disabled={generateTripMutation.isPending || !destination || !startDate || !durationDays}
              >
                {generateTripMutation.isPending ? 'Planning...' : 'Plan My Trip'}
              </Button>
              <Button variant="outline" size="lg" className="px-8 font-latin" onClick={handleDemo}>
                🎯 DEMO
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};

