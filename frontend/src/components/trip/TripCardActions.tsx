import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Bookmark, BookmarkX, Trash2 } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useSaveTrip, useUnsaveTrip } from "@/hooks/api-hooks";
import { TripDB } from "@/lib/types";
import { ItineraryModal } from "./ItineraryModal";
import { DeleteTripDialog } from "./DeleteTripDialog";

interface TripCardActionsProps {
  trip: TripDB;
}

export const TripCardActions = ({ trip }: TripCardActionsProps) => {
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  return (
    <>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4 pt-3 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewTrip}
          className="flex-1"
          aria-label={`View details for ${trip.title}`}
        >
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>

        <Button
          variant={trip.is_saved ? "default" : "outline"}
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

        <DeleteTripDialog trip={trip}>
          <Button 
            variant="destructive" 
            size="sm" 
            className="sm:px-3 sm:flex-none"
            aria-label={`Delete ${trip.title}`}
          >
            <Trash2 className="w-4 h-4 sm:mr-0 mr-1" />
            <span className="sm:hidden">Delete</span>
          </Button>
        </DeleteTripDialog>
      </div>

      <ItineraryModal
        trip={trip}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
