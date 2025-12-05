import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, IndianRupee, Navigation, ExternalLink } from "lucide-react";
import { DailyPlan, Activity } from "@/constants";
import { formatActivityTimeRange } from "../utils/formatters";

interface DailyItineraryCardProps {
  dailyPlans: DailyPlan[];
}

interface ActivityItemProps {
  activity: Activity;
}

const ActivityItem = ({ activity }: ActivityItemProps) => {
  return (
    <div className="px-4 py-2">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-3 w-3" />
            <span>{formatActivityTimeRange(activity.time, activity.duration)}</span>
          </div>
          <h5 className="font-medium">{activity.activity}</h5>
          {activity.location && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{activity.location}</span>
            </div>
          )}
        </div>
        {activity.estimated_cost && (
          <div className="flex items-center gap-1 text-sm font-medium text-green-600">
            <IndianRupee className="h-3 w-3" />
            <span>{activity.estimated_cost}</span>
          </div>
        )}
      </div>
      
      {activity.description && (
        <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
      )}
      
      {activity.booking_info?.required && (
        <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded text-sm">
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
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface DayPlanItemProps {
  day: DailyPlan;
}

const DayPlanItem = ({ day }: DayPlanItemProps) => {
  return (
    <div className="border rounded-lg p-4 bg-bula">
      <div className="mb-3 bg-bula">
        <div className="flex items-center gap-2 p-4">
          <span className="font-semibold text-white">Day {day.day}</span>
        </div>
      </div>
      
      <div className="space-y-3 bg-white rounded-lg">
        {day.activities?.map((activity: Activity, actIndex: number) => (
          <ActivityItem key={actIndex} activity={activity} />
        ))}
      </div>
    </div>
  );
};

export const DailyItineraryCard = ({ dailyPlans }: DailyItineraryCardProps) => {
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
          <DayPlanItem key={index} day={day} />
        ))}
      </CardContent>
    </Card>
  );
};
