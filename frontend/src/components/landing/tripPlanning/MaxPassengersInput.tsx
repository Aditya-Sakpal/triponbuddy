/**
 * Max Passengers Input Component
 * Allows users to specify maximum passengers for trip sharing
 */

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Users } from "lucide-react";

interface MaxPassengersInputProps {
  maxPassengers: number | undefined;
  setMaxPassengers: (maxPassengers: number | undefined) => void;
  currentTravelers: number;
}

export const MaxPassengersInput = ({
  maxPassengers,
  setMaxPassengers,
  currentTravelers,
}: MaxPassengersInputProps) => {
  const handleChange = (value: string) => {
    if (value === "") {
      setMaxPassengers(undefined);
    } else {
      const num = parseInt(value, 10);
      if (!isNaN(num) && num > 0) {
        setMaxPassengers(num);
      }
    }
  };

  // Calculate minimum passengers (user + travelers)
  const minPassengers = 1 + currentTravelers;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        <Label htmlFor="max-passengers" className="text-base font-medium">
          Maximum Passengers (Optional)
        </Label>
      </div>
      <div className="space-y-2">
        <Input
          id="max-passengers"
          type="number"
          min={minPassengers}
          placeholder="Leave empty if not sharing"
          value={maxPassengers || ""}
          onChange={(e) => handleChange(e.target.value)}
          className="text-base"
        />
      </div>
    </div>
  );
};
