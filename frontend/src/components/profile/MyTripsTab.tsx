import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useTrips } from "@/hooks/api-hooks";
import { useNavigate } from "react-router-dom";
import { useTripFilters } from "@/hooks/useTripFilters";
import { TripHeader, TripControls, TripTabs, AuthRequiredState, LoadingState } from "./tripsTab";


type SortOption = "date-newest" | "date-oldest" | "name-asc" | "name-desc";

export const MyTripsTab = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date-newest");

  const { data: tripsData, isLoading } = useTrips({
    user_id: user?.id || "",
    page: 1,
    limit: 100, // Get all trips for client-side filtering
  });

  const trips = tripsData?.trips || [];
  const { savedTrips, historyTrips, filterAndSortTrips } = useTripFilters(
    trips,
    searchQuery,
    sortBy
  );

  const handlePlanNewTrip = () => {
    navigate("/");
  };

  if (!user) {
    return <AuthRequiredState />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <TripHeader onPlanNewTrip={handlePlanNewTrip} />

      <TripControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <TripTabs
        historyTrips={historyTrips}
        savedTrips={savedTrips}
        searchQuery={searchQuery}
        filterAndSortTrips={filterAndSortTrips}
      />
    </div>
  );
};
