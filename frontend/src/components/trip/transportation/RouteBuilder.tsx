import { useState, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, GripVertical, X, Route, Loader2, Clock, IndianRupee } from "lucide-react";
import { TripsApiService } from "@/lib/api-services";
import { RouteDestination, RoutePlan } from "@/constants";
import { RouteVisualization } from "./RouteVisualization";
import { useToast } from "@/hooks/use-toast";
import { LoadingState } from "@/components/shared/LoadingState";

interface RouteBuilderProps {
  tripId: string;
  userId: string;
  destinationCity: string;
}

interface SelectedDestination extends RouteDestination {
  id: string;
}

const SortableDestinationTile = ({ destination, onRemove }: { destination: SelectedDestination; onRemove: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: destination.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-1">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate md:whitespace-normal">{destination.activity}</h4>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 truncate md:whitespace-normal">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{destination.location}</span>
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  Day {destination.day}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {destination.time}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={onRemove}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const RouteBuilder = ({ tripId, userId, destinationCity }: RouteBuilderProps) => {
  const [availableDestinations, setAvailableDestinations] = useState<RouteDestination[]>([]);
  const [selectedDestinations, setSelectedDestinations] = useState<SelectedDestination[]>([]);
  const [arrivalHotel, setArrivalHotel] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRoute, setGeneratedRoute] = useState<RoutePlan | null>(null);
  const [selectedValue, setSelectedValue] = useState<string>("");
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchDestinations = async () => {
    try {
      setIsLoading(true);
      const response = await TripsApiService.getRouteDestinations(tripId, userId);
      if (response.success) {
        setAvailableDestinations(response.destinations);
        setArrivalHotel(response.arrival_hotel);
      }
    } catch (error) {
      console.error("Error fetching destinations:", error);
      toast({
        title: "Error",
        description: "Failed to load destinations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId, userId]);

  const handleAddDestination = (location: string) => {
    const destination = availableDestinations.find((d) => d.location === location);
    if (destination && !selectedDestinations.some((d) => d.location === location)) {
      setSelectedDestinations([
        ...selectedDestinations,
        {
          ...destination,
          id: `${destination.location}-${Date.now()}`,
        },
      ]);
      setSelectedValue("");
    }
  };

  const handleRemoveDestination = (id: string) => {
    setSelectedDestinations(selectedDestinations.filter((d) => d.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSelectedDestinations((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleGenerateRoute = async () => {
    if (selectedDestinations.length === 0) {
      toast({
        title: "No destinations selected",
        description: "Please select at least one destination",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      const response = await TripsApiService.generateRoute(
        tripId,
        {
          trip_id: tripId,
          user_id: userId,
          from_location: arrivalHotel,
          to_locations: selectedDestinations.map((d) => d.location),
          destination_city: destinationCity,
        },
        userId
      );

      if (response.success) {
        setGeneratedRoute(response.route_plan);
        toast({
          title: "Route Generated!",
          description: "Your custom route has been created successfully",
        });
      }
    } catch (error) {
      console.error("Error generating route:", error);
      toast({
        title: "Error",
        description: "Failed to generate route. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setSelectedDestinations([]);
    setGeneratedRoute(null);
    setSelectedValue("");
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <LoadingState />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Route Builder
          </CardTitle>
          <CardDescription>
            Select destinations from your itinerary and arrange them to create a custom route plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Starting Point */}
          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Starting Point</p>
              <p className="text-xs text-muted-foreground">{arrivalHotel}</p>
            </div>
          </div>

          {/* Destination Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Add Destination</label>
            <Select value={selectedValue} onValueChange={handleAddDestination}>
              <SelectTrigger>
                <SelectValue placeholder="Select a place from your itinerary" />
              </SelectTrigger>
              <SelectContent>
                {availableDestinations
                  .filter((dest) => !selectedDestinations.some((d) => d.location === dest.location))
                  .map((dest, index) => (
                    <SelectItem key={index} value={dest.location}>
                      <div className="flex flex-col">
                        <span className="font-medium">{dest.activity}</span>
                        <span className="text-xs text-muted-foreground">{dest.location}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Destinations Playground */}
          {selectedDestinations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Selected Destinations (Drag to reorder)</label>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Clear All
                </Button>
              </div>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={selectedDestinations.map((d) => d.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3 p-4 bg-bula/50 rounded-lg border-2 border-dashed min-h-[100px]">
                    {selectedDestinations.map((dest) => (
                      <SortableDestinationTile
                        key={dest.id}
                        destination={dest}
                        onRemove={() => handleRemoveDestination(dest.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          {/* Generate Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleGenerateRoute}
            disabled={selectedDestinations.length === 0 || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Route...
              </>
            ) : (
              <>
                <Route className="mr-2 h-4 w-4" />
                Generate Route Plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Route Visualization */}
      {isGenerating ? (
        <Card>
          <CardContent>
            <LoadingState />
            <p className="text-center text-muted-foreground text-sm mt-4">
              Generating your custom route plan...
            </p>
          </CardContent>
        </Card>
      ) : generatedRoute ? (
        <RouteVisualization
          routePlan={generatedRoute}
          selectedDestinations={[arrivalHotel, ...selectedDestinations.map((d) => d.location)]}
        />
      ) : null}
    </div>
  );
};
