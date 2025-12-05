import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Calendar, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ItineraryTab, TripActionButtons, AccommodationTab, TransportationTab, TravelTipsTab, NeighboringPlaces, EditTripModal, ImageCarousel, HostTripModal} from "@/components/trip";
import { googlePlacesService } from "@/services/googlePlacesService";
import type { TripDB, Itinerary, ImageData } from "@/constants";
import { getCalculatedBudget } from "@/utils/tripUtils";
import { apiClient } from "@/lib/api-client";

interface TripItineraryProps {
  trip: TripDB;
  onSaveTrip?: (tripId: string) => void;
  onUnsaveTrip?: (tripId: string) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  currentUserId?: string;
}

export const TripItinerary = ({ 
  trip, 
  onSaveTrip, 
  onUnsaveTrip, 
  isLoading = false,
  onRefresh,
  currentUserId
}: TripItineraryProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("itinerary");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHostTripModalOpen, setIsHostTripModalOpen] = useState(false);
  const [editModalInitialDestination, setEditModalInitialDestination] = useState<string | undefined>(undefined);
  const [destinationImages, setDestinationImages] = useState<ImageData[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(true);
  const { user } = useUser();
  
  const itinerary = trip.itinerary_data as unknown as Itinerary;
  const customTips = (trip.itinerary_data as any)?.custom_tips || [];
  
  // Check if this is a joined trip (copy created when user joined)
  const isJoinedTripCopy = trip.is_joined === true;
  
  // Check if user is the owner of this trip (but NOT if it's a joined copy)
  const isOwner = currentUserId === trip.user_id && !isJoinedTripCopy;

  // Check if user is a joinee (accepted member of the trip OR viewing a joined copy)
  const isJoinee = isJoinedTripCopy || !!(currentUserId && trip.joined_users?.includes(currentUserId) && !isOwner);

  // Check if trip is already hosted
  const isHosted = !!trip.max_passengers && trip.max_passengers > 0;

  // Calculate the actual budget from activities (single source of truth)
  const budgetDisplay = getCalculatedBudget(trip);

  // Show all tabs to owner and joinees, but only itinerary and travel-tips to others
  const tabs = [
    { value: "itinerary", label: "Itinerary" },
    ...(isOwner || isJoinee ? [{ value: "accommodation", label: "Accommodation" }] : []),
    ...(isOwner || isJoinee ? [{ value: "transportation", label: "Transportation" }] : []),
    { value: "travel-tips", label: "Travel Tips" },
  ];

  // Check edit permissions
  useEffect(() => {
    const checkEditPermission = async () => {
      if (!currentUserId) {
        setCanEdit(false);
        setCheckingPermission(false);
        return;
      }

      setCheckingPermission(true);
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const response = await fetch(
          `${API_BASE_URL}/api/trips/${trip.trip_id}/can-edit?user_id=${encodeURIComponent(currentUserId)}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setCanEdit(data.can_edit || false);
        }
      } catch (error) {
        console.error('Failed to check edit permission:', error);
        setCanEdit(false);
      } finally {
        setCheckingPermission(false);
      }
    };

    checkEditPermission();
  }, [trip.trip_id, currentUserId]);

  useEffect(() => {
    const fetchDestinationImages = async () => {
      if (!trip.destination) return;
      
      setImagesLoading(true);
      try {
        const photoUrls = await googlePlacesService.getLocationPhotos(
          trip.destination,
          5,
          { maxWidth: 1200, maxHeight: 800 }
        );
        
        // Convert to ImageData format expected by the component
        const images: ImageData[] = photoUrls.map(url => ({
          url,
          width: 1200,
          height: 800,
          source: 'Google Places',
          title: trip.destination
        }));
        setDestinationImages(images);
      } catch (error) {
        console.error('Failed to fetch destination images:', error);
      } finally {
        setImagesLoading(false);
      }
    };

    fetchDestinationImages();
  }, [trip.destination]);

  const handleSaveToggle = () => {
    if (trip.is_saved) {
      onUnsaveTrip?.(trip.trip_id);
    } else {
      onSaveTrip?.(trip.trip_id);
    }
  };

  const handleShare = async () => {
    try {
      // First, make the trip public
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(
        `${API_BASE_URL}/api/trips/${trip.trip_id}/share?user_id=${encodeURIComponent(trip.user_id)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to make trip public');
      }
      
      // Then share the link
      if (navigator.share) {
        try {
          await navigator.share({
            title: trip.title,
            text: `Check out my trip to ${trip.destination}!`,
            url: window.location.href,
          });
        } catch (error) {
          console.log("Error sharing:", error);
        }
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        // Fallback to clipboard
        try {
          await navigator.clipboard.writeText(window.location.href);
          // You could show a toast notification here
          alert('Link copied to clipboard!');
        } catch (error) {
          console.error("Error copying to clipboard:", error);
          // Fallback: show the URL in a prompt so user can manually copy
          prompt('Copy this link:', window.location.href);
        }
      } else {
        // Final fallback: show URL in a prompt
        prompt('Copy this link:', window.location.href);
      }
    } catch (error) {
      console.error("Error sharing trip:", error);
      alert('Failed to share trip. Please try again.');
    }
  };

  const handleEditTrip = () => {
    setEditModalInitialDestination(undefined);
    setIsEditModalOpen(true);
  };

  const handleHostTrip = () => {
    setIsHostTripModalOpen(true);
  };

  const handleGenerateTripForPlace = (placeName: string) => {
    setEditModalInitialDestination(placeName);
    setIsEditModalOpen(true);
  };

  const handleTripUpdated = (newTripId: string) => {
    // Navigate to the new trip
    navigate(`/trip/${newTripId}`);
  };

  const handleCustomTipsUpdate = async (tips: string[]) => {
    if (!user?.id) return;

    try {
      // Update the itinerary_data with custom tips
      const updatedItineraryData = {
        ...trip.itinerary_data,
        custom_tips: tips,
      };

      // Call API to update trip
      await apiClient.put(
        `/api/trips/${trip.trip_id}`,
        { itinerary_data: updatedItineraryData },
        { user_id: user.id }
      );

      // Refresh the trip data
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error updating custom tips:", error);
    }
  };

  const formatDateRange = (startDate: string, durationDays: number) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + durationDays - 1);
    
    return `${start.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })} - ${end.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })}`;
  };

  return (
    <div className="min-h-screen bg-gray-200/80">
      {/* Header */}
      <div className=" text-black pt-12">
        <div className="max-w-6xl mx-auto px-4 py-8">

          {/* trip overview section */}

          <div className="flex justify-between items-start gap-8 ">
            <div className="space-y-4 flex-1">
              <h1 className="text-4xl font-bold">{itinerary?.title || trip.title}</h1>
              <div className="flex flex-wrap items-center gap-6 text-black/90">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{formatDateRange(trip.start_date, trip.duration_days)}</span>
                </div>
                {budgetDisplay && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 cursor-help">
                          <span className="font-semibold">Budget:</span>
                          <span>{budgetDisplay}</span>
                          <Info className="h-4 w-4 text-gray-600" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-xs">
                          This is the sum of estimated costs for all activities in the itinerary. 
                          Actual costs may be higher and can vary based on choices and unforeseen expenses.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              
              {trip.tags && trip.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {trip.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="bg-white/20 text-black">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop action buttons */}
            <div className="hidden md:block">
              <TripActionButtons
                onEditTrip={handleEditTrip}
                onShare={handleShare}
                onSaveToggle={handleSaveToggle}
                onHostTrip={!isHosted ? handleHostTrip : undefined}
                isLoading={isLoading || checkingPermission}
                isSaved={trip.is_saved}
                canEdit={canEdit}
                isOwner={isOwner}
              />
            </div>
          </div>

          {/* Image Carousel */}
          <ImageCarousel 
            images={destinationImages} 
            isLoading={imagesLoading} 
          />
        </div>
      </div>

      {/* Mobile Action Buttons */}
      <div className="max-w-6xl mx-auto px-4 py-4 md:hidden">
        <TripActionButtons
            onEditTrip={handleEditTrip}
            onShare={handleShare}
            onSaveToggle={handleSaveToggle}
            onHostTrip={!isHosted ? handleHostTrip : undefined}
            isLoading={isLoading || checkingPermission}
            isSaved={trip.is_saved}
            canEdit={canEdit}
            isOwner={isOwner}
          />
      </div>
      

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 gap-4 md:inline-flex md:h-auto md:items-center md:justify-start md:gap-8 md:rounded-none md:bg-transparent md:p-0 md:border-b md:border-gray-200 md:w-full pb-20">
            {tabs.map(tab => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 px-0 pb-3 pt-0 font-medium text-gray-600 shadow-none transition-none data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-blue-600 md:text-lg"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="itinerary" className="space-y-6">
            {/* Joinee Notice Banner */}
            {isJoinee && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> You are a member of this trip. All bookings will be made by the trip owner. 
                  Please contact them for any suggestions or revisions to the itinerary.
                </p>
              </div>
            )}
            <ItineraryTab 
              itinerary={itinerary} 
              tripId={trip.trip_id} 
              onRefresh={onRefresh}
              transportationMode={trip.transportation_mode}
              onNavigateToTransportation={() => setActiveTab('transportation')}
              isOwner={isOwner}
              isJoinee={isJoinee}
            />
            <NeighboringPlaces places={itinerary?.neighboring_places || []} onGenerateTrip={handleGenerateTripForPlace} />
          </TabsContent>

          <TabsContent value="accommodation">
            <AccommodationTab 
              accommodations={itinerary?.accommodation || []}
              customAccommodations={trip.custom_accommodations || []}
              hideBookingButtons={!isOwner}
              tripId={trip.trip_id}
              destination={trip.destination}
              isOwner={isOwner}
            />
          </TabsContent>

          <TabsContent value="transportation">
            <TransportationTab
              transportation={itinerary?.transportation || { routes: [] }}
              transportation_hubs_start={itinerary?.transportation_hubs_start || []}
              transportation_hubs_destination={itinerary?.transportation_hubs_destination || []}
              local_transportation={itinerary?.local_transportation || []}
              tripId={trip.trip_id}
              userId={trip.user_id}
              destinationCity={itinerary?.destination || trip.destination}
              transportationMode={trip.transportation_mode}
              hideBookingButtons={!isOwner}
            />
          </TabsContent>

          <TabsContent value="travel-tips">
            <TravelTipsTab 
              tips={itinerary?.travel_tips || []} 
              bestTimeToVisit={itinerary?.best_time_to_visit}
              tripId={trip.trip_id}
              customTips={customTips}
              onCustomTipsUpdate={handleCustomTipsUpdate}
              isOwner={isOwner}
              isJoinee={isJoinee}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Trip Modal */}
      <EditTripModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditModalInitialDestination(undefined);
        }}
        trip={trip}
        onTripUpdated={handleTripUpdated}
        initialDestination={editModalInitialDestination}
      />

      {/* Host Trip Modal */}
      <HostTripModal
        trip={trip}
        isOpen={isHostTripModalOpen}
        onClose={() => setIsHostTripModalOpen(false)}
        onSuccess={() => {
          if (onRefresh) {
            onRefresh();
          }
        }}
      />
    </div>
  );
};
