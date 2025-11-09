import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { IndianRupee } from "lucide-react";

interface BudgetInputProps {
  budget: number | undefined;
  setBudget: (budget: number | undefined) => void;
}

export const BudgetInput = ({ budget, setBudget }: BudgetInputProps) => {
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

  return (
    <div className="space-y-2">
      <Label htmlFor="budget" className="flex items-center gap-2 text-sm font-medium">
        <IndianRupee className="w-5 h-5" />
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
          value={budget || ''}
          onChange={(e) => handleBudgetChange(e.target.value)}
          placeholder="Enter your budget in INR"
          className="pl-8 h-12"
        />
      </div>

    </div>
  );
};
