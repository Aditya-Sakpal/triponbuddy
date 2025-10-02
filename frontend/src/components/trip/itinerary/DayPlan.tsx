import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DailyPlan } from "@/constants";
import { ActivityCard } from "@/components/trip";

// Helper function to calculate end time
// const calculateEndTime = (startTime: string, duration: string): string => {
//   try {
//     // Parse start time (e.g., "7:00 AM")
//     const [time, period] = startTime.split(' ');
//     let [hours, minutes] = time.split(':').map(Number);
    
//     // Convert to 24-hour format
//     if (period === 'PM' && hours !== 12) hours += 12;
//     if (period === 'AM' && hours === 12) hours = 0;
    
//     // Parse duration (e.g., "1 hour", "2 hours", "30 minutes")
//     const durationMatch = duration.match(/(\d+)\s*(hour|minute)s?/i);
//     if (!durationMatch) return startTime;
    
//     const durationValue = parseInt(durationMatch[1]);
//     const durationUnit = durationMatch[2].toLowerCase();
    
//     // Add duration
//     if (durationUnit === 'hour') {
//       hours += durationValue;
//     } else if (durationUnit === 'minute') {
//       minutes += durationValue;
//     }
    
//     // Handle overflow
//     if (minutes >= 60) {
//       hours += Math.floor(minutes / 60);
//       minutes = minutes % 60;
//     }
//     if (hours >= 24) {
//       hours = hours % 24;
//     }
    
//     // Convert back to 12-hour format
//     const endPeriod = hours >= 12 ? 'PM' : 'AM';
//     const endHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
//     const endMinutes = minutes.toString().padStart(2, '0');
    
//     return `${endHours}:${endMinutes} ${endPeriod}`;
//   } catch (error) {
//     return startTime;
//   }
// };

export const DayPlan = ({ dayPlan, isExpanded, onToggle, activityImages }: {
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
    <Card className="mb-6">
      <CardHeader
        className="cursor-pointer hover:bg-blue-800 transition-colors duration-300  bg-bula rounded-md"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between text-white">
          <CardTitle className="text-md md:text-2xl font-bold">
            Day {dayPlan.day}
          </CardTitle>
          <CardDescription className="text-md md:text-lg font-medium text-center text-white">
            {dayPlan.theme}
          </CardDescription>
          <div className="flex items-center gap-2">

            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="py-4">
          {/* Mobile View - Original Stacked Layout */}
          <div className="md:hidden space-y-4">
            {dayPlan.activities.map((activity, index) => (
              <ActivityCard
                key={index}
                activity={activity}
                imageUrl={activityImages[activity.image_search_query]}
              />
            ))}
          </div>

          {/* Desktop View - Timeline Layout */}
          <div className="hidden md:block">
            {dayPlan.activities.map((activity, index) => {
              // const endTime = calculateEndTime(activity.time, activity.duration);
              const isLastActivity = index === dayPlan.activities.length - 1;
              
              return (
                <div key={index} className="relative flex gap-6">
                  {/* Timeline Badge and Connector */}
                  <div className="flex flex-col items-center flex-shrink-0" style={{ width: '140px' }}>
                    <Badge className="bg-bula hover:bg-blue-700 text-white px-3 py-2 text-sm font-medium whitespace-nowrap">
                      {activity.time}
                    </Badge>
                    {!isLastActivity && (
                      <div className="w-0.5 bg-gray-400 flex-grow mt-2" style={{ minHeight: '100px' }} />
                    )}
                  </div>

                  {/* Activity Card */}
                  <div className="flex-grow pb-8">
                    <ActivityCard
                      activity={activity}
                      imageUrl={activityImages[activity.image_search_query]}
                      hideTime={true}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
};