import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, Clock, Mountain, Building, Umbrella, Music, ShoppingBag, Utensils } from "lucide-react";
import { useState } from "react";

const TripPlanningSection = () => {
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(['Relaxation']);

  const preferences = [
    { icon: Mountain, label: "Adventure" },
    { icon: Building, label: "Culture" },
    { icon: Umbrella, label: "Relaxation" },
    { icon: Music, label: "Classical" },
    { icon: ShoppingBag, label: "Shopping" },
    { icon: Utensils, label: "Food" },
  ];

  const handleToggle = (label: string) => {
    if (selectedPreferences.includes(label)) {
      setSelectedPreferences(selectedPreferences.filter(p => p !== label));
    } else if (selectedPreferences.length < 3) {
      setSelectedPreferences([...selectedPreferences, label]);
    }
  };

  return (
    <div className="relative px-6">
      <div className="max-w-6xl mx-auto">
        <Card className="rounded-2xl shadow-xl border-0 bg-white">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-4xl font-bold font-latin text-foreground">
              Start Planning Your Trip with TripOnBuddy
            </CardTitle>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
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
                  const isSelected = selectedPreferences.includes(pref.label);
                  return (
                    <button
                      key={index}
                      onClick={() => handleToggle(pref.label)}
                      disabled={selectedPreferences.length >= 3 && !isSelected}
                      className={`flex flex-col items-center space-y-2 p-4 rounded-lg border transition-all ${
                        isSelected 
                          ? 'bg-primary/10 border-primary text-primary' 
                          : 'bg-background border-border hover:border-primary/50'
                      } ${selectedPreferences.length >= 3 && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{pref.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {selectedPreferences.length}/3 selected
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 font-latin">
                Plan My Trip
              </Button>
              <Button variant="outline" size="lg" className="px-8 font-latin">
                🎯 DEMO
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TripPlanningSection;