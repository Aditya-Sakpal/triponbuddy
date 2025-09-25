import { Lightbulb, Calendar, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TravelTipsTabProps {
  tips: string[];
  bestTimeToVisit?: string;
}

export const TravelTipsTab = ({ tips, bestTimeToVisit }: TravelTipsTabProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Travel Tips & Recommendations</CardTitle>
          <CardDescription>
            Essential information to make your trip smooth and enjoyable
          </CardDescription>
        </CardHeader>
      </Card>

      {bestTimeToVisit && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-bula" />
              Best Time to Visit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{bestTimeToVisit}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            Essential Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tips.length > 0 ? (
            <div className="space-y-4">
              {tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No travel tips available</p>
              <p className="text-sm text-muted-foreground mt-1">
                General travel tips will be added to your itinerary
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional helpful sections */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Before You Go</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Check weather forecast</li>
                <li>• Confirm all bookings</li>
                <li>• Pack appropriate clothing</li>
                <li>• Download offline maps</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">During Your Trip</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Keep important documents safe</li>
                <li>• Stay hydrated</li>
                <li>• Take photos and make memories</li>
                <li>• Try local cuisine</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
