import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import type { Accommodation } from "@/constants";
import { useGetAccommodationDetails, useAddCustomAccommodation } from "@/hooks/api-hooks";
import { useAccommodationSearch } from "@/hooks/useAccommodationSearch";
import { useAccommodationCategories, useAccommodationImages } from "@/hooks/useAccommodationLogic";
import { AccommodationCard } from "./AccommodationCard";

interface AccommodationTabProps {
  accommodations: Accommodation[];
  customAccommodations?: Accommodation[];
  hideBookingButtons?: boolean;
  tripId?: string;
  destination?: string;
  isOwner?: boolean;
}

export const AccommodationTab = ({ 
  accommodations, 
  customAccommodations = [],
  hideBookingButtons = false,
  tripId,
  destination,
  isOwner = false
}: AccommodationTabProps) => {
  const { user } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Determine which accommodations to show
  const displayAccommodations = customAccommodations.length > 0 ? customAccommodations : accommodations;
  
  // Custom hooks for business logic
  const accommodationSearch = useAccommodationSearch();
  const { categories, categoryOptions } = useAccommodationCategories(displayAccommodations);
  const { images, loading, error } = useAccommodationImages(displayAccommodations);
  
  // API hooks
  const getAccommodationDetails = useGetAccommodationDetails();
  const addCustomAccommodation = useAddCustomAccommodation();

  // Handle get accommodation details
  const handleGetDetails = async () => {
    if (!accommodationSearch.selectedPlace || !tripId || !user?.id || !destination) return;

    const location = accommodationSearch.selectedPlace.name;
    
    try {
      const result = await getAccommodationDetails.mutateAsync({
        tripId,
        location,
        destination,
        userId: user.id
      });

      if (result.success && result.accommodation) {
        // Add the accommodation to the trip
        await addCustomAccommodation.mutateAsync({
          tripId,
          accommodation: result.accommodation,
          userId: user.id
        });

        // Reset search
        accommodationSearch.clearSearch();
      }
    } catch (error) {
      console.error("Error getting accommodation details:", error);
    }
  };

  // Render accommodation grid helper
  const renderAccommodationGrid = (accommodationList: Accommodation[]) => {
    if (accommodationList.length === 0) {
      return (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">No accommodations in this category</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accommodationList.map((accommodation, index) => {
          const imageUrl = images[accommodation.location]?.[0];
          return (
            <AccommodationCard 
              key={index} 
              accommodation={accommodation} 
              imageUrl={imageUrl}
              hideBookingButtons={hideBookingButtons}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Where You'll Stay</CardTitle>
          <CardDescription>
            {displayAccommodations.length > 0 
              ? `Explore ${displayAccommodations.length} ${customAccommodations.length > 0 ? 'custom' : 'carefully selected'} accommodations for your comfort and convenience` 
              : 'Accommodation recommendations for your trip'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Custom Accommodation Search - Only for trip owner */}
      {isOwner && tripId && user?.id && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Search Hotels
            </CardTitle>
            <CardDescription>
              Search for hotels and add custom accommodation options to your trip
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search for hotels (e.g., Taj Hotel Mumbai)"
                  value={accommodationSearch.searchQuery}
                  onChange={(e) => accommodationSearch.handleInputChange(e.target.value)}
                  onFocus={() => accommodationSearch.predictions.length > 0 && accommodationSearch.setShowPredictions(true)}
                  className="w-full pr-10"
                />
                {accommodationSearch.isLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                )}
                
                {/* Autocomplete Predictions Dropdown */}
                {accommodationSearch.showPredictions && accommodationSearch.predictions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {accommodationSearch.predictions.map((prediction) => (
                      <button
                        key={prediction.placeId}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        onClick={() => accommodationSearch.handlePlaceSelect(prediction)}
                      >
                        <div className="font-medium">{prediction.mainText}</div>
                        <div className="text-sm text-gray-500">{prediction.secondaryText}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button 
                onClick={handleGetDetails}
                disabled={!accommodationSearch.selectedPlace || getAccommodationDetails.isPending || addCustomAccommodation.isPending || accommodationSearch.isLoading}
                className="w-full"
              >
                {(getAccommodationDetails.isPending || addCustomAccommodation.isPending) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting Details...
                  </>
                ) : accommodationSearch.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Get Details & Add'
                )}
              </Button>
              

            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="text-center py-8 text-muted-foreground">Loading images...</div>
      )}
      {error && (
        <div className="text-center py-8 text-red-500">{error}</div>
      )}

      {displayAccommodations.length > 0 ? (
        <div className="space-y-6">
          {/* Mobile: Dropdown Filter */}
          <div className="md:hidden">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop: Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full hidden md:block">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({categories.all.length})</TabsTrigger>
              <TabsTrigger value="budget">Budget ({categories.budget.length})</TabsTrigger>
              <TabsTrigger value="midRange">Mid-Range ({categories.midRange.length})</TabsTrigger>
              <TabsTrigger value="premium">Premium ({categories.premium.length})</TabsTrigger>
              <TabsTrigger value="luxury">Luxury ({categories.luxury.length})</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Content for all categories */}
          {selectedCategory === "all" && (
            <div className="mt-6">
              {renderAccommodationGrid(categories.all)}
            </div>
          )}

          {selectedCategory === "budget" && (
            <div className="mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Budget Accommodations</h3>
                <p className="text-sm text-muted-foreground">Affordable options perfect for budget travelers (₹500-1500/night)</p>
              </div>
              {renderAccommodationGrid(categories.budget)}
            </div>
          )}

          {selectedCategory === "midRange" && (
            <div className="mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Mid-Range Accommodations</h3>
                <p className="text-sm text-muted-foreground">Comfortable stays with good amenities (₹1500-3500/night)</p>
              </div>
              {renderAccommodationGrid(categories.midRange)}
            </div>
          )}

          {selectedCategory === "premium" && (
            <div className="mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Premium Accommodations</h3>
                <p className="text-sm text-muted-foreground">High-quality hotels with excellent facilities (₹3500-7000/night)</p>
              </div>
              {renderAccommodationGrid(categories.premium)}
            </div>
          )}

          {selectedCategory === "luxury" && (
            <div className="mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Luxury Accommodations</h3>
                <p className="text-sm text-muted-foreground">Premium experiences with world-class amenities (₹7000+/night)</p>
              </div>
              {renderAccommodationGrid(categories.luxury)}
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">No accommodation details available</p>
              <p className="text-sm text-muted-foreground">
                Accommodation recommendations will be added to your itinerary
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
