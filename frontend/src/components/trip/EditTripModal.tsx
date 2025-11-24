import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { LocationAutocomplete } from "@/components/shared/location-autocomplete";
import { MapPin, Calendar, Clock, Mountain, Building, Umbrella, Music, ShoppingBag, Utensils, X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useGenerateTrip } from "@/hooks/api-hooks";
import { TripGenerationModal } from "./TripGenerationModal";
import { BudgetInput } from "@/components/landing/tripPlanning/BudgetInput";
import { DestinationList } from "@/components/landing/tripPlanning/DestinationList";
import { TransportationModeSelector } from "@/components/landing/tripPlanning/TransportationModeSelector";
import type { TripDB, TripPreferences, Itinerary, ImageData } from "@/constants";

interface EditTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripDB;
  onTripUpdated: (newTripId: string) => void;
  initialDestination?: string;
}

export const EditTripModal = ({ isOpen, onClose, trip, onTripUpdated, initialDestination }: EditTripModalProps) => {
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(['Relaxation']);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [startLocation, setStartLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [durationDays, setDurationDays] = useState<number>(3);
  const [isInternational, setIsInternational] = useState(false);
  const [budget, setBudget] = useState<number | undefined>(undefined);
  const [transportationMode, setTransportationMode] = useState<'default' | 'road' | 'train' | 'flight'>('default');
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
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
      const itinerary = trip.itinerary_data as unknown as Itinerary;
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

  const handleToggle = (label: string) => {
    if (selectedPreferences.includes(label)) {
      setSelectedPreferences(selectedPreferences.filter(p => p !== label));
    } else {
      setSelectedPreferences([...selectedPreferences, label]);
    }
  };

  const handleUpdateTrip = () => {


    if (!destinations || destinations.length === 0 || !startDate || !durationDays) {
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
        // max_passengers removed - can only be set when hosting a trip
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
    // Reset the mutation state
    generateTripMutation.reset();
    setIsGenerating(false);
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

  return (
    <>
      <TripGenerationModal 
        isOpen={isGenerating || generateTripMutation.isPending} 
        onClose={() => {}} // Can't close while generating
        destination={destinations[destinations.length - 1] || ""}
        onCancel={handleCancelGeneration}
      />
      
      <Dialog open={isOpen && !generateTripMutation.isPending} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto mt-12">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold">
                Edit Your Trip
              </DialogTitle>
            </div>
          </DialogHeader>

          <Card className="border-0 shadow-none">
            <CardContent className="p-6 space-y-6">
              {/* Location Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-start-location" className="text-sm font-medium">
                      Start Location 
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="edit-worldwide" 
                        checked={isInternational}
                        onCheckedChange={setIsInternational}
                      />
                      <Label htmlFor="edit-worldwide" className="text-sm text-muted-foreground">International</Label>
                    </div>
                  </div>
                  <LocationAutocomplete
                    id="edit-start-location"
                    value={startLocation}
                    onChange={setStartLocation}
                    placeholder="Enter your starting point"
                    icon={<MapPin className="w-4 h-4" />}
                  />
                </div>
                
                {/* Destination List with Drag & Drop */}
                <DestinationList
                  destinations={destinations}
                  onChange={setDestinations}
                  isInternational={isInternational}
                />
              </div>

              {/* Date and Duration Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="edit-start-date" className="text-sm font-medium">
                    Start Date <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      id="edit-start-date"
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

              {/* Budget Section */}
              <BudgetInput
                budget={budget}
                setBudget={setBudget}
              />

              {/* Transportation Mode Section */}
              <TransportationModeSelector
                value={transportationMode}
                onChange={setTransportationMode}
                startLocation={startLocation}
                destination={destinations[destinations.length - 1] || ''}
              />

              {/* Travel Preferences */}
              <div>
                <Label className="text-sm font-medium mb-4 block">
                  Travel Preferences 
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {preferenceOptions.map((pref, index) => {
                    const Icon = pref.icon;
                    const isSelected = selectedPreferences.includes(pref.label);
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleToggle(pref.label)}
                        className={`flex flex-col items-center space-y-2 p-4 rounded-lg border transition-all ${
                          isSelected 
                            ? 'bg-primary/10 border-primary text-primary' 
                            : 'bg-background border-border hover:border-primary/50'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-sm font-medium">{pref.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedPreferences.length} selected
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={handleClose}
                  disabled={generateTripMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateTrip}
                  disabled={
                    generateTripMutation.isPending || 
                    !destinations || 
                    destinations.length === 0 ||
                    !startDate || 
                    !durationDays ||
                    !hasChanges()
                  }
                  className="min-w-[150px]"
                >
                  {generateTripMutation.isPending ? 'Updating...' : 'Update Trip'}
                </Button>
              </div>

              {hasChanges() && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800 text-center">
                    Changes detected. Click "Update Trip" to regenerate your itinerary with the new preferences.
                  </p>
                </div>
              )}

              {!hasChanges() && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-sm text-gray-600 text-center">
                    No changes detected. Modify any field above to enable trip update.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
};
