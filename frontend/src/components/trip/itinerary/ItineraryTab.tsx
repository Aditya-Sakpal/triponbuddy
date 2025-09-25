import { useState, useEffect } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import type { Itinerary } from "@/constants";
import { DayPlan } from "./DayPlan";

interface ItineraryTabProps {
  itinerary: Itinerary;
}

export const ItineraryTab = ({ itinerary }: ItineraryTabProps) => {
  const [expandedDays, setExpandedDays] = useState<number[]>([1]); // First day expanded by default
  const [activityImages, setActivityImages] = useState<{ [query: string]: string | undefined }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setError(null);
      try {
        // Collect all unique image_search_query values from activities
        const queries = Array.from(new Set(
          itinerary.daily_plans?.flatMap(day => day.activities.map(act => act.image_search_query)) || []
        ));
        if (queries.length === 0) return;
        // Fetch images for each query using single image endpoint
        const results: { [query: string]: string | undefined } = {};
        await Promise.all(
          queries.map(async (query) => {
            try {
              const res = await apiClient.post<{ success: boolean; images: { url: string }[] }>(
                "/api/images/single",
                {},
                { location: query, max_images: 1, min_width: 300, min_height: 200 }
              );
              results[query] = res.images?.[0]?.url;
            } catch (err: unknown) {
              results[query] = undefined;
            }
          })
        );
        setActivityImages(results);
      } catch (err: unknown) {
        setError((err as Error)?.message || "Failed to fetch images");
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [itinerary]);

  const toggleDay = (dayNumber: number) => {
    setExpandedDays(prev =>
      prev.includes(dayNumber)
        ? prev.filter(day => day !== dayNumber)
        : [...prev, dayNumber]
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Complete Itinerary</CardTitle>
          <CardDescription>
            A detailed day-by-day breakdown of your {itinerary.duration_days}-day trip to {itinerary.destination}
          </CardDescription>
        </CardHeader>
      </Card>

      {loading && (
        <div className="text-center py-8 text-muted-foreground">Loading images...</div>
      )}
      {error && (
        <div className="text-center py-8 text-red-500">{error}</div>
      )}

      <div className="space-y-4">
        {itinerary.daily_plans?.map((dayPlan) => (
          <DayPlan
            key={dayPlan.day}
            dayPlan={dayPlan}
            isExpanded={expandedDays.includes(dayPlan.day)}
            onToggle={() => toggleDay(dayPlan.day)}
            activityImages={activityImages}
          />
        ))}
      </div>
    </div>
  );
};
