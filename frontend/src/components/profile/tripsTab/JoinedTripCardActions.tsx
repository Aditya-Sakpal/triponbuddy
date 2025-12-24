/**
 * Joined Trip Card Actions
 * Actions specific to joined trips (Help and Leave Trip)
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, BookOpen, LifeBuoy, LogOut, Shield, AlertCircle } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { TripDB } from "@/constants";
import { useNavigate } from "react-router-dom";
import { ItineraryModal } from "./ItineraryModal";
import { IssueReportModal } from "@/components/shared/IssueReportModal";
import { useToast } from "@/hooks/use-toast";
import { SafetyToolkitModal } from "../../shared/SafetyToolkitModal";
import { EmergencyNumberModal } from "../../shared/EmergencyNumberModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface JoinedTripCardActionsProps {
  trip: TripDB;
  onTripLeft?: () => void;
  onEmergencyNumberSet?: () => void;
}

export const JoinedTripCardActions = ({ trip, onTripLeft, onEmergencyNumberSet }: JoinedTripCardActionsProps) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSafetyToolkit, setShowSafetyToolkit] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const hasEmergencyNumber = trip.emergency_contact_number;

  const handleViewTrip = () => {
    setIsModalOpen(true);
  };

  const handleFullViewTrip = () => {
    navigate(`/trip/${trip.trip_id}`);
  };

  const handleHelp = () => {
    if (!hasEmergencyNumber) {
      setShowEmergencyModal(true);
    } else {
      setShowSafetyToolkit(true);
    }
  };

  const handleLeaveTrip = async () => {
    if (!user?.id) return;

    setIsLeaving(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/trips/leave?user_id=${user.id}&trip_id=${trip.trip_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to leave trip");
      }

      toast({
        title: "Left Trip",
        description: "You have successfully left this trip",
      });

      setShowLeaveDialog(false);

      // Notify parent to refresh the list
      if (onTripLeft) {
        onTripLeft();
      }
    } catch (error) {
      console.error("Error leaving trip:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to leave trip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <>
      {/* Emergency Number Setup Required Warning */}
      {!hasEmergencyNumber && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm mb-3">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-red-900">Action Required</p>
            <p className="text-red-700 text-xs">Set up emergency contact number for safety</p>
          </div>
          <Button
            size="sm"
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
            onClick={() => setShowEmergencyModal(true)}
          >
            <Shield className="h-3 w-3 mr-1" />
            Setup
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t">
        <Button
          size="sm"
          onClick={handleViewTrip}
          className="flex-1"
          aria-label={`View details for ${trip.title}`}
        >
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleFullViewTrip}
          className="flex-1"
          aria-label={`View full itinerary for ${trip.title}`}
        >
          <BookOpen className="w-4 h-4 mr-1" />
          Full View
        </Button>

        <Button
          size="sm"
          onClick={handleHelp}
          className="flex-1 bg-green-600 hover:bg-green-700"
          aria-label="Safety toolkit and emergency contacts"
        >
          <LifeBuoy className="w-4 h-4 mr-1" />
          Help
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowReportModal(true)}
          className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black"
        >
          <AlertCircle className="w-4 h-4 mr-1" />
          Report Issue
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowLeaveDialog(true)}
          className="flex-1 col-span-2"
          aria-label="Leave this trip"
        >
          <LogOut className="w-4 h-4 mr-1" />
          Leave Trip
        </Button>
      </div>

      {/* Modals */}
      <ItineraryModal
        trip={trip}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <SafetyToolkitModal
        isOpen={showSafetyToolkit}
        onClose={() => setShowSafetyToolkit(false)}
        tripTitle={trip.title}
        emergencyNumber={trip.emergency_contact_number}
      />

      <EmergencyNumberModal
        tripId={trip.trip_id}
        tripTitle={trip.title}
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        onSuccess={() => {
          toast({
            title: "Success",
            description: "Emergency contact saved. You can now access safety features.",
          });
          // Refresh the trip data to show updated emergency number
          if (onEmergencyNumberSet) {
            onEmergencyNumberSet();
          }
        }}
      />

      <IssueReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        tripId={trip.trip_id}
        isOwner={false}
      />

      {/* Leave Trip Confirmation Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave this trip?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave "{trip.title}"? This action will remove the trip from your joined trips 
              and notify the trip owner. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLeaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveTrip}
              disabled={isLeaving}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLeaving ? "Leaving..." : "Leave Trip"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
