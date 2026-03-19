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
  ignoreDistanceRules?: boolean;
}

export const TransportationModeSelector = ({ 
  value, 
  onChange, 
  startLocation = '',
  destination = '',
  disabled = false,
  isInternational = false,
  ignoreDistanceRules = false
}: TransportationModeSelectorProps) => {
  const safeValue: TransportationMode =
    value === 'default' || value === 'road' || value === 'train' || value === 'flight'
      ? value
      : 'default';

  // If parent accidentally passes an invalid value (e.g. legacy "local"), coerce to default
  useEffect(() => {
    if (safeValue !== value) onChange(safeValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate distance in real-time
  const { distanceKm, isCalculating } = useDistanceCalculation({
    startLocation,
    destination,
    enabled: !ignoreDistanceRules && !disabled && !!startLocation && !!destination,
  });

  // Determine which modes are enabled based on distance
  const isFlightDisabled = !ignoreDistanceRules && distanceKm !== null && distanceKm < 500;
  const isRoadDisabled = !ignoreDistanceRules && (isInternational || (distanceKm !== null && distanceKm > 500));
  const isTrainDisabled = !ignoreDistanceRules && (isInternational || (distanceKm !== null && distanceKm > 2500));

  // Use ref to track if we need to reset
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Auto-reset to default if current selection becomes disabled
  useEffect(() => {
    if (ignoreDistanceRules) return;
    const shouldReset = 
      (value === 'flight' && isFlightDisabled) ||
      (value === 'road' && isRoadDisabled) ||
      (value === 'train' && isTrainDisabled);
    
    if (shouldReset) {
      onChangeRef.current('default');
    }
  }, [distanceKm, value, isFlightDisabled, isRoadDisabled, isTrainDisabled, ignoreDistanceRules]);

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
        return 'Flight';
      case 'road':
        return 'Road';
      case 'train':
        return 'Train';
      default:
        return 'Default';
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
      {ignoreDistanceRules ? (
        // Native select is more reliable inside dialogs on mobile; we keep the same options.
        <select
          id="transportation-mode"
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={safeValue}
          onChange={(e) => onChange(e.target.value as TransportationMode)}
          disabled={disabled}
        >
          <option value="default">Default</option>
          <option value="road">Road</option>
          <option value="train">Train</option>
          <option value="flight">Flight</option>
        </select>
      ) : (
        <Select 
          value={safeValue} 
          onValueChange={(v) => onChange(v as TransportationMode)}
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
      )}
      {distanceKm && !ignoreDistanceRules && (
        <p className="text-xs text-muted-foreground">
          Options are enabled/disabled based on the distance between start and destination
        </p>
      )}
    </div>
  );
};
