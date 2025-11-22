import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NearbyPlacesCard } from "./NearbyPlacesCard";
import { destinationList } from "@/content/destinationContent";

interface Destination {
  id?: string;
  name: string;
  state?: string;
  description: string;
  image: string;
  season?: string;
  bestTimeToVisit?: string;
}

export const NearbyPlacesSection = () => {
  const [randomDestinations, setRandomDestinations] = useState<Destination[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Get 10 random destinations from the list
  useEffect(() => {
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
  }, []);

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
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Nearby Places
          </h2>
          <p className="text-gray-600">
            Discover hidden gems and popular destinations around you
          </p>
        </div>

        {/* Carousel Container */}
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
