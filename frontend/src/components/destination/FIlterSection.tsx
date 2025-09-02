import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { destinationsByState, indianStates, locations, seasons } from "@/content/destinationContent";



export const FilterSection = () => {
    const [selectedLocation, setSelectedLocation] = useState("all");
    const [selectedSeason, setSelectedSeason] = useState("all");
      const [isWorldwide, setIsWorldwide] = useState(false);
    
  return (
    <section className="relative -mt-16 px-6 z-20">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-6 shadow-lg bg-white rounded-lg">
            <div className="flex flex-col md:flex-row gap-6 items-end justify-center">
              <div className="space-y-2 flex-1 max-w-xs">
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location.toLowerCase().replace(/\s+/g, '-')}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex-1 max-w-xs">
                <label className="text-sm font-medium text-muted-foreground">Season</label>
                <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Seasons" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map((season) => (
                      <SelectItem key={season} value={season.toLowerCase().replace(/\s+/g, '-')}>
                        {season}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-center">
                <div className="flex flex-col items-center space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Worldwide</label>
                  <Switch
                    id="worldwide"
                    checked={isWorldwide}
                    onCheckedChange={setIsWorldwide}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
  );
};