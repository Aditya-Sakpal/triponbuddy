import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import type { ImageData } from "@/constants";

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

const travelTips = [
  "Pack light and versatile clothing for different weather conditions",
  "Research local customs and etiquette before your trip",
  "Keep digital copies of important documents like passport and tickets",
  "Try local cuisine and street food for authentic experiences",
  "Stay hydrated and be mindful of jet lag when traveling long distances",
  "Learn a few basic phrases in the local language",
  "Backup your photos and use cloud storage during your trip",
  "Respect wildlife and natural environments in your destinations"
];

export const TripGenerationModal = ({ isOpen, onClose }: TripGenerationModalProps) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [images, setImages] = useState<ImageData[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [tipVisible, setTipVisible] = useState(true);
  const [waveOffset, setWaveOffset] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Image carousel effect with horizontal wave motion
  useEffect(() => {
    if (!isOpen || images.length === 0) return;

    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(imageInterval);
  }, [isOpen, images.length]);

  // Continuous wave animation
  useEffect(() => {
    if (!isOpen) return;

    const waveInterval = setInterval(() => {
      setWaveOffset((prev) => (prev + 0.1) % (Math.PI * 2));
    }, 50); // Smooth animation

    return () => clearInterval(waveInterval);
  }, [isOpen]);

  // Travel tips slideshow effect
  useEffect(() => {
    if (!isOpen) return;

    const tipInterval = setInterval(() => {
      setTipVisible(false);
      setTimeout(() => {
        setCurrentTipIndex((prev) => (prev + 1) % travelTips.length);
        setTipVisible(true);
      }, 500); // Fade out for 500ms, then change tip and fade in
    }, 4000); // Change tip every 4 seconds

    return () => clearInterval(tipInterval);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setMessageIndex(0);
      
      // Use only Unsplash placeholder images
      const placeholderImages: ImageData[] = [
        {
          url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
          width: 800,
          height: 600,
          source: "unsplash",
          title: "Mountain landscape"
        },
        {
          url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
          width: 800,
          height: 600,
          source: "unsplash", 
          title: "Forest path"
        },
        {
          url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
          width: 800,
          height: 600,
          source: "unsplash",
          title: "Ocean view"
        },
        {
          url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
          width: 800,
          height: 600,
          source: "unsplash",
          title: "City skyline"
        },
        {
          url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
          width: 800,
          height: 600,
          source: "unsplash",
          title: "Desert landscape"
        }
      ];
      
      setImages(placeholderImages);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="mt-12 h-2xl max-w-xl border-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 z-[99]">
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          {/* Floating Pin Animation */}
          <div className="relative">
            <div className="animate-bounce">
              <MapPin className="w-16 h-16 text-primary drop-shadow-lg" />
            </div>
            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping"></div>
          </div>
          
          {/* Image Carousel */}
          {images.length > 0 && (
            <div className="relative w-full max-w-md h-48 overflow-hidden rounded-lg">
              <div className="flex space-x-2">
                {Array.from({ length: 3 }, (_, i) => {
                  const imageIndex = (currentImageIndex + i) % images.length;
                  const image = images[imageIndex];
                  const horizontalOffset = Math.sin(waveOffset + i * 0.8) * 30; // Horizontal wave motion

                  const verticalOffset = Math.sin(waveOffset + i * 0.8 + Math.PI/2) * 8; // Vertical wave motion
                  const scale = 0.85 + Math.sin(waveOffset + i * 0.8) * 0.1; // Scale variation
                  
                  return (
                    <div
                      key={`${imageIndex}-${i}`}
                      className="flex-1 h-48 relative overflow-hidden rounded-lg transform transition-all duration-300 ease-out"
                      style={{
                        transform: `translate(${horizontalOffset}px, ${verticalOffset}px) scale(${scale})`,
                        opacity: 0.6 + Math.sin(waveOffset + i * 0.8) * 0.4,
                      }}
                    >
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Hide broken images
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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

          {/* Travel Tips Slideshow */}
          <div className="text-center max-w-sm">
            <p className="text-sm text-muted-foreground mb-2">Travel Tip:</p>
            <div className="min-h-[3rem] flex items-center justify-center">
              <p
                key={currentTipIndex}
                className={`text-sm text-foreground transition-all duration-500 ${
                  tipVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2'
                }`}
              >
                {travelTips[currentTipIndex]}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
