import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { DestinationCard } from "@/components/shared/DestinationCard";
import { destinationList, indianStates } from "@/content/destinationContent";
import { internationalDestinationList } from "@/content/internationalDestinations";

interface DestListProps {
  selectedLocation: string;
  selectedSeason: string;
  isWorldwide: boolean;
}

export const DestList = ({ selectedLocation, selectedSeason, isWorldwide }: DestListProps) => {
    const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
    const [preloadingComplete, setPreloadingComplete] = useState(false);

  // Choose the correct destination list based on worldwide toggle
  const sourceList = isWorldwide ? internationalDestinationList : destinationList;

  // Filter destinations based on location, season, and worldwide toggle
  const filteredDestinations = sourceList.filter(stateData => {
    // Filter by selected location
    if (selectedLocation !== "all") {
      const locationMatch = stateData.state.toLowerCase().replace(/\s+/g, '-') === selectedLocation;
      if (!locationMatch) {
        return false;
      }
    }

    // Filter by season - filter destinations within this state
    if (selectedSeason !== "all" && selectedSeason !== "all-seasons") {
      const seasonFilteredDestinations = stateData.destinations.filter(dest => {
        // Match season in bestTimeToVisit field
        const timeToVisit = dest.bestTimeToVisit?.toLowerCase() || "";
        
        switch(selectedSeason) {
          case "summer":
            return timeToVisit.includes("may") || timeToVisit.includes("jun");
          case "winter":
            return timeToVisit.includes("nov") || timeToVisit.includes("dec") || 
                   timeToVisit.includes("jan") || timeToVisit.includes("feb");
          case "monsoon":
            return timeToVisit.includes("jul") || timeToVisit.includes("aug") || 
                   timeToVisit.includes("sep");
          case "autumn":
            return timeToVisit.includes("sep") || timeToVisit.includes("oct") || 
                   timeToVisit.includes("nov");
          default:
            return true;
        }
      });
      
      // If no destinations match the season filter, exclude this state
      if (seasonFilteredDestinations.length === 0) {
        return false;
      }
      
      // Update stateData to only include filtered destinations
      stateData.destinations = seasonFilteredDestinations;
      stateData.count = seasonFilteredDestinations.length;
    }

    return true;
  });

  // Mark preloading as complete immediately since we're using Google Places API for images
  useEffect(() => {
    setPreloadingComplete(true);
  }, []);

  // Handle individual image load (kept for compatibility, though not used with Places API)
  const handleImageLoad = useCallback(() => {
    // No-op since images are loaded by Places API in DestinationCard
  }, []);

  return (
    <section className="py-12">
            <div className="container mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Destinations by Location</h2>
                
                <div className="space-y-12">
                    {filteredDestinations.map((stateData) => (
                    <div key={stateData.state} className="space-y-6 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-shadow  p-2 md:p-6 max-w-6xl mx-auto">
                        <div className="flex items-center justify-between">
                        <h3 className="text-3xl font-bold text-foreground">{stateData.state}</h3>
                        <Badge variant="secondary" className="bg-bula text-white text-xs text-center md:text-lg">
                            <span className="md:hidden">{stateData.count}</span>
                            <span className="hidden md:inline">{`${stateData.count} destinations`}</span>
                        </Badge>
                        </div>
                        
                        <div className="flex flex-row overflow-x-auto md:grid md:grid-cols-3 gap-6 horizontal-scroll">
                        {stateData.destinations.map((destination, index) => {
                            // Create a compatible destination object for the unified card
                            const compatibleDestination = {
                                id: destination.id || `${stateData.state}-${index}`,
                                name: destination.name,
                                state: stateData.state,
                                description: destination.description,
                                image: '', // Empty string as placeholder - will be fetched by Places API
                                bestTimeToVisit: destination.bestTimeToVisit
                            };
                            
                            return (
                            <div key={index} className="flex-shrink-0 w-80 md:w-auto">
                            <DestinationCard
                                destination={compatibleDestination}
                                showState={false}
                                isImageLoaded={false}
                                onImageLoad={handleImageLoad}
                            />
                            </div>
                            );
                        })}
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
