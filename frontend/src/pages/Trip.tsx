import { useParams, Navigate } from "react-router-dom";
import { useTrip, useSaveTrip, useUnsaveTrip } from "@/hooks/api-hooks";
import { useAuthStore } from "@/lib/stores";
import { TripItinerary } from "@/components/trip/TripItinerary";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const Trip = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const { userId, isAuthenticated } = useAuthStore();
  
  // Check if this is a demo trip
  const isDemo = tripId?.startsWith('demo-trip-');
  
  const { 
    data: tripResponse, 
    isLoading, 
    error 
  } = useTrip(tripId || "", userId || "");

  // Skip API call for demo trips
  const shouldFetchTrip = !isDemo && tripId && userId;
  
  const { mutate: saveTrip, isPending: isSaving } = useSaveTrip();
  const { mutate: unsaveTrip, isPending: isUnsaving } = useUnsaveTrip();

  // Handle demo data
  let demoTrip = null;
  if (isDemo) {
    const demoData = sessionStorage.getItem('demo-trip');
    if (demoData) {
      try {
        demoTrip = JSON.parse(demoData);
      } catch (error) {
        console.error('Failed to parse demo trip data:', error);
      }
    }
  }

  // Redirect if not authenticated and not demo
  if (!isDemo && (!isAuthenticated || !userId)) {
    return <Navigate to="/" replace />;
  }

  // Handle invalid trip ID
  if (!tripId) {
    return <Navigate to="/profile" replace />;
  }

  // Loading state
  if (shouldFetchTrip && isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <h3 className="text-lg font-semibold">Loading your trip...</h3>
              <p className="text-muted-foreground">Please wait while we fetch your itinerary</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (shouldFetchTrip && error) {
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
  const currentTrip = isDemo ? demoTrip : tripResponse?.trip;
  if (!currentTrip) {
    if (isDemo) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="w-96">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold text-destructive">Demo Trip Not Found</h3>
                <p className="text-muted-foreground">
                  The demo trip data is not available. Please try generating a new trip.
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
    return <Navigate to="/profile" replace />;
  }

  const handleSaveTrip = (tripId: string) => {
    if (!isDemo) {
      saveTrip({ tripId, userId });
    }
  };

  const handleUnsaveTrip = (tripId: string) => {
    if (!isDemo) {
      unsaveTrip({ tripId, userId });
    }
  };

  return (
    <TripItinerary
      trip={currentTrip}
      onSaveTrip={handleSaveTrip}
      onUnsaveTrip={handleUnsaveTrip}
      isLoading={isSaving || isUnsaving}
    />
  );
};

export default Trip;
