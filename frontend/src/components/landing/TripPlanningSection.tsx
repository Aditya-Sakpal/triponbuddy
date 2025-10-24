import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TripGenerationModal } from "@/components/trip/TripGenerationModal";
import { LocationInputs, DateDurationInputs, TravelPreferences, ActionButtons } from "./tripPlanning";
import { useTripPlanning } from "./tripPlanning/useTripPlanning";

export const TripPlanningSection = () => {
  const {
    // State
    selectedPreferences,
    destination,
    startLocation,
    startDate,
    durationDays,
    isInternational,
    modalImages,
    isGenerating,
    isSignedIn,
    isLoaded,
    
    // Setters
    setDestination,
    setStartLocation,
    setStartDate,
    setDurationDays,
    setIsInternational,
    
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
        destination={destination}
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
              <LocationInputs
                startLocation={startLocation}
                setStartLocation={setStartLocation}
                destination={destination}
                setDestination={setDestination}
                isInternational={isInternational}
                setIsInternational={setIsInternational}
              />

              <DateDurationInputs
                startDate={startDate}
                setStartDate={setStartDate}
                durationDays={durationDays}
                setDurationDays={setDurationDays}
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

