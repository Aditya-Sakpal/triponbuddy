import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { IndianRupee, Info, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BudgetInputProps {
  budget: number | undefined;
  setBudget: (budget: number | undefined) => void;
  minimumBudget?: number;
  isEstimating?: boolean;
}

export const BudgetInput = ({ budget, setBudget, minimumBudget, isEstimating }: BudgetInputProps) => {
  const handleBudgetChange = (value: string) => {
    if (value === '') {
      setBudget(undefined);
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        setBudget(numValue);
      }
    }
  };

  const isBelowMinimum = budget !== undefined && minimumBudget !== undefined && budget < minimumBudget;

  return (
    <div className="space-y-2 my-4">
      <div className="flex items-center gap-2">
        <Label htmlFor="budget" className="flex items-center gap-2 text-sm font-medium">
          <IndianRupee className="w-5 h-5" />
          Budget/person
        </Label>
        {isEstimating && (
          <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-4 h-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Set your total budget in INR to get cost-appropriate recommendations</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          ₹
        </span>
        <Input
          id="budget"
          type="number"
          min={minimumBudget || 0}
          step="1000"
          value={budget || ''}
          onChange={(e) => handleBudgetChange(e.target.value)}
          placeholder={minimumBudget ? `Minimum: ₹${minimumBudget.toLocaleString('en-IN')}` : "Enter your budget in INR"}
          className={`pl-8 h-12 ${isBelowMinimum ? 'border-destructive' : ''}`}
        />
      </div>
      
      {isBelowMinimum && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Budget should be at least ₹{minimumBudget?.toLocaleString('en-IN')} for this trip
          </AlertDescription>
        </Alert>
      )}
      
      {minimumBudget && !isBelowMinimum && budget !== undefined && (
        <p className="text-xs text-muted-foreground">
          Minimum recommended: ₹{minimumBudget.toLocaleString('en-IN')}
        </p>
      )}
    </div>
  );
};
