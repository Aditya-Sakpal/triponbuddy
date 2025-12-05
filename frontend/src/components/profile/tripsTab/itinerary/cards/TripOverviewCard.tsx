import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar, Info } from "lucide-react";
import { TripDB, Itinerary } from "@/constants";
import { getCalculatedBudget } from "@/utils/tripUtils";
import { formatDate } from "../utils/formatters";

interface TripOverviewCardProps {
  trip: TripDB;
  itinerary: Itinerary;
}

export const TripOverviewCard = ({ trip, itinerary }: TripOverviewCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Trip Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Start Date</p>
            <p className="text-lg">{formatDate(trip.start_date)}</p>
          </div>
          {trip.end_date && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">End Date</p>
              <p className="text-lg">{formatDate(trip.end_date)}</p>
            </div>
          )}
          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      Estimated Cost
                      <Info className="h-3 w-3" />
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                      {getCalculatedBudget(trip)}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">
                    Sum of estimated activity costs. Actual costs may be higher.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {itinerary.best_time_to_visit && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Best Time to Visit</p>
              <p className="text-lg">{itinerary.best_time_to_visit}</p>
            </div>
          )}
        </div>
        {trip.start_location && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Starting From</p>
            <p className="text-lg">{trip.start_location}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
