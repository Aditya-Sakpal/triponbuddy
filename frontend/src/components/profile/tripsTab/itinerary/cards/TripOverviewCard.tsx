import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { TripDB, Itinerary } from "@/constants";
import { formatDate } from "../utils/formatters";

// Helper function to convert simple markdown to HTML
const parseMarkdown = (text: string): string => {
  return text
    .replace(/^### (.*?)$/gm, '<h3 class="font-bold text-lg mb-2">$1</h3>') // H3
    .replace(/^## (.*?)$/gm, '<h2 class="font-bold text-xl mb-2">$1</h2>') // H2
    .replace(/^# (.*?)$/gm, '<h1 class="font-bold text-2xl mb-2">$1</h1>') // H1
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
    .replace(/\n/g, '<br />'); // Line breaks
};

interface TripOverviewCardProps {
  trip: TripDB;
  itinerary: Itinerary;
  summary?: string;
  loading?: boolean;
}

export const TripOverviewCard = ({ trip, itinerary, summary = "", loading = false }: TripOverviewCardProps) => {

  // Format dates for display
  const formatDateRange = () => {
    if (trip.start_date && trip.end_date) {
      return `${formatDate(trip.start_date)} - ${formatDate(trip.end_date)}`;
    }
    return formatDate(trip.start_date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Trip Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Summary */}
        <div className="space-y-2">
          {loading ? (
            <p className="text-muted-foreground italic">Generating summary...</p>
          ) : (
            <p 
              className="text-base leading-relaxed" 
              dangerouslySetInnerHTML={{ __html: parseMarkdown(summary) }}
            />
          )}
        </div>

        {/* Trip Details Table */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Trip Details</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-3 font-medium bg-muted/50 w-1/3">Dates</td>
                  <td className="px-4 py-3">{formatDateRange()}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-3 font-medium bg-muted/50">Duration</td>
                  <td className="px-4 py-3">{trip.duration_days} {trip.duration_days === 1 ? 'day' : 'days'}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-3 font-medium bg-muted/50">Destinations</td>
                  <td className="px-4 py-3">{trip.destination}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-3 font-medium bg-muted/50">Budget</td>
                  <td className="px-4 py-3 capitalize">{trip.budget || 'Moderate'}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium bg-muted/50">Pace</td>
                  <td className="px-4 py-3 capitalize">Moderate</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Info */}
        {trip.start_location && (
          <div className="pt-2">
            <p className="text-sm font-medium text-muted-foreground">Starting From</p>
            <p className="text-base">{trip.start_location}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
