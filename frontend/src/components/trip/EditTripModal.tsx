import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { LocationAutocomplete } from "@/components/shared/location-autocomplete";
import { MapPin, Calendar, Clock } from "lucide-react";
import { TripGenerationModal } from "./TripGenerationModal";
import { BudgetInput } from "@/components/landing/tripPlanning/BudgetInput";
import { DestinationList } from "@/components/landing/tripPlanning/DestinationList";
import { TransportationModeSelector } from "@/components/landing/tripPlanning/TransportationModeSelector";
import { useEditTrip } from "./edit/useEditTrip";
import type { TripDB } from "@/constants";

interface EditTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripDB;
  onTripUpdated: (newTripId: string) => void;
  initialDestination?: string;
}

export const EditTripModal = ({ isOpen, onClose, trip, onTripUpdated, initialDestination }: EditTripModalProps) => {
  const {
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
    isPending,

    // Setters
    setDestinations,
    setStartLocation,
    setStartDate,
    setDurationDays,
    setIsInternational,
    setBudget,
    setTransportationMode,

    // Handlers
    handleToggle,
    handleUpdateTrip,
    handleCancelGeneration,
    handleClose,
    hasChanges,
  } = useEditTrip({ isOpen, onClose, trip, onTripUpdated, initialDestination });

  return (
    <>
      <TripGenerationModal 
        isOpen={isGenerating || isPending} 
        onClose={() => {}} // Can't close while generating
        destination={destinations[destinations.length - 1] || ""}
        onCancel={handleCancelGeneration}
        preloadedImages={modalImages}
      />
      
      <Dialog open={isOpen && !isPending} onOpenChange={handleClose}>
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
                    isInternational={isInternational}
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
                minimumBudget={minimumBudget}
                isEstimating={isEstimatingBudget}
              />

              {/* Transportation Mode Section */}
              <TransportationModeSelector
                value={transportationMode}
                onChange={setTransportationMode}
                startLocation={startLocation}
                destination={destinations[destinations.length - 1] || ''}
                isInternational={isInternational}
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
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateTrip}
                  disabled={
                    isPending || 
                    !destinations || 
                    destinations.length === 0 ||
                    !startDate || 
                    !durationDays ||
                    !hasChanges()
                  }
                  className="min-w-[150px]"
                >
                  {isPending ? 'Updating...' : 'Update Trip'}
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
