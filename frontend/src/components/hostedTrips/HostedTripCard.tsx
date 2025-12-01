/**
 * Hosted Trip Card Component
 * Displays a hosted trip with traveler demographics and join request button
 */

import { useState } from "react";
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
import { useDestinationImage } from "@/hooks/useDestinationImage";
import { useTripData } from "@/hooks/useTripData";
import { usePendingRequests } from "@/hooks/usePendingRequests";
import {
  isJoinable,
  getAvailableSlots,
  isUserOnTrip,
  getAllTravelerDemographics,
  formatTripTitle,
} from "@/utils/hostedTripUtils";

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

  // Custom hooks for data fetching
  const destinationImage = useDestinationImage(trip.destination);
  const { fullTripData, resetTripData } = useTripData(trip, user?.id);
  const { pendingRequestsCount, decrementPendingRequests } = usePendingRequests(
    showPendingRequests,
    user?.id,
    trip.user_id,
    trip.trip_id
  );

  // Derived data
  const tripData = fullTripData || trip;
  const formattedStartDate = format(new Date(trip.start_date), "MMM dd, yyyy");
  const formattedEndDate = trip.end_date 
    ? format(new Date(trip.end_date), "MMM dd, yyyy")
    : formattedStartDate;
  const tripTitle = formatTripTitle(trip.destination, username);
  const demographics = getAllTravelerDemographics(tripData);
  const availableSlots = getAvailableSlots(tripData);
  const userOnTrip = isUserOnTrip(tripData, user?.id);
  const tripIsJoinable = isJoinable(tripData, user?.id);
  const isOwner = user?.id === trip.user_id;

  // If not owner, not joined, not pending, and no slots, don't show
  if (!isOwner && !userOnTrip && tripData.request_status !== 'pending' && availableSlots <= 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all">
      {/* Trip Image */}
      {destinationImage && (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={destinationImage}
            alt={trip.destination}
            className="w-full h-full object-cover"
            loading="lazy"
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
        {!destinationImage && (
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
              Budget: {
                tripData.custom_budget 
                  ? `₹${tripData.custom_budget?.toLocaleString('en-IN')}`
                  : getCalculatedBudget(tripData)
              }
            </span>
          </div>
        </div>

        {/* Host Comments */}
        {tripData.host_comments && (
          <div className="pt-2 border-t">
            <h4 className="text-sm font-semibold mb-2">Host's Message</h4>
            <p className="text-sm text-muted-foreground italic">
              "{tripData.host_comments}"
            </p>
          </div>
        )}

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
              {availableSlots} {availableSlots === 1 ? 'slot' : 'slots'} available
            </span>
            <span className="text-xs text-muted-foreground/70">
              (Max {trip.max_passengers})
            </span>
          </div>
        )}

        {/* User Status Message */}
        {userOnTrip && !isOwner && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 px-3 py-2 rounded-md">
              <UserPlus className="h-4 w-4" />
              <span>Joined</span>
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
          {!userOnTrip && availableSlots > 0 && tripIsJoinable && (
            tripData.request_status === 'pending' ? (
              <Button
                size="sm"
                variant="outline"
                className="ml-auto"
                disabled
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Requested
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="ml-auto"
                onClick={() => setShowJoinDialog(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Request to Join
              </Button>
            )
          )}
        </div>
      </CardContent>

      {/* Join Trip Dialog */}
      <JoinTripDialog
        tripId={trip.trip_id}
        tripTitle={trip.title}
        tripDestination={trip.destination}
        preferredGender={tripData.preferred_gender}
        ageRangeMin={tripData.age_range_min}
        ageRangeMax={tripData.age_range_max}
        isOpen={showJoinDialog}
        onClose={() => setShowJoinDialog(false)}
        onSuccess={() => {
          // Refresh trip data after successful request
          if (onTripUpdated) {
            onTripUpdated();
          }
          resetTripData();
        }}
      />

      {/* Join Requests Modal - Only for trip owner */}
      {showPendingRequests && user && trip.user_id === user.id && (
        <JoinRequestsModal
          tripId={trip.trip_id}
          tripTitle={trip.title || `Trip to ${trip.destination}`}
          isOpen={showRequestsModal}
          onClose={() => setShowRequestsModal(false)}
          onRequestHandled={() => {
            // Refresh pending requests count
            decrementPendingRequests();
            
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
