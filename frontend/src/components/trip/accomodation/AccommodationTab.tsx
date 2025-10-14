
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Accommodation } from "@/constants";
import { apiClient } from "@/lib/api-client";
import { AccommodationCard } from "./AccommodationCard";

interface AccommodationTabProps {
  accommodations: Accommodation[];
}

export const AccommodationTab = ({ accommodations }: AccommodationTabProps) => {
  const [images, setImages] = useState<{ [location: string]: string[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setError(null);
      try {
        const locations = accommodations.map(acc => acc.location);
        if (locations.length === 0) return;
        // Use backend bulk images endpoint
        const result = await apiClient.post<{ [key: string]: string[] }>("/api/images/bulk", locations);
        setImages(result);
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
            <AccommodationCard key={index} accommodation={accommodation} imageUrl={imageUrl} />
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
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({categories.all.length})</TabsTrigger>
            <TabsTrigger value="budget">Budget ({categories.budget.length})</TabsTrigger>
            <TabsTrigger value="midRange">Mid-Range ({categories.midRange.length})</TabsTrigger>
            <TabsTrigger value="premium">Premium ({categories.premium.length})</TabsTrigger>
            <TabsTrigger value="luxury">Luxury ({categories.luxury.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {renderAccommodationGrid(categories.all)}
          </TabsContent>

          <TabsContent value="budget" className="mt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Budget Accommodations</h3>
              <p className="text-sm text-muted-foreground">Affordable options perfect for budget travelers (₹500-1500/night)</p>
            </div>
            {renderAccommodationGrid(categories.budget)}
          </TabsContent>

          <TabsContent value="midRange" className="mt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Mid-Range Accommodations</h3>
              <p className="text-sm text-muted-foreground">Comfortable stays with good amenities (₹1500-3500/night)</p>
            </div>
            {renderAccommodationGrid(categories.midRange)}
          </TabsContent>

          <TabsContent value="premium" className="mt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Premium Accommodations</h3>
              <p className="text-sm text-muted-foreground">High-quality hotels with excellent facilities (₹3500-7000/night)</p>
            </div>
            {renderAccommodationGrid(categories.premium)}
          </TabsContent>

          <TabsContent value="luxury" className="mt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Luxury Accommodations</h3>
              <p className="text-sm text-muted-foreground">Premium experiences with world-class amenities (₹7000+/night)</p>
            </div>
            {renderAccommodationGrid(categories.luxury)}
          </TabsContent>
        </Tabs>
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
