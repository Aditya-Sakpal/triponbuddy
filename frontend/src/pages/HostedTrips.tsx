/**
 * Hosted Trips Page
 * A dedicated page for hosting and browsing hosted trips
 */

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { HostedTripsHeroSection, HostTripPanel, HostedTripCard } from "@/components/hostedTrips";
import { TripDB } from "@/constants";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Compass, Globe, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/api-hooks";

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

  // Get user profile for filtering
  const { data: userProfileData } = useUserProfile(user?.id || "");
  const userAge = userProfileData?.profile?.age;
  const userGender = userProfileData?.profile?.gender;

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
          if (!trip.max_passengers || trip.max_passengers <= 0) {
            return false;
          }

          // If user is the owner, always show their trip (bypass all demographic checks)
          if (user && trip.user_id === user.id) {
            return true;
          }

          // If user is logged in and has profile, filter by age/gender preferences
          if (user && userAge && userGender) {
            // Check gender preference
            if (trip.preferred_gender && trip.preferred_gender !== null && trip.preferred_gender !== "") {
              if (trip.preferred_gender !== userGender) {
                return false; // User doesn't match gender preference
              }
            }

            // Check age range
            if (trip.age_range_min !== null && trip.age_range_min !== undefined) {
              if (userAge < trip.age_range_min) {
                return false; // User is too young
              }
            }
            if (trip.age_range_max !== null && trip.age_range_max !== undefined) {
              if (userAge > trip.age_range_max) {
                return false; // User is too old
              }
            }
          }

          return true;
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
  }, [toast, user, userAge, userGender]);

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

  // Separate trips into public and user's trips
  const publicTrips = hostedTrips.filter(trip => trip.user_id !== user?.id);
  const userTrips = hostedTrips.filter(trip => trip.user_id === user?.id);

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
                Hosted Trips
              </h2>
              <p className="text-muted-foreground mt-2">
                Browse and join trips hosted by travelers from around the community
              </p>
            </div>

            <Tabs defaultValue="public" className="w-full">
              <TabsList className="inline-flex h-auto items-center justify-start gap-4 sm:gap-8 rounded-none bg-transparent border-b border-gray-200 w-full p-2 sm:p-4 mb-6">
                <TabsTrigger
                  value="public"
                  className="rounded-none border-b-2 px-0 pb-2 sm:pb-3 pt-0 font-medium text-gray-600 shadow-none transition-none data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-blue-600 text-sm sm:text-base md:text-lg gap-1 sm:gap-2"
                >
                  <Globe className="h-4 w-4" />
                  <span className="whitespace-nowrap">Public Trips</span>
                </TabsTrigger>
                {user && (
                  <TabsTrigger
                    value="yours"
                    className="rounded-none border-b-2 px-0 pb-2 sm:pb-3 pt-0 font-medium text-gray-600 shadow-none transition-none data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-blue-600 text-sm sm:text-base md:text-lg gap-1 sm:gap-2"
                  >
                    <User className="h-4 w-4" />
                    <span className="whitespace-nowrap">Your Hosted Trips</span>
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Public Trips Tab */}
              <TabsContent value="public">
                {/* Loading State */}
                {isLoading && (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && publicTrips.length === 0 && (
                  <div className="text-center py-12">
                    <Compass className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No public trips yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Be the first to host a trip! Select one of your saved trips above and share it with the community.
                    </p>
                  </div>
                )}

                {/* Trips Grid */}
                {!isLoading && publicTrips.length > 0 && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {publicTrips.map((trip) => (
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
              </TabsContent>

              {/* Your Trips Tab */}
              {user && (
                <TabsContent value="yours">
                  {/* Loading State */}
                  {isLoading && (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}

                  {/* Empty State */}
                  {!isLoading && userTrips.length === 0 && (
                    <div className="text-center py-12">
                      <Compass className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">You haven't hosted any trips yet</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Host your first trip using the panel above to share your journey with the community!
                      </p>
                    </div>
                  )}

                  {/* Trips Grid */}
                  {!isLoading && userTrips.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userTrips.map((trip) => (
                        <HostedTripCard
                          key={trip.trip_id}
                          trip={trip}
                          onTripUpdated={handleTripUpdated}
                          showPendingRequests={true}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default HostedTrips;
