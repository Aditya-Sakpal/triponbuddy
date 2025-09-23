import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, BookmarkCheck } from "lucide-react";
import { TripDB } from "@/lib/types";
import { TripCardActions } from "@/components/trip/TripCardActions";
import { formatDate } from "@/utils/tripUtils";

interface TripCardProps {
  trip: TripDB;
}

export const TripCard = ({ trip }: TripCardProps) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-800 mb-1">{trip.title}</h3>
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{trip.destination}</span>
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

      {trip.start_location && (
        <div className="flex items-center gap-2 text-gray-600 mb-3">
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
            From: {trip.start_location}
          </span>
        </div>
      )}

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

      <div className="text-xs text-gray-400 mb-3">
        Created {formatDate(trip.created_at)}
      </div>

      <TripCardActions trip={trip} />
    </CardContent>
  </Card>
);
