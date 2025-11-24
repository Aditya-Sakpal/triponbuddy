import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { googlePlacesService } from "@/services/googlePlacesService";

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
  const [placesImage, setPlacesImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageFailed, setImageFailed] = useState(false);

  // Fetch image from Google Places API
  useEffect(() => {
    let isMounted = true;

    const fetchPlacesImage = async () => {
      try {
        setImageLoading(true);
        // Combine destination name with state for better search results
        const searchQuery = destination.state 
          ? `${destination.name}, ${destination.state}`
          : destination.name;
        
        const photoUrl = await googlePlacesService.getActivityPhoto(searchQuery);
        
        if (isMounted) {
          if (photoUrl) {
            setPlacesImage(photoUrl);
            setImageFailed(false);
          } else {
            // If no photo found, use fallback
            setImageFailed(true);
          }
          setImageLoading(false);
        }
      } catch (error) {
        console.error(`Error fetching Places image for ${destination.name}:`, error);
        if (isMounted) {
          setImageFailed(true);
          setImageLoading(false);
        }
      }
    };

    fetchPlacesImage();

    return () => {
      isMounted = false;
    };
  }, [destination.name, destination.state]);

  const handleExploreClick = () => {
    // Navigate to home page with destination as query param
    const params = new URLSearchParams();
    params.set('destination', destination.name);
    navigate(`/?${params.toString()}`);
  };

  // Determine which image to display
  // Use Places API image if available, otherwise use provided image (if any), or use placeholder
  const displayImage = placesImage || destination.image || `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop`;
  const shouldShowLoader = imageLoading;

  return (
    <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-border/50 hover:border-primary/20 overflow-hidden h-full flex flex-col">
      <div className="relative overflow-hidden rounded-t-lg flex-shrink-0">
        {/* Background placeholder for loading state */}
        {shouldShowLoader && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        
        <img
          src={displayImage}
          alt={destination.name}
          className={`w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300 ${
            shouldShowLoader ? 'opacity-0' : 'opacity-100'
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
        </div>
        <div className="absolute bottom-4 right-4 text-white text-sm text-right">
          <h3 className="font-semibold">{destination.bestTimeToVisit}</h3>
        </div>
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
