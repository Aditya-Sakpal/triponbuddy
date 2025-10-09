import { Label } from "@/components/ui/label";
import { Mountain, Building, Umbrella, Music, ShoppingBag, Utensils } from "lucide-react";

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
      <Label className="text-sm font-medium mb-4 block">
        Travel Preferences <span className="text-muted-foreground">ⓘ</span>
      </Label>
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
