import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowRight, Info } from "lucide-react";

interface Destination {
  id?: string;
  name: string;
  state?: string;
  description: string;
  image: string;
  season?: string;
  bestTimeToVisit?: string;
}

interface DestinationCardProps {
  destination: Destination;
  showState?: boolean;
  isImageLoaded?: boolean;
  onImageLoad?: () => void;
}

export const DestinationCard = ({ 
  destination, 
  showState = false, 
  isImageLoaded = true,
  onImageLoad 
}: DestinationCardProps) => {
  const navigate = useNavigate();

  const handleExploreClick = () => {
    // Navigate to home page with destination as query param
    const params = new URLSearchParams();
    params.set('destination', destination.name);
    navigate(`/?${params.toString()}`);
  };

  return (
    <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-border/50 hover:border-primary/20 overflow-hidden h-full flex flex-col">
      <div className="relative overflow-hidden rounded-t-lg flex-shrink-0">
        {/* Background placeholder for loading state */}
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bula"></div>
          </div>
        )}
        
        <img
          src={destination.image}
          alt={destination.name}
          className={`w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300 ${
            isImageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={onImageLoad}
          loading="eager"
          decoding="async"
          style={{ 
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-xl font-semibold">{destination.name}</h3>
          {showState && destination.state && (
            <p className="text-white/80 text-sm">{destination.state}</p>
          )}
        </div>
        {destination.bestTimeToVisit && (
          <div className="absolute bottom-4 right-4 z-10">
            <TooltipProvider delayDuration={200} skipDelayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="bg-black/50 hover:bg-black/70 rounded-full p-2 text-white transition-colors">
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="z-[99] pr-24">
                  <p>Best time to visit: <br/>{destination.bestTimeToVisit}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
      <CardContent className="p-6 flex-1 flex flex-col">
        <CardDescription className="text-muted-foreground mb-4 flex-1 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
          {destination.description}
        </CardDescription>
        <Button
          variant="ghost"
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors mt-auto"
          onClick={handleExploreClick}
        >
          Explore Destination
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};
