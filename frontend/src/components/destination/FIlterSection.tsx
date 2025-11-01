import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { locations, seasons } from "@/content/destinationContent";
import { useState } from "react";

interface FilterSectionProps {
  selectedLocation: string;
  setSelectedLocation: (value: string) => void;
  selectedSeason: string;
  setSelectedSeason: (value: string) => void;
  isWorldwide: boolean;
  setIsWorldwide: (value: boolean) => void;
}

export const FilterSection = ({
  selectedLocation,
  setSelectedLocation,
  selectedSeason,
  setSelectedSeason,
  isWorldwide,
  setIsWorldwide
}: FilterSectionProps) => {
  const [open, setOpen] = useState(false);
    
  return (
    <section className="relative -mt-16 z-20">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-6 shadow-lg bg-white rounded-lg">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
              <div className="space-y-2 w-full md:flex-1 md:max-w-xs">
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      <span className="truncate">
                        {selectedLocation
                          ? locations.find((location) => location.toLowerCase().replace(/\s+/g, '-') === selectedLocation)
                          : "All Locations"}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-full p-0" 
                    align="start" 
                    side="bottom" 
                    sideOffset={4}
                    avoidCollisions={false}
                  >
                    <Command>
                      <CommandInput placeholder="Search locations..." />
                      <CommandList>
                        <CommandEmpty>No location found.</CommandEmpty>
                        <CommandGroup>
                          {locations.filter((location) => location !== "All Locations").map((location) => (
                            <CommandItem
                              key={location}
                              value={location}
                              onSelect={(currentValue) => {
                                const normalizedValue = currentValue.toLowerCase().replace(/\s+/g, '-');
                                setSelectedLocation(normalizedValue === selectedLocation ? "" : normalizedValue);
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedLocation === location.toLowerCase().replace(/\s+/g, '-') ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {location}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2 w-full md:flex-1 md:max-w-xs">
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

              <div className="flex items-center justify-center w-full md:w-auto">
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