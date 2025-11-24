/**
 * Host Trip Modal Component
 * Allows users to host their trip with customizable settings
 */

import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, Share2, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TripDB } from "@/constants";
import { SharedTrip } from "@/types/forum";
import { getCalculatedBudget } from "@/utils/tripUtils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface HostTripModalProps {
  trip: TripDB;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const HostTripModal = ({
  trip,
  isOpen,
  onClose,
  onSuccess,
}: HostTripModalProps) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [maxPassengers, setMaxPassengers] = useState<string>("2");
  const [preferredGender, setPreferredGender] = useState<string>("any");
  const [ageRangeType, setAgeRangeType] = useState<string>("any");
  const [customAgeMin, setCustomAgeMin] = useState<number>(18);
  const [customAgeMax, setCustomAgeMax] = useState<number>(60);
  const [customBudget, setCustomBudget] = useState<string>("");
  const [comments, setComments] = useState<string>("");

  // Calculate minimum budget from trip activities
  const calculatedBudget = getCalculatedBudget(trip);
  const minBudgetValue = parseFloat(calculatedBudget.replace(/[₹,]/g, '')) || 0;

  // Initialize custom budget to calculated budget
  useEffect(() => {
    if (isOpen) {
      setCustomBudget(minBudgetValue.toString());
    }
  }, [isOpen, minBudgetValue]);

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be signed in to host trips",
        variant: "destructive",
      });
      return;
    }

    // Validate max passengers
    const passengers = parseInt(maxPassengers);
    if (isNaN(passengers) || passengers < 1 || passengers > 10) {
      toast({
        title: "Error",
        description: "Please enter a valid number of passengers (1-10)",
        variant: "destructive",
      });
      return;
    }

    // Validate custom budget
    const budgetValue = parseFloat(customBudget);
    if (isNaN(budgetValue) || budgetValue < minBudgetValue) {
      toast({
        title: "Error",
        description: `Budget must be at least ${calculatedBudget} (the calculated trip cost)`,
        variant: "destructive",
      });
      return;
    }

    // Validate custom age range if selected
    if (ageRangeType === "custom") {
      if (customAgeMin < 18 || customAgeMax > 120 || customAgeMin > customAgeMax) {
        toast({
          title: "Error",
          description: "Please enter a valid age range (min 18, max 120)",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Calculate age range based on selection
      let ageRangeMin = null;
      let ageRangeMax = null;

      switch (ageRangeType) {
        case "18-25":
          ageRangeMin = 18;
          ageRangeMax = 25;
          break;
        case "26-35":
          ageRangeMin = 26;
          ageRangeMax = 35;
          break;
        case "above-35":
          ageRangeMin = 36;
          ageRangeMax = 120;
          break;
        case "custom":
          ageRangeMin = customAgeMin;
          ageRangeMax = customAgeMax;
          break;
        default:
          // "any" - no age restrictions
          break;
      }

      // Update the trip to set hosting parameters and make it public
      const updatePayload = {
        is_public: true,
        max_passengers: passengers,
        preferred_gender: preferredGender === "any" ? null : preferredGender,
        age_range_min: ageRangeMin,
        age_range_max: ageRangeMax,
        custom_budget: budgetValue,
        host_comments: comments || null,
      };
      
      console.log("Updating trip with payload:", updatePayload);
      
      const updateResponse = await fetch(
        `${API_BASE_URL}/api/trips/${trip.trip_id}?user_id=${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        console.error("Failed to update trip:", errorData);
        throw new Error("Failed to update trip settings");
      }
      
      const updateResult = await updateResponse.json();
      console.log("Trip update result:", updateResult);

      // Prepare shared trip data for the forum post
      const sharedTripData: SharedTrip = {
        trip_id: trip.trip_id,
        destination: trip.destination,
        total_cost: `₹${budgetValue.toLocaleString('en-IN')}`, // Use custom budget
        cover_image_url: undefined,
        start_date: trip.start_date,
        end_date: trip.end_date || trip.start_date,
        duration_days: trip.duration_days,
      };

      // Create forum post with custom message if provided
      const defaultMessage = `Hey everyone! I'm hosting a trip to ${trip.destination} and looking for travel companions to join me. Check out the details below!`;
      const postMessage = comments 
        ? `${comments}\n\nTrip to ${trip.destination}` 
        : defaultMessage;

      const postResponse = await fetch(
        `${API_BASE_URL}/api/forum/posts?user_id=${user.id}&username=${
          user.username || user.firstName || "Anonymous"
        }`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: postMessage,
            shared_trip: sharedTripData,
          }),
        }
      );

      if (!postResponse.ok) {
        throw new Error("Failed to create forum post");
      }

      toast({
        title: "Success!",
        description: `Your trip to ${trip.destination} is now hosted and visible to the community`,
      });

      onClose();

      if (onSuccess) {
        onSuccess();
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

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset form state
      setMaxPassengers("2");
      setPreferredGender("any");
      setAgeRangeType("any");
      setCustomAgeMin(18);
      setCustomAgeMax(60);
      setCustomBudget(minBudgetValue.toString());
      setComments("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Host Your Trip
          </DialogTitle>
          <DialogDescription>
            Share your trip with the community and find travel companions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Trip Preview */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-md">
            <h4 className="font-semibold text-primary mb-1">
              {trip.title || `Trip to ${trip.destination}`}
            </h4>
            <p className="text-sm text-muted-foreground">
              📍 {trip.destination} • {trip.duration_days} days
            </p>
            <p className="text-sm font-medium text-green-600 mt-1">
              Base Budget: {calculatedBudget}
            </p>
          </div>

          {/* Number of Travelers */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="max-passengers">Number of Travelers</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Maximum number of additional travelers who can join this trip
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

          {/* Gender Preference */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Select Gender</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Preferred gender for travelers joining your trip (optional)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select value={preferredGender} onValueChange={setPreferredGender}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender preference" />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                <SelectItem value="any">Any (No restriction)</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Budget */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="custom-budget">Budget per Person (₹)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
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

          {/* Age Range */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Age Range</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Preferred age range for travelers joining your trip (optional)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <RadioGroup value={ageRangeType} onValueChange={setAgeRangeType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="any" id="age-any" />
                <Label htmlFor="age-any" className="font-normal cursor-pointer">
                  Any (No restriction)
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

            {/* Custom Age Range Inputs */}
            {ageRangeType === "custom" && (
              <div className="space-y-3 pt-2 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="age-min" className="text-sm font-medium">
                    Minimum Age: {customAgeMin}
                  </Label>
                  <Slider
                    id="age-min"
                    min={18}
                    max={120}
                    step={1}
                    value={[customAgeMin]}
                    onValueChange={(values) => setCustomAgeMin(values[0])}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age-max" className="text-sm font-medium">
                    Maximum Age: {customAgeMax}
                  </Label>
                  <Slider
                    id="age-max"
                    min={18}
                    max={120}
                    step={1}
                    value={[customAgeMax]}
                    onValueChange={(values) => setCustomAgeMax(values[0])}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Comments/Remarks */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="comments">Comments/Remarks (Optional)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Add any additional information or requirements for potential travelers
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="E.g., Looking for adventure enthusiasts, flexible with dates, etc."
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
