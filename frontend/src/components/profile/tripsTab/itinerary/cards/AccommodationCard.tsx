import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bed, MapPin, ExternalLink } from "lucide-react";
import { Accommodation } from "@/constants";
import { formatTitleCase } from "@/utils/tripUtils";
import { formatCurrency } from "../utils/formatters";

interface ImageMap {
  [location: string]: string[];
}

interface AccommodationCardProps {
  accommodation: Accommodation[];
  accommodationImages?: ImageMap;
}

interface AccommodationItemProps {
  acc: Accommodation;
  imageUrl?: string;
}

const AccommodationItem = ({ acc, imageUrl }: AccommodationItemProps) => {
  return (
    <div className="border rounded-lg p-3">
      <div className="flex gap-4">
        {/* Accommodation Image - Small card on the left */}
        <div className="w-24 h-24 flex-shrink-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg overflow-hidden">
          <img
            src={imageUrl || `https://placehold.co/100x100?text=${encodeURIComponent(acc.name)}`}
            alt={acc.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        
        {/* Accommodation Content - Right side */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h5 className="font-medium">{acc.name}</h5>
              {acc.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{acc.location}</span>
                </div>
              )}
              {acc.type && (
                <Badge variant="outline" className="mt-1">
                  {formatTitleCase(acc.type)}
                </Badge>
              )}
            </div>
            {acc.price_range && (
              <div className="text-right flex-shrink-0">
                <p className="font-medium text-green-600">
                  {formatCurrency(acc.price_range)}
                </p>
              </div>
            )}
          </div>
          {acc.amenities && acc.amenities.length > 0 && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-1">
                {acc.amenities.slice(0, 3).map((amenity, amenityIndex) => (
                  <Badge key={amenityIndex} variant="outline" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
                {acc.amenities.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{acc.amenities.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {acc.booking_url && (
        <Button size="sm" className="mt-2 pdf-hide" asChild>
          <a href={acc.booking_url} target="_blank" rel="noopener noreferrer">
            View Details
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </Button>
      )}
    </div>
  );
};

export const AccommodationCard = ({ accommodation, accommodationImages = {} }: AccommodationCardProps) => {
  if (!accommodation || accommodation.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bed className="h-5 w-5" />
          Accommodation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {accommodation.map((acc: Accommodation, index: number) => (
            <AccommodationItem 
              key={index} 
              acc={acc} 
              imageUrl={accommodationImages[acc.location]?.[0]}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
