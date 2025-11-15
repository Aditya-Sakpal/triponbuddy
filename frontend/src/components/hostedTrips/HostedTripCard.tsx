/**
 * Hosted Trip Card Component
 * Displays a hosted trip with traveler demographics and join request button
 */

import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { TripDB } from "@/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Wallet, UserPlus, Users, User, Bell } from "lucide-react";
import { format } from "date-fns";
import { JoinTripDialog } from "@/components/shared/JoinTripDialog";
import { JoinRequestsModal } from "./JoinRequestsModal";
import { getCalculatedBudget } from "@/utils/tripUtils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface HostedTripCardProps {
  trip: TripDB;
  username?: string;
  onTripUpdated?: () => void;
  showPendingRequests?: boolean;
}

const HostedTripCard = ({ trip, username, onTripUpdated, showPendingRequests = false }: HostedTripCardProps) => {
  const { user } = useUser();
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [fullTripData, setFullTripData] = useState<TripDB | null>(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  
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
        // If this is a joined trip copy, we need to fetch the ORIGINAL trip to get demographics
        // Check if trip has original_trip_id (means it's a copy)
        const tripIdToFetch = (trip as TripDB & { original_trip_id?: string }).original_trip_id || trip.trip_id;
        
        const response = await fetch(
          `${API_BASE_URL}/api/trips/${tripIdToFetch}?user_id=${user.id}`
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
  }, [trip.trip_id, trip, user]);

  // Fetch pending requests count if this is the user's trip
  useEffect(() => {
    const fetchPendingRequestsCount = async () => {
      if (!showPendingRequests || !user || trip.user_id !== user.id) {
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/join-requests/notifications?user_id=${user.id}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Count pending requests for this specific trip
            interface NotificationData {
              type: string;
              request_status: string;
              related_trip_id: string;
            }

            const count = data.notifications.filter(
              (notif: NotificationData) =>
                notif.type === "join_request" &&
                notif.request_status === "pending" &&
                notif.related_trip_id === trip.trip_id
            ).length;
            
            setPendingRequestsCount(count);
          }
        }
      } catch (error) {
        console.error("Error fetching pending requests:", error);
      }
    };

    fetchPendingRequestsCount();
  }, [showPendingRequests, user, trip.user_id, trip.trip_id]);

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

  // Get all traveler demographics (original travelers + joined users)
  const getAllTravelerDemographics = () => {
    const tripData = fullTripData || trip;
    const travelers = tripData.travelers || [];
    const joinedDemographics = tripData.joined_users_demographics || [];
    
    const allDemographics = [
      ...travelers.map((traveler, idx) => ({
        id: `traveler-${idx}`,
        age: traveler.age,
        gender: traveler.gender,
        type: 'original' as const,
      })),
      ...joinedDemographics.map((joined: { user_id: string; age: number; gender: string }) => ({
        id: `joined-${joined.user_id}`,
        age: joined.age,
        gender: joined.gender,
        type: 'joined' as const,
      }))
    ];
    
    return allDemographics;
  };

  const demographics = getAllTravelerDemographics();

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

        {/* Pending Requests Badge - Only shown for trip owner */}
        {showPendingRequests && user && trip.user_id === user.id && pendingRequestsCount > 0 && (
          <div className="pt-2">
            <Badge
              variant="default"
              className="cursor-pointer hover:bg-primary/90 transition-colors"
              onClick={() => setShowRequestsModal(true)}
            >
              <Bell className="h-3 w-3 mr-1" />
              {pendingRequestsCount} Pending Request{pendingRequestsCount !== 1 ? 's' : ''}
            </Badge>
          </div>
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
              Budget: {getCalculatedBudget(fullTripData || trip)}
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

      {/* Join Requests Modal - Only for trip owner */}
      {showPendingRequests && user && trip.user_id === user.id && (
        <JoinRequestsModal
          tripId={trip.trip_id}
          tripTitle={trip.title || `Trip to ${trip.destination}`}
          isOpen={showRequestsModal}
          onClose={() => setShowRequestsModal(false)}
          onRequestHandled={() => {
            // Refresh pending requests count
            setPendingRequestsCount((prev) => Math.max(0, prev - 1));
            
            // Refresh trip data
            if (onTripUpdated) {
              onTripUpdated();
            }
          }}
        />
      )}
    </Card>
  );
};

export default HostedTripCard;
