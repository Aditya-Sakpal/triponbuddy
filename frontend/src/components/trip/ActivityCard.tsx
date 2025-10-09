import { Clock, MapPin, IndianRupee, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { FaInfoCircle } from "react-icons/fa";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Activity } from "@/constants";
import { useState } from "react";

export const ActivityCard = ({ activity, imageUrl, hideTime = false }: { activity: Activity, imageUrl?: string, hideTime?: boolean }) => {
  const [showDetailedDescription, setShowDetailedDescription] = useState(false);

  return (
    <Card className="mb-4 border-none ">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                {!hideTime && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground md:hidden">
                    <Clock className="w-4 h-4" />
                    <span>{activity.time}</span>
                  </div>
                )}
                <h4 className="font-semibold text-lg">{activity.activity}</h4>

              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                <IndianRupee className="w-4 h-4" />
                <span>{activity.estimated_cost}</span>
              </div>
            </div>
            
            <p className="text-muted-foreground">{activity.description}</p>



            <div className="aspect-[4/1] bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg overflow-hidden">
              <img
                src={imageUrl || `https://placehold.co/300x200?text=${encodeURIComponent(activity.image_search_query)}`}
                alt={activity.activity}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

                <div className="flex items-center gap-1 text-md text-bula">
                  <MapPin className="w-4 h-4" />
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {activity.location}
                  </a>
                </div>

                            {/* Know More Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetailedDescription(!showDetailedDescription)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5"
            >
              <FaInfoCircle className="w-4 h-4" />

              <span className="font-medium">
                Know More</span>
              {showDetailedDescription ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>

            {/* Detailed Description Section */}
            {showDetailedDescription && (
              <div className=" p-4 rounded-lg border-4 border-l-bula">
                <h5 className="font-semibold text-sm text-blue-900 mb-2">
                  About {activity.activity}
                </h5>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {activity.detailed_description}
                </p>
              </div>
            )}
            
            {activity.booking_info && activity.booking_info.required && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Booking Required
                    </p>
                    <p className="text-xs text-bula">
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