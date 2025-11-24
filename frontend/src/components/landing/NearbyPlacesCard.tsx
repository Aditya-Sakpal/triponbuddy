import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

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

interface NearbyPlacesCardProps {
  destination: Destination;
  onImageLoad?: () => void;
}

export const NearbyPlacesCard = ({ 
  destination, 
  onImageLoad 
}: NearbyPlacesCardProps) => {
  const navigate = useNavigate();

  const handleArrowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to home page with destination as query param
    const params = new URLSearchParams();
    params.set('destination', destination.name);
    navigate(`/?${params.toString()}`);
    
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="group relative flex-shrink-0 w-48 h-64 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:w-64 hover:shadow-xl">
            {/* Image */}
            <img
              src={destination.image}
              alt={destination.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onLoad={onImageLoad}
              loading="lazy"
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Tilted arrow button */}
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-3 right-3 bg-white/90 hover:bg-white text-bula backdrop-blur-sm rounded-full w-8 h-8 transform rotate-45 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:scale-110 shadow-lg"
              onClick={handleArrowClick}
            >
              <ArrowUpRight className="h-4 w-4 -rotate-45" />
            </Button>
            
            {/* Destination name on hover (bottom) */}
            <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="text-white font-semibold text-sm line-clamp-2">
                {destination.name}
              </h3>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-gray-900 text-white border-gray-700">
          <p className="font-medium">{destination.name}</p>
          {destination.state && (
            <p className="text-xs text-gray-300">{destination.state}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
