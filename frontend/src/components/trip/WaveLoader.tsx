import { useState, useEffect } from "react";
import type { ImageData } from "@/constants";

interface WaveLoaderProps {
  images: ImageData[];
  isActive: boolean;
}

export const WaveLoader = ({ images, isActive }: WaveLoaderProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [waveOffset, setWaveOffset] = useState(0);
  const [slideOffset, setSlideOffset] = useState(0);

  // Image carousel effect with horizontal sliding motion
  useEffect(() => {
    if (!isActive || images.length === 0) return;

    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000); // Change image every 3 seconds for faster pace

    return () => clearInterval(imageInterval);
  }, [isActive, images.length]);

  // Continuous sliding animation - faster speed
  useEffect(() => {
    if (!isActive) return;

    const slideInterval = setInterval(() => {
      setSlideOffset((prev) => prev + 0.06); // Continuous increment for unidirectional movement
      setWaveOffset((prev) => (prev + 0.06) % (Math.PI * 2)); // Keep sine wave for vertical motion
    }, 40); // Decreased from 50ms to 40ms for smoother faster animation

    return () => clearInterval(slideInterval);
  }, [isActive]);

  // Reset state when inactive
  useEffect(() => {
    if (!isActive) {
      setSlideOffset(0);
      setWaveOffset(0);
      setCurrentImageIndex(0);
    }
  }, [isActive]);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-36 flex items-center justify-center overflow-hidden">
      {Array.from({ length: 50 }, (_, i) => {
        // Calculate which image this card should show
        const imageIndex = (currentImageIndex + i) % images.length;
        const image = images[imageIndex];
        
        // Calculate horizontal position for sliding effect
        // Cards start from right (positive X) and move left (negative X)
        const basePosition = i * 120 - 200; // Space cards 120px apart, start 200px to the right
        const horizontalPosition = basePosition - (slideOffset * 50); // Convert slide offset to pixels for unidirectional movement
        
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
                  (e.target as HTMLImageElement).src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjI0IiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDIyNCAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMjQiIGhlaWdodD0iMjU2IiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zNWVtIiBmaWxsPSIjOUI5QkE0IiBmb250LXNpemU9IjE0Ij5Mb2FkaW5nPC90ZXh0Pgo8L3N2Zz4=";
                }}
              />
              <div className="absolute inset-2 rounded-xl bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
