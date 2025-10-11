
import { ExternalLink, MapPin, Star, Building, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Accommodation } from "@/constants";

export const AccommodationCard = ({ accommodation, imageUrl }: { accommodation: Accommodation, imageUrl?: string }) => {
  // Generate search URLs for booking platforms
  const locationQuery = encodeURIComponent(`${accommodation.name}, ${accommodation.location}`);
  const bookingComUrl = `https://www.booking.com/search.html?ss=${locationQuery}`;
  const makeMyTripUrl = `https://www.makemytrip.com/hotels/hotel-listing/?city=${encodeURIComponent(accommodation.location)}`;
  const agodaUrl = `https://www.agoda.com/search?city=${encodeURIComponent(accommodation.location)}`;

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/20 overflow-hidden h-full flex flex-col max-w-sm mx-auto">
      {/* Image Section - Separate from content */}
      <div className="relative overflow-hidden flex-shrink-0">
        <img
          src={imageUrl || `https://placehold.co/400x300?text=${encodeURIComponent(accommodation.name)}`}
          alt={accommodation.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Content Section - Below image with proper spacing */}
      <CardContent className="p-4 flex-1 flex flex-col space-y-3">
        {/* Title and Location */}
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-foreground">{accommodation.name}</h3>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-xs">{accommodation.location || "Location information not available"}</span>
          </div>
        </div>

        {/* Type and Rating */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-medium">{accommodation.type}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-medium">{parseFloat(accommodation.rating) === 5 ? "Excellent" : "Good"}</span>
          </div>
        </div>

        {/* Generic Description */}
        <p className="text-muted-foreground text-xs leading-relaxed">
          A comfortable place to stay during your trip.
        </p>

        {/* Price and Rating */}
        <div className="flex items-center justify-between py-2 border-y border-border">
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-blue-600">
              {accommodation.price_range}
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${i < parseFloat(accommodation.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
              />
            ))}
            <span className="ml-1 font-semibold text-sm">{accommodation.rating}/5</span>
          </div>
        </div>

        {/* Booking Section */}
        <div className="space-y-2 pt-1">
          <h4 className="font-semibold text-base">Book this accommodation:</h4>
          
          {/* 2x2 Grid of Booking Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {/* Original Booking Link */}
            <Button asChild className="w-full" size="sm">
              <a 
                href={accommodation.booking_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="text-xs">Book Now</span>
              </a>
            </Button>

            {/* Booking.com */}
            <Button asChild variant="default" className="w-full bg-[#003580] hover:bg-[#002451]" size="sm">
              <a 
                href={bookingComUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1"
              >
                <Building className="w-3.5 h-3.5" />
                <span className="text-xs">Booking.com</span>
              </a>
            </Button>

            {/* MakeMyTrip */}
            <Button asChild variant="default" className="w-full bg-[#00a6ff] hover:bg-[#0085cc]" size="sm">
              <a 
                href={makeMyTripUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="text-xs">MakeMyTrip</span>
              </a>
            </Button>

            {/* Agoda */}
            <Button asChild variant="default" className="w-full bg-[#9b1c8e] hover:bg-[#7a1671]" size="sm">
              <a 
                href={agodaUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1"
              >
                <Building className="w-3.5 h-3.5" />
                <span className="text-xs">Agoda</span>
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};