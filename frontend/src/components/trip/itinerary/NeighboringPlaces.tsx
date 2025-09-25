
import { useEffect, useState } from "react";
import { MapPin, Clock, IndianRupee, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { NeighboringPlace } from "@/constants";
import { apiClient } from "@/lib/api-client";

interface NeighboringPlacesProps {
  places: NeighboringPlace[];
}


const NeighboringPlaceCard = ({ place, imageUrl }: { place: NeighboringPlace, imageUrl?: string }) => {
  return (
    <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-border/50 hover:border-primary/20 overflow-hidden h-full flex flex-col">
      <div className="relative overflow-hidden rounded-t-lg flex-shrink-0">
        <img
          src={imageUrl || `https://placehold.co/400x250?text=${encodeURIComponent(place.image_search_query)}`}
          alt={place.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-xl font-semibold">{place.name}</h3>
          <div className="flex items-center gap-1 text-white/80 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{place.distance}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
          <p className="text-muted-foreground line-clamp-3">
            {place.description}
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{place.time_to_reach}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <IndianRupee className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-green-600">{place.estimated_cost}</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">Best Known For:</p>
            <p className="text-sm text-muted-foreground">{place.best_known_for}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors mt-4"
        >
          Explore This Place
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};


export const NeighboringPlaces = ({ places }: NeighboringPlacesProps) => {
  const [images, setImages] = useState<{ [location: string]: string[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setError(null);
      try {
        const locations = places.map(place => place.name);
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
  }, [places]);

  if (!places || places.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>You Would Also Like to Visit</CardTitle>
          <CardDescription>
            Discover nearby attractions and destinations that complement your trip
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
        {places.map((place, index) => {
          // Use first image for place name if available
          const imageUrl = images[place.name]?.[0];
          return (
            <NeighboringPlaceCard key={index} place={place} imageUrl={imageUrl} />
          );
        })}
      </div>
    </div>
  );
};
