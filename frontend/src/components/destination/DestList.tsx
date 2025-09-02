import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { destinationsByState, indianStates } from "@/content/destinationContent";

export const DestList = () => {
    const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
    const [preloadingComplete, setPreloadingComplete] = useState(false);
    const [isWorldwide, setIsWorldwide] = useState(false);
    const filteredDestinations = destinationsByState.filter(stateData => {
    if (isWorldwide) {
         return true; // Show all destinations
    } else {
         return indianStates.includes(stateData.state); // Show only Indian destinations
    }
  });

  // Preload all images on component mount with priority loading
  useEffect(() => {
    const preloadImages = async () => {
      // Get all images from filtered destinations
      const allImages = destinationsByState.flatMap(stateData => 
        stateData.destinations.map(destination => destination.image)
      );

      // Priority load first 12 images (visible on initial load)
      const priorityImages = allImages.slice(0, 12);
      const remainingImages = allImages.slice(12);

      // Add link preload tags for priority images
      priorityImages.forEach((imageSrc, index) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = imageSrc;
        if ('fetchPriority' in link) {
          (link as HTMLLinkElement & { fetchPriority?: string }).fetchPriority = 'high';
        }
        // Add crossorigin for better caching
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });

      // Load priority images first
      const priorityPromises = priorityImages.map(imageSrc => {
        return new Promise<string>((resolve) => {
          const img = new Image();
          img.onload = () => {
            setLoadedImages(prev => new Set(prev).add(imageSrc));
            resolve(imageSrc);
          };
          img.onerror = () => {
            console.warn(`Failed to load priority image: ${imageSrc}`);
            resolve(imageSrc); // Don't reject, just continue
          };
          // Set high priority for these images
          if ('fetchPriority' in img) {
            (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority = 'high';
          }
          img.src = imageSrc;
        });
      });
 
      // Load priority images immediately
      await Promise.allSettled(priorityPromises);

      // Load remaining images with slight delay to not block priority ones
      setTimeout(() => {
        const remainingPromises = remainingImages.map(imageSrc => {
          return new Promise<string>((resolve) => {
            const img = new Image();
            img.onload = () => {
              setLoadedImages(prev => new Set(prev).add(imageSrc));
              resolve(imageSrc);
            };
            img.onerror = () => {
              console.warn(`Failed to load image: ${imageSrc}`);
              resolve(imageSrc);
            };
            img.src = imageSrc;
          });
        });

        Promise.allSettled(remainingPromises).finally(() => {
          setPreloadingComplete(true);
        });
      }, 50);
    };

    preloadImages();

      // Cleanup function to remove preload links
    return () => {
      const preloadLinks = document.querySelectorAll('link[rel="preload"][as="image"]');
      preloadLinks.forEach(link => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, []);

  // Handle individual image load
  const handleImageLoad = useCallback((imageSrc: string) => {
    setLoadedImages(prev => new Set(prev).add(imageSrc));
    
  }, []);

  return (
    <section className="py-12 px-6">
            <div className="container mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12">Destinations by Location</h2>
                
                <div className="space-y-12">
                    {filteredDestinations.map((stateData) => (
                    <div key={stateData.state} className="space-y-6 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-shadow p-6 max-w-6xl mx-auto">
                        <div className="flex items-center justify-between">
                        <h3 className="text-3xl font-bold text-foreground">{stateData.state}</h3>
                        <Badge variant="secondary" className="bg-blue-600 text-white text-lg">
                            {stateData.count} destinations
                        </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stateData.destinations.map((destination, index) => {
                            const isImageLoaded = loadedImages.has(destination.image);
                            
                            return (
                            <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group">
                                <div className="aspect-video relative overflow-hidden">
                                {/* Background placeholder */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                    {!isImageLoaded && (
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    )}
                                </div>
                                
                                {/* Actual image */}
                                <img
                                    src={destination.image}
                                    alt={destination.name}
                                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                                    isImageLoaded ? 'opacity-100' : 'opacity-0'
                                    }`}
                                    onLoad={() => handleImageLoad(destination.image)}
                                    loading="eager"
                                    decoding="async"
                                    style={{ 
                                    willChange: 'transform, opacity',
                                    backfaceVisibility: 'hidden'
                                    }}
                                />
                                </div>
                                <CardContent className="p-4">
                                <h4 className="font-semibold text-2xl mb-2 group-hover:text-blue-600 transition-colors">
                                    {destination.name}
                                </h4>
                                <p className="text-muted-foreground text-md leading-relaxed">
                                    {destination.description}
                                </p>
                                </CardContent>
                            </Card>
                            );
                        })}
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
