import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TravelTipsCardProps {
  tips: string[];
}

export const TravelTipsCard = ({ tips }: TravelTipsCardProps) => {
  if (!tips || tips.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Travel Tips</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {tips.map((tip: string, index: number) => (
            <li key={index} className="flex items-start gap-2">
              <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <span className="text-sm">{tip}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
