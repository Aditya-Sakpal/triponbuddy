import { useState, useEffect, useCallback } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NearbyCarousel } from "./NearbyCarousel";
import { destinationList } from "@/content/destinationContent";
import { googlePlacesService, type NearbyPlace } from "@/services/googlePlacesService";

interface Destination {
  id?: string;
  name: string;
  state?: string;
  description?: string;
  image: string;
  season?: string;
  bestTimeToVisit?: string;
  rating?: number;
  types?: string[];
  distance?: number;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export const NearbyPlacesSection = () => {
  const [randomDestinations, setRandomDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [useGooglePlaces, setUseGooglePlaces] = useState(false);
  const [locationPromptShown, setLocationPromptShown] = useState(false);

  const loadFallbackDestinations = useCallback(() => {
    const allDestinations: Destination[] = [];
    
    // Flatten all destinations from all states
    destinationList.forEach(stateData => {
      stateData.destinations.forEach(dest => {
        allDestinations.push({
          id: dest.id,
          name: dest.name,
          state: stateData.state,
          description: dest.description,
          image: `https://placehold.co/800x600?text=${encodeURIComponent(dest.name)}`,
          season: dest.season,
          bestTimeToVisit: dest.bestTimeToVisit
        });
      });
    });

    // Shuffle and pick 10 random destinations
    const shuffled = [...allDestinations].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 10);
    setRandomDestinations(selected);
    setUseGooglePlaces(false);
  }, []);

  const fetchNearbyPlaces = useCallback(async () => {
    setIsLoading(true);
    setLocationError(null);
    setLocationPromptShown(true);

    try {
      // Get current location first so we can calculate distances
      const location = await googlePlacesService.getCurrentLocation();
      
      // Try to get nearby places from Google Places API
      const nearbyPlaces = await googlePlacesService.searchNearbyPlaces(
        location.latitude, 
        location.longitude, 
        50000, 
        10
      );
      
      // Transform Google Places data to Destination format
      const destinations: Destination[] = nearbyPlaces.map((place: NearbyPlace) => ({
        id: place.id,
        name: place.name,
        description: place.vicinity || `${place.types[0]?.replace(/_/g, ' ')} in your area`,
        image: place.photos?.[0] || `https://placehold.co/800x600?text=${encodeURIComponent(place.name)}`,
        rating: place.rating,
        types: place.types,
        distance: calculateDistance(
          location.latitude,
          location.longitude,
          place.location.lat,
          place.location.lng
        ),
      }));

      setRandomDestinations(destinations);
      setUseGooglePlaces(true);
      setLocationError(null);
    } catch (error) {
      // Fallback to random destinations from our curated list
      setLocationError(error instanceof Error ? error.message : 'Failed to get nearby places');
      
      // Only load fallback if we don't already have destinations
      if (randomDestinations.length === 0) {
        loadFallbackDestinations();
      }
    } finally {
      setIsLoading(false);
    }
  }, [loadFallbackDestinations, randomDestinations.length]);

  // Load curated destinations first, then try geolocation automatically
  useEffect(() => {
    // Load fallback destinations first for instant display
    loadFallbackDestinations();
    setIsLoading(false);
    
    // Then immediately try to get nearby places (this will trigger the location prompt)
    const timer = setTimeout(() => {
      fetchNearbyPlaces();
    }, 1000); // Small delay to let the UI render first

    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="py-12 bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <div className="container mx-auto px-6 mb-8">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            {useGooglePlaces ? "Nearby Places" : "Explore Destinations"}
          </h2>
        </div>
        <p className="text-gray-600">
          {useGooglePlaces 
            ? "Discover interesting places within 100km of your location"
            : "Discover hidden gems and popular destinations"}
        </p>
        {locationError && !isLoading && !useGooglePlaces && (
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <p className="text-sm text-amber-600">
              {locationError.includes('denied') 
                ? '📍 Enable location access to see places near you'
                : `📍 ${locationError}`
              }
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={fetchNearbyPlaces}
              className="text-xs"
            >
              <MapPin className="h-3 w-3 mr-1" />
              Enable Location
            </Button>
          </div>
        )}
      </div>

      {/* Carousel - Full width, no padding */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 text-bula animate-spin" />
            <p className="text-gray-600">Finding places near you...</p>
          </div>
        </div>
      ) : (
        <NearbyCarousel places={randomDestinations} />
      )}
    </section>
  );
};
