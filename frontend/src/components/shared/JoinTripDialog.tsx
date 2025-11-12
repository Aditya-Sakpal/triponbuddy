/**
 * Join Trip Request Dialog
 * Allows users to request to join a trip with age and gender
 */

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface JoinTripDialogProps {
  tripId: string;
  tripTitle: string;
  tripDestination: string;
  preferredGender?: string | null;
  ageRangeMin?: number | null;
  ageRangeMax?: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const JoinTripDialog = ({
  tripId,
  tripTitle,
  tripDestination,
  preferredGender,
  ageRangeMin,
  ageRangeMax,
  isOpen,
  onClose,
  onSuccess,
}: JoinTripDialogProps) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to join trips",
        variant: "destructive",
      });
      return;
    }

    if (!age || parseInt(age) < 1 || parseInt(age) > 120) {
      toast({
        title: "Invalid age",
        description: "Please enter a valid age between 1 and 120",
        variant: "destructive",
      });
      return;
    }

    // Validate age must be 18+
    if (parseInt(age) < 18) {
      toast({
        title: "Age Restriction",
        description: "Sorry, you must be at least 18 years old to join trips.",
        variant: "destructive",
      });
      return;
    }

    if (!gender) {
      toast({
        title: "Gender required",
        description: "Please select your gender",
        variant: "destructive",
      });
      return;
    }

    // Validate against trip's gender preference
    if (preferredGender && preferredGender !== null && preferredGender !== "" && preferredGender !== gender) {
      toast({
        title: "Gender Requirement Not Met",
        description: "We apologize, but the trip owner is looking for travel companions with similar preferences.",
        variant: "destructive",
      });
      return;
    }

    // Validate against trip's age range
    const ageNum = parseInt(age);
    if (ageRangeMin !== null && ageRangeMin !== undefined && ageNum < ageRangeMin) {
      toast({
        title: "Age Requirement Not Met",
        description: `We apologize, but the trip owner is looking for travelers aged ${ageRangeMin} and above.`,
        variant: "destructive",
      });
      return;
    }

    if (ageRangeMax !== null && ageRangeMax !== undefined && ageNum > ageRangeMax) {
      toast({
        title: "Age Requirement Not Met",
        description: `We apologize, but the trip owner is looking for travelers aged ${ageRangeMax} and below.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const userName = user.username || user.firstName || "Anonymous";
      const response = await fetch(
        `${API_BASE_URL}/api/join-requests?user_id=${user.id}&user_name=${encodeURIComponent(userName)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            trip_id: tripId,
            age: parseInt(age),
            gender: gender,
          }),
        }
      );

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.detail || data.message || "Failed to send join request");
      }

      toast({
        title: "Request sent!",
        description: "Your join request has been sent to the trip owner",
      });

      // Reset form
      setAge("");
      setGender("");
      onClose();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error sending join request:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send join request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setAge("");
      setGender("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request to Join Trip</DialogTitle>
          <DialogDescription>
            Request to join the trip to {tripDestination}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Trip Preview */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-md">
            <h4 className="font-semibold text-primary mb-1">{tripTitle}</h4>
            <p className="text-sm text-muted-foreground">📍 {tripDestination}</p>
          </div>

          {/* Requirements Info */}
          {((preferredGender && preferredGender !== null && preferredGender !== "") || 
            (ageRangeMin !== null && ageRangeMin !== undefined) || 
            (ageRangeMax !== null && ageRangeMax !== undefined)) && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-xs font-semibold text-amber-900 mb-1">Trip Requirements:</p>
              <div className="space-y-1">
                {preferredGender && preferredGender !== null && preferredGender !== "" && (
                  <p className="text-xs text-amber-800">
                    • Gender: {preferredGender.charAt(0).toUpperCase() + preferredGender.slice(1)}
                  </p>
                )}
                {((ageRangeMin !== null && ageRangeMin !== undefined) || 
                  (ageRangeMax !== null && ageRangeMax !== undefined)) && (
                  <p className="text-xs text-amber-800">
                    • Age: {ageRangeMin && ageRangeMax
                      ? `${ageRangeMin}-${ageRangeMax} years`
                      : ageRangeMin
                      ? `${ageRangeMin}+ years`
                      : `Up to ${ageRangeMax} years`}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Age Input */}
          <div className="space-y-2">
            <Label htmlFor="join-age">
              Your Age <span className="text-destructive">*</span>
            </Label>
            <Input
              id="join-age"
              type="number"
              min="18"
              max="120"
              placeholder="Enter your age (must be 18+)"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              You must be at least 18 years old to join trips
            </p>
          </div>

          {/* Gender Select */}
          <div className="space-y-2">
            <Label htmlFor="join-gender">
              Gender <span className="text-destructive">*</span>
            </Label>
            <Select
              value={gender}
              onValueChange={setGender}
              disabled={isSubmitting}
            >
              <SelectTrigger id="join-gender">
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-xs text-muted-foreground">
            The trip owner will review your request and notify you of their decision.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !age || !gender}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Send Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
