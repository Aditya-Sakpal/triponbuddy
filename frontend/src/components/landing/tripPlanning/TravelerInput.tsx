import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Users, Plus, Trash2 } from "lucide-react";
import type { Traveler } from "@/constants";

interface TravelerInputProps {
  travelers: Traveler[];
  setTravelers: (travelers: Traveler[]) => void;
}

export const TravelerInput = ({ travelers, setTravelers }: TravelerInputProps) => {
  const addTraveler = () => {
    setTravelers([...travelers, { age: 25, gender: 'male' }]);
  };

  const removeTraveler = (index: number) => {
    setTravelers(travelers.filter((_, i) => i !== index));
  };

  const updateTraveler = (index: number, field: keyof Traveler, value: number | string) => {
    const newTravelers = [...travelers];
    if (field === 'age') {
      newTravelers[index].age = Number(value);
    } else {
      newTravelers[index].gender = String(value);
    }
    setTravelers(newTravelers);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Users className="w-5 h-5" />
          Travelers ({travelers.length})
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addTraveler}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Traveler
        </Button>
      </div>

      <div className="space-y-3">
        {travelers.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No travelers added yet. Click "Add Traveler" to get started.
          </p>
        )}
        
        {travelers.map((traveler, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor={`age-${index}`} className="text-sm">
                    Age
                  </Label>
                  <Input
                    id={`age-${index}`}
                    type="number"
                    min="1"
                    max="120"
                    value={traveler.age}
                    onChange={(e) => updateTraveler(index, 'age', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`gender-${index}`} className="text-sm">
                    Gender
                  </Label>
                  <Select
                    value={traveler.gender}
                    onValueChange={(value) => updateTraveler(index, 'gender', value)}
                  >
                    <SelectTrigger id={`gender-${index}`} className="w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeTraveler(index)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
