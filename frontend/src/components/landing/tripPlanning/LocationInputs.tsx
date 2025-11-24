import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LocationAutocomplete } from "@/components/shared/location-autocomplete";
import { MapPin } from "lucide-react";

interface LocationInputsProps {
  startLocation: string;
  setStartLocation: (value: string) => void;
  destination: string;
  setDestination: (value: string) => void;
  isInternational: boolean;
  setIsInternational: (value: boolean) => void;
}

export const LocationInputs = ({
  startLocation,
  setStartLocation,
  destination,
  setDestination,
  isInternational,
  setIsInternational,
}: LocationInputsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
            <Label htmlFor="start-location" className="text-sm font-medium">
              Start Location 
            </Label>
            <div className="flex items-center space-x-2">
              <Switch 
                id="worldwide" 
                checked={isInternational}
                onCheckedChange={setIsInternational}
              />
              <Label htmlFor="worldwide" className="text-sm text-muted-foreground">Worldwide</Label>
            </div>

        </div>

        <LocationAutocomplete
          id="start-location"
          value={startLocation}
          onChange={setStartLocation}
          placeholder="Enter your starting point"
          icon={<MapPin className="w-4 h-4" />}
        />
      </div>

      <div className="space-y-3">
          <Label className="text-sm font-medium">
            Destination <span className="text-destructive">*</span>
          </Label>
        <LocationAutocomplete
          value={destination}
          onChange={setDestination}
          placeholder="Where do you want to go?"
          icon={<MapPin className="w-4 h-4 text-primary" />}
          required
        />
      </div>
    </div>
  );
};
