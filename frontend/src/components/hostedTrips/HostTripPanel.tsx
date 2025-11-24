/**
 * Host Trip Panel Component
 * Allows users to select and host their trips
 */

import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Share2, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useUserTrips } from "@/hooks/useUserTrips";
import { useSelectedTrip } from "@/hooks/useSelectedTrip";
import { validateHostTripForm } from "@/utils/hostTripValidation";
import {
  calculateAgeRange,
  getPreferredGenderValue,
  getDefaultFormValues,
} from "@/utils/hostTripUtils";
import { hostTrip, type HostTripParams } from "@/services/hostTripService";
import { getCalculatedBudget } from "@/utils/tripUtils";

interface HostTripPanelProps {
  onTripHosted?: () => void;
}

export const HostTripPanel = ({ onTripHosted }: HostTripPanelProps) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Custom hooks
  const { trips, isLoading, error: tripsError } = useUserTrips(user?.id);
  const {
    selectedTripId,
    setSelectedTripId,
    selectedTrip,
    calculatedBudget,
    minBudgetValue,
    customBudget,
    setCustomBudget,
  } = useSelectedTrip(trips);

  // Form state
  const [maxPassengers, setMaxPassengers] = useState<string>("2");
  const [preferredGender, setPreferredGender] = useState<string>("any");
  const [ageRangeType, setAgeRangeType] = useState<string>("any");
  const [customAgeMin, setCustomAgeMin] = useState<number>(18);
  const [customAgeMax, setCustomAgeMax] = useState<number>(60);

  // Show error toast if trips failed to load
  if (tripsError) {
    toast({
      title: "Error",
      description: tripsError,
      variant: "destructive",
    });
  }

  const handleHostTrip = async () => {
    if (!user) return;

    // Validate form
    const validation = validateHostTripForm(
      selectedTrip,
      maxPassengers,
      customBudget,
      minBudgetValue,
      calculatedBudget,
      ageRangeType,
      customAgeMin,
      customAgeMax
    );

    if (!validation.isValid) {
      toast({
        title: "Error",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    if (!selectedTrip) return;

    setIsSubmitting(true);

    try {
      const budgetValue = parseFloat(customBudget);
      const passengers = parseInt(maxPassengers);
      
      // Calculate age range
      const { ageRangeMin, ageRangeMax } = calculateAgeRange(
        ageRangeType,
        customAgeMin,
        customAgeMax
      );

      // Prepare host trip parameters
      const hostParams: HostTripParams = {
        tripId: selectedTrip.trip_id,
        userId: user.id,
        maxPassengers: passengers,
        preferredGender: getPreferredGenderValue(preferredGender),
        ageRangeMin,
        ageRangeMax,
        customBudget: budgetValue,
      };

      // Host the trip
      const username = user.username || user.firstName || "Anonymous";
      await hostTrip(selectedTrip, hostParams, username);

      toast({
        title: "Success!",
        description: `Your trip to ${selectedTrip.destination} is now hosted and visible to the community`,
      });

      // Reset form to defaults
      const defaults = getDefaultFormValues();
      setSelectedTripId(defaults.selectedTripId);
      setMaxPassengers(defaults.maxPassengers);
      setPreferredGender(defaults.preferredGender);
      setAgeRangeType(defaults.ageRangeType);
      setCustomAgeMin(defaults.customAgeMin);
      setCustomAgeMax(defaults.customAgeMax);
      setCustomBudget(defaults.customBudget);

      if (onTripHosted) {
        onTripHosted();
      }
    } catch (error) {
      console.error("Error hosting trip:", error);
      toast({
        title: "Error",
        description: "Failed to host trip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Please sign in to host trips
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Host a Trip
        </CardTitle>
        <CardDescription>
          Share your trip with the community and find travel companions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              You don't have any trips yet
            </p>
            <a href="/profile?tab=trips" className="text-primary hover:underline">
              Create a trip to get started →
            </a>
          </div>
        ) : (
          <>
            {/* Trip Selection */}
            <div className="space-y-2">
              <Label htmlFor="trip-select">Select Trip</Label>
              <Select value={selectedTripId} onValueChange={setSelectedTripId}>
                <SelectTrigger id="trip-select">
                  <SelectValue placeholder="Choose a trip to host" />
                </SelectTrigger>
                <SelectContent>
                  {trips.map((trip) => (
                    <SelectItem key={trip.trip_id} value={trip.trip_id}>
                      {trip.title || `Trip to ${trip.destination}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Trip Preview */}
            {selectedTrip && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-md space-y-2">
                <h4 className="font-semibold text-primary">
                  {selectedTrip.title || `Trip to ${selectedTrip.destination}`}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {selectedTrip.destination} • {selectedTrip.duration_days} days
                </p>
                <p className="text-sm font-medium text-green-600">
                  Budget: {getCalculatedBudget(selectedTrip)}
                </p>
              </div>
            )}

            {/* Max Passengers */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="max-passengers">Maximum Passengers</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Total number of people who can join this trip (including you)
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="max-passengers"
                type="number"
                min="1"
                max="10"
                value={maxPassengers}
                onChange={(e) => setMaxPassengers(e.target.value)}
                placeholder="e.g., 4"
              />
            </div>

            {/* Custom Budget */}
            {selectedTrip && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="custom-budget">Budget per Person (₹)</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Set the budget for travelers joining your trip. Must be at least {calculatedBudget} (the base trip cost).
                          You can set a higher budget if needed.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="custom-budget"
                  type="number"
                  min={minBudgetValue}
                  value={customBudget}
                  onChange={(e) => setCustomBudget(e.target.value)}
                  placeholder={`Minimum: ${minBudgetValue}`}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum budget: {calculatedBudget}
                </p>
              </div>
            )}

            {/* Gender Preference */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Gender Preference (Optional)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Only users matching this gender can request to join. Leave as "Any" for no restriction.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select value={preferredGender} onValueChange={setPreferredGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any (No restriction)</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Age Range */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Age Range (Optional)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Only users within this age range can request to join. All users must be 18+.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <RadioGroup value={ageRangeType} onValueChange={setAgeRangeType}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="any" id="age-any" />
                  <Label htmlFor="age-any" className="font-normal cursor-pointer">
                    Any age (18+)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="18-25" id="age-18-25" />
                  <Label htmlFor="age-18-25" className="font-normal cursor-pointer">
                    18-25 years
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="26-35" id="age-26-35" />
                  <Label htmlFor="age-26-35" className="font-normal cursor-pointer">
                    26-35 years
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="above-35" id="age-above-35" />
                  <Label htmlFor="age-above-35" className="font-normal cursor-pointer">
                    Above 35 years
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="age-custom" />
                  <Label htmlFor="age-custom" className="font-normal cursor-pointer">
                    Custom range
                  </Label>
                </div>
              </RadioGroup>

              {/* Custom Age Range Sliders */}
              {ageRangeType === "custom" && (
                <div className="space-y-4 pt-2 pl-6">
                  <div className="space-y-2">
                    <Label className="text-sm">
                      Minimum Age: <span className="font-semibold">{customAgeMin}</span>
                    </Label>
                    <Slider
                      value={[customAgeMin]}
                      onValueChange={(value) => setCustomAgeMin(value[0])}
                      min={18}
                      max={120}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">
                      Maximum Age: <span className="font-semibold">{customAgeMax}</span>
                    </Label>
                    <Slider
                      value={[customAgeMax]}
                      onValueChange={(value) => setCustomAgeMax(value[0])}
                      min={18}
                      max={120}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleHostTrip}
              disabled={!selectedTripId || isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Hosting Trip...
                </>
              ) : (
                <>
                  <Share2 className="mr-2 h-4 w-4" />
                  Host Trip
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
