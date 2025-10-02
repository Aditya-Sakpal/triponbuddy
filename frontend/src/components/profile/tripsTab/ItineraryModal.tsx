import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Clock, IndianRupee, ExternalLink, Car, Bed, Navigation } from "lucide-react";
import { TripDB, Itinerary, DailyPlan, Activity, Accommodation, TravelRoute, NeighboringPlace, TransportationHub, LocalTransportation } from "@/constants";
import { useMemo } from "react";
import { formatTitleCase } from "@/utils/tripUtils";

interface ItineraryModalProps {
  trip: TripDB | null;
  open: boolean;
  onClose: () => void;
}

export const ItineraryModal = ({ trip, open, onClose }: ItineraryModalProps) => {
  const itinerary = useMemo(() => {
    if (!trip?.itinerary_data) return null;
    return trip.itinerary_data as unknown as Itinerary;
  }, [trip?.itinerary_data]);

  if (!trip || !itinerary) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const formatCurrency = (amount: string | number) => {
    if (typeof amount === 'string') {
      return amount.includes('₹') ? amount : `₹${amount}`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const formatActivityTimeRange = (time: string, duration?: string) => {
    if (!time) return '';

    // Parse start time - assume format like "09:00" or "9:00"
    const timeMatch = time.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
    if (!timeMatch) return time; // fallback to original time if parsing fails

    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const ampm = timeMatch[3]?.toUpperCase();

    // Convert to 24-hour format if needed
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);

    let endDate = startDate;

    // Parse duration and calculate end time
    if (duration) {
      const durationMatch = duration.match(/(\d+)\s*h(?:ours?)?(?:\s*(\d+)\s*m(?:in(?:utes?)?)?)?|(\d+)\s*m(?:in(?:utes?)?)?/i);
      if (durationMatch) {
        let addHours = 0;
        let addMinutes = 0;

        if (durationMatch[1]) { // hours and possibly minutes
          addHours = parseInt(durationMatch[1]);
          if (durationMatch[2]) addMinutes = parseInt(durationMatch[2]);
        } else if (durationMatch[3]) { // only minutes
          addMinutes = parseInt(durationMatch[3]);
        }

        endDate = new Date(startDate.getTime() + (addHours * 60 * 60 * 1000) + (addMinutes * 60 * 1000));
      }
    }

    // Format times in 12-hour format
    const formatTime12Hour = (date: Date) => {
      const h = date.getHours();
      const m = date.getMinutes();
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12;
      return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
    };

    const startTime = formatTime12Hour(startDate);
    const endTime = duration ? formatTime12Hour(endDate) : null;

    return endTime ? `${startTime} - ${endTime}` : startTime;
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto mt-12">
        <DialogHeader className="border-b border-bula text-bula">
          <DialogTitle className="text-2xl font-bold">{trip.title}</DialogTitle>
          <DialogDescription className="text-lg">
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {trip.destination}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {trip.duration_days} {trip.duration_days === 1 ? 'day' : 'days'}
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trip Overview */}
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
                {itinerary.estimated_total_cost && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estimated Cost</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(itinerary.estimated_total_cost)}
                    </p>
                  </div>
                )}
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

          {/* Daily Plans */}
          {itinerary.daily_plans && itinerary.daily_plans.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Daily Itinerary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {itinerary.daily_plans.map((day: DailyPlan, index: number) => (
                  <div key={index} className="border rounded-lg p-4 bg-bula">
                    <div className="mb-3 bg-bula">
                      <div className="flex items-center gap-2 p-4 ">
                        <span className="font-semibold text-white">Day {day.day}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 bg-white  rounded-lg">
                      {day.activities?.map((activity: Activity, actIndex: number) => (
                        <div key={actIndex} className="px-4 py-2">
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
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Accommodation */}
          {itinerary.accommodation && itinerary.accommodation.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bed className="h-5 w-5" />
                  Accommodation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {itinerary.accommodation.map((acc: Accommodation, index: number) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-medium">{acc.name}</h5>
                          {acc.location && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{acc.location}</span>
                            </div>
                          )}
                          {acc.type && (
                            <Badge variant="outline" className="mt-1">
                              {formatTitleCase(acc.type)}
                            </Badge>
                          )}
                        </div>
                        {acc.price_range && (
                          <div className="text-right">
                            <p className="font-medium text-green-600">
                              {formatCurrency(acc.price_range)}
                            </p>
                          </div>
                        )}
                      </div>
                      {acc.amenities && acc.amenities.length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {acc.amenities.map((amenity, amenityIndex) => (
                              <Badge key={amenityIndex} variant="outline" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {acc.booking_url && (
                        <Button size="sm" className="mt-2" asChild>
                          <a href={acc.booking_url} target="_blank" rel="noopener noreferrer">
                            View Details
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transportation */}
          {itinerary.transportation?.routes && itinerary.transportation.routes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Transportation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {itinerary.transportation.routes.map((trans: TravelRoute, index: number) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-medium">{formatTitleCase(trans.type)}</h5>
                          {trans.from && trans.to && (
                            <p className="text-sm text-muted-foreground">{trans.from} → {trans.to}</p>
                          )}
                          {trans.duration && (
                            <Badge variant="outline" className="mt-1">
                              {trans.duration}
                            </Badge>
                          )}
                        </div>
                        {trans.estimated_cost && (
                          <div className="text-right">
                            <p className="font-medium text-green-600">
                              {formatCurrency(trans.estimated_cost)}
                            </p>
                          </div>
                        )}
                      </div>
                      {trans.booking_url && (
                        <Button size="sm" className="mt-2" asChild>
                          <a href={trans.booking_url} target="_blank" rel="noopener noreferrer">
                            Book Now
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transportation Hubs - Start Location */}
          {itinerary.transportation_hubs_start && itinerary.transportation_hubs_start.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Transportation Hubs (Starting Point)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {itinerary.transportation_hubs_start.map((hub: TransportationHub, index: number) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-medium">{hub.name}</h5>
                          <p className="text-sm text-muted-foreground">{hub.type} • {hub.location}</p>
                          {hub.distance_from_city && (
                            <p className="text-sm text-muted-foreground">
                              {hub.distance_from_city} from city center
                            </p>
                          )}
                        </div>
                        {hub.estimated_cost_to_reach && (
                          <div className="text-right">
                            <p className="font-medium text-green-600">
                              {formatCurrency(hub.estimated_cost_to_reach)}
                            </p>
                            <p className="text-xs text-muted-foreground">to reach</p>
                          </div>
                        )}
                      </div>
                      {hub.transportation_options && hub.transportation_options.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium mb-1">Available Options:</p>
                          <div className="flex flex-wrap gap-1">
                            {hub.transportation_options.map((option, optionIndex) => (
                              <Badge key={optionIndex} variant="outline" className="text-xs">
                                {option}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transportation Hubs - Destination */}
          {itinerary.transportation_hubs_destination && itinerary.transportation_hubs_destination.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Transportation Hubs (Destination)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {itinerary.transportation_hubs_destination.map((hub: TransportationHub, index: number) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-medium">{hub.name}</h5>
                          <p className="text-sm text-muted-foreground">{hub.type} • {hub.location}</p>
                          {hub.distance_from_city && (
                            <p className="text-sm text-muted-foreground">
                              {hub.distance_from_city} from city center
                            </p>
                          )}
                        </div>
                        {hub.estimated_cost_to_reach && (
                          <div className="text-right">
                            <p className="font-medium text-green-600">
                              {formatCurrency(hub.estimated_cost_to_reach)}
                            </p>
                            <p className="text-xs text-muted-foreground">to reach</p>
                          </div>
                        )}
                      </div>
                      {hub.transportation_options && hub.transportation_options.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium mb-1">Available Options:</p>
                          <div className="flex flex-wrap gap-1">
                            {hub.transportation_options.map((option, optionIndex) => (
                              <Badge key={optionIndex} variant="outline" className="text-xs">
                                {option}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Local Transportation */}
          {itinerary.local_transportation && itinerary.local_transportation.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Local Transportation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {itinerary.local_transportation.map((local: LocalTransportation, index: number) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-medium">{formatTitleCase(local.type)}</h5>
                          <p className="text-sm text-muted-foreground">{local.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {local.availability}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Covers: {local.coverage_area}
                            </span>
                          </div>
                        </div>
                        {local.estimated_cost && (
                          <div className="text-right">
                            <p className="font-medium text-green-600">
                              {formatCurrency(local.estimated_cost)}
                            </p>
                          </div>
                        )}
                      </div>
                      {local.booking_info && (
                        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded text-sm">
                          <p className="text-blue-800 dark:text-blue-200">
                            {local.booking_info}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Neighboring Places */}
          {itinerary.neighboring_places && itinerary.neighboring_places.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Nearby Attractions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {itinerary.neighboring_places.map((place: NeighboringPlace, index: number) => (
                    <div key={index} className="border rounded-lg p-3">
                      <h5 className="font-medium">{place.name}</h5>
                      {place.distance && (
                        <p className="text-sm text-muted-foreground">
                          {place.distance} away
                        </p>
                      )}
                      {place.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {place.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Travel Tips */}
          {itinerary.travel_tips && itinerary.travel_tips.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Travel Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {itinerary.travel_tips.map((tip: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
