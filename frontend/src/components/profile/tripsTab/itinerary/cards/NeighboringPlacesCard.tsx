import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NeighboringPlace } from "@/constants";

interface NeighboringPlacesCardProps {
  places: NeighboringPlace[];
}

interface NeighboringPlaceItemProps {
  place: NeighboringPlace;
}

const NeighboringPlaceItem = ({ place }: NeighboringPlaceItemProps) => {
  return (
    <div className="border rounded-lg p-3">
      <h5 className="font-medium">{place.name}</h5>
      {place.distance && (
        <p className="text-sm text-muted-foreground">
          {place.distance} away
        </p>
      )}
      {place.description && (
        <p className="text-sm text-muted-foreground mt-1">
          {place.description}
        </p>
      )}
    </div>
  );
};

export const NeighboringPlacesCard = ({ places }: NeighboringPlacesCardProps) => {
  if (!places || places.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nearby Attractions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {places.map((place: NeighboringPlace, index: number) => (
            <NeighboringPlaceItem key={index} place={place} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
