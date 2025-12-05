import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, Bookmark, UserPlus } from "lucide-react";
import { TripDB } from "@/constants";
import { TripsList } from "./TripsList";

interface TripTabsProps {
  historyTrips: TripDB[];
  savedTrips: TripDB[];
  joinedTrips: TripDB[];
  searchQuery: string;
  filterAndSortTrips: (tripList: TripDB[]) => TripDB[];
  onTripLeft?: () => void;
  onEmergencyNumberSet?: () => void;
}

export const TripTabs = ({
  historyTrips,
  savedTrips,
  joinedTrips,
  searchQuery,
  filterAndSortTrips,
  onTripLeft,
  onEmergencyNumberSet,
}: TripTabsProps) => {
  return (
    <Tabs defaultValue="history" className="w-full">
      <TabsList className="inline-flex h-auto items-center justify-center gap-2 sm:gap-4 md:gap-8 rounded-none bg-transparent border-b border-gray-200 w-full p-2 sm:p-4">
        <TabsTrigger
          value="history"
          className="rounded-none border-b-2 px-0 pb-2 sm:pb-3 pt-0 font-medium text-gray-600 shadow-none transition-none data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-blue-600 text-sm sm:text-base md:text-lg gap-1 sm:gap-2"
        >
          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="whitespace-nowrap">Trip History</span>
          {historyTrips.length > 0 && (
            <Badge variant="secondary" className="ml-0.5 sm:ml-1 bg-blue-100 text-blue-600 text-xs px-1.5 py-0">
              {historyTrips.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="saved"
          className="rounded-none border-b-2 px-0 pb-2 sm:pb-3 pt-0 font-medium text-gray-600 shadow-none transition-none data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-blue-600 text-sm sm:text-base md:text-lg gap-1 sm:gap-2"
        >
          <Bookmark className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="whitespace-nowrap">Saved Trips</span>
          {savedTrips.length > 0 && (
            <Badge variant="secondary" className="ml-0.5 sm:ml-1 bg-green-100 text-green-600 text-xs px-1.5 py-0">
              {savedTrips.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="joined"
          className="rounded-none border-b-2 px-0 pb-2 sm:pb-3 pt-0 font-medium text-gray-600 shadow-none transition-none data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-blue-600 text-sm sm:text-base md:text-lg gap-1 sm:gap-2"
        >
          <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="whitespace-nowrap">Joined Trips</span>
          <div className="flex gap-1 ml-0.5 sm:ml-1">
            {joinedTrips.length > 0 && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-600 text-xs px-1.5 py-0">
                {joinedTrips.length}
              </Badge>
            )}
            {joinedTrips.filter((trip: TripDB) => !trip.emergency_contact_number).length > 0 && (
              <Badge variant="destructive" className="bg-red-500 text-white text-xs px-1.5 py-0">
                {joinedTrips.filter((trip: TripDB) => !trip.emergency_contact_number).length}
              </Badge>
            )}
          </div>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="history" className="mt-4 sm:mt-6">
        <div className="mb-3 sm:mb-4">
          <p className="text-xs sm:text-sm text-gray-600">
            Auto-saved trips from your planning sessions
          </p>
        </div>
        <TripsList
          trips={historyTrips}
          searchQuery={searchQuery}
          filterAndSortTrips={filterAndSortTrips}
        />
      </TabsContent>

      <TabsContent value="saved" className="mt-4 sm:mt-6">
        <div className="mb-3 sm:mb-4">
          <p className="text-xs sm:text-sm text-gray-600">
            Trips you've bookmarked for future reference
          </p>
        </div>
        <TripsList
          trips={savedTrips}
          searchQuery={searchQuery}
          filterAndSortTrips={filterAndSortTrips}
        />
      </TabsContent>

      <TabsContent value="joined" className="mt-4 sm:mt-6">
        <div className="mb-3 sm:mb-4">
          <p className="text-xs sm:text-sm text-gray-600">
            Trips you've joined from other travelers
          </p>
        </div>
        <TripsList
          trips={joinedTrips}
          searchQuery={searchQuery}
          filterAndSortTrips={filterAndSortTrips}
          onTripLeft={onTripLeft}
          onEmergencyNumberSet={onEmergencyNumberSet}
        />
      </TabsContent>
    </Tabs>
  );
};
