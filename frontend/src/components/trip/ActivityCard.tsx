import { Clock, MapPin, ExternalLink, ChevronDown, ChevronUp, MinusCircle, Star } from "lucide-react";
import { FaInfoCircle } from "react-icons/fa";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Activity } from "@/constants";
import { useState } from "react";
import { sanitizePrice } from "@/utils/tripUtils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { googlePlacesService, type PlaceDetails } from "@/services/googlePlacesService";
import { formatActivityTimeRange } from "./itinerary/timeUtils";

const getTagColor = (tag?: string) => {
  switch (tag) {
    case "arrival_departure":
      return "bg-purple-100 text-purple-800 border-purple-300";
    case "dining":
      return "bg-orange-100 text-orange-800 border-orange-300";
    case "sightseeing":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "shopping":
      return "bg-pink-100 text-pink-800 border-pink-300";
    case "entertainment":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "relaxation":
      return "bg-green-100 text-green-800 border-green-300";
    case "adventure":
      return "bg-red-100 text-red-800 border-red-300";
    case "cultural":
      return "bg-indigo-100 text-indigo-800 border-indigo-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

const getTagLabel = (tag?: string) => {
  if (!tag) return "General";
  return tag.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export const ActivityCard = ({ 
  activity, 
  imageUrl, 
  hideTime = false,
  isEditMode = false,
  onModify
}: { 
  activity: Activity, 
  imageUrl?: string, 
  hideTime?: boolean,
  isEditMode?: boolean,
  onModify?: () => void
}) => {
  const [showDetailedDescription, setShowDetailedDescription] = useState(false);
  const [showPlaceDialog, setShowPlaceDialog] = useState(false);
  const [isLoadingPlace, setIsLoadingPlace] = useState(false);
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [placeError, setPlaceError] = useState<string | null>(null);

  const placeQuery = `${activity.activity} ${activity.location || ""}`.trim();
  const timeRange = formatActivityTimeRange(activity.time, activity.duration);

  const handleOpenPlaceDialog = async () => {
    setShowPlaceDialog(true);
    if (placeDetails || isLoadingPlace) return;

    setIsLoadingPlace(true);
    setPlaceError(null);
    try {
      const details = await googlePlacesService.getPlaceDetails(placeQuery);
      setPlaceDetails(details);
      if (!details) {
        setPlaceError("No Google place details found for this location.");
      }
    } catch {
      setPlaceError("Unable to load Google place details right now.");
    } finally {
      setIsLoadingPlace(false);
    }
  };

  return (
    <>
    <Card className="mb-4 border-none overflow-hidden">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                {!hideTime && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground md:hidden">
                    <Clock className="w-4 h-4" />
                    <span>{timeRange}</span>
                    {activity.duration && <span className="text-xs">({activity.duration})</span>}
                  </div>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    className="font-semibold text-lg text-left hover:underline"
                    onClick={handleOpenPlaceDialog}
                  >
                    {activity.activity}
                  </button>
                  {activity.tag && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getTagColor(activity.tag)}`}
                    >
                      {getTagLabel(activity.tag)}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-end leading-tight">
                  <div className="text-sm font-medium text-green-600">
                    {sanitizePrice(activity.estimated_cost)}
                  </div>
                  {activity.duration && (
                    <div className="text-xs text-muted-foreground">
                      {activity.duration}
                    </div>
                  )}
                </div>
                {isEditMode && activity.tag !== "arrival_departure" && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 rounded-full shadow-lg"
                    onClick={onModify}
                  >
                    <MinusCircle className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
            
            <p className="text-muted-foreground">{activity.description}</p>

            <button
              type="button"
              onClick={handleOpenPlaceDialog}
              className="w-full text-left rounded-xl overflow-hidden"
            >
              <div className="w-full h-[200px] sm:h-[250px] md:h-[320px] lg:h-[340px] bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={imageUrl || `https://placehold.co/300x200?text=${encodeURIComponent(activity.image_search_query)}`}
                  alt={activity.activity}
                  className="block w-full h-full object-cover object-center transition-transform duration-300 hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>
            </button>

            <div className="flex items-center gap-1 text-md text-bula">
              <MapPin className="w-4 h-4" />
              <button
                type="button"
                onClick={handleOpenPlaceDialog}
                className="hover:underline text-left"
              >
                {activity.location}
              </button>
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
    <Dialog open={showPlaceDialog} onOpenChange={setShowPlaceDialog}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{activity.activity}</DialogTitle>
          <DialogDescription>{activity.location}</DialogDescription>
        </DialogHeader>

        {isLoadingPlace && (
          <div className="space-y-3">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {!isLoadingPlace && (
          <div className="space-y-4">
            {placeDetails?.rating && (
              <div className="flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">{placeDetails.rating.toFixed(1)} / 5 Google rating</span>
              </div>
            )}

            <p className="text-sm text-muted-foreground leading-relaxed">
              {activity.detailed_description || activity.description}
            </p>

            {placeDetails?.photoUrls && placeDetails.photoUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {placeDetails.photoUrls.map((photoUrl, idx) => (
                  <img
                    key={`${photoUrl}-${idx}`}
                    src={photoUrl}
                    alt={`${activity.activity} photo ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-md"
                    loading="lazy"
                  />
                ))}
              </div>
            )}

            {placeError && (
              <p className="text-sm text-destructive">{placeError}</p>
            )}

            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <a
                  href={placeDetails?.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Google Maps
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
              {placeDetails?.address && (
                <span className="text-xs text-muted-foreground">{placeDetails.address}</span>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
};
