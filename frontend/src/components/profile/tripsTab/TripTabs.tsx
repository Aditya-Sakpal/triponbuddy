import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, Bookmark } from "lucide-react";
import { TripDB } from "@/lib/types";
import { TripsList } from "./TripsList";

interface TripTabsProps {
  historyTrips: TripDB[];
  savedTrips: TripDB[];
  searchQuery: string;
  filterAndSortTrips: (tripList: TripDB[]) => TripDB[];
}

export const TripTabs = ({
  historyTrips,
  savedTrips,
  searchQuery,
  filterAndSortTrips,
}: TripTabsProps) => {
  return (
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
        <TripsList
          trips={historyTrips}
          searchQuery={searchQuery}
          filterAndSortTrips={filterAndSortTrips}
        />
      </TabsContent>

      <TabsContent value="saved" className="mt-6">
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Trips you've bookmarked for future reference
          </p>
        </div>
        <TripsList
          trips={savedTrips}
          searchQuery={searchQuery}
          filterAndSortTrips={filterAndSortTrips}
        />
      </TabsContent>
    </Tabs>
  );
};
