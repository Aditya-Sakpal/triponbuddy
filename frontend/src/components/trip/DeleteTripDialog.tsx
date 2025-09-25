import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useDeleteTrip } from "@/hooks/api-hooks";
import { useUser } from "@clerk/clerk-react";
import { TripDB } from "@/constants";

interface DeleteTripDialogProps {
  trip: TripDB;
  children?: React.ReactNode;
}

export const DeleteTripDialog = ({ trip, children }: DeleteTripDialogProps) => {
  const { user } = useUser();
  const deleteTrip = useDeleteTrip();

  const handleDelete = () => {
    if (!user?.id) return;
    
    deleteTrip.mutate({
      tripId: trip.trip_id,
      userId: user.id,
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children || (
          <Button variant="destructive" size="sm">
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        )}
      </AlertDialogTrigger>
      
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Trip</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{trip.title}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteTrip.isPending}
          >
            {deleteTrip.isPending ? "Deleting..." : "Delete Trip"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
