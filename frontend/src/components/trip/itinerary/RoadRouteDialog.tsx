import { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Hotel, Coffee, Landmark, ExternalLink } from "lucide-react";
import { googleMapsLoader } from "@/lib/google-maps-loader";
import type { RoadRouteResponse } from "@/services/roadRouteApi";

interface RoadRouteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  routeData: RoadRouteResponse["route"] | null;
  loading: boolean;
  error: string | null;
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

export const RoadRouteDialog = ({ isOpen, onOpenChange, routeData, loading, error }: RoadRouteDialogProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);

  // Initialize Google Map when route data is available
  useEffect(() => {
    const initializeMap = async () => {
      if (!routeData || !mapRef.current || !isOpen) return;

      try {
        // Load Google Maps API with marker library
        await googleMapsLoader.load({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          libraries: ['places', 'geometry', 'marker'],
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const google = (window as any).google;
        if (!google || !google.maps) return;

        // Import required libraries
        const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
        await google.maps.importLibrary("geometry");

        // Create map centered between origin and destination
        const centerLat = (routeData.origin.lat + routeData.destination.lat) / 2;
        const centerLng = (routeData.origin.lng + routeData.destination.lng) / 2;

        const map = new google.maps.Map(mapRef.current, {
          center: { lat: centerLat, lng: centerLng },
          zoom: 8,
          mapTypeControl: true,
          fullscreenControl: true,
          mapId: 'DEMO_MAP_ID', // Required for AdvancedMarkerElement
        });

        mapInstanceRef.current = map;

        // Add origin marker with custom pin
        const originPin = new PinElement({
          background: '#10b981',
          borderColor: '#ffffff',
          glyphColor: '#ffffff',
          glyphText: 'A',
          scale: 1.2,
        });

        new AdvancedMarkerElement({
          map,
          position: { lat: routeData.origin.lat, lng: routeData.origin.lng },
          title: 'Start',
          content: originPin.element,
        });

        // Add destination marker with custom pin
        const destinationPin = new PinElement({
          background: '#ef4444',
          borderColor: '#ffffff',
          glyphColor: '#ffffff',
          glyphText: 'B',
          scale: 1.2,
        });

        new AdvancedMarkerElement({
          map,
          position: { lat: routeData.destination.lat, lng: routeData.destination.lng },
          title: 'Destination',
          content: destinationPin.element,
        });

        // Add waypoint markers
        if (routeData.waypoints) {
          routeData.waypoints.forEach((waypoint) => {
            // Create custom pin based on category
            let pinColor = '#3b82f6'; // default blue
            let pinGlyph = '';
            
            switch (waypoint.category.toLowerCase()) {
              case 'hotel':
              case 'lodging':
                pinColor = '#8b5cf6'; // purple
                pinGlyph = '🏨';
                break;
              case 'restaurant':
                pinColor = '#f59e0b'; // amber
                pinGlyph = '🍽️';
                break;
              case 'attraction':
                pinColor = '#ec4899'; // pink
                pinGlyph = '🎯';
                break;
              default:
                pinColor = '#3b82f6'; // blue
                pinGlyph = '📍';
            }

            const waypointPin = new PinElement({
              background: pinColor,
              borderColor: '#ffffff',
              glyphColor: '#ffffff',
              glyphText: pinGlyph,
              scale: 1.3, // Increased scale as requested
            });

            const marker = new AdvancedMarkerElement({
              map,
              position: { lat: waypoint.location.latitude, lng: waypoint.location.longitude },
              title: waypoint.name,
              content: waypointPin.element,
            });

            // Add info window
            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="padding: 12px; max-width: 200px;">
                  <strong style="font-size: 14px;">${waypoint.name}</strong>
                  <p style="margin: 4px 0; color: #666; font-size: 12px;">${waypoint.category}</p>
                  ${waypoint.rating ? `<p style="margin: 4px 0; font-size: 12px;">⭐ ${waypoint.rating}</p>` : ''}
                  <p style="margin: 4px 0; font-size: 11px; color: #888;">${waypoint.address}</p>
                </div>
              `,
            });

            marker.addListener('click', () => {
              infoWindow.open(map, marker);
            });
          });
        }

        // Decode and display the polyline route
        if (routeData.polyline) {
          const decodedPath = google.maps.geometry.encoding.decodePath(routeData.polyline);
          const routePath = new google.maps.Polyline({
            path: decodedPath,
            geodesic: true,
            strokeColor: '#3b82f6',
            strokeOpacity: 0.8,
            strokeWeight: 4,
          });
          routePath.setMap(map);

          // Fit bounds to show entire route
          const bounds = new google.maps.LatLngBounds();
          bounds.extend({ lat: routeData.origin.lat, lng: routeData.origin.lng });
          bounds.extend({ lat: routeData.destination.lat, lng: routeData.destination.lng });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          decodedPath.forEach((point: any) => bounds.extend(point));
          map.fitBounds(bounds);
        }
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initializeMap();

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [routeData, isOpen]);

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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
            
            {/* Interactive Map */}
            <div className="rounded-lg overflow-hidden border shadow-sm">
              <div ref={mapRef} key={isOpen ? 'map-open' : 'map-closed'} className="w-full h-[400px]" />
            </div>

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
                        <div className="flex items-start gap-4">
                          {/* Image */}
                          {waypoint.photo_ref ? (
                            <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                              <img 
                                src={`https://places.googleapis.com/v1/${waypoint.photo_ref}/media?maxHeightPx=400&maxWidthPx=400&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`}
                                alt={waypoint.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-primary/5 flex items-center justify-center">
                              {getCategoryIcon(waypoint.category)}
                            </div>
                          )}

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
                            <p className="text-xs text-muted-foreground capitalize mb-2 flex items-center gap-1">
                              {getCategoryIcon(waypoint.category)}
                              {waypoint.category}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {waypoint.address}
                            </p>
                          </div>
                          
                          <Button variant="ghost" size="sm" asChild className="ml-2 self-start">
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

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
