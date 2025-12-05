import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, ExternalLink } from "lucide-react";
import { TravelRoute } from "@/constants";
import { formatTitleCase } from "@/utils/tripUtils";
import { formatCurrency } from "../utils/formatters";

interface TransportationCardProps {
  routes: TravelRoute[];
}

interface TransportationRouteItemProps {
  route: TravelRoute;
}

const TransportationRouteItem = ({ route }: TransportationRouteItemProps) => {
  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-start justify-between">
        <div>
          <h5 className="font-medium">{formatTitleCase(route.type)}</h5>
          {route.from && route.to && (
            <p className="text-sm text-muted-foreground">{route.from} → {route.to}</p>
          )}
          {route.duration && (
            <Badge variant="outline" className="mt-1">
              {route.duration}
            </Badge>
          )}
        </div>
        {route.estimated_cost && (
          <div className="text-right">
            <p className="font-medium text-green-600">
              {formatCurrency(route.estimated_cost)}
            </p>
          </div>
        )}
      </div>
      {route.booking_url && (
        <Button size="sm" className="mt-2" asChild>
          <a href={route.booking_url} target="_blank" rel="noopener noreferrer">
            Book Now
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </Button>
      )}
    </div>
  );
};

export const TransportationCard = ({ routes }: TransportationCardProps) => {
  if (!routes || routes.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Transportation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {routes.map((route: TravelRoute, index: number) => (
            <TransportationRouteItem key={index} route={route} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
