import { useState, useEffect } from "react";
import { Clock, MapPin, IndianRupee, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";
import type { Itinerary, DailyPlan, Activity } from "@/lib/types";

interface ItineraryTabProps {
  itinerary: Itinerary;
}


const ActivityCard = ({ activity, imageUrl }: { activity: Activity, imageUrl?: string }) => {
  return (
    <Card className="mb-4 border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{activity.time}</span>
                  <Badge className="text-xs">
                    {activity.duration}
                  </Badge>
                </div>
                <h4 className="font-semibold text-lg">{activity.activity}</h4>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{activity.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                <IndianRupee className="w-4 h-4" />
                <span>{activity.estimated_cost}</span>
              </div>
            </div>
            
            <p className="text-muted-foreground">{activity.description}</p>
            
            {activity.booking_info && activity.booking_info.required && (
              <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Booking Required
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-300">
                      Price Range: {activity.booking_info.price_range}
                    </p>
                  </div>
                  <Button size="sm" asChild>
                    <a 
                      href={activity.booking_info.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs"
                    >
                      Book Now
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="lg:col-span-1">
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg overflow-hidden">
              <img
                src={imageUrl || `https://placehold.co/300x200?text=${encodeURIComponent(activity.image_search_query)}`}
                alt={activity.activity}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


const DayPlan = ({ dayPlan, isExpanded, onToggle, activityImages }: {
  dayPlan: DailyPlan;
  isExpanded: boolean;
  onToggle: () => void;
  activityImages: { [query: string]: string | undefined };
}) => {
  const dayName = new Date(dayPlan.date).toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = new Date(dayPlan.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Card className="mb-6 bg-blue-700">
      <CardHeader
        className="cursor-pointer hover:bg-muted/50 transition-colors duration-300"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm">
                Day {dayPlan.day}
              </Badge>
              <span className="text-white">
                {dayName}, {formattedDate}
              </span>
            </CardTitle>
            <CardDescription className="text-lg font-medium text-black">
              {dayPlan.theme}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="text-xs">
              {dayPlan.activities.length} Activities
            </Badge>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-white" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="space-y-4">
            {dayPlan.activities.map((activity, index) => (
              <ActivityCard
                key={index}
                activity={activity}
                imageUrl={activityImages[activity.image_search_query]}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};


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
