import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TripGenerationModal } from "@/components/trip/TripGenerationModal";
import { DateDurationInputs, TravelPreferences, BudgetInput, ActionButtons, DestinationList, TransportationModeSelector } from "./tripPlanning";
import { useTripPlanning } from "./tripPlanning/useTripPlanning";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LocationAutocomplete } from "@/components/shared/location-autocomplete";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MapPin, Info } from "lucide-react";

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
              <TooltipProvider>
                {/* Start Location and International Toggle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="start-location" className="text-sm font-medium">
                          Start Location
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Enter the city or location where your journey begins</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="worldwide" 
                          checked={isInternational}
                          onCheckedChange={setIsInternational}
                        />
                        <Label htmlFor="worldwide" className="text-sm text-muted-foreground">Worldwide</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Toggle to search destinations worldwide or within India only</p>
                          </TooltipContent>
                        </Tooltip>
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

              <BudgetInput
                budget={budget}
                setBudget={setBudget}
                minimumBudget={minimumBudget}
                isEstimating={isEstimatingBudget}
              />

              <TransportationModeSelector
                value={transportationMode}
                onChange={setTransportationMode}
                startLocation={startLocation}
                destination={destinations[destinations.length - 1] || ''}
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
              </TooltipProvider>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

