import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ItineraryHeaderProps {
  destination: string;
  durationDays: number;
}

export const ItineraryHeader = ({ destination, durationDays }: ItineraryHeaderProps) => {
  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle>Your Complete Itinerary</CardTitle>
        <CardDescription>
          A detailed day-by-day breakdown of your {durationDays}-day trip to {destination}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};
