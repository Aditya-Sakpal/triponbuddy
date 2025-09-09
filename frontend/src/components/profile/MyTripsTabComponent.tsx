import { useState, useMemo } from "react";
import { useUser } from "@clerk/clerk-react";
import { useTrips } from "@/hooks/api-hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Calendar, MapPin, Clock, Bookmark, BookmarkCheck } from "lucide-react";
import { TripDB } from "@/lib/types";
import { useNavigate } from "react-router-dom";
import { TripCardActions } from "@/components/trip/TripCardActions";

type SortOption = "date-newest" | "date-oldest" | "name-asc" | "name-desc";

export const MyTripsTabComponent = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date-newest");
  
  const { data: tripsData, isLoading } = useTrips({
    user_id: user?.id || "",
    page: 1,
    limit: 100, // Get all trips for client-side filtering
  });

  const trips = useMemo(() => tripsData?.trips || [], [tripsData?.trips]);

  // Separate saved and unsaved trips
  const savedTrips = useMemo(() => 
    trips.filter(trip => trip.is_saved), [trips]
  );
  
  const historyTrips = useMemo(() => 
    trips.filter(trip => !trip.is_saved), [trips]
  );

  // Filter and sort function
  const filterAndSortTrips = (tripList: TripDB[]) => {
    let filtered = tripList;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(trip => 
        trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.destination.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort trips
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "date-oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "name-asc":
          return a.title.localeCompare(b.title);
        case "name-desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
  };

  const handlePlanNewTrip = () => {
    navigate("/");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const TripCard = ({ trip }: { trip: TripDB }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-800 mb-1">{trip.title}</h3>
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{trip.destination}</span>
            </div>
          </div>
          {trip.is_saved && (
            <BookmarkCheck className="h-5 w-5 text-blue-600" />
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(trip.start_date)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{trip.duration_days} {trip.duration_days === 1 ? 'day' : 'days'}</span>
          </div>
        </div>

        {trip.start_location && (
          <div className="flex items-center gap-2 text-gray-600 mb-3">
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              From: {trip.start_location}
            </span>
          </div>
        )}

        {trip.tags && trip.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {trip.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {trip.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{trip.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="text-xs text-gray-400 mb-3">
          Created {formatDate(trip.created_at)}
        </div>

        <TripCardActions trip={trip} />
      </CardContent>
    </Card>
  );

  const TripsList = ({ trips: tripList }: { trips: TripDB[] }) => {
    const filteredAndSortedTrips = filterAndSortTrips(tripList);

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

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please sign in to view your trips.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Trips</h2>
          <p className="text-gray-600">Manage and view your travel history</p>
        </div>
        <Button onClick={handlePlanNewTrip} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Plan New Trip
        </Button>
      </div>

      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search trips by name or destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-newest">Date (Newest First)</SelectItem>
            <SelectItem value="date-oldest">Date (Oldest First)</SelectItem>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Trips Tabs */}
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-50 p-1 h-12">
          <TabsTrigger 
            value="history" 
            className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm gap-2"
          >
            <Clock className="h-4 w-4" />
            Trip History
            {historyTrips.length > 0 && (
              <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-600">
                {historyTrips.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="saved" 
            className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm gap-2"
          >
            <Bookmark className="h-4 w-4" />
            Saved Trips
            {savedTrips.length > 0 && (
              <Badge variant="secondary" className="ml-1 bg-green-100 text-green-600">
                {savedTrips.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Auto-saved trips from your planning sessions
            </p>
          </div>
          <TripsList trips={historyTrips} />
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Trips you've bookmarked for future reference
            </p>
          </div>
          <TripsList trips={savedTrips} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
