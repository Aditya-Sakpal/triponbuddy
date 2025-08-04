import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MapPin, Calendar, Clock, Mountain, Building, Umbrella, Music, ShoppingBag, Utensils } from "lucide-react";

const TripPlanningSection = () => {
  const preferences = [
    { icon: Mountain, label: "Adventure" },
    { icon: Building, label: "Culture" },
    { icon: Umbrella, label: "Relaxation", selected: true },
    { icon: Music, label: "Classical" },
    { icon: ShoppingBag, label: "Shopping" },
    { icon: Utensils, label: "Food" },
  ];

  return (
    <div className="bg-background py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-foreground">
          Start Planning Your Trip with TripOnBuddy
        </h2>
        
        <div className="bg-card rounded-2xl p-8 shadow-lg border">
          {/* Location Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-3">
              <Label htmlFor="start-location" className="text-sm font-medium">
                Start Location <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  id="start-location"
                  placeholder="Enter your starting point"
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Destination <span className="text-muted-foreground">ⓘ</span></Label>
                <div className="flex items-center space-x-2">
                  <Switch id="worldwide" />
                  <Label htmlFor="worldwide" className="text-sm text-muted-foreground">Worldwide</Label>
                </div>
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-4 h-4" />
                <Input 
                  placeholder="Where do you want to go?"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Date and Duration Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-3">
              <Label htmlFor="start-date" className="text-sm font-medium">
                Start Date <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  id="start-date"
                  type="date"
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium">Number of Days <span className="text-muted-foreground">ⓘ</span></Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="How long is your trip?"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Travel Preferences */}
          <div className="mb-8">
            <Label className="text-sm font-medium mb-4 block">
              Travel Preferences <span className="text-muted-foreground">ⓘ</span>
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {preferences.map((pref, index) => {
                const Icon = pref.icon;
                return (
                  <button
                    key={index}
                    className={`flex flex-col items-center space-y-2 p-4 rounded-lg border transition-all ${
                      pref.selected 
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
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8">
              Plan My Trip
            </Button>
            <Button variant="outline" size="lg" className="px-8">
              🎯 DEMO
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripPlanningSection;