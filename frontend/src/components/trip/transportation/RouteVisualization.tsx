import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Clock, IndianRupee, Bus, Train, Car, Footprints, Info } from "lucide-react";
import { RoutePlan, RouteSegment } from "@/constants";

interface RouteVisualizationProps {
  routePlan: RoutePlan;
  selectedDestinations: string[];
}

const getModeIcon = (mode: string) => {
  const modeLower = mode.toLowerCase();
  if (modeLower.includes("walk")) return <Footprints className="h-4 w-4" />;
  if (modeLower.includes("metro") || modeLower.includes("train")) return <Train className="h-4 w-4" />;
  if (modeLower.includes("bus")) return <Bus className="h-4 w-4" />;
  if (modeLower.includes("auto") || modeLower.includes("taxi") || modeLower.includes("car")) return <Car className="h-4 w-4" />;
  return <Navigation className="h-4 w-4" />;
};

const RouteSegmentVisual = ({ segment, isLast }: { segment: RouteSegment; isLast: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showStartPopup, setShowStartPopup] = useState(false);
  const [showEndPopup, setShowEndPopup] = useState(false);

  return (
    <div className="relative">
      {/* Starting Point */}
      <div className="flex items-start gap-4 mb-2">
        <div className="relative">
          <div
            className="relative cursor-pointer transition-transform hover:scale-110"
            onMouseEnter={() => {
              setIsHovered(true);
              setShowStartPopup(true);
            }}
            onMouseLeave={() => {
              setIsHovered(false);
              setShowStartPopup(false);
            }}
            onClick={() => setShowStartPopup(!showStartPopup)}
            onTouchStart={() => setShowStartPopup(!showStartPopup)}
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg z-10 relative">
              <MapPin className="h-5 w-5 text-primary-foreground" fill="currentColor" />
            </div>
            {isHovered && (
              <div className="absolute -top-1 -left-1 w-12 h-12 rounded-full bg-primary/20 animate-ping" />
            )}
          </div>
          
          {/* Popup Tooltip */}
          {showStartPopup && (
            <div className="absolute left-12 top-0 z-50 w-80 bg-popover border rounded-lg shadow-lg p-4 animate-in fade-in-0 zoom-in-95">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">{segment.from_location}</h4>
                <p className="text-xs text-muted-foreground">{segment.description}</p>
                {segment.landmarks && segment.landmarks.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium">Landmarks:</p>
                    <ul className="text-xs text-muted-foreground list-disc list-inside">
                      {segment.landmarks.map((landmark: string, idx: number) => (
                        <li key={idx}>{landmark}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {segment.details && (
                  <div className="pt-2 border-t">
                    <p className="text-xs">{segment.details}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 pt-2">
          <h4 className="font-medium text-sm">{segment.from_location}</h4>
        </div>
      </div>

      {/* Connecting Line with Transport Info */}
      <div className="flex items-start gap-4 mb-2 ml-5">
        <div className="relative">
          <div className="w-0.5 h-20 bg-gradient-to-b from-primary via-primary/50 to-primary border-l-2 border-dashed border-primary" />
        </div>
        <div className="flex-1 pt-4">
          <div className="bg-card border rounded-lg p-3 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              {getModeIcon(segment.mode)}
              <Badge variant="outline" className="text-xs">
                {segment.mode}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {segment.estimated_time}
              </div>
              <div className="flex items-center gap-1">
                <IndianRupee className="h-3 w-3" />
                {segment.estimated_cost}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ending Point (only if last segment) */}
      {isLast && (
        <div className="flex items-start gap-4">
          <div className="relative">
            <div 
              className="relative cursor-pointer transition-transform hover:scale-110"
              onMouseEnter={() => setShowEndPopup(true)}
              onMouseLeave={() => setShowEndPopup(false)}
              onClick={() => setShowEndPopup(!showEndPopup)}
              onTouchStart={() => setShowEndPopup(!showEndPopup)}
            >
              <div className="w-10 h-10 rounded-full bg-destructive flex items-center justify-center shadow-lg z-10 relative">
                <MapPin className="h-5 w-5 text-destructive-foreground" fill="currentColor" />
              </div>
            </div>
            
            {/* Popup Tooltip */}
            {showEndPopup && (
              <div className="absolute left-12 top-0 z-50 w-80 bg-popover border rounded-lg shadow-lg p-4 animate-in fade-in-0 zoom-in-95">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">{segment.to_location}</h4>
                  <p className="text-xs text-muted-foreground">Final Destination</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 pt-2">
            <h4 className="font-medium text-sm">{segment.to_location}</h4>
            <Badge variant="destructive" className="mt-1 text-xs">
              Destination
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
};

export const RouteVisualization = ({ routePlan, selectedDestinations }: RouteVisualizationProps) => {
  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle>
          {/* Desktop: Title and details in one row */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              Generated Route Plan
            </div>
            <div className="flex items-center gap-4 text-sm font-normal">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {routePlan.total_time}
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <IndianRupee className="h-4 w-4" />
                {routePlan.total_cost}
              </div>
              <Badge variant="secondary">{routePlan.total_distance}</Badge>
            </div>
          </div>

          {/* Mobile: Title and details stacked */}
          <div className="md:hidden space-y-3">
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              Generated Route Plan
            </div>
            <div className="space-y-2 text-sm font-normal">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>{routePlan.total_time}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <IndianRupee className="h-4 w-4 flex-shrink-0" />
                <span>{routePlan.total_cost}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Navigation className="h-4 w-4 flex-shrink-0" />
                <span>{routePlan.total_distance}</span>
              </div>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Route Overview */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Info className="h-4 w-4 text-primary" />
            Route Overview
          </div>
          <p className="text-sm text-muted-foreground">
            From <span className="font-semibold text-foreground">{routePlan.from_location}</span> to{" "}
            <span className="font-semibold text-foreground">{routePlan.to_location}</span>
          </p>
          {selectedDestinations.length > 2 && (
            <p className="text-xs text-muted-foreground">
              Via {selectedDestinations.length - 2} stop{selectedDestinations.length > 3 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Route Segments Visualization */}
        <div className="space-y-0">
          {routePlan.segments.map((segment, index) => (
            <RouteSegmentVisual key={index} segment={segment} isLast={index === routePlan.segments.length - 1} />
          ))}
        </div>

        {/* Travel Tips */}
        {routePlan.tips && routePlan.tips.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Travel Tips
            </h4>
            <ul className="space-y-2">
              {routePlan.tips.map((tip, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
