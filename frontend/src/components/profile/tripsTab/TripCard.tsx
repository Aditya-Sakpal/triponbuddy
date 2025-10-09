import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, BookmarkCheck } from "lucide-react";
import { TripDB, Itinerary } from "@/constants";
import { TripCardActions } from "@/components/trip";
import { formatDate } from "@/utils/tripUtils";

interface TripCardProps {
  trip: TripDB;
}

export const TripCard = ({ trip }: TripCardProps) => {
  console.log('TripCard - destination_image:', trip.destination_image);
  
  const itinerary = trip.itinerary_data as unknown as Itinerary;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Destination Image */}
          {trip.destination_image && (
            <div className="w-full">
              <img
                src={trip.destination_image}
                alt={trip.destination}
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  console.error('Image failed to load:', trip.destination_image);
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', trip.destination_image);
                }}
              />
            </div>
          )}

          {/* Trip Details */}
          <div className="w-full">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-bula mb-1">{trip.title}</h3>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{trip.destination}</span>
              </div>

            <div className="flex gap-2 mb-3">
              {trip.start_location && (
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  From: {trip.start_location}
                </span>
              )}
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                Type: {trip.is_international ? "International" : "Domestic"}
              </span>
            </div>

            </div>
            {trip.is_saved && (
              <BookmarkCheck className="h-5 w-5 text-bula" />
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(trip.start_date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{trip.duration_days} {trip.duration_days === 1 ? 'day' : 'days'}</span>
            </div>
          </div>

          

          {trip.tags && trip.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {trip.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {trip.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{trip.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {itinerary?.estimated_total_cost && (
            <div className="mb-3">
              <Badge variant="secondary" className="text-xs">
                Total Cost: {(() => {
                  const match = itinerary.estimated_total_cost.match(/₹[^()]+/);
                  return match ? match[0].trim().replace(/ - ₹/g, ' - ') : itinerary.estimated_total_cost.replace(/ - ₹/g, ' - ');
                })()}
              </Badge>
            </div>
          )}

          <div className="text-xs text-gray-400 mb-3">
            Created {formatDate(trip.created_at)}
          </div>

          <TripCardActions trip={trip} />
        </div>
      </div>
    </CardContent>
  </Card>
  );
};
