import { useState, useEffect } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Route } from "lucide-react";
import { RouteBuilderModal } from "./RouteBuilderModal";
import { TripsApiService } from "@/lib/api-services";
import { RouteDestination } from "@/constants";
import { useToast } from "@/hooks/use-toast";

interface RoutePlanPanelProps {
  tripId: string;
  userId: string;
  destinationCity: string;
}

export const RoutePlanPanel = ({ tripId, userId, destinationCity }: RoutePlanPanelProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableDestinations, setAvailableDestinations] = useState<RouteDestination[]>([]);
  const [startingLocation, setStartingLocation] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchDestinations = async () => {
    try {
      setIsLoading(true);
      const response = await TripsApiService.getRouteDestinations(tripId, userId);
      if (response.success) {
        setAvailableDestinations(response.destinations);
        setStartingLocation(response.arrival_hotel);
      }
    } catch (error) {
      console.error("Error fetching destinations:", error);
      toast({
        title: "Error",
        description: "Failed to load destinations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isModalOpen && availableDestinations.length === 0) {
      fetchDestinations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

  const handleOpenModal = async () => {
    // Fetch destinations before opening modal if not already loaded
    if (availableDestinations.length === 0) {
      await fetchDestinations();
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <Route className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg">Plan Your Route</CardTitle>
                <CardDescription className="text-sm">
                  Create a custom route connecting the activities in your itinerary
                </CardDescription>
              </div>
            </div>
            <Button 
              onClick={handleOpenModal} 
              disabled={isLoading} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Route className="mr-2 h-4 w-4" />
              Open Planner
            </Button>
          </div>
        </CardHeader>
      </Card>

      <RouteBuilderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tripId={tripId}
        userId={userId}
        destinationCity={destinationCity}
        startingLocation={startingLocation}
        availableDestinations={availableDestinations}
      />
    </>
  );
};
