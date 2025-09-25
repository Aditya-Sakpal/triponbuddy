import { Clock, MapPin, IndianRupee, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Activity } from "@/constants";

export const ActivityCard = ({ activity, imageUrl }: { activity: Activity, imageUrl?: string }) => {
  return (
    <Card className="mb-4 border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="space-y-3">
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

            <div className="aspect-[4/1] bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg overflow-hidden">
              <img
                src={imageUrl || `https://placehold.co/300x200?text=${encodeURIComponent(activity.image_search_query)}`}
                alt={activity.activity}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            
            {activity.booking_info && activity.booking_info.required && (
              <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Booking Required
                    </p>
                    <p className="text-xs text-bula dark:text-blue-300">
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
          

        </div>
      </CardContent>
    </Card>
  );
};