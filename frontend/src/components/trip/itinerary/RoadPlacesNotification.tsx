import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { roadRouteApi, type RoadRouteResponse } from "@/services/roadRouteApi";
import { RoadRouteDialog } from "./RoadRouteDialog";

interface RoadPlacesNotificationProps {
  tripId: string;
  onNavigateToTransportation: () => void;
}

export const RoadPlacesNotification = ({ tripId, onNavigateToTransportation }: RoadPlacesNotificationProps) => {
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [routeData, setRouteData] = useState<RoadRouteResponse["route"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoadRoute = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await roadRouteApi.getRoadRoute(tripId, user.id);
      
      if (response.success && response.route) {
        setRouteData(response.route);
      } else {
        setError(response.error || "Failed to load road route");
      }
    } catch (err) {
      console.error("Error fetching road route:", err);
      setError("Failed to load road route. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewPlaces = () => {
    setIsModalOpen(true);
    if (!routeData) {
      fetchRoadRoute();
    }
  };

  return (
    <>
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-green-50 to-teal-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 rounded-full p-3">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Road Places</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Discover hotels, restaurants, and attractions along your road journey. 
                View detailed route information with recommended stops.
              </p>
              <div className="flex gap-2">
                <Button onClick={handleViewPlaces} variant="default" size="sm">
                  View Places to Explore on the Road
                  <MapPin className="w-4 h-4 ml-2" />
                </Button>

              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <RoadRouteDialog 
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        routeData={routeData}
        loading={loading}
        error={error}
      />
    </>
  );
};
