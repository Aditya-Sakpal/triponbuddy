import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar, Clock } from "lucide-react";

interface DateDurationInputsProps {
  startDate: string;
  setStartDate: (value: string) => void;
  durationDays: number;
  setDurationDays: (value: number) => void;
}

export const DateDurationInputs = ({
  startDate,
  setStartDate,
  durationDays,
  setDurationDays,
}: DateDurationInputsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="space-y-3">
        <Label htmlFor="start-date" className="text-sm font-medium">
          Start Date <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none z-10" />
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="pl-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            style={{
              colorScheme: 'light dark'
            }}
            required
            min={new Date().toISOString().split('T')[0]}
            onFocus={(e) => {
              // Show the calendar picker on focus
              e.target.showPicker?.();
            }}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Number of Days <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="number"
            min="1"
            max="30"
            value={durationDays || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "") {
                setDurationDays(0); // Allow empty field
              } else {
                const numValue = parseInt(value);
                if (!isNaN(numValue) && numValue >= 1 && numValue <= 30) {
                  setDurationDays(numValue);
                }
              }
            }}
            placeholder="How long is your trip?"
            className="pl-10"
            required
          />
        </div>
      </div>
    </div>
  );
};
