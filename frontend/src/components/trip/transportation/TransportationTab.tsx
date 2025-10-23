import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Transportation, TransportationHub, LocalTransportation } from "@/constants";
import { TransportationCard } from "./TransportationCard";
import { TransportationHubCard } from "./TransportationHubCard";
import { LocalTransportationPanel } from "./LocalTransportationPanel";

interface TransportationTabProps {
  transportation: Transportation;
  transportation_hubs_start: TransportationHub[];
  transportation_hubs_destination: TransportationHub[];
  local_transportation: LocalTransportation[];
}

export const TransportationTab = ({
  transportation,
  transportation_hubs_start,
  transportation_hubs_destination,
  local_transportation
}: TransportationTabProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Transportation</CardTitle>
          <CardDescription>
            Your travel arrangements for getting to and around your destination
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Travel Routes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Travel Routes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {transportation.routes.map((route, index) => (
            <TransportationCard key={index} transport={route} />
          ))}
        </div>
      </div>

      {/* Transportation Hubs Comparison */}
      {(transportation_hubs_start.length > 0 || transportation_hubs_destination.length > 0) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Transportation Hubs</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Starting Location Hubs */}
            <div className="space-y-4">
              <h1 className="text-2xl font-medium text-primary border-b pb-2">Starting Location</h1>
              {transportation_hubs_start.length > 0 ? (
                <div className="space-y-4">
                  {transportation_hubs_start.map((hub, index) => (
                    <TransportationHubCard key={`start-${index}`} hub={hub} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No transportation hubs data available for starting location</p>
                </div>
              )}
            </div>

            {/* Destination Hubs */}
            <div className="space-y-4">
              <h1 className="text-2xl font-medium text-primary border-b pb-2">Destination</h1>
              {transportation_hubs_destination.length > 0 ? (
                <div className="space-y-4">
                  {transportation_hubs_destination.map((hub, index) => (
                    <TransportationHubCard key={`dest-${index}`} hub={hub} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No transportation hubs data available for destination</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Local Transportation */}
      {local_transportation.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Local Transportation at Destination</h3>
          <LocalTransportationPanel localTransportation={local_transportation} />
        </div>
      )}

      {transportation.routes.length === 0 && transportation_hubs_start.length === 0 &&
       transportation_hubs_destination.length === 0 && local_transportation.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">No transportation details available</p>
              <p className="text-sm text-muted-foreground">
                Transportation options will be added to your itinerary
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
