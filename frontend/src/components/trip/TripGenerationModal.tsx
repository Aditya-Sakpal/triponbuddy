import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MapPin, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSingleImage } from "@/hooks/api-hooks";
import type { ImageData } from "@/constants";

interface TripGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination?: string;
  onCancel?: () => void;
  preloadedImages?: ImageData[];
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

export const TripGenerationModal = ({ isOpen, onClose, destination, onCancel, preloadedImages }: TripGenerationModalProps) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [images, setImages] = useState<ImageData[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [waveOffset, setWaveOffset] = useState(0);
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
      setCurrentImageIndex(0);
      setCurrentTipIndex(0);
      setImagesFetched(true);
      
      // Fetch real images from backend
      singleImageMutation.mutate(
        {
          location: destination,
          max_images: 10, // Increased from 5 to 10 for more variety
          min_width: 800,
          min_height: 600,
        },
        {
          onSuccess: (data) => {
            if (data.images && data.images.length > 0) {
              setImages(data.images);
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
    
    // Reset imagesFetched when modal closes
    if (!isOpen) {
      setImagesFetched(false);
      setImages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, destination, imagesFetched, preloadedImages]);

  // Loading messages rotation
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Image carousel effect with horizontal sliding motion
  useEffect(() => {
    if (!isOpen || images.length === 0) return;

    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000); // Change image every 3 seconds for faster pace

    return () => clearInterval(imageInterval);
  }, [isOpen, images.length]);

  // Continuous sliding animation - faster speed
  useEffect(() => {
    if (!isOpen) return;

    const slideInterval = setInterval(() => {
      setWaveOffset((prev) => (prev + 0.06) % (Math.PI * 2)); // Increased from 0.02 to 0.06 for faster sliding
    }, 40); // Decreased from 50ms to 40ms for smoother faster animation

    return () => clearInterval(slideInterval);
  }, [isOpen]);

  // Travel tips rotation
  useEffect(() => {
    if (!isOpen) return;

    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % travelTips.length);
    }, 5000); // Change tip every 5 seconds

    return () => clearInterval(tipInterval);
  }, [isOpen]);

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
            {images.length > 0 && (
              <div className="relative w-full h-36 flex items-center justify-center overflow-hidden">
                {Array.from({ length: 6 }, (_, i) => {
                  // Calculate which image this card should show
                  const imageIndex = (currentImageIndex + i) % images.length;
                  const image = images[imageIndex];
                  
                  // Calculate horizontal position for sliding effect
                  // Cards start from right (positive X) and move left (negative X)
                  const basePosition = i * 120 - 200; // Space cards 120px apart, start 200px to the right
                  const slideOffset = waveOffset * 50; // Convert wave offset to pixels
                  const horizontalPosition = basePosition - slideOffset;
                  
                  // Add slight vertical wave motion
                  const verticalOffset = Math.sin(waveOffset + i * 0.5) * 8;
                  
                  // Calculate distance from center for opacity and z-index effects
                  const distanceFromCenter = Math.abs(horizontalPosition);
                  
                  // All cards have consistent size - no automatic scaling
                  const scale = 1.0;
                  
                  // Opacity based on distance from center
                  const opacity = Math.max(0.3, 1 - distanceFromCenter / 400);
                  
                  return (
                    <div
                      key={`card-${i}`} // Stable key based on position
                      className="absolute w-28 h-32 rounded-2xl shadow-xl bg-white dark:bg-gray-800 p-2 transition-all duration-1000 ease-out hover:scale-110 cursor-pointer"
                      style={{
                        transform: `translate(${horizontalPosition}px, ${verticalOffset}px) scale(${scale})`,
                        opacity: opacity,
                        zIndex: Math.floor(100 - distanceFromCenter), // Closer cards appear on top
                      }}
                    >
                      <div className="w-full h-full overflow-hidden rounded-xl">
                        <img
                          src={image.url}
                          alt={image.title}
                          className="w-full h-full object-cover transition-opacity duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-2 rounded-xl bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

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
