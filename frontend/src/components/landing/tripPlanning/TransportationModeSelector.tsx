import { useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plane, Car, Train, List, Loader2 } from "lucide-react";
import type { TransportationMode } from "@/constants";
import { useDistanceCalculation } from "@/hooks/useDistanceCalculation";

interface TransportationModeSelectorProps {
  value: TransportationMode;
  onChange: (value: TransportationMode) => void;
  startLocation?: string;
  destination?: string;
  disabled?: boolean;
  isInternational?: boolean;
}

export const TransportationModeSelector = ({ 
  value, 
  onChange, 
  startLocation = '',
  destination = '',
  disabled = false,
  isInternational = false
}: TransportationModeSelectorProps) => {
  // Calculate distance in real-time
  const { distanceKm, isCalculating } = useDistanceCalculation({
    startLocation,
    destination,
    enabled: !disabled && !!startLocation && !!destination,
  });

  // Determine which modes are enabled based on distance
  const isFlightDisabled = distanceKm !== null && distanceKm < 500;
  const isRoadDisabled = isInternational || (distanceKm !== null && distanceKm > 500);
  const isTrainDisabled = isInternational || (distanceKm !== null && distanceKm > 2500);

  // Use ref to track if we need to reset
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Auto-reset to default if current selection becomes disabled
  useEffect(() => {
    const shouldReset = 
      (value === 'flight' && isFlightDisabled) ||
      (value === 'road' && isRoadDisabled) ||
      (value === 'train' && isTrainDisabled);
    
    if (shouldReset) {
      onChangeRef.current('default');
    }
  }, [distanceKm, value, isFlightDisabled, isRoadDisabled, isTrainDisabled]);

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'flight':
        return <Plane className="w-4 h-4 mr-2" />;
      case 'road':
        return <Car className="w-4 h-4 mr-2" />;
      case 'train':
        return <Train className="w-4 h-4 mr-2" />;
      default:
        return <List className="w-4 h-4 mr-2" />;
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'flight':
        return isFlightDisabled
          ? 'Flight (Requires 500+ km)' 
          : 'Flight (500+ km)';
      case 'road':
        if (isInternational) return 'Road (Unavailable )';
        return isRoadDisabled
          ? 'Road (Only for ≤500 km)' 
          : 'Road (≤500 km)';
      case 'train':
        if (isInternational) return 'Train (Unavailable)';
        return isTrainDisabled
          ? 'Train (Only for ≤2500 km)' 
          : 'Train (≤2500 km)';
      default:
        return 'Default (All modes)';
    }
  };

  return (
    <div className="space-y-2 py-2">
      <Label htmlFor="transportation-mode" className="text-sm font-medium">
        Transportation Mode
      </Label>
      {isCalculating && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="w-3 h-3 animate-spin" />
          Calculating distance...
        </div>
      )}
      {distanceKm && !isCalculating && (
        <p className="text-xs text-muted-foreground">
          Distance: {distanceKm.toFixed(0)} km
        </p>
      )}
      <Select 
        value={value} 
        onValueChange={onChange}
        disabled={disabled || isCalculating}
      >
        <SelectTrigger id="transportation-mode" className="w-full">
          <SelectValue placeholder="Select transportation mode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">
            <div className="flex items-center">
              {getModeIcon('default')}
              {getModeLabel('default')}
            </div>
          </SelectItem>
          <SelectItem value="road" disabled={isRoadDisabled}>
            <div className="flex items-center">
              {getModeIcon('road')}
              {getModeLabel('road')}
            </div>
          </SelectItem>
          <SelectItem value="train" disabled={isTrainDisabled}>
            <div className="flex items-center">
              {getModeIcon('train')}
              {getModeLabel('train')}
            </div>
          </SelectItem>
          <SelectItem value="flight" disabled={isFlightDisabled}>
            <div className="flex items-center">
              {getModeIcon('flight')}
              {getModeLabel('flight')}
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      {distanceKm && (
        <p className="text-xs text-muted-foreground">
          Options are enabled/disabled based on the distance between start and destination
        </p>
      )}
    </div>
  );
};
