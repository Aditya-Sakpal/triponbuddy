import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Mountain, Building, Umbrella, Music, ShoppingBag, Utensils, Info } from "lucide-react";

interface TravelPreferencesProps {
  selectedPreferences: string[];
  onToggle: (label: string) => void;
}

export const TravelPreferences = ({
  selectedPreferences,
  onToggle,
}: TravelPreferencesProps) => {
  const preferenceOptions = [
    { icon: Mountain, label: "Adventure" },
    { icon: Building, label: "Culture" },
    { icon: Umbrella, label: "Relaxation" },
    { icon: Music, label: "Classical" },
    { icon: ShoppingBag, label: "Shopping" },
    { icon: Utensils, label: "Food" },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Label className="text-sm font-medium">
          Travel Preferences
        </Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-4 h-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Select interests to personalize your trip recommendations</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {preferenceOptions.map((pref, index) => {
          const Icon = pref.icon;
          const isSelected = selectedPreferences.includes(pref.label);
          return (
            <button
              key={index}
              onClick={() => onToggle(pref.label)}
              className={`flex flex-col items-center space-y-2 p-4 rounded-lg border transition-all ${
                isSelected
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-background border-border hover:border-primary/50'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm font-medium">{pref.label}</span>
            </button>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        {selectedPreferences.length} selected
      </p>
    </div>
  );
};
