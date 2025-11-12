/**
 * Hosted Trip Card Component
 * Displays a hosted trip with traveler demographics and join request button
 */

import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { TripDB } from "@/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Wallet, UserPlus, Users, User } from "lucide-react";
import { format } from "date-fns";
import { JoinTripDialog } from "@/components/shared/JoinTripDialog";
import { getCalculatedBudget } from "@/utils/tripUtils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface HostedTripCardProps {
  trip: TripDB;
  username?: string;
  onTripUpdated?: () => void;
}

const HostedTripCard = ({ trip, username, onTripUpdated }: HostedTripCardProps) => {
  const { user } = useUser();
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [fullTripData, setFullTripData] = useState<TripDB | null>(null);
  
  const formattedStartDate = format(new Date(trip.start_date), "MMM dd, yyyy");
  const formattedEndDate = trip.end_date 
    ? format(new Date(trip.end_date), "MMM dd, yyyy")
    : formattedStartDate;
  
  const tripTitle = username 
    ? `${username}'s trip to ${trip.destination}`
    : `Trip to ${trip.destination}`;

  // Fetch full trip data - only if user is logged in for accurate joined status
  useEffect(() => {
    const fetchTripData = async () => {
      if (!user) {
        // If no user, just use the trip prop data
        return;
      }
      
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/trips/${trip.trip_id}?user_id=${user.id}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setFullTripData(data.trip);
          }
        }
      } catch (error) {
        console.error("Error fetching trip data:", error);
      }
    };

    fetchTripData();
  }, [trip.trip_id, user]);

  // Calculate if trip is joinable
  const isJoinable = () => {
    // Use fullTripData if available for most accurate info, otherwise use trip prop
    const tripData = fullTripData || trip;
    
    if (!tripData.max_passengers) {
      return false;
    }
    
    // Can't join your own trip
    if (user && tripData.user_id === user.id) {
      return false;
    }
    
    // Check if user has already joined
    if (user && tripData.joined_users && tripData.joined_users.includes(user.id)) {
      return false;
    }
    
    const currentTravelers = (tripData.travelers || []).length;
    const joinedUsers = (tripData.joined_users || []).length;
    const currentPassengers = 1 + currentTravelers + joinedUsers; // +1 for owner
    
    const hasSlots = currentPassengers < tripData.max_passengers;
    
    return hasSlots;
  };

  const getAvailableSlots = () => {
    const tripData = fullTripData || trip;
    
    if (!tripData.max_passengers) return 0;
    
    const currentTravelers = (tripData.travelers || []).length;
    const joinedUsers = (tripData.joined_users || []).length;
    const currentPassengers = 1 + currentTravelers + joinedUsers;
    
    return tripData.max_passengers - currentPassengers;
  };

  // Check if user is on this trip (either owner or has joined)
  const isUserOnTrip = () => {
    if (!user) return false;
    
    const tripData = fullTripData || trip;
    
    // Check if user is the owner
    if (tripData.user_id === user.id) {
      return true;
    }
    
    // Check if user has joined
    if (tripData.joined_users && tripData.joined_users.includes(user.id)) {
      return true;
    }
    
    return false;
  };

  // Get traveler demographics
  const getTravelerDemographics = () => {
    const tripData = fullTripData || trip;
    const travelers = tripData.travelers || [];
    
    return travelers.map((traveler, idx) => ({
      id: `traveler-${idx}`,
      age: traveler.age,
      gender: traveler.gender,
    }));
  };

  const demographics = getTravelerDemographics();

  return (
    <Card className="overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all">
      {/* Trip Image */}
      {trip.destination_image && (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={trip.destination_image}
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
        {!trip.destination_image && (
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
              Total Cost: {getCalculatedBudget(fullTripData || trip)}
            </span>
          </div>
        </div>

        {/* Traveler Demographics */}
        {demographics.length > 0 && (
          <div className="pt-2 border-t">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              Travelers
            </h4>
            <div className="flex flex-wrap gap-2">
              {demographics.map((traveler) => (
                <div
                  key={traveler.id}
                  className="px-3 py-1 bg-primary/10 rounded-full text-xs font-medium"
                >
                  {traveler.age}y, {traveler.gender}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trip Sharing Info */}
        {trip.max_passengers && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
            <Users className="h-4 w-4" />
            <span>
              {getAvailableSlots()} {getAvailableSlots() === 1 ? 'slot' : 'slots'} available
            </span>
            <span className="text-xs text-muted-foreground/70">
              (Max {trip.max_passengers})
            </span>
          </div>
        )}

        {/* Gender and Age Requirements */}
        {trip.max_passengers && (
          <div className="pt-2 border-t space-y-1">
            {(() => {
              const tripData = fullTripData || trip;
              const hasGenderReq = tripData.preferred_gender && tripData.preferred_gender !== null && tripData.preferred_gender !== "";
              const hasAgeReq = (tripData.age_range_min !== null && tripData.age_range_min !== undefined) || 
                               (tripData.age_range_max !== null && tripData.age_range_max !== undefined);
              
              console.log('HostedTripCard specifications check:', {
                trip_id: trip.trip_id,
                preferred_gender: tripData.preferred_gender,
                age_range_min: tripData.age_range_min,
                age_range_max: tripData.age_range_max,
                hasGenderReq,
                hasAgeReq,
                fullTripDataExists: !!fullTripData
              });
              
              if (!hasGenderReq && !hasAgeReq) {
                return (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-green-600">✨ Everyone is welcome!</span>
                  </div>
                );
              }
              
              return (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground">Looking for:</p>
                  {hasGenderReq && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Gender:</span>{" "}
                      {tripData.preferred_gender!.charAt(0).toUpperCase() + tripData.preferred_gender!.slice(1)}
                    </div>
                  )}
                  {hasAgeReq && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Age:</span>{" "}
                      {tripData.age_range_min && tripData.age_range_max
                        ? `${tripData.age_range_min}-${tripData.age_range_max} years`
                        : tripData.age_range_min
                        ? `${tripData.age_range_min}+ years`
                        : `Up to ${tripData.age_range_max} years`}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* User Status Message */}
        {isUserOnTrip() && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 px-3 py-2 rounded-md">
              <UserPlus className="h-4 w-4" />
              <span>You're on this trip!</span>
            </div>
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
          
          {/* Show join button only if user is not on the trip and slots are available */}
          {!isUserOnTrip() && getAvailableSlots() > 0 && isJoinable() && (
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
      {(fullTripData || trip) && (
        <JoinTripDialog
          tripId={trip.trip_id}
          tripTitle={trip.title}
          tripDestination={trip.destination}
          preferredGender={(fullTripData || trip).preferred_gender}
          ageRangeMin={(fullTripData || trip).age_range_min}
          ageRangeMax={(fullTripData || trip).age_range_max}
          isOpen={showJoinDialog}
          onClose={() => setShowJoinDialog(false)}
          onSuccess={() => {
            // Refresh trip data after successful request
            if (onTripUpdated) {
              onTripUpdated();
            }
            setFullTripData(null);
          }}
        />
      )}
    </Card>
  );
};

export default HostedTripCard;
