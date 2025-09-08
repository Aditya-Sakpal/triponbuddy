import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Share, Heart, HeartOff, Calendar, MapPin, Users, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ItineraryTab } from "./ItineraryTab";
import { AccommodationTab } from "./AccommodationTab";
import { TransportationTab } from "./TransportationTab";
import { TravelTipsTab } from "./TravelTipsTab";
import { NeighboringPlaces } from "./NeighboringPlaces";
import { EditTripModal } from "./EditTripModal";
import type { TripDB, Itinerary } from "@/lib/types";

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
  
  const itinerary = trip.itinerary_data as unknown as Itinerary;

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-start justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/20 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleEditTrip}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Trip
              </Button>
              <Button
                variant="outline"
                onClick={handleShare}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Share className="w-4 h-4 mr-2" />
                Share Trip
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveToggle}
                disabled={isLoading}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {trip.is_saved ? (
                  <HeartOff className="w-4 h-4 mr-2" />
                ) : (
                  <Heart className="w-4 h-4 mr-2" />
                )}
                {trip.is_saved ? 'Unsave Trip' : 'Save Trip'}
              </Button>
            </div>
          </div>

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
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
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
            <TransportationTab transportation={itinerary?.transportation || []} />
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
