/**
 * Forum Trip Card Component
 * Displays a shared trip in a forum post with image, title, and cost
 */

import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { SharedTrip } from "@/types/forum";
import { TripDB } from "@/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Wallet, UserPlus, Users } from "lucide-react";
import { format } from "date-fns";
import { JoinTripDialog } from "@/components/shared/JoinTripDialog";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface ForumTripCardProps {
  trip: SharedTrip;
  username: string;
}

const ForumTripCard = ({ trip, username }: ForumTripCardProps) => {
  const { user } = useUser();
  const [fullTripData, setFullTripData] = useState<TripDB | null>(null);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const formattedStartDate = format(new Date(trip.start_date), "MMM dd, yyyy");
  const formattedEndDate = format(new Date(trip.end_date), "MMM dd, yyyy");
  
  const tripTitle = `${username}'s trip to ${trip.destination}`;

  // Fetch full trip data to check if it's joinable
  useEffect(() => {
    const fetchTripData = async () => {
      if (!user) return;
      
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/trips/${trip.trip_id}?user_id=${user.id}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setFullTripData(data.trip);
            // Only log if trip is shareable
            if (data.trip.max_passengers) {
              console.log(`📋 Loaded shareable trip ${trip.trip_id}:`, {
                max_passengers: data.trip.max_passengers,
                travelers: data.trip.travelers?.length || 0,
                joined_users: data.trip.joined_users?.length || 0
              });
            }
          }
        } else if (response.status === 404) {
          // Trip not found or not accessible - silently handle
        } else {
          console.warn(`Unexpected response status for trip ${trip.trip_id}: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching trip data:", error);
      }
    };

    fetchTripData();
  }, [trip.trip_id, user]);

  // Calculate if trip is joinable
  const isJoinable = () => {
    // If data not loaded yet, return false (will re-render when data loads)
    if (!fullTripData || !fullTripData.max_passengers) {
      return false;
    }
    // Can't join your own trip
    if (!user || fullTripData.user_id === user.id) {
      return false;
    }
    
    const currentTravelers = (fullTripData.travelers || []).length;
    const joinedUsers = (fullTripData.joined_users || []).length;
    const currentPassengers = 1 + currentTravelers + joinedUsers; // +1 for owner
    
    const joinable = currentPassengers < fullTripData.max_passengers;
    
    // Only log when data is available and trip is joinable
    if (joinable) {
      console.log('✅ Trip is joinable:', {
        trip_id: trip.trip_id,
        max_passengers: fullTripData.max_passengers,
        currentPassengers,
        availableSlots: fullTripData.max_passengers - currentPassengers
      });
    }
    
    return joinable;
  };

  const getAvailableSlots = () => {
    if (!fullTripData || !fullTripData.max_passengers) return 0;
    
    const currentTravelers = (fullTripData.travelers || []).length;
    const joinedUsers = (fullTripData.joined_users || []).length;
    const currentPassengers = 1 + currentTravelers + joinedUsers;
    
    return fullTripData.max_passengers - currentPassengers;
  };

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

        {/* Trip Sharing Info */}
        {fullTripData?.max_passengers && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
            <Users className="h-4 w-4" />
            <span>
              {getAvailableSlots()} {getAvailableSlots() === 1 ? 'slot' : 'slots'} available
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3">
          <a
            href={`/trip/${trip.trip_id}`}
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            View full itinerary →
          </a>
          
          {isJoinable() && (
            <Button
              size="sm"
              variant="outline"
              className="ml-auto"
              onClick={() => setShowJoinDialog(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Request to Join
            </Button>
          )}
        </div>
      </CardContent>

      {/* Join Trip Dialog */}
      {fullTripData && (
        <JoinTripDialog
          tripId={trip.trip_id}
          tripTitle={fullTripData.title}
          tripDestination={trip.destination}
          isOpen={showJoinDialog}
          onClose={() => setShowJoinDialog(false)}
          onSuccess={() => {
            // Refresh trip data after successful request
            setFullTripData(null);
          }}
        />
      )}
    </Card>
  );
};

export default ForumTripCard;
