/**
 * Join Trip Request Dialog
 * Allows users to request to join a trip using their profile information
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
import { Loader2, UserPlus, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/api-hooks";
import { Link } from "react-router-dom";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: userProfileData, isLoading: profileLoading } = useUserProfile(
    user?.id || ""
  );

  const isProfileComplete = userProfileData?.profile?.age && userProfileData?.profile?.gender;

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to join trips",
        variant: "destructive",
      });
      return;
    }

    // Check if profile is complete
    if (!isProfileComplete) {
      toast({
        title: "Profile Incomplete",
        description: "Please complete your profile (age and gender) before requesting to join trips.",
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

          {/* Profile Incomplete Warning */}
          {!profileLoading && !isProfileComplete && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-red-900 mb-1">Profile Incomplete</p>
                  <p className="text-xs text-red-800 mb-2">
                    Please complete your profile (age and gender) before requesting to join trips.
                  </p>
                  <Link 
                    to="/profile" 
                    className="text-xs font-medium text-red-700 hover:text-red-900 underline"
                    onClick={handleClose}
                  >
                    Go to Profile →
                  </Link>
                </div>
              </div>
            </div>
          )}



          {/* Profile Info Sharing Notice */}
          {!profileLoading && isProfileComplete && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-blue-900 mb-1">Profile Information</p>
                  <p className="text-xs text-blue-800">
                    Your profile information (age: {userProfileData?.profile?.age}, gender: {userProfileData?.profile?.gender}) will be shared with the trip owner to help them review your request.
                  </p>
                </div>
              </div>
            </div>
          )}

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
            disabled={isSubmitting || !isProfileComplete || profileLoading}
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
