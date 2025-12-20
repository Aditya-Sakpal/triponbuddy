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
      
      // Hide browser-only elements before capture
      const pdfHideElements = element.querySelectorAll('.pdf-hide');
      pdfHideElements.forEach(el => (el as HTMLElement).style.display = 'none');
      
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

      // Page dimensions
      const margin = 10;
      const pageWidth = 210;
      const pageHeight = 297;
      
      // URLs for links
      const tripUrl = getTripUrl();
      const contactUrl = getContactUrl();
      
      // Add header with trip info and clickable links at the top of each page
      const addHeader = () => {
        let yPos = margin;
        
        // Trip title
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(trip.title, margin, yPos + 5);
        yPos += 10;
        
        // Destination and duration
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text(` ${trip.destination}  •   ${trip.duration_days} ${trip.duration_days === 1 ? 'day' : 'days'}`, margin, yPos + 5);
        yPos += 8;
        
        // Clickable links
        pdf.setTextColor(37, 99, 235); // Blue color
        pdf.textWithLink('View in Browser', margin, yPos + 5, { url: tripUrl });
        pdf.textWithLink('Talk to Us', margin + 45, yPos + 5, { url: contactUrl });
        yPos += 10;
        
        // Separator line
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        
        return yPos + 5; // Return the Y position where content should start
      };
      
      const headerHeight = 35; // Height reserved for header
      const contentWidth = pageWidth - (margin * 2);
      const contentAreaHeight = pageHeight - margin - headerHeight - margin; // Available height for image per page
      const imgHeight = (canvas.height * contentWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      
      // First page
      const contentStartY = addHeader();
      pdf.addImage(imgData, 'JPEG', margin, contentStartY, contentWidth, imgHeight);
      heightLeft -= contentAreaHeight;

      // Additional pages
      while (heightLeft > 0) {
        pdf.addPage();
        const headerY = addHeader();
        // Calculate the offset to show the next portion of the image
        const yOffset = headerY - (imgHeight - heightLeft);
        pdf.addImage(imgData, 'JPEG', margin, yOffset, contentWidth, imgHeight);
        heightLeft -= contentAreaHeight;
      }

      pdf.save(`${trip.title.replace(/\s+/g, '_')}_Itinerary.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  }, [trip, getTripUrl, getContactUrl]);

  if (!trip || !itinerary) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto mt-12">
        <div ref={contentRef} className="p-4">
          <DialogHeader className="border-b border-bula text-bula pb-4 pdf-hide">
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
