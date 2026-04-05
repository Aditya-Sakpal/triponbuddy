import { useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { DestinationCard } from "@/components/shared/DestinationCard";
import { destinationList } from "@/content/destinationContent";
import { internationalDestinationList } from "@/content/internationalDestinations";

interface DestListProps {
  selectedLocation: string;
  selectedSeason: string;
  isWorldwide: boolean;
}

const SEASON_MONTHS: Record<string, string> = {
  summer: "May - June",
  winter: "November - February",
  monsoon: "July - September",
  autumn: "September - November",
};

export const DestList = ({ selectedLocation, selectedSeason, isWorldwide }: DestListProps) => {
  // Choose the correct destination list based on worldwide toggle
  const sourceList = isWorldwide ? internationalDestinationList : destinationList;

  // Build filtered list immutably so season/location changes never mutate source data.
  const filteredDestinations = useMemo(() => {
    const isAllSeasons = selectedSeason === "all" || selectedSeason === "all-seasons";

    const seasonMatches = (bestTimeToVisit?: string, season?: string): boolean => {
      if (isAllSeasons) return true;
      if (season && season.toLowerCase() === selectedSeason) return true;

      const timeToVisit = bestTimeToVisit?.toLowerCase() || "";
      switch (selectedSeason) {
        case "summer":
          return timeToVisit.includes("may") || timeToVisit.includes("jun");
        case "winter":
          return (
            timeToVisit.includes("nov") ||
            timeToVisit.includes("dec") ||
            timeToVisit.includes("jan") ||
            timeToVisit.includes("feb")
          );
        case "monsoon":
          return (
            timeToVisit.includes("jul") ||
            timeToVisit.includes("aug") ||
            timeToVisit.includes("sep")
          );
        case "autumn":
          return (
            timeToVisit.includes("sep") ||
            timeToVisit.includes("oct") ||
            timeToVisit.includes("nov")
          );
        default:
          return true;
      }
    };

    return sourceList
      .filter((stateData) => {
        if (selectedLocation === "all") return true;
        return stateData.state.toLowerCase().replace(/\s+/g, "-") === selectedLocation;
      })
      .map((stateData) => {
        const seasonFilteredDestinations = stateData.destinations.filter((dest) =>
          seasonMatches(dest.bestTimeToVisit, dest.season)
        );

        return {
          ...stateData,
          destinations: seasonFilteredDestinations,
          count: seasonFilteredDestinations.length,
        };
      })
      .filter((stateData) => stateData.destinations.length > 0);
  }, [sourceList, selectedLocation, selectedSeason]);

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
                            const seasonBasedDisplayMonths =
                              selectedSeason !== "all" && selectedSeason !== "all-seasons"
                                ? (SEASON_MONTHS[selectedSeason] || destination.bestTimeToVisit)
                                : destination.bestTimeToVisit;

                            // Create a compatible destination object for the unified card
                            const compatibleDestination = {
                                id: destination.id || `${stateData.state}-${index}`,
                                name: destination.name,
                                state: stateData.state,
                                description: destination.description,
                                image: '', // Empty string as placeholder - will be fetched by Places API
                                bestTimeToVisit: seasonBasedDisplayMonths
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
