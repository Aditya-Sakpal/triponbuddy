import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MapPin, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { ImageData } from "@/constants";
import { WaveLoader } from "@/components/trip/WaveLoader";

interface TripGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination?: string;
  onCancel?: () => void;
  preloadedImages?: ImageData[];
  generationComplete?: boolean;
}

const loadingMessages = [
  "Checking availability...",
  "Finding perfect destinations...",
  "Crafting your experience...",
  "Optimizing your itinerary...",
];

const travelTips = [
  "Tip: Local cuisine is a must-try experience!",
  "Tip: Research local customs and etiquette before your trip",
  "Tip: Keep digital copies of important documents",
  "Tip: Learn a few basic phrases in the local language",
];

export const TripGenerationModal = ({ isOpen, onClose, destination, onCancel, preloadedImages, generationComplete = false }: TripGenerationModalProps) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [images, setImages] = useState<ImageData[]>([]);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Images are fetched in useTripPlanning hook using Google Places API
  useEffect(() => {
    if (preloadedImages && preloadedImages.length > 0) {
      setImages(preloadedImages);
    }
  }, [preloadedImages]);

  // Reset state when modal closes or generation completes
  useEffect(() => {
    if (!isOpen || generationComplete) {
      setImages([]);
      setMessageIndex(0);
      setCurrentTipIndex(0);
    }
  }, [isOpen, generationComplete]);

  // Loading messages rotation
  useEffect(() => {
    if (!isOpen || generationComplete) return;
    
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [isOpen, generationComplete]);

  // Travel tips rotation
  useEffect(() => {
    if (!isOpen || generationComplete) return;

    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % travelTips.length);
    }, 5000); // Change tip every 5 seconds

    return () => clearInterval(tipInterval);
  }, [isOpen, generationComplete]);

  // Progress bar animation - stops at 90% until generation is complete
  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      return;
    }

    if (generationComplete) {
      // Complete to 100% when generation is done
      setProgress(100);
      return;
    }

    // Animate progress to 90% over ~8 seconds
    const targetProgress = 90;
    const duration = 8000; // 8 seconds
    const steps = 60;
    const increment = targetProgress / steps;
    const interval = duration / steps;

    let currentStep = 0;
    const progressInterval = setInterval(() => {
      currentStep++;
      const newProgress = Math.min(currentStep * increment, targetProgress);
      setProgress(newProgress);

      if (newProgress >= targetProgress) {
        clearInterval(progressInterval);
      }
    }, interval);

    return () => clearInterval(progressInterval);
  }, [isOpen, generationComplete]);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full border-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-0 max-h-[750px] min-h-[600px] overflow-hidden">
        {/* Animated Gradient Border Line at Top */}
        <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-full w-full animate-pulse"></div>
        </div>
        
        <div className="relative flex flex-col items-center justify-center py-8 px-6 space-y-6 h-full">
          {/* Bouncing Animation Container - wraps all content */}
          <div className="animate-bounce-slow w-full flex flex-col items-center space-y-6">
            
            {/* Floating Pin Animation with Spinning Lines */}
            <div className="relative flex items-center justify-center w-20 h-20">
              {/* Spinning circular lines around the pin - 3 separate arcs */}
              <svg className="absolute inset-0 w-20 h-20 animate-spin-slow" viewBox="0 0 80 80">
                {/* Dark Blue Arc */}
                <path
                  d="M 40 10 A 30 30 0 0 1 70 40"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Light Blue Arc */}
                <path
                  d="M 70 40 A 30 30 0 0 1 40 70"
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.6"
                />
                {/* Pink Arc */}
                <path
                  d="M 40 70 A 30 30 0 0 1 10 40"
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.5"
                />
              </svg>
              
              <div className="relative z-[10]">
                <MapPin className="w-10 h-10 text-primary drop-shadow-lg" />
                {/* Ripple effect */}
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping"></div>
              </div>
            </div>
            
            {/* Title */}
            <div className="text-center space-y-3">
              <h3 className="text-lg font-semibold text-bula">
                Planning your trip to {destination || "your destination"}
              </h3>
              
              {/* Loading Message with Pulsating Dot */}
              <div className="inline-flex items-center gap-3 px-4 py-2.5 bg-blue-100 dark:bg-gray-800 rounded-full">
                {/* Pulsating Blue Dot */}
                <div className="relative flex items-center justify-center w-2.5 h-2.5">
                  <div className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping"></div>
                  <div className="relative w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                </div>
                <p className="text-muted-foreground text-sm font-medium">
                  {loadingMessages[messageIndex]}
                </p>
              </div>
            </div>

            {/* Progress Bar */}

            <div className="w-full max-w-xs bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-1.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Image Carousel with sliding animation */}
            {/* Loop over images in the WaveLoader (WaveLoader should handle the array) */}
            <WaveLoader images={images} isActive={isOpen && !generationComplete} />

          {/* Cancel Button - outside bouncing animation */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>

            {/* Travel Tips */}
            <div className="text-center max-w-sm px-2 min-h-[2rem] flex items-center justify-center">
              <p
                key={currentTipIndex}
                className="text-xs text-muted-foreground italic animate-fade-in"
              >
                💡 {travelTips[currentTipIndex]}
              </p>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};
