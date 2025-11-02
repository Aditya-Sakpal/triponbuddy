/**
 * Forum Trip Card Component
 * Displays a shared trip in a forum post with image, title, and cost
 */

import { SharedTrip } from "@/types/forum";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, MapPin, Wallet } from "lucide-react";
import { format } from "date-fns";

interface ForumTripCardProps {
  trip: SharedTrip;
  username: string;
}

const ForumTripCard = ({ trip, username }: ForumTripCardProps) => {
  const formattedStartDate = format(new Date(trip.start_date), "MMM dd, yyyy");
  const formattedEndDate = format(new Date(trip.end_date), "MMM dd, yyyy");
  
  const tripTitle = `${username}'s trip to ${trip.destination}`;

  return (
    <Card className="overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all">
      {/* Trip Image */}
      {trip.cover_image_url && (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={trip.cover_image_url}
            alt={trip.destination}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-xl font-bold text-white drop-shadow-lg">
              {tripTitle}
            </h3>
          </div>
        </div>
      )}

      <CardContent className="p-4 space-y-3">
        {/* No image fallback */}
        {!trip.cover_image_url && (
          <h3 className="text-xl font-bold text-primary">
            {tripTitle}
          </h3>
        )}

        {/* Trip Details */}
        <div className="grid gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="font-medium">{trip.destination}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>
              {formattedStartDate} - {formattedEndDate}
            </span>
            <span className="text-xs">({trip.duration_days} days)</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Wallet className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-green-600">
              Total Cost: {trip.total_cost}
            </span>
          </div>
        </div>

        {/* View Details Link */}
        <a
          href={`/trip/${trip.trip_id}`}
          className="inline-flex items-center text-sm font-medium text-primary hover:underline mt-2"
        >
          View full itinerary →
        </a>
      </CardContent>
    </Card>
  );
};

export default ForumTripCard;
