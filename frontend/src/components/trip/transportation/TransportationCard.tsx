import { ExternalLink, Plane, Car, Train, Clock, IndianRupee, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TravelRoute } from "@/constants";
import { formatTitleCase } from "@/utils/tripUtils";

const getTransportIcon = (type: string) => {
  const typeLower = type.toLowerCase();
  if (typeLower.includes('flight') || typeLower.includes('air')) return Plane;
  if (typeLower.includes('car') || typeLower.includes('taxi') || typeLower.includes('uber')) return Car;
  if (typeLower.includes('train') || typeLower.includes('rail')) return Train;
  return Car; // Default to car
};

export const TransportationCard = ({ transport }: { transport: TravelRoute }) => {
  const Icon = getTransportIcon(transport.type);

  return (
    <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-border/50 hover:border-white/20 overflow-hidden h-full flex flex-col max-w-5xl ">
      <CardHeader className="pb-3 bg-bula text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors duration-300 ju">
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base leading-tight">{formatTitleCase(transport.type)}</CardTitle>
            </div>
          </div>
          <Badge variant="outline" className="group-hover:bg-white/10 transition-colors duration-300 text-xs px-2 py-0.5 text-white">
            {transport.duration}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col space-y-3">
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2 text-xs">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span>{transport.duration}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <IndianRupee className="w-3 h-3 text-muted-foreground" />
              <span className="font-medium text-green-600">{transport.estimated_cost}</span>
            </div>
            {transport.details && (
              <div className="flex items-start gap-2 text-xs">
                <Info className="w-3 h-3 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">{transport.details}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium max-w-[80px]">{transport.from}</span>
            <div className="flex-1 border-t border-dashed border-muted-foreground/30 mx-2 relative">
              <Icon className="w-3 h-3 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background text-muted-foreground rounded-full p-0.5" />
            </div>
            <span className="font-medium max-w-[80px]">{transport.to}</span>
          </div>
        </div>

        <Button asChild size="sm" className="w-full mt-auto">
          <a
            href={transport.booking_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Book Now
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};