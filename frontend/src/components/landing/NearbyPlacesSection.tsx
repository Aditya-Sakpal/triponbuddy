import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NearbyPlacesCard } from "./NearbyPlacesCard";
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
}

export const NearbyPlacesSection = () => {
  const [randomDestinations, setRandomDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [useGooglePlaces, setUseGooglePlaces] = useState(false);
  const [locationPromptShown, setLocationPromptShown] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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
          image: dest.image,
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
      // Try to get nearby places from Google Places API
      const nearbyPlaces = await googlePlacesService.getNearbyPlacesFromCurrentLocation(100000, 10);
      
      // Transform Google Places data to Destination format
      const destinations: Destination[] = nearbyPlaces.map((place: NearbyPlace) => ({
        id: place.id,
        name: place.name,
        description: place.vicinity || `${place.types[0]?.replace(/_/g, ' ')} in your area`,
        image: place.photos?.[0] || `https://placehold.co/800x600?text=${encodeURIComponent(place.name)}`,
        rating: place.rating,
        types: place.types,
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

  // Check scroll position to enable/disable buttons
  const checkScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, []);

  // Scroll left
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: "smooth"
      });
    }
  };

  // Scroll right
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth"
      });
    }
  };

  // Add scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      // Initial check
      checkScroll();
      return () => container.removeEventListener("scroll", checkScroll);
    }
  }, [checkScroll, randomDestinations]);

  return (
    <section className="py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {useGooglePlaces ? "Nearby Places" : "Explore Destinations"}
            </h2>
            {useGooglePlaces && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                <MapPin className="h-3 w-3" />
                Near You
              </span>
            )}
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

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 text-bula animate-spin" />
              <p className="text-gray-600">Finding places near you...</p>
            </div>
          </div>
        ) : (
          /* Carousel Container */
          <div className="relative">
            {/* Left Arrow */}
            <Button
              variant="outline"
              size="icon"
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm rounded-full w-10 h-10 transition-all duration-300 ${
                !canScrollLeft ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
              onClick={scrollLeft}
              disabled={!canScrollLeft}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Scrollable Container */}
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-12"
              style={{ 
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                clipPath: "inset(0 0 0 0)"
              }}
            >
              {randomDestinations.map((destination, index) => (
                <NearbyPlacesCard
                  key={destination.id || `${destination.name}-${index}`}
                  destination={destination}
                />
              ))}
            </div>

            {/* Right Arrow */}
            <Button
              variant="outline"
              size="icon"
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm rounded-full w-10 h-10 transition-all duration-300 ${
                !canScrollRight ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
              onClick={scrollRight}
              disabled={!canScrollRight}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Hide scrollbar globally for this section */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};
