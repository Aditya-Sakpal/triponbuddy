import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DailyPlan, Activity } from "@/constants";
import { ActivityCard } from "@/components/trip";

export const DayPlan = ({ 
  dayPlan, 
  isExpanded, 
  onToggle, 
  activityImages,
  isEditMode = false,
  onModifyActivity
}: {
  dayPlan: DailyPlan;
  isExpanded: boolean;
  onToggle: () => void;
  activityImages: { [query: string]: string | undefined };
  isEditMode?: boolean;
  onModifyActivity?: (index: number, activity: Activity) => void;
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
                isEditMode={isEditMode}
                onModify={() => onModifyActivity?.(index, activity)}
              />
            ))}
          </div>

          {/* Desktop View - Timeline Layout */}
          <div className="hidden md:block">
            {dayPlan.activities.map((activity, index) => {
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
                      isEditMode={isEditMode}
                      onModify={() => onModifyActivity?.(index, activity)}
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