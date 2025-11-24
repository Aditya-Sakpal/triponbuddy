import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, ArrowRight, Hotel, Coffee, Landmark, ExternalLink } from "lucide-react";
import { roadRouteApi, type RoadRouteResponse } from "@/services/roadRouteApi";

interface RoadPlacesNotificationProps {
  tripId: string;
  onNavigateToTransportation: () => void;
}

// Helper function to format duration from seconds string (e.g., "12892s") to readable format
const formatDuration = (duration: string): string => {
  const seconds = parseInt(duration.replace('s', ''));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

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

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "hotel":
      case "lodging":
        return <Hotel className="w-4 h-4" />;
      case "restaurant":
        return <Coffee className="w-4 h-4" />;
      case "attraction":
        return <Landmark className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
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
                View detailed route information with recommended stops in the Transportation tab.
              </p>
              <div className="flex gap-2">
                <Button onClick={handleViewPlaces} variant="default" size="sm">
                  View Places to Explore
                  <MapPin className="w-4 h-4 ml-2" />
                </Button>
                <Button onClick={onNavigateToTransportation} variant="outline" size="sm">
                  View Route Map
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Places to Explore on Your Road Trip</DialogTitle>
            <DialogDescription>
              Recommended hotels, restaurants, and attractions along your journey
            </DialogDescription>
          </DialogHeader>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading places...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {routeData && !loading && (
            <div className="space-y-6">
              {/* Route Summary */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">Route Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Distance:</span>
                    <span className="font-medium ml-2">
                      {(routeData.distance_meters / 1000).toFixed(1)} km
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Estimated Duration:</span>
                    <span className="font-medium ml-2">{formatDuration(routeData.duration)}</span>
                  </div>
                </div>
              </div>

              {/* Places Along Route */}
              {routeData.waypoints && routeData.waypoints.length > 0 ? (
                <div>
                  <h3 className="font-semibold text-lg mb-4">
                    Places Along the Route ({routeData.waypoints.length})
                  </h3>
                  <div className="space-y-3">
                    {routeData.waypoints.map((waypoint, index) => (
                      <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="mt-1 text-primary">
                                {getCategoryIcon(waypoint.category)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-1">
                                  <h4 className="font-medium text-base">{waypoint.name}</h4>
                                  {waypoint.rating && (
                                    <div className="flex items-center gap-1 ml-2">
                                      <span className="text-yellow-500">★</span>
                                      <span className="text-sm font-medium">
                                        {waypoint.rating}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground capitalize mb-2">
                                  {waypoint.category}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {waypoint.address}
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" asChild className="ml-2">
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                  waypoint.name
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No places found along this route.</p>
                </div>
              )}

              {/* Link to Transportation Tab */}
              <div className="border-t pt-4">
                <Button onClick={onNavigateToTransportation} variant="outline" className="w-full">
                  View Full Route on Map
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
