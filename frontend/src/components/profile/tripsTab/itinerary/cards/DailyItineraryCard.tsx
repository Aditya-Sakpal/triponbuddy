import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, IndianRupee, Navigation, ExternalLink } from "lucide-react";
import { DailyPlan, Activity } from "@/constants";
import { formatActivityTimeRange } from "../utils/formatters";

interface ImageMap {
  [query: string]: string | undefined;
}

interface DailyItineraryCardProps {
  dailyPlans: DailyPlan[];
  activityImages?: ImageMap;
}

interface ActivityItemProps {
  activity: Activity;
  imageUrl?: string;
}

const ActivityItem = ({ activity, imageUrl }: ActivityItemProps) => {
  return (
    <div className="px-4 py-2">
      <div className="flex gap-4">
        {/* Activity Image - Larger card on the left */}
        <div className="w-32 h-32 flex-shrink-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg overflow-hidden">
          <img
            src={imageUrl || `https://placehold.co/150x150?text=${encodeURIComponent(activity.image_search_query || activity.activity)}`}
            alt={activity.activity}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        
        {/* Activity Content - Right side */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Clock className="h-3 w-3" />
                <span>{formatActivityTimeRange(activity.time, activity.duration)}</span>
              </div>
              <h5 className="font-medium">{activity.activity}</h5>
              {activity.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{activity.location}</span>
                </div>
              )}
            </div>
            {activity.estimated_cost && (
              <div className="flex items-center gap-1 text-sm font-medium text-green-600 flex-shrink-0">
                <IndianRupee className="h-3 w-3" />
                <span>{activity.estimated_cost}</span>
              </div>
            )}
          </div>
          
          {activity.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
          )}
        </div>
      </div>
      
      {activity.booking_info?.required && (
        <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded text-sm mt-2 pdf-hide">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-blue-800 dark:text-blue-200">
                Booking Required
              </span>
              {activity.booking_info.price_range && (
                <span className="text-bula dark:text-blue-300 ml-2">
                  {activity.booking_info.price_range}
                </span>
              )}
            </div>
            {activity.booking_info.url && (
              <Button size="sm" className="pdf-hide" asChild>
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
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface DayPlanItemProps {
  day: DailyPlan;
  activityImages?: ImageMap;
}

const DayPlanItem = ({ day, activityImages = {} }: DayPlanItemProps) => {
  return (
    <div className="border rounded-lg p-4 bg-bula">
      <div className="mb-3 bg-bula">
        <div className="flex items-center gap-2 p-4">
          <span className="font-semibold text-white">Day {day.day}</span>
        </div>
      </div>
      
      <div className="space-y-3 bg-white rounded-lg">
        {day.activities?.map((activity: Activity, actIndex: number) => (
          <ActivityItem 
            key={actIndex} 
            activity={activity} 
            imageUrl={activityImages[activity.image_search_query]}
          />
        ))}
      </div>
    </div>
  );
};

export const DailyItineraryCard = ({ dailyPlans, activityImages = {} }: DailyItineraryCardProps) => {
  if (!dailyPlans || dailyPlans.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          Daily Itinerary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {dailyPlans.map((day: DailyPlan, index: number) => (
          <DayPlanItem key={index} day={day} activityImages={activityImages} />
        ))}
      </CardContent>
    </Card>
  );
};
