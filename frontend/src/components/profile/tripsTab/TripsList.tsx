import { TripDB } from "@/lib/types";
import { TripCard } from "./TripCard";
import { MapPin } from "lucide-react";

interface TripsListProps {
  trips: TripDB[];
  searchQuery: string;
  filterAndSortTrips: (tripList: TripDB[]) => TripDB[];
}

export const TripsList = ({ trips, searchQuery, filterAndSortTrips }: TripsListProps) => {
  const filteredAndSortedTrips = filterAndSortTrips(trips);

  if (filteredAndSortedTrips.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <MapPin className="h-12 w-12 mx-auto mb-2" />
        </div>
        <p className="text-gray-500 text-lg mb-2">No trips found</p>
        <p className="text-gray-400 text-sm">
          {searchQuery ? "Try adjusting your search" : "Start planning your first trip!"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredAndSortedTrips.map((trip) => (
        <TripCard key={trip.trip_id} trip={trip} />
      ))}
    </div>
  );
};
