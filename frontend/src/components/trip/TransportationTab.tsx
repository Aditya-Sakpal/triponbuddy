import { ExternalLink, Plane, Car, Train, MapPin, Clock, IndianRupee } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Transportation } from "@/lib/types";

interface TransportationTabProps {
  transportation: Transportation[];
}

const getTransportIcon = (type: string) => {
  const typeLower = type.toLowerCase();
  if (typeLower.includes('flight') || typeLower.includes('air')) return Plane;
  if (typeLower.includes('car') || typeLower.includes('taxi') || typeLower.includes('uber')) return Car;
  if (typeLower.includes('train') || typeLower.includes('rail')) return Train;
  return Car; // Default to car
};

const TransportationCard = ({ transport }: { transport: Transportation }) => {
  const Icon = getTransportIcon(transport.type);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{transport.type}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                {transport.from} → {transport.to}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline">{transport.duration}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>Duration: {transport.duration}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <IndianRupee className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-green-600">{transport.estimated_cost}</span>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button asChild>
              <a 
                href={transport.booking_url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Book Transportation
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{transport.from}</span>
            <div className="flex-1 border-t border-dashed border-muted-foreground/30 mx-4 relative">
              <Icon className="w-4 h-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background text-muted-foreground" />
            </div>
            <span className="font-medium">{transport.to}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const TransportationTab = ({ transportation }: TransportationTabProps) => {
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

      <div className="grid grid-cols-1 gap-6">
        {transportation.map((transport, index) => (
          <TransportationCard key={index} transport={transport} />
        ))}
      </div>

      {transportation.length === 0 && (
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
