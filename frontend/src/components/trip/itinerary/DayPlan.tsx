import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyPlan } from "@/constants";
import { ActivityCard } from "@/components/trip";

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
    <Card className="mb-6 bg-gray-300">
      <CardHeader
        className="cursor-pointer hover:bg-blue-800 transition-colors duration-300  bg-bula rounded-xl"
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