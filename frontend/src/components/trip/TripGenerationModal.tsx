import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MapPin } from "lucide-react";
import { useState, useEffect } from "react";

interface TripGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const loadingMessages = [
  "Crafting your experience...",
  "Finding perfect destinations...",
  "Optimizing your itinerary...",
  "Finalizing your trip...",
  "Adding special touches...",
  "Almost ready for adventure..."
];

export const TripGenerationModal = ({ isOpen, onClose }: TripGenerationModalProps) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setMessageIndex(0);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          {/* Floating Pin Animation */}
          <div className="relative">
            <div className="animate-bounce">
              <MapPin className="w-16 h-16 text-primary drop-shadow-lg" />
            </div>
            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping"></div>
          </div>
          
          {/* Loading Text */}
          <div className="text-center space-y-3">
            <h3 className="text-xl font-semibold text-foreground">
              Planning Your Perfect Trip
            </h3>
            <p 
              key={messageIndex}
              className="text-muted-foreground animate-fade-in text-lg"
            >
              {loadingMessages[messageIndex]}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-64 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div className="bg-primary h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
          </div>

          {/* Background Elements */}
          <div className="absolute top-4 left-4 w-8 h-8 bg-primary/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-4 right-4 w-6 h-6 bg-purple-300/20 rounded-full animate-pulse delay-700"></div>
          <div className="absolute top-8 right-8 w-4 h-4 bg-blue-300/20 rounded-full animate-pulse delay-1000"></div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
