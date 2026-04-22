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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarDays, MapPin, Wallet, UserPlus, Users, User, Bell, Car, Train, Plane, UserCircle2 } from "lucide-react";
import { format } from "date-fns";
import { JoinTripDialog } from "@/components/shared/JoinTripDialog";
import { JoinRequestsModal } from "./JoinRequestsModal";
import { getBudgetDisplay } from "@/utils/tripUtils";
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
import { useUserProfile } from "@/hooks/api-hooks";

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
  const [showHostDetails, setShowHostDetails] = useState(false);

  // Custom hooks for data fetching
  const destinationImage = useDestinationImage(trip.destination);
  const { fullTripData, resetTripData } = useTripData(trip, user?.id);
  const { pendingRequestsCount, decrementPendingRequests } = usePendingRequests(
    showPendingRequests,
    user?.id,
    trip.user_id,
    trip.trip_id
  );
  const { data: hostProfileData, isLoading: hostProfileLoading } = useUserProfile(trip.user_id);

  // Derived data
  const tripData = fullTripData || trip;
  const formattedStartDate = format(new Date(trip.start_date), "MMM dd, yyyy");
  const formattedEndDate = trip.end_date 
    ? format(new Date(trip.end_date), "MMM dd, yyyy")
    : formattedStartDate;
  const hostDisplayName = trip.host_name || tripData.host_name || username;
  const tripTitle = formatTripTitle(trip.destination, hostDisplayName);
  const demographics = getAllTravelerDemographics(tripData);
  const availableSlots = getAvailableSlots(tripData);
  const userOnTrip = isUserOnTrip(tripData, user?.id);
  const tripIsJoinable = isJoinable(tripData, user?.id);
  const isOwner = user?.id === trip.user_id;

  // Helper function to get transport icon and label
  const getTransportInfo = (mode?: string) => {
    if (!mode || mode === 'default') return null;
    
    switch (mode) {
      case 'road':
        return { icon: Car, label: 'Road' };
      case 'train':
        return { icon: Train, label: 'Train' };
      case 'flight':
        return { icon: Plane, label: 'Flight' };
      default:
        return null;
    }
  };

  const transportInfo = getTransportInfo(tripData.transportation_mode);

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
          {hostDisplayName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserCircle2 className="h-4 w-4" />
              <span>
                Hosted by <span className="font-semibold text-foreground">{hostDisplayName}</span>
              </span>
            </div>
          )}

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
                  : getBudgetDisplay(tripData)
              }
            </span>
          </div>

          {/* Mode of Transport */}
          {transportInfo && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <transportInfo.icon className="h-4 w-4" />
              <span>Transport: {transportInfo.label}</span>
            </div>
          )}
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

        {/* Host Details Trigger */}
        <div className="pt-2 border-t">
          <button
            type="button"
            className="text-sm font-medium text-primary hover:underline"
            onClick={() => setShowHostDetails(true)}
          >
            View host details
          </button>
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

      {/* Host Details Modal */}
      <Dialog open={showHostDetails} onOpenChange={setShowHostDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{hostDisplayName ? `${hostDisplayName}'s Profile` : "Host Profile"}</DialogTitle>
            <DialogDescription>
              Host information for this trip
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Age</p>
                <p className="font-medium">
                  {hostProfileLoading
                    ? "Loading..."
                    : hostProfileData?.profile?.age
                      ? `${hostProfileData.profile.age} years`
                      : "Not shared"}
                </p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Gender</p>
                <p className="font-medium capitalize">
                  {hostProfileLoading
                    ? "Loading..."
                    : hostProfileData?.profile?.gender || "Not shared"}
                </p>
              </div>
            </div>

            <div className="rounded-md border p-3 space-y-1">
              <p className="text-xs text-muted-foreground">Trip Preferences</p>
              <p className="text-sm">
                Preferred gender: {tripData.preferred_gender || "Any"}
              </p>
              <p className="text-sm">
                Preferred age range: {tripData.age_range_min ?? "Any"} - {tripData.age_range_max ?? "Any"}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default HostedTripCard;
