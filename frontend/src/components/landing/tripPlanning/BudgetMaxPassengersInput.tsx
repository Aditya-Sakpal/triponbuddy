/**
 * Budget and Max Passengers Input Component
 * Combined component with 2-column layout for budget and max passengers
 */

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { IndianRupee, Users } from "lucide-react";

interface BudgetMaxPassengersInputProps {
  budget: number | undefined;
  setBudget: (budget: number | undefined) => void;
  maxPassengers: number | undefined;
  setMaxPassengers: (maxPassengers: number | undefined) => void;
  currentTravelers: number;
}

export const BudgetMaxPassengersInput = ({
  budget,
  setBudget,
  maxPassengers,
  setMaxPassengers,
  currentTravelers,
}: BudgetMaxPassengersInputProps) => {
  const handleBudgetChange = (value: string) => {
    if (value === "") {
      setBudget(undefined);
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        setBudget(numValue);
      }
    }
  };

  const handleMaxPassengersChange = (value: string) => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pt-4">
      {/* Budget Input */}
      <div className="space-y-3">
        <Label htmlFor="budget" className="flex items-center gap-2 text-sm font-medium">
          <IndianRupee className="w-4 h-4" />
          Budget (Optional)
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            ₹
          </span>
          <Input
            id="budget"
            type="number"
            min="0"
            step="1000"
            value={budget || ""}
            onChange={(e) => handleBudgetChange(e.target.value)}
            placeholder="Enter your budget in INR"
            className="pl-8 h-12"
          />
        </div>
      </div>

      {/* Max Passengers Input */}
      <div className="space-y-3">
        <Label htmlFor="max-passengers" className="flex items-center gap-2 text-sm font-medium">
          <Users className="w-4 h-4" />
          Maximum Passengers (Optional)
        </Label>
        <div className="space-y-2">
          <Input
            id="max-passengers"
            type="number"
            min={minPassengers}
            placeholder="Leave empty if not sharing"
            value={maxPassengers || ""}
            onChange={(e) => handleMaxPassengersChange(e.target.value)}
            className="h-12"
          />
        </div>
      </div>
    </div>
  );
};
