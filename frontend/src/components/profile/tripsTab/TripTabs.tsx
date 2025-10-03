import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, Bookmark } from "lucide-react";
import { TripDB } from "@/constants";
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
      <TabsList className="inline-flex h-auto items-center justify-start gap-8 rounded-none bg-transparent border-b border-gray-200 w-full p-4">
        <TabsTrigger
          value="history"
          className="rounded-none border-b-2 px-0 pb-3 pt-0 font-medium text-gray-600 shadow-none transition-none data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-blue-600 text-lg gap-2"
        >
          <Clock className="h-4 w-4" />
          Trip History
          {historyTrips.length > 0 && (
            <Badge variant="secondary" className="ml-1 bg-blue-100 text-bula">
              {historyTrips.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="saved"
          className="rounded-none border-b-2 px-0 pb-3 pt-0 font-medium text-gray-600 shadow-none transition-none data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-blue-600 text-lg gap-2"
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
