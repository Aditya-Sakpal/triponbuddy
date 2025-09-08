
import { useEffect, useState } from "react";
import { ExternalLink, MapPin, Star, Wifi, Car, Utensils, Dumbbell, Waves } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Accommodation } from "@/lib/types";
import { apiClient } from "@/lib/api-client";


interface AccommodationTabProps {
  accommodations: Accommodation[];
}

const getAmenityIcon = (amenity: string) => {
  const amenityLower = amenity.toLowerCase();
  if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return Wifi;
  if (amenityLower.includes('car') || amenityLower.includes('parking')) return Car;
  if (amenityLower.includes('restaurant') || amenityLower.includes('dining')) return Utensils;
  if (amenityLower.includes('fitness') || amenityLower.includes('gym')) return Dumbbell;
  if (amenityLower.includes('pool') || amenityLower.includes('spa')) return Waves;
  return Star; // Default icon
};


const AccommodationCard = ({ accommodation, imageUrl }: { accommodation: Accommodation, imageUrl?: string }) => {
  return (
    <Card className="h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
        {/* Image */}
        <div className="lg:col-span-1">
          <div className="aspect-square lg:aspect-auto lg:h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-t-lg lg:rounded-l-lg lg:rounded-t-none overflow-hidden">
            <img
              src={imageUrl || `https://placehold.co/400x300?text=${encodeURIComponent(accommodation.name)}`}
              alt={accommodation.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-xl">{accommodation.name}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{accommodation.location}</span>
                </div>
                <Badge variant="secondary">{accommodation.type}</Badge>
              </div>
              <div className="text-right space-y-1">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{accommodation.rating}</span>
                </div>
                <div className="text-lg font-semibold text-green-600">
                  {accommodation.price_range}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Amenities */}
            <div>
              <h4 className="font-medium mb-3">Amenities</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {accommodation.amenities.map((amenity, index) => {
                  const Icon = getAmenityIcon(amenity);
                  return (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span>{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Booking Button */}
            <Button asChild className="w-full">
              <a 
                href={accommodation.booking_url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Book Now
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </div>
      </div>
    </Card>
  );
};


export const AccommodationTab = ({ accommodations }: AccommodationTabProps) => {
  const [images, setImages] = useState<{ [location: string]: string[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setError(null);
      try {
        const locations = accommodations.map(acc => acc.location);
        if (locations.length === 0) return;
        // Use backend bulk images endpoint
        const result = await apiClient.post<{ [key: string]: string[] }>("/api/images/bulk", locations);
        setImages(result);
      } catch (err: unknown) {
        setError((err as Error)?.message || "Failed to fetch images");
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [accommodations]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Where You'll Stay</CardTitle>
          <CardDescription>
            Carefully selected accommodations for your comfort and convenience
          </CardDescription>
        </CardHeader>
      </Card>

      {loading && (
        <div className="text-center py-8 text-muted-foreground">Loading images...</div>
      )}
      {error && (
        <div className="text-center py-8 text-red-500">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {accommodations.map((accommodation, index) => {
          // Use first image for location if available
          const imageUrl = images[accommodation.location]?.[0];
          return (
            <AccommodationCard key={index} accommodation={accommodation} imageUrl={imageUrl} />
          );
        })}
      </div>

      {accommodations.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">No accommodation details available</p>
              <p className="text-sm text-muted-foreground">
                Accommodation recommendations will be added to your itinerary
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
