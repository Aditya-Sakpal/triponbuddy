import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Download } from "lucide-react";
import { TripDB, Itinerary } from "@/constants";
import { useMemo, useRef, useCallback } from "react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Import modular card components
import {
  TripOverviewCard,
  DailyItineraryCard,
  AccommodationCard,
  TransportationCard,
  TransportationHubsCard,
  LocalTransportationCard,
  NeighboringPlacesCard,
  TravelTipsCard,
} from './itinerary/cards';

interface ItineraryModalProps {
  trip: TripDB | null;
  open: boolean;
  onClose: () => void;
}

export const ItineraryModal = ({ trip, open, onClose }: ItineraryModalProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const itinerary = useMemo(() => {
    if (!trip?.itinerary_data) return null;
    return trip.itinerary_data as unknown as Itinerary;
  }, [trip?.itinerary_data]);

  const handleDownloadPDF = useCallback(async () => {
    if (!contentRef.current || !trip) return;

    try {
      const element = contentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${trip.title.replace(/\s+/g, '_')}_Itinerary.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  }, [trip]);

  if (!trip || !itinerary) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto mt-12">
        <div ref={contentRef} className="p-1">
          <DialogHeader className="border-b border-bula text-bula pb-4">
            <DialogTitle className="text-2xl font-bold">{trip.title}</DialogTitle>
            <DialogDescription className="text-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {trip.destination}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {trip.duration_days} {trip.duration_days === 1 ? 'day' : 'days'}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDownloadPDF} 
                  className="w-full sm:w-auto"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Trip Overview */}
            <TripOverviewCard trip={trip} itinerary={itinerary} />

            {/* Daily Plans */}
            <DailyItineraryCard dailyPlans={itinerary.daily_plans} />

            {/* Accommodation */}
            <AccommodationCard accommodation={itinerary.accommodation} />

            {/* Transportation */}
            <TransportationCard routes={itinerary.transportation?.routes} />

            {/* Transportation Hubs - Start Location */}
            <TransportationHubsCard 
              hubs={itinerary.transportation_hubs_start} 
              title="Transportation Hubs (Starting Point)" 
            />

            {/* Transportation Hubs - Destination */}
            <TransportationHubsCard 
              hubs={itinerary.transportation_hubs_destination} 
              title="Transportation Hubs (Destination)" 
            />

            {/* Local Transportation */}
            <LocalTransportationCard localTransportation={itinerary.local_transportation} />

            {/* Neighboring Places */}
            <NeighboringPlacesCard places={itinerary.neighboring_places} />

            {/* Travel Tips */}
            <TravelTipsCard tips={itinerary.travel_tips} />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
