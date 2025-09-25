import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Users, IndianRupee } from "lucide-react";
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
}

export const TripItinerary = ({ 
  trip, 
  onSaveTrip, 
  onUnsaveTrip, 
  isLoading = false 
}: TripItineraryProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("itinerary");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [destinationImages, setDestinationImages] = useState<ImageData[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  
  const itinerary = trip.itinerary_data as unknown as Itinerary;

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
    <div className="min-h-screen bg-background mt-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-bula to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          <div className="max-w-7xl mx-auto px-4 py-4 hidden md:block">
            <TripActionButtons
              onEditTrip={handleEditTrip}
              onShare={handleShare}
              onSaveToggle={handleSaveToggle}
              isLoading={isLoading}
              isSaved={trip.is_saved}
          />

          </div>


          {/* trip overview section */}

          <div className="space-y-4">
            <h1 className="text-4xl font-bold">{itinerary?.title || trip.title}</h1>
            <div className="flex flex-wrap items-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{trip.destination}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{formatDateRange(trip.start_date, trip.duration_days)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{trip.duration_days} {trip.duration_days === 1 ? 'Day' : 'Days'}</span>
              </div>
              {itinerary?.estimated_total_cost && (
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5" />
                  <span>{itinerary.estimated_total_cost}</span>
                </div>
              )}
            </div>
            
            {trip.tags && trip.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {trip.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-white/20 text-white">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Image Carousel */}
          <ImageCarousel 
            images={destinationImages} 
            isLoading={imagesLoading} 
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 md:hidden">
        <TripActionButtons
            onEditTrip={handleEditTrip}
            onShare={handleShare}
            onSaveToggle={handleSaveToggle}
            isLoading={isLoading}
            isSaved={trip.is_saved}
          />

      </div>
      

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex w-full overflow-x-auto px-8 lg:w-auto lg:grid lg:grid-cols-4 lg:px-0">
            <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
            <TabsTrigger value="accommodation">Accommodation</TabsTrigger>
            <TabsTrigger value="transportation">Transportation</TabsTrigger>
            <TabsTrigger value="travel-tips">Travel Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="itinerary" className="space-y-6">
            <ItineraryTab itinerary={itinerary} />
            <NeighboringPlaces places={itinerary?.neighboring_places || []} />
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
        onClose={() => setIsEditModalOpen(false)}
        trip={trip}
        onTripUpdated={handleTripUpdated}
      />
    </div>
  );
};
