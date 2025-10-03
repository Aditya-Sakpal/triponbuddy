import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TripHeaderProps {
  onPlanNewTrip: () => void;
}

export const TripHeader = ({ onPlanNewTrip }: TripHeaderProps) => {
  return (
    <div className="flex flex-col text-center md:text-left sm:flex-row gap-4 md:items-start items-center justify-between">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">My Trips</h2>
        <p className="text-gray-600">Manage and view your travel history</p>
      </div>
      <Button onClick={onPlanNewTrip} className="gap-2 bg-bula hover:bg-bula">
        <Plus className="h-4 w-4" />
        Plan New Trip
      </Button>
    </div>
  );
};
