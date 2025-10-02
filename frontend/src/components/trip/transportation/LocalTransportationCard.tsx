import { Car, Clock, IndianRupee, MapPin, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LocalTransportation } from "@/constants";
import { formatTitleCase } from "@/utils/tripUtils";

const getLocalTransportIcon = (type: string) => {
  const typeLower = type.toLowerCase();
  if (typeLower.includes('taxi') || typeLower.includes('cab')) return Car;
  if (typeLower.includes('rickshaw')) return Car;
  if (typeLower.includes('metro')) return Car;
  if (typeLower.includes('bus')) return Car;
  return Car;
};

export const LocalTransportationCard = ({ localTransport }: { localTransport: LocalTransportation }) => {
  const Icon = getLocalTransportIcon(localTransport.type);

  return (
    <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-border/50 hover:border-white/20 overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-3 bg-bula text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors duration-300">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base leading-tight">{formatTitleCase(localTransport.type)}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-0.5 text-xs text-black">
                <Clock className="w-3 h-3" />
                <span>{localTransport.availability}</span>
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="group-hover:bg-white/10 transition-colors duration-300 text-xs px-2 py-0.5 text-white">
            {localTransport.estimated_cost}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col space-y-3">
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-2">
            <div className="text-xs text-muted-foreground">
              {localTransport.description}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <span>Covers: {localTransport.coverage_area}</span>
            </div>
            {localTransport.booking_info && (
              <div className="flex items-start gap-2 text-xs">
                <Info className="w-3 h-3 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">{localTransport.booking_info}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};