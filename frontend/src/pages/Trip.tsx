import { useParams, Navigate } from "react-router-dom";
import { useTrip, useSaveTrip, useUnsaveTrip } from "@/hooks/api-hooks";
import { useUser } from "@clerk/clerk-react";
import { TripItinerary } from "@/components/trip/TripItinerary";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { LoadingState } from "@/components/shared/LoadingState";

const Trip = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const { user, isLoaded } = useUser();
  const userId = user?.id;
  
  const { 
    data: tripResponse, 
    isLoading, 
    error,
    refetch
  } = useTrip(tripId || "", userId || "");

  const { mutate: saveTrip, isPending: isSaving } = useSaveTrip();
  const { mutate: unsaveTrip, isPending: isUnsaving } = useUnsaveTrip();

  // Wait for Clerk to load
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="py-12">
            <LoadingState />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle invalid trip ID
  if (!tripId) {
    return <Navigate to="/profile" replace />;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="py-12">
            <LoadingState />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-destructive">Trip Not Found</h3>
              <p className="text-muted-foreground">
                {error.message || "The trip you're looking for doesn't exist or you don't have access to it."}
              </p>
              <button
                onClick={() => window.history.back()}
                className="text-primary hover:underline"
              >
                Go Back
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No trip data
  if (!tripResponse?.trip) {
    return <Navigate to="/profile" replace />;
  }

  const handleSaveTrip = (tripId: string) => {
    saveTrip({ tripId, userId });
  };

  const handleUnsaveTrip = (tripId: string) => {
    unsaveTrip({ tripId, userId });
  };

  const handleRefresh = async () => {
    if (refetch) {
      await refetch();
    }
  };

  return (
    <TripItinerary
      trip={tripResponse.trip}
      onSaveTrip={handleSaveTrip}
      onUnsaveTrip={handleUnsaveTrip}
      isLoading={isSaving || isUnsaving}
      onRefresh={handleRefresh}
    />
  );
};

export default Trip;
