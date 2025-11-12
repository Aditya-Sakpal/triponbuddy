import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TripGenerationModal } from "@/components/trip/TripGenerationModal";
import { DateDurationInputs, TravelPreferences, TravelerInput, BudgetInput, ActionButtons, DestinationList } from "./tripPlanning";
import { useTripPlanning } from "./tripPlanning/useTripPlanning";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
import { MapPin } from "lucide-react";

export const TripPlanningSection = () => {
  const {
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
    travelers,
    budget,
    
    // Setters
    setDestinations,
    setPendingDestination,
    setStartLocation,
    setStartDate,
    setDurationDays,
    setIsInternational,
    setTravelers,
    setBudget,
    
    // Actions
    handleDemo,
    handlePlanTrip,
    handleCancelGeneration,
    handleTogglePreference,
    
    // Computed
    isPending,
    isDisabled,
  } = useTripPlanning();

  return (
    <>
      <TripGenerationModal 
        isOpen={isGenerating || isPending} 
        onClose={() => {}}
        destination={destinations[destinations.length - 1] || ""}
        onCancel={handleCancelGeneration}
        preloadedImages={modalImages}
      />
      
      <div className="relative px-6 overflow-x-hidden pb-12">
        <div className="max-w-6xl mx-auto">
          <Card className="rounded-2xl shadow-xl border-0 bg-white">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-4xl font-bold font-latin text-foreground">
                Start Planning Your Trip with TripOnBuddy
              </CardTitle>
            </CardHeader>
            
            <CardContent className="px-8 pb-8">
              {/* Start Location and International Toggle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="start-location" className="text-sm font-medium">
                      Start Location 
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="worldwide" 
                        checked={isInternational}
                        onCheckedChange={setIsInternational}
                      />
                      <Label htmlFor="worldwide" className="text-sm text-muted-foreground">Worldwide</Label>
                    </div>
                  </div>
                  <LocationAutocomplete
                    id="start-location"
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
                  onPendingDestinationChange={setPendingDestination}
                  isInternational={isInternational}
                />
              </div>

              <DateDurationInputs
                startDate={startDate}
                setStartDate={setStartDate}
                durationDays={durationDays}
                setDurationDays={setDurationDays}
              />

              <TravelerInput
                travelers={travelers}
                setTravelers={setTravelers}
              />

              <BudgetInput
                budget={budget}
                setBudget={setBudget}
              />

              <TravelPreferences
                selectedPreferences={selectedPreferences}
                onToggle={handleTogglePreference}
              />

              <ActionButtons
                onPlanTrip={handlePlanTrip}
                onDemo={handleDemo}
                isGenerating={isPending}
                isDisabled={isDisabled}
                isSignedIn={isSignedIn}
                isLoaded={isLoaded}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

