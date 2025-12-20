import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Download } from "lucide-react";
import { TripDB, Itinerary } from "@/constants";
import { useMemo, useRef, useCallback, useState, useEffect } from "react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { fetchActivityImages } from "@/components/trip/itinerary/helpers/imageHelpers";
import { useAccommodationImages } from "@/hooks/useAccommodationLogic";

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

interface ImageMap {
  [query: string]: string | undefined;
}

interface ItineraryModalProps {
  trip: TripDB | null;
  open: boolean;
  onClose: () => void;
}

export const ItineraryModal = ({ trip, open, onClose }: ItineraryModalProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [activityImages, setActivityImages] = useState<ImageMap>({});
  const [imagesLoading, setImagesLoading] = useState(false);
  
  const itinerary = useMemo(() => {
    if (!trip?.itinerary_data) return null;
    return trip.itinerary_data as unknown as Itinerary;
  }, [trip?.itinerary_data]);

  // Fetch accommodation images
  const accommodations = useMemo(() => itinerary?.accommodation || [], [itinerary?.accommodation]);
  const { images: accommodationImages } = useAccommodationImages(open ? accommodations : []);

  // Fetch activity images when itinerary is available
  useEffect(() => {
    const loadImages = async () => {
      if (!itinerary) return;
      
      setImagesLoading(true);
      try {
        const images = await fetchActivityImages(itinerary);
        setActivityImages(images);
      } catch (error) {
        console.error("Failed to fetch activity images:", error);
      } finally {
        setImagesLoading(false);
      }
    };

    if (open && itinerary) {
      loadImages();
    }
  }, [itinerary, open]);

  // Get trip URL for "View in Browser" link
  const getTripUrl = useCallback(() => {
    return `${window.location.origin}/trip/${trip?.trip_id}`;
  }, [trip?.trip_id]);

  // Get contact page URL
  const getContactUrl = useCallback(() => {
    return `${window.location.origin}/contact`;
  }, []);

  const handleDownloadPDF = useCallback(async () => {
    if (!contentRef.current || !trip) return;

    try {
      const element = contentRef.current;
      
      // Show PDF-only elements and hide browser-only elements before capture
      const pdfHideElements = element.querySelectorAll('.pdf-hide');
      const pdfShowElements = element.querySelectorAll('.pdf-show');
      
      pdfHideElements.forEach(el => (el as HTMLElement).style.display = 'none');
      // Don't show pdf-show elements in the image - we'll add links as PDF text
      
      // Use lower scale and JPEG for smaller file size
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // Restore visibility after capture
      pdfHideElements.forEach(el => (el as HTMLElement).style.display = '');

      // Use JPEG with compression for smaller file size
      const imgData = canvas.toDataURL('image/jpeg', 0.7);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      // Add padding from all sides (10mm margin)
      const margin = 10;
      const pageWidth = 210;
      const pageHeight = 297;
      
      // Add clickable links as a footer on each page
      const tripUrl = getTripUrl();
      const contactUrl = getContactUrl();
      
      const addFooterLinks = () => {
        const footerY = pageHeight - 8;
        pdf.setFontSize(9);
        pdf.setTextColor(37, 99, 235); // Blue color
        
        // View in Browser link
        pdf.textWithLink('View in Browser', margin, footerY, { url: tripUrl });
        
        // Talk to Us link
        pdf.textWithLink('Talk to Us', margin + 50, footerY, { url: contactUrl });
        
        // Reset text color
        pdf.setTextColor(0, 0, 0);
      };
      
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2) - 15; // Leave space for footer
      const imgHeight = (canvas.height * contentWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeight);
      addFooterLinks();
      
      heightLeft -= contentHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeight);
        addFooterLinks();
        heightLeft -= contentHeight;
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
        <div ref={contentRef} className="p-4">
          <DialogHeader className="border-b border-bula text-bula pb-4">
            <DialogTitle className="text-2xl font-bold">{trip.title}</DialogTitle>
            <div className="text-lg text-muted-foreground">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {trip.destination}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {trip.duration_days} {trip.duration_days === 1 ? 'day' : 'days'}
                  </span>
                </div>
                
                {/* Download PDF Button - Hidden in PDF */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDownloadPDF} 
                  className="w-full sm:w-auto pdf-hide"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Trip Overview */}
            <TripOverviewCard trip={trip} itinerary={itinerary} />

            {/* Daily Plans */}
            <DailyItineraryCard dailyPlans={itinerary.daily_plans} activityImages={activityImages} />

            {/* Accommodation */}
            <AccommodationCard accommodation={itinerary.accommodation} accommodationImages={accommodationImages} />

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
