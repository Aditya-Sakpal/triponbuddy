
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Accommodation } from "@/constants";
import { googlePlacesService } from "@/services/googlePlacesService";
import { AccommodationCard } from "./AccommodationCard";

interface AccommodationTabProps {
  accommodations: Accommodation[];
  hideBookingButtons?: boolean;
}

export const AccommodationTab = ({ accommodations, hideBookingButtons = false }: AccommodationTabProps) => {
  const [images, setImages] = useState<{ [location: string]: string[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setError(null);
      try {
        if (accommodations.length === 0) return;
        
        const imageMap: { [key: string]: string[] } = {};
        
        // Fetch images for each accommodation location with rate limiting
        for (let i = 0; i < accommodations.length; i++) {
          const acc = accommodations[i];
          try {
            // Use accommodation name and location for better search results
            const photoUrl = await googlePlacesService.getActivityPhoto(
              acc.location,
              acc.name
            );
            imageMap[acc.location] = photoUrl ? [photoUrl] : [];
          } catch (err) {
            console.error(`Failed to fetch image for ${acc.location}:`, err);
            imageMap[acc.location] = [];
          }
          
          // Add delay between requests to avoid rate limiting
          if (i < accommodations.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
        
        setImages(imageMap);
      } catch (err: unknown) {
        setError((err as Error)?.message || "Failed to fetch images");
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [accommodations]);

  // Helper function to extract minimum price from price_range string
  const extractMinPrice = (priceRange: string): number => {
    // Extract all numbers from the string (e.g., "₹1500-3500/night" -> [1500, 3500])
    const numbers = priceRange.match(/\d+/g);
    if (!numbers || numbers.length === 0) return 0;
    // Return the first (minimum) number
    return parseInt(numbers[0], 10);
  };

  // Categorize accommodations by type/budget
  const categorizeAccommodations = () => {
    const categories = {
      all: accommodations,
      budget: accommodations.filter(acc => {
        const typeMatch = acc.type?.toLowerCase().includes('budget') || 
                         acc.type?.toLowerCase().includes('hostel') ||
                         acc.type?.toLowerCase().includes('guesthouse');
        const priceMatch = acc.price_range && extractMinPrice(acc.price_range) < 1500;
        return typeMatch || priceMatch;
      }),
      midRange: accommodations.filter(acc => {
        const typeMatch = acc.type?.toLowerCase().includes('mid') || 
                         acc.type?.toLowerCase().includes('standard');
        const minPrice = acc.price_range ? extractMinPrice(acc.price_range) : 0;
        const priceMatch = minPrice >= 1500 && minPrice < 3500;
        return typeMatch || priceMatch;
      }),
      premium: accommodations.filter(acc => {
        const typeMatch = acc.type?.toLowerCase().includes('premium') || 
                         acc.type?.toLowerCase().includes('deluxe');
        const minPrice = acc.price_range ? extractMinPrice(acc.price_range) : 0;
        const priceMatch = minPrice >= 3500 && minPrice < 7000;
        return typeMatch || priceMatch;
      }),
      luxury: accommodations.filter(acc => {
        const typeMatch = acc.type?.toLowerCase().includes('luxury') || 
                         acc.type?.toLowerCase().includes('resort') ||
                         acc.type?.toLowerCase().includes('five star') ||
                         acc.type?.toLowerCase().includes('5 star');
        const minPrice = acc.price_range ? extractMinPrice(acc.price_range) : 0;
        const priceMatch = minPrice >= 7000;
        return typeMatch || priceMatch;
      })
    };

    return categories;
  };

  const categories = categorizeAccommodations();

  const categoryOptions = [
    { value: "all", label: `All (${categories.all.length})` },
    { value: "budget", label: `Budget (${categories.budget.length})` },
    { value: "midRange", label: `Mid-Range (${categories.midRange.length})` },
    { value: "premium", label: `Premium (${categories.premium.length})` },
    { value: "luxury", label: `Luxury (${categories.luxury.length})` }
  ];

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
            {accommodations.length > 0 
              ? `Explore ${accommodations.length} carefully selected accommodations for your comfort and convenience` 
              : 'Accommodation recommendations for your trip'}
          </CardDescription>
        </CardHeader>
      </Card>

      {loading && (
        <div className="text-center py-8 text-muted-foreground">Loading images...</div>
      )}
      {error && (
        <div className="text-center py-8 text-red-500">{error}</div>
      )}

      {accommodations.length > 0 ? (
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
