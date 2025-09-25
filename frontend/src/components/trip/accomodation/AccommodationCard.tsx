
import { ExternalLink, MapPin, Star, Wifi, Car, Utensils, Dumbbell, Waves } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Accommodation } from "@/constants";

const getAmenityIcon = (amenity: string) => {
  const amenityLower = amenity.toLowerCase();
  if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return Wifi;
  if (amenityLower.includes('car') || amenityLower.includes('parking')) return Car;
  if (amenityLower.includes('restaurant') || amenityLower.includes('dining')) return Utensils;
  if (amenityLower.includes('fitness') || amenityLower.includes('gym')) return Dumbbell;
  if (amenityLower.includes('pool') || amenityLower.includes('spa')) return Waves;
  return Star; // Default icon
};

export const AccommodationCard = ({ accommodation, imageUrl }: { accommodation: Accommodation, imageUrl?: string }) => {
  return (
    <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-border/50 hover:border-primary/20 overflow-hidden h-full flex flex-col">
      <div className="relative overflow-hidden rounded-t-lg flex-shrink-0">
        <img
          src={imageUrl || `https://placehold.co/400x300?text=${encodeURIComponent(accommodation.name)}`}
          alt={accommodation.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-xl font-semibold">{accommodation.name}</h3>
          <div className="flex items-center gap-2 text-sm text-white/80">
            <MapPin className="w-4 h-4" />
            <span>{accommodation.location}</span>
          </div>
          <Badge variant="secondary" className="mt-1">{accommodation.type}</Badge>
        </div>
      </div>
      <CardContent className="p-6 flex-1 flex flex-col">

        <div className="flex-1">
          <h4 className="font-medium mb-3">Amenities</h4>
          <div className="grid grid-cols-2 gap-2">
            {accommodation.amenities.slice(0, 4).map((amenity, index) => {
              const Icon = getAmenityIcon(amenity);
              return (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span>{amenity}</span>
                </div>
              );
            })}
          </div>
          <div className="text-center mb-4">
            <div className="flex gap-1">
                <span className="text-lg font-semibold text-green-600">
                  {accommodation.price_range}
                </span>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{accommodation.rating}</span>
            </div>
          </div>
          <h1 className="font-medium my-3 text-xl">Book this accommodation</h1>
        </div>
        <Button asChild className="w-full mt-auto">
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
    </Card>
  );
};