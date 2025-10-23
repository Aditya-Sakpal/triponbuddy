import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ItineraryTab, TripActionButtons, AccommodationTab, TransportationTab, TravelTipsTab, NeighboringPlaces, EditTripModal, ImageCarousel} from "@/components/trip";
import { apiClient } from "@/lib/api-client";
import type { TripDB, Itinerary, ImageData } from "@/constants";

interface TripItineraryProps {
  trip: TripDB;
  onSaveTrip?: (tripId: string) => void;
  onUnsaveTrip?: (tripId: string) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const TripItinerary = ({ 
  trip, 
  onSaveTrip, 
  onUnsaveTrip, 
  isLoading = false,
  onRefresh
}: TripItineraryProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("itinerary");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editModalInitialDestination, setEditModalInitialDestination] = useState<string | undefined>(undefined);
  const [destinationImages, setDestinationImages] = useState<ImageData[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  
  const itinerary = trip.itinerary_data as unknown as Itinerary;

  // Extract budget - use trip.budget if available, otherwise parse from estimated_total_cost
  const getBudgetDisplay = () => {
    if (trip.budget) {
      return `₹ ${Number(trip.budget).toLocaleString('en-IN')}`;
    }
    
    // Fallback to estimated_total_cost from itinerary_data
    if (itinerary?.estimated_total_cost) {
      return itinerary.estimated_total_cost;
    }
    
    return null;
  };

  const budgetDisplay = getBudgetDisplay();

  const tabs = [
    { value: "itinerary", label: "Itinerary" },
    { value: "accommodation", label: "Accommodation" },
    { value: "transportation", label: "Transportation" },
    { value: "travel-tips", label: "Travel Tips" },
  ];

  useEffect(() => {
    const fetchDestinationImages = async () => {
      if (!trip.destination) return;
      
      setImagesLoading(true);
      try {
        const response = await apiClient.post<{
          success: boolean;
          images: ImageData[];
        }>('/api/images/single', {}, {
          location: trip.destination,
          max_images: 5,
          min_width: 800,
          min_height: 600
        });
        
        if (response.success && response.images) {
          setDestinationImages(response.images);
        }
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
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  const handleEditTrip = () => {
    setEditModalInitialDestination(undefined);
    setIsEditModalOpen(true);
  };

  const handleGenerateTripForPlace = (placeName: string) => {
    setEditModalInitialDestination(placeName);
    setIsEditModalOpen(true);
  };

  const handleTripUpdated = (newTripId: string) => {
    // Navigate to the new trip
    navigate(`/trip/${newTripId}`);
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
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Budget:</span>
                    <span>{budgetDisplay}</span>
                  </div>
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
                isLoading={isLoading}
                isSaved={trip.is_saved}
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
            isLoading={isLoading}
            isSaved={trip.is_saved}
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
            <ItineraryTab itinerary={itinerary} tripId={trip.trip_id} onRefresh={onRefresh} />
            <NeighboringPlaces places={itinerary?.neighboring_places || []} onGenerateTrip={handleGenerateTripForPlace} />
          </TabsContent>

          <TabsContent value="accommodation">
            <AccommodationTab accommodations={itinerary?.accommodation || []} />
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
            />
          </TabsContent>

          <TabsContent value="travel-tips">
            <TravelTipsTab 
              tips={itinerary?.travel_tips || []} 
              bestTimeToVisit={itinerary?.best_time_to_visit}
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
    </div>
  );
};
