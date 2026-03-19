import { MapPin, IndianRupee, Navigation, Building } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TransportationHub } from "@/constants";
import { formatTitleCase } from "@/utils/tripUtils";

const sanitizeDistance = (distance: string): string => {
  const match = distance.match(/(\d+(?:\.\d+)?)\s*km/i);
  return match ? `${match[1]} km` : distance;
};

const getHubIcon = (type: string) => {
  const typeLower = type.toLowerCase();
  if (typeLower.includes('airport')) return Building;
  if (typeLower.includes('railway') || typeLower.includes('station')) return Building;
  if (typeLower.includes('bus')) return Building;
  return Building;
};

export const TransportationHubCard = ({ hub }: { hub: TransportationHub }) => {
  const Icon = getHubIcon(hub.type);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-white/20 overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-3 text-black">
        <div className="grid grid-cols-[1fr_auto] items-start gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 bg-white/10 rounded-lg">
              <Icon className="w-5 h-5 text-bula" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base leading-tight">{hub.name}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-0.5 text-xs text-black">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{formatTitleCase(hub.type)}</span>
              </CardDescription>
            </div>
          </div>
          <Badge className="text-xs px-2 py-0.5 text-white text-center justify-self-end whitespace-nowrap shrink-0">
            {sanitizeDistance(hub.distance_from_city)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col space-y-3">
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2 text-xs">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <span>{hub.location}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <IndianRupee className="w-3 h-3 text-muted-foreground" />
              <span className="font-medium text-green-600">{hub.estimated_cost_to_reach}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <Navigation className="w-3 h-3 text-muted-foreground" />
            <span className="font-medium">Available transport:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {hub.transportation_options.map((option, index) => (
              <Badge key={index} className="text-xs">
                {option}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};