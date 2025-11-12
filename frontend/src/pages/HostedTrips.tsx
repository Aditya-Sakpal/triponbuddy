/**
 * Hosted Trips Page
 * A dedicated page for hosting and browsing hosted trips
 */

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { HostedTripsHeroSection, HostTripPanel, HostedTripCard } from "@/components/hostedTrips";
import { TripDB } from "@/constants";
import { Button } from "@/components/ui/button";
import { Loader2, Compass } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const HostedTrips = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [hostedTrips, setHostedTrips] = useState<TripDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const PAGE_SIZE = 12;

  // Fetch public hosted trips
  const fetchHostedTrips = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/trips/public?page=${pageNum}&limit=${PAGE_SIZE}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch hosted trips");
      }

      const data = await response.json();

      if (data.success) {
        // Filter to only show trips with max_passengers set (hosting trips)
        // Show all public trips regardless of ownership or join status
        const hostingTrips = data.trips.filter((trip: TripDB) => {
          return trip.max_passengers && trip.max_passengers > 0;
        });

        if (append) {
          setHostedTrips((prev) => [...prev, ...hostingTrips]);
        } else {
          setHostedTrips(hostingTrips);
        }

        setHasMore(data.has_next);
      }
    } catch (error) {
      console.error("Error fetching hosted trips:", error);
      toast({
        title: "Error",
        description: "Failed to load hosted trips",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchHostedTrips(1);
  }, [fetchHostedTrips]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchHostedTrips(nextPage, true);
  };

  const handleTripHosted = () => {
    // Refresh the list when a new trip is hosted
    setPage(1);
    fetchHostedTrips(1);
  };

  const handleTripUpdated = () => {
    // Refresh the list when a trip is updated (e.g., someone joined)
    setPage(1);
    fetchHostedTrips(1);
  };

  return (
    <>
      {/* Hero Section */}
      <HostedTripsHeroSection />

      {/* Main Content */}
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto max-w-7xl px-4 space-y-8">
          {/* Host Trip Panel */}
          {user && (
            <div className="max-w-3xl mx-auto">
              <HostTripPanel onTripHosted={handleTripHosted} />
            </div>
          )}

          {/* Hosted Trips Section */}
          <div>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Available Hosted Trips
              </h2>
              <p className="text-muted-foreground mt-2">
                Browse and join trips hosted by travelers from around the community
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {/* Empty State */}
            {!isLoading && hostedTrips.length === 0 && (
              <div className="text-center py-12">
                <Compass className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No hosted trips yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Be the first to host a trip! Select one of your saved trips above and share it with the community.
                </p>
              </div>
            )}

            {/* Trips Grid */}
            {!isLoading && hostedTrips.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hostedTrips.map((trip) => (
                    <HostedTripCard
                      key={trip.trip_id}
                      trip={trip}
                      onTripUpdated={handleTripUpdated}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      variant="outline"
                      size="lg"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Load More"
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HostedTrips;
