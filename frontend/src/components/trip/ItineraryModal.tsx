import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Clock, IndianRupee, ExternalLink, Car, Bed, Navigation } from "lucide-react";
import { TripDB, Itinerary, DailyPlan, Activity, Accommodation, Transportation, NeighboringPlace } from "@/lib/types";
import { useMemo } from "react";

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

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
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
                  <div key={index} className="border rounded-lg p-4">
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">Day {day.day}</Badge>
                        <span className="font-semibold">{formatDate(day.date)}</span>
                      </div>
                      {day.theme && (
                        <p className="text-lg font-medium text-primary">{day.theme}</p>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {day.activities?.map((activity: Activity, actIndex: number) => (
                        <div key={actIndex} className="border-l-2 border-l-primary pl-4 py-2">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <Clock className="h-3 w-3" />
                                <span>{activity.time}</span>
                                {activity.duration && (
                                  <Badge variant="outline" className="text-xs">
                                    {activity.duration}
                                  </Badge>
                                )}
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
                                  <Button size="sm" variant="outline" asChild>
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
                              {acc.type}
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
                        <Button size="sm" variant="outline" className="mt-2" asChild>
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
          {itinerary.transportation && itinerary.transportation.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Transportation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {itinerary.transportation.map((trans: Transportation, index: number) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-medium">{trans.type}</h5>
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
                        <Button size="sm" variant="outline" className="mt-2" asChild>
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
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
