import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MapPin, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSingleImage } from "@/hooks/api-hooks";
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
  const [imagesFetched, setImagesFetched] = useState(false);
  
  const singleImageMutation = useSingleImage();

  // Use preloaded images if available
  useEffect(() => {
    if (preloadedImages && preloadedImages.length > 0) {
      setImages(preloadedImages);
      setImagesFetched(true);
    }
  }, [preloadedImages]);

  // Fetch images when modal opens and destination is provided (fallback if no preloaded images)
  useEffect(() => {
    if (isOpen && destination && !imagesFetched && (!preloadedImages || preloadedImages.length === 0)) {
      setMessageIndex(0);
      setCurrentTipIndex(0);
      setImagesFetched(true);
      
      // Fetch real images from backend
      singleImageMutation.mutate(
        {
          location: destination,
          max_images: 10, // Fetch up to 10 images only
          min_width: 800,
          min_height: 600,
        },
        {
          onSuccess: (data) => {
            if (data.images && data.images.length > 0) {
              // Only keep the first 8-10 images
              setImages(data.images.slice(0, 10));
            } else {
              // Fallback to placeholder images if no images found
              setImages([
                {
                  url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
                  width: 800,
                  height: 600,
                  source: "unsplash",
                  title: destination
                },
                {
                  url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
                  width: 800,
                  height: 600,
                  source: "unsplash", 
                  title: destination
                },
                {
                  url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop",
                  width: 800,
                  height: 600,
                  source: "unsplash",
                  title: destination
                }
              ]);
            }
          },
          onError: () => {
            // Fallback to placeholder images on error
            setImages([
              {
                url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
                width: 800,
                height: 600,
                source: "unsplash",
                title: destination
              },
              {
                url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
                width: 800,
                height: 600,
                source: "unsplash", 
                title: destination
              },
              {
                url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop",
                width: 800,
                height: 600,
                source: "unsplash",
                title: destination
              }
            ]);
          }
        }
      );
    }
    
    // Reset imagesFetched when modal closes or generation completes
    if (!isOpen || generationComplete) {
      setImagesFetched(false);
      setImages([]);
      setMessageIndex(0);
      setCurrentTipIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, destination, imagesFetched, preloadedImages, generationComplete]);

  // Loading messages rotation
  useEffect(() => {
    if (!isOpen || generationComplete) return;
    
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2500);

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

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full border-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-0 max-h-[600px] min-h-[550px]">
        <div className="relative flex flex-col items-center justify-center py-6 px-6 space-y-4 h-full">
          {/* Bouncing Animation Container - wraps all content */}
          <div className="animate-bounce-slow w-full flex flex-col items-center space-y-4">
            
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
              
              <div className="relative z-10">
                <MapPin className="w-10 h-10 text-primary drop-shadow-lg" />
                {/* Ripple effect */}
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping"></div>
              </div>
            </div>
            
            {/* Title */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">
                Planning your trip to {destination || "your destination"}
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                {loadingMessages[messageIndex]}
              </p>
            </div>

            {/* Image Carousel with sliding animation */}
            {/* Loop over images in the WaveLoader (WaveLoader should handle the array) */}
            <WaveLoader images={images} isActive={isOpen && !generationComplete} />

            {/* Progress Bar */}
            <div className="w-full max-w-xs bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-1.5 rounded-full animate-pulse-slow" style={{width: '70%'}}></div>
            </div>

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
        </div>
      </DialogContent>
    </Dialog>
  );
};
