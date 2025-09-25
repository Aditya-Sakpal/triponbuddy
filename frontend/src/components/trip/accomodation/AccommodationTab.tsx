
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Where You'll Stay</CardTitle>
          <CardDescription>
            Carefully selected accommodations for your comfort and convenience
          </CardDescription>
        </CardHeader>
      </Card>

      {loading && (
        <div className="text-center py-8 text-muted-foreground">Loading images...</div>
      )}
      {error && (
        <div className="text-center py-8 text-red-500">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accommodations.map((accommodation, index) => {
          // Use first image for location if available
          const imageUrl = images[accommodation.location]?.[0];
          return (
            <AccommodationCard key={index} accommodation={accommodation} imageUrl={imageUrl} />
          );
        })}
      </div>

      {accommodations.length === 0 && (
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
