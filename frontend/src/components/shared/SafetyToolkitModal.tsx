/**
 * Safety Toolkit Modal
 * Provides safety features for trip participants
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, AlertTriangle, Phone, Headphones, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SafetyToolkitModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripTitle: string;
  emergencyNumber?: string;
}

export const SafetyToolkitModal = ({
  isOpen,
  onClose,
  tripTitle,
  emergencyNumber,
}: SafetyToolkitModalProps) => {
  const { toast } = useToast();
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const handleShareLocation = () => {
    setActiveAction("location");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
          
          // Copy to clipboard
          navigator.clipboard.writeText(locationUrl);
          
          toast({
            title: "Location Copied",
            description: "Your current location URL has been copied to clipboard",
          });
          setActiveAction(null);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Unable to get your current location. Please check your permissions.",
            variant: "destructive",
          });
          setActiveAction(null);
        }
      );
    } else {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      setActiveAction(null);
    }
  };

  const handleReportIssue = () => {
    setActiveAction("report");
    toast({
      title: "Report Issue",
      description: "This feature will allow you to report issues during your trip. Implementation coming soon.",
    });
    setActiveAction(null);
  };

  const handleCallEmergencyContact = () => {
    if (emergencyNumber) {
      window.location.href = `tel:${emergencyNumber}`;
    } else {
      toast({
        title: "No Emergency Contact",
        description: "Please set up an emergency contact number first",
        variant: "destructive",
      });
    }
  };

  const handleCallHelpline = () => {
    window.location.href = "tel:112";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Safety Toolkit
          </DialogTitle>
          <DialogDescription>
            Safety tools for {tripTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {/* Share Current Location */}
          <Button
            variant="outline"
            className="w-full justify-start h-auto py-4 px-4"
            onClick={handleShareLocation}
            disabled={activeAction === "location"}
          >
            <MapPin className="h-5 w-5 mr-3 text-blue-600" />
            <div className="text-left flex-1">
              <div className="font-semibold">Share Current Location</div>
              <div className="text-xs text-muted-foreground">
                Copy your location link to share with others
              </div>
            </div>
          </Button>

          {/* Report an Issue */}
          <Button
            variant="outline"
            className="w-full justify-start h-auto py-4 px-4"
            onClick={handleReportIssue}
            disabled={activeAction === "report"}
          >
            <AlertTriangle className="h-5 w-5 mr-3 text-orange-600" />
            <div className="text-left flex-1">
              <div className="font-semibold">Report an Issue</div>
              <div className="text-xs text-muted-foreground">
                Report safety concerns or problems
              </div>
            </div>
          </Button>

          {/* Call Emergency Number */}
          <Button
            variant="outline"
            className="w-full justify-start h-auto py-4 px-4"
            onClick={handleCallEmergencyContact}
          >
            <Phone className="h-5 w-5 mr-3 text-green-600" />
            <div className="text-left flex-1">
              <div className="font-semibold">Call Emergency Contact</div>
              <div className="text-xs text-muted-foreground">
                {emergencyNumber ? `Call ${emergencyNumber}` : "No emergency contact set"}
              </div>
            </div>
          </Button>

          {/* Call Helpline */}
          <Button
            variant="outline"
            className="w-full justify-start h-auto py-4 px-4"
            onClick={handleCallHelpline}
          >
            <Headphones className="h-5 w-5 mr-3 text-red-600" />
            <div className="text-left flex-1">
              <div className="font-semibold">Call Helpline (112)</div>
              <div className="text-xs text-muted-foreground">
                Emergency services hotline
              </div>
            </div>
          </Button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-xs text-amber-900">
          <p className="font-semibold mb-1">Safety First</p>
          <p>
            In case of any emergency, always prioritize your safety and contact local authorities immediately.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
