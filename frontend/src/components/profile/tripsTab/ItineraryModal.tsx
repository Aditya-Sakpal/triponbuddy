import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Download } from "lucide-react";
import { TripDB, Itinerary } from "@/constants";
import { useMemo, useRef, useCallback, useState, useEffect } from "react";
import jsPDF from 'jspdf';
import { fetchActivityImages } from "@/components/trip/itinerary/helpers/imageHelpers";
import { useAccommodationImages } from "@/hooks/useAccommodationLogic";
import { API_BASE_URL } from "@/constants/api";

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
  const [tripSummary, setTripSummary] = useState<string>("");
  const [summaryLoading, setSummaryLoading] = useState(true);
  
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

  // Fetch trip summary when trip is available
  useEffect(() => {
    const fetchSummary = async () => {
      if (!trip) return;
      
      setSummaryLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/trips/${trip.trip_id}/summary?user_id=${encodeURIComponent(trip.user_id)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setTripSummary(data.summary || "Experience an unforgettable journey filled with adventure, culture, and memorable moments.");
        } else {
          setTripSummary("Experience an unforgettable journey filled with adventure, culture, and memorable moments.");
        }
      } catch (error) {
        console.error("Failed to fetch trip summary:", error);
        setTripSummary("Experience an unforgettable journey filled with adventure, culture, and memorable moments.");
      } finally {
        setSummaryLoading(false);
      }
    };

    if (open && trip) {
      fetchSummary();
    }
  }, [trip, open]);

  // Get trip URL for "View in Browser" link
  const getTripUrl = useCallback(() => {
    return `${window.location.origin}/trip/${trip?.trip_id}`;
  }, [trip?.trip_id]);

  // Get contact page URL
  const getContactUrl = useCallback(() => {
    return `${window.location.origin}/contact`;
  }, []);

  const handleDownloadPDF = useCallback(async () => {
    if (!trip || !itinerary) return;

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      // Page dimensions
      const margin = 15;
      const pageWidth = 210;
      const pageHeight = 297;
      const contentWidth = pageWidth - (margin * 2);
      let yPos = margin;

      // URLs for links
      const tripUrl = getTripUrl();
      const contactUrl = getContactUrl();

      // Helper to add page headers
      const addHeader = (isFirst: boolean) => {
        if (isFirst) {
          // Large header for first page with blue background
          pdf.setFillColor(37, 99, 235); // Blue background
          pdf.rect(0, 0, pageWidth, yPos + 45, 'F');
          
          pdf.setFontSize(26);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(255, 255, 255); // White text
          pdf.text(`Trip to ${trip.destination}`, pageWidth / 2, yPos + 12, { align: 'center' });
          yPos += 20;
          
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'normal');
          pdf.text('powered by TripOnBuddy', pageWidth / 2, yPos, { align: 'center' });
          yPos += 10;
          
          // Links
          pdf.setFontSize(10);
          const link1 = 'View trip on TripOnBuddy';
          const link2 = 'Talk to us on WhatsApp';
          const link1Width = pdf.getTextWidth(link1);
          const totalWidth = link1Width + 10 + pdf.getTextWidth(link2);
          const startX = (pageWidth - totalWidth) / 2;
          pdf.textWithLink(link1, startX, yPos, { url: tripUrl });
          pdf.textWithLink(link2, startX + link1Width + 10, yPos, { url: contactUrl });
          yPos += 8;
          
          pdf.setTextColor(0, 0, 0); // Reset to black for content
        } else {
          // Small header for subsequent pages with blue background
          pdf.setFillColor(37, 99, 235); // Blue background
          pdf.rect(0, 0, pageWidth, yPos + 18, 'F');
          
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(255, 255, 255); // White text
          pdf.text(`Trip to ${trip.destination}`, margin, yPos + 5);
          
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          pdf.text('powered by TripOnBuddy', margin, yPos + 10);
          
          pdf.textWithLink('View trip', margin + 50, yPos + 10, { url: tripUrl });
          pdf.textWithLink('Talk to us', margin + 80, yPos + 10, { url: contactUrl });
          yPos += 15;
          
          pdf.setTextColor(0, 0, 0); // Reset to black for content
        }
        
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 8;
      };

      const checkPageBreak = (requiredSpace: number) => {
        if (yPos + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
          addHeader(false);
        }
      };

      // Add first page header
      addHeader(true);
      
      // Add padding after first header
      yPos += 5;

      // Helper to add section headers with blue background
      const addSectionHeader = (title: string) => {
        checkPageBreak(15);
        pdf.setFillColor(37, 99, 235); // Blue background
        pdf.rect(margin, yPos - 2, contentWidth, 10, 'F');
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(255, 255, 255); // White text
        pdf.text(title, margin + 3, yPos + 5);
        pdf.setTextColor(0, 0, 0); // Reset to black
        yPos += 12;
      };

      // Trip Overview Section
      addSectionHeader('Trip Overview');

      // Summary (fetch from API or use placeholder)
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      // Strip markdown formatting for PDF
      const cleanSummary = tripSummary
        .replace(/^#{1,3}\s+/gm, '') // Remove markdown headings
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.*?)\*/g, '$1'); // Remove italic
      const summaryLines = pdf.splitTextToSize(cleanSummary, contentWidth);
      pdf.text(summaryLines, margin, yPos);
      yPos += summaryLines.length * 5 + 5;

      checkPageBreak(40);

      // Trip Details Table
      const budgetValue = typeof trip.budget === 'string' ? trip.budget : 'Moderate';
      const tableData = [
        ['Dates', `${new Date(trip.start_date).toLocaleDateString()} - ${trip.end_date ? new Date(trip.end_date).toLocaleDateString() : 'N/A'}`],
        ['Duration', `${trip.duration_days} ${trip.duration_days === 1 ? 'day' : 'days'}`],
        ['Destinations', trip.destination],
        ['Budget', budgetValue.charAt(0).toUpperCase() + budgetValue.slice(1)],
        ['Pace', 'Moderate']
      ];

      pdf.setFillColor(245, 245, 245);
      tableData.forEach((row, index) => {
        checkPageBreak(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, yPos, contentWidth / 3, 8, 'F');
        pdf.text(row[0], margin + 2, yPos + 5);
        
        pdf.setFont('helvetica', 'normal');
        pdf.text(row[1], margin + contentWidth / 3 + 2, yPos + 5);
        
        pdf.setDrawColor(220, 220, 220);
        pdf.line(margin, yPos + 8, pageWidth - margin, yPos + 8);
        yPos += 8;
      });

      yPos += 10;

      // Daily Itinerary
      addSectionHeader('Daily Itinerary');

      // Helper to load and convert image to base64
      const loadImageAsBase64 = async (url: string): Promise<string | null> => {
        try {
          return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
              } else {
                resolve(null);
              }
            };
            img.onerror = () => resolve(null);
            img.src = url;
          });
        } catch (error) {
          console.error('Failed to load image:', error);
          return null;
        }
      };

      for (const day of itinerary.daily_plans) {
        checkPageBreak(30);
        
        // Day header with light blue background
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, yPos - 2, contentWidth, 8, 'F');
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(37, 99, 235);
        pdf.text(`Day ${day.day}`, margin + 3, yPos + 4);
        pdf.setTextColor(0, 0, 0);
        yPos += 10;

        for (const activity of day.activities) {
          const imageHeight = 25;
          const imageWidth = 25;
          checkPageBreak(imageHeight + 10);
          
          // Try to load and add activity image
          const imageUrl = activityImages[activity.image_search_query];
          let imageAdded = false;
          if (imageUrl) {
            try {
              const base64Image = await loadImageAsBase64(imageUrl);
              if (base64Image) {
                pdf.addImage(base64Image, 'JPEG', margin + 5, yPos, imageWidth, imageHeight);
                imageAdded = true;
              }
            } catch (error) {
              console.error('Error adding image to PDF:', error);
            }
          }
          
          // If image failed, show placeholder
          if (!imageAdded && imageUrl) {
            pdf.setFillColor(230, 230, 250);
            pdf.rect(margin + 5, yPos, imageWidth, imageHeight, 'F');
          }
          
          const textX = (imageUrl || imageAdded) ? margin + 5 + imageWidth + 5 : margin + 5;
          const maxTextWidth = (imageUrl || imageAdded) ? contentWidth - imageWidth - 15 : contentWidth - 10;
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text(activity.activity, textX, yPos + 3);
          let currentYPos = yPos + 6;
          
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          
          if (activity.time) {
            pdf.text(`Time: ${activity.time}`, textX, currentYPos);
            currentYPos += 4;
          }
          
          if (activity.location) {
            const locationLines = pdf.splitTextToSize(`Location: ${activity.location}`, maxTextWidth);
            pdf.text(locationLines, textX, currentYPos);
            currentYPos += locationLines.length * 3.5;
          }
          
          if (activity.description) {
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(8);
            const descLines = pdf.splitTextToSize(activity.description, maxTextWidth);
            pdf.text(descLines, textX, currentYPos);
            currentYPos += descLines.length * 3.5;
          }
          
          // Set yPos to the maximum of current text position or image bottom
          yPos = Math.max(currentYPos, yPos + imageHeight + 2);
          pdf.setTextColor(0, 0, 0);
          yPos += 2;
        }
        
        yPos += 3;
      }

      // Accommodation Section
      if (itinerary.accommodation && itinerary.accommodation.length > 0) {
        addSectionHeader('Accommodation');

        for (const acc of itinerary.accommodation) {
          const imageHeight = 25;
          const imageWidth = 25;
          checkPageBreak(imageHeight + 5);
          
          // Try to load and add accommodation image
          const accImageUrl = accommodationImages[acc.location]?.[0];
          let imageAdded = false;
          if (accImageUrl) {
            try {
              const base64Image = await loadImageAsBase64(accImageUrl);
              if (base64Image) {
                pdf.addImage(base64Image, 'JPEG', margin + 5, yPos, imageWidth, imageHeight);
                imageAdded = true;
              }
            } catch (error) {
              console.error('Error adding accommodation image to PDF:', error);
            }
          }
          
          // If image failed, show placeholder
          if (!imageAdded && accImageUrl) {
            pdf.setFillColor(230, 240, 250);
            pdf.rect(margin + 5, yPos, imageWidth, imageHeight, 'F');
          }
          
          const textX = (accImageUrl || imageAdded) ? margin + 5 + imageWidth + 5 : margin + 5;
          const maxTextWidth = (accImageUrl || imageAdded) ? contentWidth - imageWidth - 15 : contentWidth - 10;
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(0, 0, 0);
          pdf.text(acc.name, textX, yPos + 3);
          let currentYPos = yPos + 6;
          
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(100, 100, 100);
          
          if (acc.location) {
            const locLines = pdf.splitTextToSize(`Location: ${acc.location}`, maxTextWidth);
            pdf.text(locLines, textX, currentYPos);
            currentYPos += locLines.length * 3.5;
          }
          
          if (acc.type) {
            pdf.text(`Type: ${acc.type}`, textX, currentYPos);
            currentYPos += 3.5;
          }
          
          if (acc.price_range) {
            pdf.text(`Price: ${acc.price_range}`, textX, currentYPos);
            currentYPos += 3.5;
          }
          
          yPos = Math.max(currentYPos, yPos + imageHeight + 2);
          yPos += 3;
        }
      }

      pdf.save(`trip_${trip.destination.replace(/\s+/g, '_')}_${trip.title.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  }, [trip, itinerary, activityImages, accommodationImages, tripSummary, getTripUrl, getContactUrl]);

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
            <TripOverviewCard trip={trip} itinerary={itinerary} summary={tripSummary} loading={summaryLoading} />

            {/* Daily Plans */}
            <DailyItineraryCard dailyPlans={itinerary.daily_plans} activityImages={activityImages} />

            {/* Accommodation */}
            <AccommodationCard accommodation={itinerary.accommodation} accommodationImages={accommodationImages} />

            {/* Transportation - Hidden in PDF */}
            <div className="pdf-hide">
              <TransportationCard routes={itinerary.transportation?.routes} />
            </div>

            {/* Transportation Hubs - Start Location - Hidden in PDF */}
            <div className="pdf-hide">
              <TransportationHubsCard 
                hubs={itinerary.transportation_hubs_start} 
                title="Transportation Hubs (Starting Point)" 
              />
            </div>

            {/* Transportation Hubs - Destination - Hidden in PDF */}
            <div className="pdf-hide">
              <TransportationHubsCard 
                hubs={itinerary.transportation_hubs_destination} 
                title="Transportation Hubs (Destination)" 
              />
            </div>

            {/* Local Transportation - Hidden in PDF */}
            <div className="pdf-hide">
              <LocalTransportationCard localTransportation={itinerary.local_transportation} />
            </div>

            {/* Neighboring Places - Hidden in PDF */}
            <div className="pdf-hide">
              <NeighboringPlacesCard places={itinerary.neighboring_places} />
            </div>

            {/* Travel Tips - Hidden in PDF */}
            <div className="pdf-hide">
              <TravelTipsCard tips={itinerary.travel_tips} />
            </div>
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
