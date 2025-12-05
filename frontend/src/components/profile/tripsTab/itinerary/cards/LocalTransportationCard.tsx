import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car } from "lucide-react";
import { LocalTransportation } from "@/constants";
import { formatTitleCase } from "@/utils/tripUtils";
import { formatCurrency } from "../utils/formatters";

interface LocalTransportationCardProps {
  localTransportation: LocalTransportation[];
}

interface LocalTransportationItemProps {
  local: LocalTransportation;
}

const LocalTransportationItem = ({ local }: LocalTransportationItemProps) => {
  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-start justify-between">
        <div>
          <h5 className="font-medium">{formatTitleCase(local.type)}</h5>
          <p className="text-sm text-muted-foreground">{local.description}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {local.availability}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Covers: {local.coverage_area}
            </span>
          </div>
        </div>
        {local.estimated_cost && (
          <div className="text-right">
            <p className="font-medium text-green-600">
              {formatCurrency(local.estimated_cost)}
            </p>
          </div>
        )}
      </div>
      {local.booking_info && (
        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded text-sm">
          <p className="text-blue-800 dark:text-blue-200">
            {local.booking_info}
          </p>
        </div>
      )}
    </div>
  );
};

export const LocalTransportationCard = ({ localTransportation }: LocalTransportationCardProps) => {
  if (!localTransportation || localTransportation.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Local Transportation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {localTransportation.map((local: LocalTransportation, index: number) => (
            <LocalTransportationItem key={index} local={local} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
