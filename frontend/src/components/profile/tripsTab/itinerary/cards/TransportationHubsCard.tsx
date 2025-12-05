import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car } from "lucide-react";
import { TransportationHub } from "@/constants";
import { formatCurrency } from "../utils/formatters";

interface TransportationHubsCardProps {
  hubs: TransportationHub[];
  title: string;
}

interface TransportationHubItemProps {
  hub: TransportationHub;
}

const TransportationHubItem = ({ hub }: TransportationHubItemProps) => {
  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-start justify-between">
        <div>
          <h5 className="font-medium">{hub.name}</h5>
          <p className="text-sm text-muted-foreground">{hub.type} • {hub.location}</p>
          {hub.distance_from_city && (
            <p className="text-sm text-muted-foreground">
              {hub.distance_from_city} from city center
            </p>
          )}
        </div>
        {hub.estimated_cost_to_reach && (
          <div className="text-right">
            <p className="font-medium text-green-600">
              {formatCurrency(hub.estimated_cost_to_reach)}
            </p>
            <p className="text-xs text-muted-foreground">to reach</p>
          </div>
        )}
      </div>
      {hub.transportation_options && hub.transportation_options.length > 0 && (
        <div className="mt-2">
          <p className="text-sm font-medium mb-1">Available Options:</p>
          <div className="flex flex-wrap gap-1">
            {hub.transportation_options.map((option, optionIndex) => (
              <Badge key={optionIndex} variant="outline" className="text-xs">
                {option}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const TransportationHubsCard = ({ hubs, title }: TransportationHubsCardProps) => {
  if (!hubs || hubs.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {hubs.map((hub: TransportationHub, index: number) => (
            <TransportationHubItem key={index} hub={hub} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
