import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, ExternalLink, Bookmark, BookmarkX, Trash2, Share2, BookOpen } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useSaveTrip, useUnsaveTrip } from "@/hooks/api-hooks";
import { TripDB } from "@/constants";
import { useNavigate } from "react-router-dom";
import { ItineraryModal } from "./ItineraryModal";
import { DeleteTripDialog } from "../../trip/DeleteTripDialog";
import { PostTripDialog } from "./PostTripDialog";
import { IssueReportModal } from "@/components/shared/IssueReportModal";
import { useToast } from "@/hooks/use-toast";

interface TripCardActionsProps {
  trip: TripDB;
}

export const TripCardActions = ({ trip }: TripCardActionsProps) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const saveTrip = useSaveTrip();
  const unsaveTrip = useUnsaveTrip();

  const handleSaveToggle = () => {
    if (!user?.id) return;

    const mutation = trip.is_saved ? unsaveTrip : saveTrip;
    mutation.mutate({
      tripId: trip.trip_id,
      userId: user.id,
    });
  };

  const handleViewTrip = () => {
    setIsModalOpen(true);
  };

  const handleFullViewTrip = () => {
    navigate(`/trip/${trip.trip_id}`);
  };


  return (
    <>
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
          onClick={handleSaveToggle}
          disabled={saveTrip.isPending || unsaveTrip.isPending}
          className="flex-1"
          aria-label={trip.is_saved ? "Remove trip from saved" : "Save trip for later"}
        >
          {saveTrip.isPending || unsaveTrip.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-1" />
              {trip.is_saved ? "Unsaving..." : "Saving..."}
            </>
          ) : trip.is_saved ? (
            <>
              <BookmarkX className="w-4 h-4 mr-1" />
              Unsave
            </>
          ) : (
            <>
              <Bookmark className="w-4 h-4 mr-1" />
              Save
            </>
          )}
        </Button>

        <PostTripDialog trip={trip}>
          <Button
            size="sm"
            className="flex-1 w-full"
            aria-label={`Post ${trip.title} to community`}
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Post
          </Button>
        </PostTripDialog>

        <DeleteTripDialog trip={trip}>
          <Button 
            variant="destructive" 
            size="sm" 
            className="flex-1"
            aria-label={`Delete ${trip.title}`}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </DeleteTripDialog>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowReportModal(true)}
          className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black"
        >
          Report Issue
        </Button>
      </div>

      <ItineraryModal
        trip={trip}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <IssueReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        tripId={trip.trip_id}
        isOwner={true}
      />
    </>
  );
};
